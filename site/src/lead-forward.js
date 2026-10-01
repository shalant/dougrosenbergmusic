// Best-effort forward of contact-form submissions into customer-intake-backend's
// Leads table (POST /api/leads). Kept free of Workers-only imports
// ("cloudflare:email") so it can be unit-tested under plain Node — see
// lead-forward.test.js. Same pattern as dougrosenbergdev's forwardLeadToErp().
//
// No auth/secret needed: that endpoint has no auth on POST (only CORS +
// per-IP rate limiting), and a server-to-server fetch from a Worker sends no
// Origin header, so the backend's browser-origin CORS check never applies.

export const LEAD_INTAKE_URL = "https://admin.dougrosenbergdev.com/api/leads";

// Whitelisted, not passed through raw — drives both the email subject tag and
// the lead's Source, so an arbitrary value from a direct API call (bypassing
// the <select>'s two real options) falls back to "music".
export const INTEREST_LABELS = {
	web: "Web Project",
	music: "Music",
};

// customer-intake-backend's LeadSource enum has exactly these two values.
// A web-project inquiry is a dev-services lead even though it arrives via the
// music site, so Source follows what the visitor asked for, not the site.
const LEAD_SOURCES = {
	web: "DevServices",
	music: "MusicBooking",
};

export function resolveInterest(interest) {
	return Object.hasOwn(INTEREST_LABELS, interest) ? interest : "music";
}

export function buildLeadPayload({ name, email, message, interest }) {
	const key = resolveInterest(interest);
	return {
		source: LEAD_SOURCES[key],
		name,
		email,
		// The backend Lead has no interest field, so keep it in the message text.
		message: `[Interested in: ${INTEREST_LABELS[key]}]\n\n${message}`,
	};
}

// Never throws: errors are logged, not propagated, so a backend outage can't
// turn into a failed contact form. fetchImpl is injectable for tests.
export async function forwardLeadToErp(fields, fetchImpl = fetch) {
	try {
		const res = await fetchImpl(LEAD_INTAKE_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(buildLeadPayload(fields)),
			signal: AbortSignal.timeout(5000),
		});
		if (!res.ok) {
			console.error("Lead intake forward failed:", res.status, await res.text());
		}
	} catch (err) {
		console.error("Lead intake forward error:", err);
	}
}
