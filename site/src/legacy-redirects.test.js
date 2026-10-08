import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Search Console (2026-10-07) still listed the pre-Astro /bio.html,
// /contact.html and /teaching.html as 404s. They must 301 to the home page via
// LEGACY_REDIRECTS in worker.js. Static test only: worker.js imports
// `cloudflare:email`, which plain Node can't load, so the map is read from the
// source and real behavior is checked with `curl` against the live site.
const worker = readFileSync(new URL("./worker.js", import.meta.url), "utf8");
const block = worker.match(/const LEGACY_REDIRECTS = \{([\s\S]*?)\n\};/)?.[1] ?? "";

for (const path of ["/bio.html", "/contact.html", "/teaching.html"]) {
	test(`${path} redirects to the home page`, () => {
		assert.match(block, new RegExp(`^\\s*"${path.replace(".", "\\.")}": "/",\\s*$`, "m"));
	});
}
