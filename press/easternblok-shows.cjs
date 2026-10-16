#!/usr/bin/env node
// Rebuilds Eastern Blok's show history from the band's old website,
// easternblok.net, as saved by the Wayback Machine. The domain was later taken
// over by a spam blog, so these snapshots are the only copy of the calendar.
//
// Usage (from the repo root):
//   node press/easternblok-shows.cjs [snapshotDir] [--out site/src/data/eastern-blok-shows.json]
//
// snapshotDir defaults to ../press-archive/easternblok-net-calendar/snapshots
// (outside git; see that folder's source.txt for how the files were fetched).
// Each file is named <waybackTimestamp>_<page>, e.g.
// 20120127200419_calendar-past.html.
//
// The site had three formats, all handled here:
//   - "past" table (calendar.html?showcal=past, calendar-past.html): one <tr>
//     per show with <span class="date">, then venue / city / region / country
//     separated by newlines or tabs; a following colspan="2" row is a note.
//   - "upcoming" entries (calendar.html): <div class="entry"> with an <h2>
//     date, an <h3> venue and an <address> or <p> with the location.
//   - RSS (calendar.xml): <item><title>Feb 4, 2012 - Wood Dale, IL</title>.
// A show on a "past" list is recorded as `past` (the band listed it as played).
// A show only ever seen as upcoming is `announced`: it may have been
// cancelled, and the page says so.
//
// Shows are also matched against the fan-recording log in
// site/src/data/eastern-blok-press.json (gigLog), which adds the Goran
// Ivanovic Group years before the calendar starts and an Internet Archive link
// where a recording exists.

const fs = require("node:fs");
const path = require("node:path");

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function decodeEntities(s) {
	return s
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#0?39;|&apos;|&rsquo;|&lsquo;/g, "'")
		.replace(/&ldquo;|&rdquo;/g, '"')
		.replace(/&ndash;|&mdash;/g, "-")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripTags(s) {
	return s.replace(/<[^>]*>/g, "");
}

/** "Dec 21, 2011", "November 19, 2008", "Sunday, October 18th, 2009" -> "2011-12-21" */
function parseDate(text) {
	const m = decodeEntities(text).match(/([A-Za-z]{3,})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,\s*(\d{4})/);
	if (!m) return null;
	const month = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
	if (month === -1) return null;
	return `${m[3]}-${String(month + 1).padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}

/** Title-cases text typed all in lowercase ("schubas" -> "Schubas"); leaves anything with capitals alone. */
function tidyCase(s) {
	if (!s || s !== s.toLowerCase()) return s;
	return s.replace(/(^|[\s/(-])([a-z])/g, (_, pre, ch) => pre + ch.toUpperCase());
}

// The site mixed "IL", "il", "Illinois" and "Ill"; shown as the postal code.
const STATE_NAMES = {
	illinois: "IL", ill: "IL", michigan: "MI", ohio: "OH", "new york": "NY", minnesota: "MN",
	wisconsin: "WI", iowa: "IA", indiana: "IN", pennsylvania: "PA", massachusetts: "MA",
	vermont: "VT", missouri: "MO", colorado: "CO", nebraska: "NE", kansas: "KS", texas: "TX",
	louisiana: "LA", mississippi: "MS", kentucky: "KY",
};

/** "il" -> "IL", "Illinois" -> "IL"; anything else (e.g. "Poland") is only title-cased. */
function tidyRegion(s) {
	if (!s) return s;
	if (/^[a-z]{2}$/i.test(s)) return s.toUpperCase();
	return STATE_NAMES[s.toLowerCase().replace(/\.$/, "")] ?? tidyCase(s);
}

function lines(html) {
	return decodeEntities(stripTags(html.replace(/<br\s*\/?>/gi, "\n")))
		.split(/[\n\t\r]+/)
		.map((l) => l.trim())
		.filter(Boolean);
}

/** Finds "City, ST" / "City ST" / ["City", "ST"] among address lines. */
function cityRegion(addressLines) {
	const useful = addressLines
		.filter((l) => !/^\d/.test(l) && !/\d{3}[-.)\s]\d{3}/.test(l))
		.map((l) => l.replace(/\s+\d{5}(-\d{4})?$/, "").trim());
	for (const line of useful) {
		const m = line.match(/^(.+?),?\s+([A-Za-z]{2}|Illinois|Ill|Michigan|Ohio|New York)\.?$/);
		if (m && !/\s(st|ave|rd|blvd)\.?$/i.test(m[1])) return { city: m[1].replace(/,$/, "").trim(), region: m[2] };
	}
	if (useful.length >= 2 && /^[A-Za-z]{2}$/.test(useful[1])) return { city: useful[0], region: useful[1] };
	if (useful.length === 1 && /^[A-Za-z]{2}$/.test(useful[0])) return { city: null, region: useful[0] };
	// A lone short line is a city ("Washington D.C."); a sentence ("Eastern Blok
	// will be performing at ...") is not, so it stays only in `raw`.
	if (useful.length >= 1 && useful[0].length <= 30 && !/[:!]/.test(useful[0])) return { city: useful[0], region: null };
	return { city: null, region: null };
}

/** Rows of the "past dates" table. */
function parsePastTable(html) {
	const shows = [];
	const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) ?? [];
	for (const row of rows) {
		const dateCell = row.match(/<span class="date">([\s\S]*?)<\/span>/i);
		if (!dateCell) {
			const note = row.match(/<td colspan="2">([\s\S]*?)<\/td>/i);
			if (note && shows.length) shows[shows.length - 1].note = lines(note[1]).join(" ");
			continue;
		}
		const date = parseDate(dateCell[1]);
		const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) ?? [];
		const where = cells[1] ?? "";
		const link = where.match(/<a[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/i);
		const parts = lines(stripTags(where.replace(/<\/?td[^>]*>/gi, "")).replace(/\n/g, "\t"));
		// Some rows give only "venue / state" ("Minnesota State U / Mn").
		const [venue, city, region, country] = parts.length === 2 && /^[A-Za-z]{2}$/.test(parts[1]) ? [parts[0], null, parts[1]] : parts;
		shows.push({
			date,
			venue: link ? lines(link[2]).join(" ") : venue,
			city: city ?? null,
			region: region ?? null,
			country: country ?? null,
			venueUrl: link ? link[1] : null,
			raw: parts.join(" / "),
		});
	}
	return shows;
}

/** <div class="entry"> blocks of the upcoming-shows page. */
function parseUpcomingEntries(html) {
	const shows = [];
	const entries = html.split(/<div class="entry">/i).slice(1);
	for (const entry of entries) {
		const h2 = entry.match(/<h2>([\s\S]*?)<\/h2>/i);
		const h3 = entry.match(/<h3>([\s\S]*?)<\/h3>/i);
		if (!h2) continue;
		const link = h3?.[1].match(/<a[^>]*href=['"]([^'"]+)['"]/i);
		const address = entry.match(/<address>([\s\S]*?)<\/address>/i) ?? entry.match(/<p>([\s\S]*?)<\/p>/i);
		const addressLines = address ? lines(address[1]) : [];
		const { city, region } = cityRegion(addressLines);
		const venue = h3 ? lines(h3[1]).join(" ") : null;
		shows.push({
			date: parseDate(stripTags(h2[1])),
			venue,
			city,
			region,
			country: null,
			venueUrl: link ? link[1] : null,
			raw: [venue, ...addressLines].filter(Boolean).join(" / "),
		});
	}
	return shows;
}

/** <item>s of calendar.xml. */
function parseRss(xml) {
	const shows = [];
	for (const item of xml.match(/<item>[\s\S]*?<\/item>/gi) ?? []) {
		const title = decodeEntities(item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
		const description = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i)?.[1] ?? "";
		const descLines = lines(description);
		const titleParts = title.split(" - ");
		const { city, region } = cityRegion([titleParts[titleParts.length - 1]]);
		shows.push({
			date: parseDate(titleParts[0]),
			venue: descLines[1] ?? null,
			city,
			region,
			country: null,
			venueUrl: description.match(/href="([^"]+)"/)?.[1] ?? null,
			raw: title,
		});
	}
	return shows;
}

function kindOf(fileName) {
	if (fileName.endsWith(".xml")) return "rss";
	if (/past/.test(fileName)) return "past";
	return "upcoming";
}

function parseSnapshot(fileName, text) {
	const kind = kindOf(fileName);
	if (kind === "rss") return parseRss(text);
	if (kind === "past") return parsePastTable(text);
	return parseUpcomingEntries(text);
}

// Fixes for plain typos in the old site, each backed by the site's own other
// listings. Applied after merging; the original stays in `raw`, and the show
// gets a `corrected` note.
const CORRECTIONS = [
	{
		match: (s) => /magnus/i.test(s.venue ?? "") && s.city === "Madison" && s.region === "IL",
		fix: { region: "WI" },
		why: "Listed as Madison, IL; the site's other Restaurant Magnus listings say Madison, WI.",
	},
];

function applyCorrections(shows) {
	for (const show of shows) {
		for (const c of CORRECTIONS) {
			if (c.match(show)) Object.assign(show, c.fix, { corrected: c.why });
		}
	}
	return shows;
}

/**
 * Doug's hand edits from press/easternblok-shows-overrides.json, matched by
 * date + venue as they appear in the output. Null fields are blanks still to
 * fill and are skipped. Returns the overrides that matched no show, so a typo
 * in the file is reported instead of silently ignored.
 */
function applyOverrides(shows, overrides) {
	const unmatched = [];
	for (const o of overrides) {
		const show = shows.find((s) => s.date === o.date && s.venue === o.venue);
		if (!show) {
			unmatched.push(o);
			continue;
		}
		// "New Haven, CT" typed into city is split into city + region.
		const split = typeof o.city === "string" ? o.city.match(/^(.+?),\s*([A-Za-z]{2})$/) : null;
		const edit = split ? { ...o, city: split[1], region: o.region ?? split[2] } : o;
		for (const field of ["city", "region", "status", "confirmed"]) {
			if (edit[field] != null) show[field] = field === "region" ? tidyRegion(edit[field]) : edit[field];
		}
	}
	return unmatched;
}

function venueKey(venue) {
	return (venue ?? "").toLowerCase().replace(/^the\s+/, "").replace(/[^a-z0-9]/g, "").slice(0, 10);
}

/**
 * Merges parsed snapshots into one list. A show seen on any "past" list is
 * `past`; otherwise `announced`. Same date + similar venue = same show.
 */
function mergeShows(snapshots, recordings = []) {
	const byKey = new Map();
	// "past" lists first, so their spelling of a venue wins over an earlier
	// "upcoming" listing of the same show.
	const rank = (snap) => (kindOf(snap.file) === "past" ? 0 : 1);
	const sorted = [...snapshots].sort((a, b) => rank(a) - rank(b));
	for (const snap of sorted) {
		const kind = kindOf(snap.file);
		for (const show of snap.shows) {
			if (!show.date) continue;
			const key = `${show.date}|${venueKey(show.venue)}`;
			// A listing with no venue name joins the one show that day in the same city.
			const existing =
				byKey.get(key) ??
				(venueKey(show.venue) === ""
					? [...byKey.values()].find((s) => s.date === show.date && (s.city ?? "").toLowerCase() === (show.city ?? "").toLowerCase())
					: undefined);
			if (existing) {
				existing.sources.push(snap.id);
				if (kind === "past") existing.status = "past";
				for (const field of ["city", "region", "country", "venueUrl", "note"]) existing[field] ??= show[field] ?? null;
				continue;
			}
			byKey.set(key, {
				date: show.date,
				venue: tidyCase(show.venue),
				city: tidyCase(show.city),
				region: tidyRegion(show.region),
				country: show.country,
				venueUrl: show.venueUrl,
				note: show.note ?? null,
				status: kind === "past" ? "past" : "announced",
				recording: null,
				raw: show.raw,
				sources: [snap.id],
			});
		}
	}

	for (const rec of recordings) {
		const sameDay = [...byKey.values()].filter((s) => s.date === rec.date);
		const recVenue = venueKey(rec.venue.split(",")[0]);
		const match = sameDay.find((s) => venueKey(s.venue) === recVenue) ?? (sameDay.length === 1 ? sameDay[0] : null);
		if (match) {
			match.recording = rec.archiveId;
			continue;
		}
		const [venue, city] = rec.venue.split(",").map((s) => s.trim());
		byKey.set(`${rec.date}|rec|${recVenue}`, {
			date: rec.date,
			venue,
			city: city ?? null,
			region: null,
			country: null,
			venueUrl: null,
			note: null,
			status: "recorded",
			recording: rec.archiveId,
			raw: rec.venue,
			sources: ["internet-archive"],
		});
	}

	return applyCorrections([...byKey.values()]).sort((a, b) => a.date.localeCompare(b.date) || (a.venue ?? "").localeCompare(b.venue ?? ""));
}

function snapshotId(fileName) {
	return fileName.replace(/\.(html|xml)/, "").replace(/_+$/, "");
}

function main() {
	const args = process.argv.slice(2);
	const outIdx = args.indexOf("--out");
	const out = outIdx === -1 ? null : args[outIdx + 1];
	const dir = args.find((a, i) => !a.startsWith("--") && i !== outIdx + 1) ?? path.join(__dirname, "../../press-archive/easternblok-net-calendar/snapshots");

	const snapshots = fs
		.readdirSync(dir)
		.sort()
		.map((file) => {
			const shows = parseSnapshot(file, fs.readFileSync(path.join(dir, file), "utf8"));
			const timestamp = file.slice(0, 14);
			const page = file.slice(15).replace(/_showcal_past$/, "?showcal=past");
			return {
				id: snapshotId(file),
				file,
				page,
				wayback: `https://web.archive.org/web/${timestamp}/http://www.easternblok.net/${page}`,
				kind: kindOf(file),
				shows,
			};
		});

	const bandData = JSON.parse(fs.readFileSync(path.join(__dirname, "../site/src/data/eastern-blok-press.json"), "utf8"));
	const shows = mergeShows(snapshots, bandData.gigLog.shows);
	const overrides = JSON.parse(fs.readFileSync(path.join(__dirname, "easternblok-shows-overrides.json"), "utf8")).shows;
	const unmatched = applyOverrides(shows, overrides);
	for (const o of unmatched) console.warn(`warning: override matched no show: ${o.date} ${o.venue}`);

	const result = {
		_about:
			"Eastern Blok / Goran Ivanovic Group show history, rebuilt 2026-10-15 by press/easternblok-shows.cjs from the Wayback Machine's copies of the band's own site (easternblok.net calendar pages) plus the Internet Archive fan-recording log. status: past = on the band's own past-dates list, or confirmed by Doug (see confirmed); announced = only ever listed as upcoming (may not have happened); recorded = known only from a fan recording. Venue names are tidied for capitalization only; raw keeps the original text. Generated; don't hand-edit. Hand edits go in press/easternblok-shows-overrides.json.",
		sources: snapshots.map(({ id, page, wayback, kind, shows: s }) => ({ id, page, wayback, kind, shows: s.length })),
		shows,
	};

	const json = JSON.stringify(result, null, "\t") + "\n";
	if (out) fs.writeFileSync(out, json);
	const count = (status) => shows.filter((s) => s.status === status).length;
	console.log(`${shows.length} shows (${count("past")} past, ${count("announced")} announced, ${count("recorded")} recording-only), ${shows.filter((s) => s.recording).length} with a recording, ${shows[0]?.date} to ${shows[shows.length - 1]?.date}`);
	if (!out) process.stdout.write(json);
}

if (require.main === module) main();

module.exports = { parseDate, tidyCase, tidyRegion, cityRegion, parsePastTable, parseUpcomingEntries, parseRss, mergeShows, applyOverrides, venueKey };
