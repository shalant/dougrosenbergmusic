import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The sheet-music viewer iframes /sheetmusic/* PDFs same-origin. The global
// `X-Frame-Options: DENY` / CSP `frame-ancestors 'none'` in public/_headers
// blocked that (found live 2026-09-30), so the /sheetmusic/* rule must detach
// both and allow same-origin framing. Static test only: the local http-server
// and Node don't apply _headers, so real header behavior is checked with
// `wrangler dev` + curl (see docs/todolist.md).
const headers = readFileSync(new URL("../public/_headers", import.meta.url), "utf8");
const block = headers.match(/^\/sheetmusic\/\*\r?\n((?:[ \t]+.*\r?\n?)+)/m)?.[1] ?? "";

test("/sheetmusic/* detaches the global frame-blocking headers", () => {
	assert.match(block, /^\s*! X-Frame-Options\s*$/m);
	assert.match(block, /^\s*! Content-Security-Policy\s*$/m);
});

test("/sheetmusic/* re-allows same-origin framing only", () => {
	assert.match(block, /^\s*X-Frame-Options: SAMEORIGIN\s*$/m);
	assert.doesNotMatch(block, /X-Frame-Options: ALLOW/i);
});

test("every other path still denies framing", () => {
	assert.match(headers, /^\/\*\r?\n(?:[ \t]+.*\r?\n)*?[ \t]+X-Frame-Options: DENY/m);
});
