import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import press from "./data/eastern-blok-press.json" with { type: "json" };
import dougPress from "./data/doug-press.json" with { type: "json" };
import { buildArchive, cleanQuote, dateLabel, dateParts, publicEntries, shortQuote, sortDate, tickPosition } from "./data/press-archive.js";

// /easternblok/press and /press show only approved entries, and only short excerpts of
// what the sources said. These checks guard both.

const shown = [...publicEntries(press.entries), ...publicEntries(dougPress.entries)];
const pressIndex = JSON.parse(readFileSync(new URL("../../press/press.json", import.meta.url), "utf8"));
// merge-press.cjs folds duplicates into one entry and keeps the other ids as aliases.
const indexById = new Map();
for (const e of Array.isArray(pressIndex) ? pressIndex : pressIndex.entries) {
	for (const id of [e.id, ...(e.aliases ?? [])]) indexById.set(id, e);
}

test("only approved entries are shown, and never fan comments or the concert recording", () => {
	assert.ok(shown.length > 0);
	for (const e of shown) {
		assert.equal(e.approved, true, e.id);
		assert.ok(!["listener-comment", "concert-recording"].includes(e.kind), e.id);
	}
	assert.ok(![...press.entries, ...dougPress.entries].some((e) => e.kind === "listener-comment" && e.approved), "a fan comment is approved");
});

test("every shown entry is approved in press/press.json too", () => {
	for (const e of shown) assert.equal(indexById.get(e.id)?.approved, true, e.id);
});

test("every shown entry has what the page prints: outlet, title, kind, and a link or a print note", () => {
	for (const e of shown) {
		assert.ok(e.outlet && e.title && e.kind, e.id);
		assert.ok(e.url === null || /^https?:\/\//.test(e.url), e.id);
	}
});

test("the page's quotes are short excerpts of a real pull quote", () => {
	const { wall } = buildArchive(press.entries);
	assert.ok(wall.length > 0);
	for (const e of shown) {
		const q = shortQuote(e);
		if (!q) continue;
		assert.ok(q.split(/\s+/).length <= 30, `${e.id} quote is too long`);
		const sources = e.pullQuotes.map((p) => cleanQuote(typeof p === "string" ? p : p.text));
		assert.ok(sources.includes(q), e.id);
	}
});

test("band-issued material never gets a quote on the page", () => {
	for (const e of shown.filter((x) => x.kind === "promo-bio")) assert.equal(shortQuote(e), null, e.id);
});

for (const [name, file] of [["Eastern Blok", press], ["Doug", dougPress]]) {
	test(`${name}: every shown entry lands in the wall or in exactly one year list, and none is undated`, () => {
		const a = buildArchive(file.entries);
		const placed = a.wall.length + a.years.reduce((n, [, list]) => n + list.length, 0);
		assert.equal(placed, a.total);
		assert.ok(!a.years.some(([year]) => year === "Undated" && name === "Doug"), "a personal entry has no usable date");
	});
}

test("a date range sorts at its start", () => {
	assert.equal(sortDate({ date: "2003-02-27/2004-01-29" }), "2003-02-27");
	assert.equal(sortDate({ date: "", showDates: ["2011-03-29"] }), "2011-03-29");
});

test("ids are unique across the band and personal press files", () => {
	const ids = [...press.entries, ...dougPress.entries].map((e) => e.id);
	assert.equal(new Set(ids).size, ids.length);
});

test("date helpers handle day, month and year precision", () => {
	assert.deepEqual(dateParts("2008-03-24"), { year: 2008, month: 3, day: 24 });
	assert.equal(dateParts(""), null);
	assert.equal(dateLabel("2008-03-24"), "Mar 24");
	assert.equal(dateLabel("2007-10", true), "Oct 2007");
	assert.equal(dateLabel("2007", true), "2007");
});

test("tick positions stay inside the strip and are null outside it", () => {
	assert.ok(tickPosition("2004-01-02", 2004, 2013) >= 0);
	assert.ok(tickPosition("2013-12-30", 2004, 2013) <= 1);
	assert.equal(tickPosition("2016-03-09", 2004, 2013), null);
	assert.equal(tickPosition(null, 2004, 2013), null);
});
