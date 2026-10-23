import { test } from "node:test";
import assert from "node:assert/strict";
import video from "./data/eastern-blok-video.json" with { type: "json" };
import shows from "./data/eastern-blok-shows.json" with { type: "json" };

// eastern-blok-video.json is hand-collected from YouTube (see its _about).
// These checks guard what VideoLog.astro relies on.

test("every video has an 11-character YouTube id, a title, an uploader and a length", () => {
	for (const v of video.videos) {
		assert.match(v.id, /^[A-Za-z0-9_-]{11}$/, v.id);
		assert.ok(v.title && v.uploader, v.id);
		assert.match(v.length, /^\d{1,2}(:\d{2}){1,2}$/, v.id);
	}
});

test("ids are unique and exactly one clip leads", () => {
	const ids = video.videos.map((v) => v.id);
	assert.equal(new Set(ids).size, ids.length);
	assert.equal(video.videos.filter((v) => v.lead).length, 1);
});

test("dates are ISO or null, and every video says how its date was decided", () => {
	for (const v of video.videos) {
		assert.ok(v.date === null || /^\d{4}-\d{2}-\d{2}$/.test(v.date), v.id);
		assert.ok(v.how, `${v.id} has no "how"`);
	}
});

test("a dated video either matches a show in the log or says it is missing from it", () => {
	const logged = new Set(shows.shows.map((s) => s.date));
	for (const v of video.videos.filter((x) => x.date && !logged.has(x.date))) {
		assert.match(v.how, /not in the show log|after the last show|check it/i, `${v.id} ${v.date}`);
	}
});
