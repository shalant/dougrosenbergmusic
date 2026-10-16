const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
	parseDate,
	tidyCase,
	tidyRegion,
	cityRegion,
	parsePastTable,
	parseUpcomingEntries,
	parseRss,
	mergeShows,
} = require("./easternblok-shows.cjs");

// Fixtures are short excerpts in the exact markup of the archived
// easternblok.net calendar pages (see the header of easternblok-shows.cjs).

test("parseDate reads every date style the site used", () => {
	assert.equal(parseDate("Dec&nbsp;21,&nbsp;2011"), "2011-12-21");
	assert.equal(parseDate("&nbsp;November&nbsp;19,&nbsp;2008"), "2008-11-19");
	assert.equal(parseDate("Sunday, October 18th, 2009"), "2009-10-18");
	assert.equal(parseDate("Feb 4, 2012"), "2012-02-04");
	assert.equal(parseDate("no date here"), null);
});

test("tidyCase only touches all-lowercase text", () => {
	assert.equal(tidyCase("new trier high school"), "New Trier High School");
	assert.equal(tidyCase("Johnny D's"), "Johnny D's");
	assert.equal(tidyCase("WORLD MUSIC FESTIVAL"), "WORLD MUSIC FESTIVAL");
});

test("tidyRegion turns state spellings into postal codes", () => {
	assert.equal(tidyRegion("il"), "IL");
	assert.equal(tidyRegion("Illinois"), "IL");
	assert.equal(tidyRegion("New York"), "NY");
	assert.equal(tidyRegion("Poland"), "Poland");
});

test("cityRegion handles address blocks, zip codes and sentences", () => {
	assert.deepEqual(cityRegion(["1920 W. Irving Park Road", "Chicago, IL"]), { city: "Chicago", region: "IL" });
	assert.deepEqual(cityRegion(["Kalamazoo, MI 49007"]), { city: "Kalamazoo", region: "MI" });
	assert.deepEqual(cityRegion(["glencoe", "il"]), { city: "glencoe", region: "il" });
	assert.deepEqual(cityRegion(["mn"]), { city: null, region: "mn" });
	assert.deepEqual(cityRegion(["Eastern Blok will be performing at The Ford/Comerica Global Thursday Multicultural Series at:"]), { city: null, region: null });
});

test("parsePastTable reads the 2008 newline layout", () => {
	const html = `<table id="calendar"><tr>
<td><span class="date">&nbsp;November&nbsp;15,&nbsp;2008</span></td>
<td><a href="http://www.kirksvillerocks.com" target="_blank">Wrongdaddy's</a>
Kirksville
MO</td>
</tr></table>`;
	assert.deepEqual(parsePastTable(html), [
		{ date: "2008-11-15", venue: "Wrongdaddy's", city: "Kirksville", region: "MO", country: null, venueUrl: "http://www.kirksvillerocks.com", raw: "Wrongdaddy's / Kirksville / MO" },
	]);
});

test("parsePastTable reads the 2012 tab layout and attaches note rows", () => {
	const html = `<table id="calendar">
	<tr id="event_254">
		<td><span class="date">Dec&nbsp;21,&nbsp;2011</span></td>
		<td>
			<a href='http://www.schubas.com' target='_blank'>schubas</a>			chicago			il					</td>
	</tr>
		<tr>
		<td colspan="2"><p><i>this will sell out, and it's not to be missed!</i></p></td>
	</tr>
	<tr id="event_246">
		<td><span class="date">Dec&nbsp;11,&nbsp;2011</span></td>
		<td>
			<a href='http://www.beachlandballroom.com' target='_blank'>Beachland Ballroom/Tavern</a>			Cleveland			Ohio			US		</td>
	</tr></table>`;
	const shows = parsePastTable(html);
	assert.equal(shows.length, 2);
	assert.equal(shows[0].venue, "schubas");
	assert.equal(shows[0].city, "chicago");
	assert.equal(shows[0].note, "this will sell out, and it's not to be missed!");
	assert.equal(shows[1].country, "US");
});

test("parsePastTable reads venue-plus-state rows", () => {
	const html = `<tr><td><span class="date">Sep&nbsp;17,&nbsp;2009</span></td><td>Minnesota State U			Mn		</td></tr>`;
	const [show] = parsePastTable(html);
	assert.equal(show.city, null);
	assert.equal(show.region, "Mn");
});

test("parseUpcomingEntries reads entry blocks", () => {
	const html = `<div class="entry">
<h2>Thursday, July 12th, 2007</h2>
<h3>Katerina's</h3>
<div class="details"><h4>8 PM</h4></div>
<p>
1920 W. Irving Park Road<br />
Chicago, IL<br />
<br />
*Eastern Blok in RESIDENCY
</p>
</div>`;
	const [show] = parseUpcomingEntries(html);
	assert.equal(show.date, "2007-07-12");
	assert.equal(show.venue, "Katerina's");
	assert.equal(show.city, "Chicago");
	assert.equal(show.region, "IL");
});

test("parseRss reads calendar.xml items", () => {
	const xml = `<item>
<title>Feb 4, 2012 - Wood Dale, IL</title>
<description><![CDATA[<b>Feb 4, 2012 @ 8pm</b><br />Art Gallery Kafe<br />127 Front St.<br />Wood Dale, IL<br />]]></description>
</item>`;
	const [show] = parseRss(xml);
	assert.equal(show.date, "2012-02-04");
	assert.equal(show.venue, "Art Gallery Kafe");
	assert.equal(show.city, "Wood Dale");
});

const show = (overrides) => ({ date: "2011-12-21", venue: "Schubas", city: "Chicago", region: "IL", country: null, venueUrl: null, raw: "", ...overrides });

test("mergeShows prefers past lists, joins duplicates, and tidies case", () => {
	const merged = mergeShows([
		{ id: "a_calendar", file: "a_calendar.html", shows: [show({ venue: "schubas", city: "chicago", region: "il" })] },
		{ id: "b_calendar-past", file: "b_calendar-past.html", shows: [show({ venue: "schubas", city: "chicago", region: "il" })] },
	]);
	assert.equal(merged.length, 1);
	assert.equal(merged[0].status, "past");
	assert.equal(merged[0].venue, "Schubas");
	assert.equal(merged[0].region, "IL");
	assert.deepEqual(merged[0].sources, ["b_calendar-past", "a_calendar"]);
});

test("mergeShows keeps an upcoming-only show as announced", () => {
	const [merged] = mergeShows([{ id: "a", file: "a_calendar.html", shows: [show({ date: "2012-02-04" })] }]);
	assert.equal(merged.status, "announced");
});

test("mergeShows joins a listing with no venue to the same-city show that day", () => {
	const merged = mergeShows([
		{ id: "p", file: "p_calendar.html_showcal_past", shows: [show({ date: "2008-11-15", venue: "Wrongdaddy's", city: "Kirksville", region: "MO" })] },
		{ id: "u", file: "u_calendar.html", shows: [show({ date: "2008-11-15", venue: "", city: "Kirksville", region: "MO" })] },
	]);
	assert.equal(merged.length, 1);
});

test("mergeShows keeps two shows on the same day in different places", () => {
	const merged = mergeShows([
		{ id: "p", file: "p_calendar-past.html", shows: [show({ date: "2011-12-09", venue: "The Bullfrog Brewery" }), show({ date: "2011-12-09", venue: "Mt. Anthony Union High School" })] },
	]);
	assert.equal(merged.length, 2);
});

test("mergeShows links fan recordings and adds recording-only shows", () => {
	const merged = mergeShows(
		[{ id: "p", file: "p_calendar-past.html", shows: [show({ date: "2011-12-11", venue: "Beachland Ballroom/Tavern", city: "Cleveland" })] }],
		[
			{ date: "2011-12-11", venue: "The Beachland Tavern", archiveId: "eb2011-12-11" },
			{ date: "2005-06-24", venue: "HotHouse, Chicago", archiveId: "gorangroup2005-06-24" },
		],
	);
	assert.equal(merged.length, 2);
	assert.equal(merged.find((s) => s.date === "2011-12-11").recording, "eb2011-12-11");
	const early = merged.find((s) => s.date === "2005-06-24");
	assert.equal(early.status, "recorded");
	assert.equal(early.venue, "HotHouse");
	assert.equal(early.city, "Chicago");
});

test("mergeShows fixes the Restaurant Magnus state typo and says so", () => {
	const [merged] = mergeShows([{ id: "p", file: "p_calendar-past.html", shows: [show({ venue: "Restaurant Magnus", city: "Madison", region: "IL" })] }]);
	assert.equal(merged.region, "WI");
	assert.match(merged.corrected, /Madison, WI/);
});
