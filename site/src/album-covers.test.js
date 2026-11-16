import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import sharp from "sharp";

// Two of the album scans carried black bars along the top and bottom
// (better-than-tv.jpg 11 and 6 rows, underwater.jpg 18 and 18). On the dark
// theme they vanished into the navy; on the light theme's paper they read as
// heavy black strips (bad cop, 2026-11-15), so the files were cropped. A
// scan bar averages about luma 1; the darkest real edge (Better Than TV's
// own top row) averages above 20.

sharp.cache(false);
const dir = new URL("../public/images/albums/", import.meta.url);

test("no album cover has a black scan bar along an edge", async () => {
	const files = readdirSync(dir).filter((f) => f.endsWith(".jpg"));
	assert.ok(files.length >= 4, "expected the four album covers");
	for (const f of files) {
		const { data, info } = await sharp(readFileSync(new URL(f, dir)))
			.greyscale()
			.raw()
			.toBuffer({ resolveWithObject: true });
		const { width: W, height: H } = info;
		const row = (y) => {
			let s = 0;
			for (let x = 0; x < W; x++) s += data[y * W + x];
			return s / W;
		};
		const col = (x) => {
			let s = 0;
			for (let y = 0; y < H; y++) s += data[y * W + x];
			return s / H;
		};
		const edges = { top: row(0), bottom: row(H - 1), left: col(0), right: col(W - 1) };
		for (const [edge, luma] of Object.entries(edges)) {
			assert.ok(luma > 10, `${f} ${edge} edge averages luma ${luma.toFixed(1)}`);
		}
	}
});
