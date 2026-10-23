import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import press from "./data/eastern-blok-press.json" with { type: "json" };
import { buildArchive, cleanQuote, dateLabel, dateParts, publicEntries, shortQuote, tickPosition } from "./data/press-archive.js";

// /easternblok/press shows only approved entries, and only short excerpts of
// what the sources said. These checks guard both.

const shown = publicEntries(press.entries);
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
	assert.ok(!press.entries.some((e) => e.kind === "listener-comment" && e.approved), "a fan comment is approved");
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

test("every shown entry lands in the wall or in exactly one year list", () => {
	const a = buildArchive(press.entries);
	const placed = a.wall.length + a.years.reduce((n, [, list]) => n + list.length, 0);
	assert.equal(placed, a.total);
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
