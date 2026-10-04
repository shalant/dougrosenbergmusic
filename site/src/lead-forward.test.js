import { test, mock } from "node:test";
import assert from "node:assert/strict";
import {
	buildLeadPayload,
	forwardLeadToErp,
	INTEREST_LABELS,
	LEAD_INTAKE_URL,
	MAX_MESSAGE_LENGTH,
	ORIGIN_SITE,
} from "./lead-forward.js";

const fields = { name: "Test Person", email: "test@example.com", message: "Hello there" };

test("music interest maps to MusicBooking and tags the message", () => {
	const p = buildLeadPayload({ ...fields, interest: "music" });
	assert.equal(p.source, "MusicBooking");
	assert.equal(p.message, "[Interested in: Music]\n\nHello there");
	assert.equal(p.name, "Test Person");
	assert.equal(p.email, "test@example.com");
});

test("web interest maps to DevServices", () => {
	const p = buildLeadPayload({ ...fields, interest: "web" });
	assert.equal(p.source, "DevServices");
	assert.match(p.message, /^\[Interested in: Web Project\]/);
});

test("missing or unknown interest falls back to MusicBooking", () => {
	assert.equal(buildLeadPayload({ ...fields }).source, "MusicBooking");
	assert.equal(buildLeadPayload({ ...fields, interest: "__proto__" }).source, "MusicBooking");
	assert.equal(buildLeadPayload({ ...fields, interest: "evil" }).source, "MusicBooking");
});

test("every interest sends originSite dougrosenberg.com", () => {
	// Asserting the literal as well as the constant: the backend's allowlist is an
	// exact match, so a typo in ORIGIN_SITE would otherwise pass this test.
	assert.equal(ORIGIN_SITE, "dougrosenberg.com");
	for (const interest of ["music", "web"]) {
		const p = buildLeadPayload({ ...fields, interest });
		assert.equal(p.originSite, "dougrosenberg.com");
	}
});

test("a message at the form's length cap still fits the backend's 4000 after the interest tag", () => {
	// The backend caps Lead.Message at 4000 and stores the prefixed text, so the cap
	// the form enforces (MAX_MESSAGE_LENGTH) has to leave room for the longest tag.
	const atCap = "x".repeat(MAX_MESSAGE_LENGTH);
	for (const interest of Object.keys(INTEREST_LABELS)) {
		const p = buildLeadPayload({ ...fields, message: atCap, interest });
		assert.ok(
			p.message.length <= 4000,
			`${interest}: prefixed message is ${p.message.length} characters, over the backend's 4000`,
		);
	}
});

test("forward POSTs JSON to the lead intake URL with a timeout signal", async () => {
	const fetchMock = mock.fn(async () => new Response("{}", { status: 201 }));
	await forwardLeadToErp({ ...fields, interest: "web" }, fetchMock);
	assert.equal(fetchMock.mock.callCount(), 1);
	const [url, init] = fetchMock.mock.calls[0].arguments;
	assert.equal(url, LEAD_INTAKE_URL);
	assert.equal(init.method, "POST");
	assert.equal(init.headers["Content-Type"], "application/json");
	assert.equal(JSON.parse(init.body).source, "DevServices");
	assert.ok(init.signal instanceof AbortSignal);
});

test("a non-OK response is logged, not thrown", async () => {
	const err = mock.method(console, "error", () => {});
	await forwardLeadToErp(fields, async () => new Response("boom", { status: 429 }));
	assert.equal(err.mock.callCount(), 1);
	err.mock.restore();
});

test("a network error is logged, not thrown", async () => {
	const err = mock.method(console, "error", () => {});
	await forwardLeadToErp(fields, async () => {
		throw new Error("network down");
	});
	assert.equal(err.mock.callCount(), 1);
	err.mock.restore();
});
