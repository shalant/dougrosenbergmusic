// Builds the data for /easternblok/press from src/data/eastern-blok-press.json.
// Only entries with approved: true are shown, so flipping that flag is still
// how Doug controls what goes public. Fan and forum comments and the concert
// recording (already in the show log) are never shown, approved or not.
// Pure functions, tested in press-archive.test.js.

const NEVER_SHOWN = new Set(['listener-comment', 'concert-recording']);

/** Plain-language names for each entry kind. */
export const KIND_LABEL = {
	review: 'Review',
	feature: 'Feature',
	preview: 'Preview',
	interview: 'Interview',
	listing: 'Listing',
	mention: 'Mention',
	retrospective: 'Look back',
	quote: 'Testimonial',
	'promo-bio': 'Band bio',
	recording: 'Radio session',
};

// Kinds whose pull quotes go on the review wall. Previews, interviews and
// mentions keep their quote inline in the year ledger instead: their best
// lines are usually about the gig, not the music.
const WALL_KINDS = new Set(['review', 'feature']);
const MAX_WALL_WORDS = 30;

const wordCount = (text) => text.trim().split(/\s+/).length;
const quoteText = (q) => (typeof q === 'string' ? q : q.text);

/** Splits "2008-03-24", "2008-03" or "2008" into numbers; null if it has no year. */
export function dateParts(date) {
	const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(date ?? '');
	if (!m) return null;
	return { year: Number(m[1]), month: m[2] ? Number(m[2]) : null, day: m[3] ? Number(m[3]) : null };
}

/** The date an entry sits at: its own, else the first show it lists. */
export function sortDate(entry) {
	return entry.date || entry.showDates?.[0] || null;
}

/** True where the band itself wrote or issued the piece, so it is not independent press. */
export function isFromBand(entry) {
	return entry.kind === 'promo-bio' || /\bband\b|the band's own/i.test(entry.outlet);
}

/** Quote text as shown: a leading "(translated ...)" note and "..." are tidied. */
export function cleanQuote(text) {
	return text
		.replace(/^\(translated[^)]*\)\s*/i, '')
		.replace(/^\.\.\./, '…')
		.replace(/\.\.\.$/, '…')
		.replace(/^"|"$/g, '')
		.trim();
}

/** True where the pull quote is the entry's own translation of a foreign-language source. */
export const isTranslated = (entry) => entry.pullQuotes.some((q) => /^\(translated/i.test(quoteText(q)));

/** The quote to feature for an entry: one that names Doug if there is one, else the first short one. */
export function shortQuote(entry) {
	if (isFromBand(entry)) return null;
	const quotes = entry.pullQuotes.map((q) => cleanQuote(quoteText(q))).filter((t) => t && wordCount(t) <= MAX_WALL_WORDS);
	if (quotes.length === 0) return null;
	return quotes.find((t) => /rosenberg/i.test(t)) ?? quotes[0];
}

/** The quote for the review wall, or null if the entry belongs in the ledger. */
export function wallQuote(entry) {
	return WALL_KINDS.has(entry.kind) ? shortQuote(entry) : null;
}

/** Splits a quote around Doug's surname so the page can colour it. */
export function highlightName(text) {
	const m = /(Doug Rosenberg|Rosenberg)/.exec(text);
	if (!m) return [{ text, name: false }];
	return [
		{ text: text.slice(0, m.index), name: false },
		{ text: m[0], name: true },
		{ text: text.slice(m.index + m[0].length), name: false },
	].filter((part) => part.text);
}

export function publicEntries(entries) {
	return entries.filter((e) => e.approved === true && !NEVER_SHOWN.has(e.kind));
}

const byDate = (a, b) => (sortDate(a) ?? '9999').localeCompare(sortDate(b) ?? '9999');

/**
 * Everything the page needs: the review wall, a per-year ledger of every
 * other piece, tick positions for the timeline strip, and the counts.
 */
export function buildArchive(entries) {
	const shown = publicEntries(entries).sort(byDate);
	const wall = [];
	const rest = [];
	for (const entry of shown) {
		const quote = wallQuote(entry);
		if (quote) wall.push({ entry, quote });
		else rest.push(entry);
	}

	const years = new Map();
	for (const entry of rest) {
		const parts = dateParts(sortDate(entry));
		const key = parts ? String(parts.year) : 'Undated';
		if (!years.has(key)) years.set(key, []);
		years.get(key).push(entry);
	}

	const outlets = new Set(shown.map((e) => e.outlet.replace(/\s*[(,].*$/, '').trim()));
	const dated = shown.map((e) => dateParts(sortDate(e))).filter(Boolean);
	return {
		wall,
		years: [...years.entries()],
		total: shown.length,
		outletCount: outlets.size,
		firstYear: Math.min(...dated.map((d) => d.year)),
		lastYear: Math.max(...dated.map((d) => d.year)),
		shown,
	};
}

/** Position 0..1 of a date within [startYear, endYear + 1), or null outside it or undated. */
export function tickPosition(date, startYear, endYear) {
	const parts = dateParts(date);
	if (!parts || parts.year < startYear || parts.year > endYear) return null;
	const month = (parts.month ?? 6) - 1;
	const day = parts.day ? (parts.day - 1) / 31 : 0.5;
	const months = (parts.year - startYear) * 12 + month + day;
	return months / ((endYear - startYear + 1) * 12);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Mar 24" / "Mar" / "" (day, month, year only), or with the year added: "Mar 24, 2008" / "Mar 2008" / "2008". */
export function dateLabel(date, withYear = false) {
	const p = dateParts(date);
	if (!p) return '';
	const monthDay = p.month ? `${MONTHS[p.month - 1]}${p.day ? ` ${p.day}` : ''}` : '';
	if (!withYear) return monthDay;
	if (!monthDay) return String(p.year);
	return p.day ? `${monthDay}, ${p.year}` : `${monthDay} ${p.year}`;
}
