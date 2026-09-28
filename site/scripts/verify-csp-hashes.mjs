#!/usr/bin/env node
// Guards against the exact failure this repo already hit once (see
// public/_headers' own comment, 2026-09-20): an inline <script> in
// BaseLayout.astro/StaffNav.astro/etc. changes, its sha256 hash changes,
// nobody regenerates public/_headers' CSP script-src list, and the script
// is now silently CSP-blocked in production - it still renders, it just
// never runs. `npm run build` must already have run before this.
//
// Extracts the real hash set from the built HTML (same logic public/_headers'
// own comment documents, including stripping HTML comments first - the
// un-stripped version is what caused the original bug) and diffs it against
// whatever's actually checked into public/_headers.
//
// Default (no flags): report-only, exits non-zero on any mismatch - this is
// what CI runs, so a forgotten regen fails the build instead of shipping
// silently. Pass --write to rewrite public/_headers' script-src hash list
// in place instead of just reporting.

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const BUILT_FILES = ["dist/index.html", "dist/404.html"];
const HEADERS_FILE = "public/_headers";
const WRITE = process.argv.includes("--write");

function hashesFromBuiltHtml() {
	const hashes = new Set();
	for (const file of BUILT_FILES) {
		const html = readFileSync(file, "utf8").replace(/<!--[\s\S]*?-->/g, "");
		const scriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
		let match;
		while ((match = scriptRe.exec(html))) {
			const hash = createHash("sha256").update(match[1], "utf8").digest("base64");
			hashes.add(`sha256-${hash}`);
		}
	}
	return hashes;
}

function hashesFromHeadersFile(headersText) {
	const cspLine = headersText.split(/\r?\n/).find((line) => line.includes("Content-Security-Policy:"));
	if (!cspLine) {
		throw new Error(`No Content-Security-Policy line found in ${HEADERS_FILE}`);
	}
	const hashes = new Set();
	const hashRe = /'(sha256-[^']+)'/g;
	let match;
	while ((match = hashRe.exec(cspLine))) {
		hashes.add(match[1]);
	}
	return hashes;
}

const expected = hashesFromBuiltHtml();
const headersText = readFileSync(HEADERS_FILE, "utf8");
const actual = hashesFromHeadersFile(headersText);

const missing = [...expected].filter((h) => !actual.has(h));
const stale = [...actual].filter((h) => !expected.has(h));

if (missing.length === 0 && stale.length === 0) {
	console.log(`✓ ${HEADERS_FILE}'s CSP script-src hashes match the built HTML (${expected.size} hashes).`);
	process.exit(0);
}

if (WRITE) {
	// The hash tokens sit as one contiguous run right after `script-src 'self' `
	// (before the https: source list) - replace just that run, sorted for a
	// stable/deterministic diff, leave everything else on the line untouched.
	const sortedTokens = [...expected].sort().map((h) => `'${h}'`).join(" ");
	const hashRunRe = /(script-src 'self' )(?:'sha256-[^']+'\s*)+/;
	if (!hashRunRe.test(headersText)) {
		console.error(`Could not find a script-src hash run to replace in ${HEADERS_FILE}.`);
		process.exit(1);
	}
	const updated = headersText.replace(hashRunRe, `$1${sortedTokens} `);
	writeFileSync(HEADERS_FILE, updated);
	console.log(`✓ Rewrote ${HEADERS_FILE} with ${expected.size} current hash(es).`);
	process.exit(0);
}

console.error(`✗ ${HEADERS_FILE}'s CSP script-src hashes are out of date.\n`);
if (missing.length > 0) {
	console.error("Missing (needed by the current build, not present in _headers):");
	for (const h of missing) console.error(`  '${h}'`);
}
if (stale.length > 0) {
	console.error("Stale (in _headers, no longer produced by any inline script):");
	for (const h of stale) console.error(`  '${h}'`);
}
console.error("\nRegenerate: npm run verify-csp -- --write (after npm run build).");
process.exit(1);
