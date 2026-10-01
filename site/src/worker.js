// Cloudflare Worker entry point — sits in front of the static-assets binding
// configured in wrangler.jsonc ("main" + "assets" together). Handles the one
// real API route (contact form submission -> email) and falls back to
// env.ASSETS.fetch() for every other request, which serves the Astro-built
// static site exactly as before this file existed. Same pattern as
// haxbyte.com's site/src/worker.js.
//
// Email is sent via Cloudflare's native Workers send_email binding (see the
// "send_email" block in wrangler.jsonc) rather than a third-party API — no
// external account or secret needed. Setup requirements, both one-time
// Cloudflare-dashboard steps: Email Routing must be enabled on the
// dougrosenberg.com zone, and the destination address below must be a
// verified "Destination Address" in this Cloudflare account's Email Routing
// settings (dashboard -> the zone -> Email -> Email Routing -> Destination
// Addresses) — until both are done, sends will fail with an error from the
// send_email binding.
//
// Each submission is also forwarded, best-effort, to customer-intake-backend's
// POST /api/leads (see lead-forward.js) so it lands in the Leads table.

import { EmailMessage } from "cloudflare:email";
import { INTEREST_LABELS, resolveInterest, forwardLeadToErp } from "./lead-forward.js";

const CONTACT_TO = "doug.rosenberg@gmail.com";
const FROM_ADDRESS = "contact@dougrosenberg.com";
const ALLOWED_ORIGINS = ["https://dougrosenberg.com", "https://www.dougrosenberg.com"];

function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Strips CR/LF so form input (name/email) can never inject extra headers
// into the raw MIME message built below.
function sanitizeHeaderValue(value) {
	return value.replace(/[\r\n]+/g, " ").trim();
}

// RFC 2047 encoding so a name/subject with non-ASCII characters renders
// correctly instead of being mangled by mail clients expecting ASCII headers.
// btoa only accepts a Latin1/byte string, so the UTF-8 bytes are mapped to
// one char each before encoding (the old unescape(encodeURIComponent())
// trick does the same thing but unescape is deprecated).
function encodeHeaderUtf8(value) {
	const bytes = new TextEncoder().encode(value);
	const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
	return `=?UTF-8?B?${btoa(binary)}?=`;
}

function buildRawEmail({ name, email, message, interest }) {
	const safeName = sanitizeHeaderValue(name);
	const safeEmail = sanitizeHeaderValue(email);
	const encodedName = encodeHeaderUtf8(safeName);
	// Whitelisted in lead-forward.js, not passed through raw - this drives the
	// subject-line triage tag and is echoed in the body.
	const interestLabel = INTEREST_LABELS[resolveInterest(interest)];

	return [
		`From: ${encodeHeaderUtf8("Doug Rosenberg Music — Contact Form")} <${FROM_ADDRESS}>`,
		`To: ${CONTACT_TO}`,
		`Reply-To: ${encodedName} <${safeEmail}>`,
		`Subject: ${encodeHeaderUtf8(`[${interestLabel}] New contact form message from ${safeName}`)}`,
		`Content-Type: text/plain; charset="UTF-8"`,
		`MIME-Version: 1.0`,
		``,
		`From: ${safeName} <${safeEmail}>`,
		`Interested in: ${interestLabel}`,
		``,
		message,
	].join("\r\n");
}

async function handleContact(request, env) {
	// Same-origin form, so a mismatched Origin means the request didn't come
	// from the real contact section — not full CSRF protection (no
	// session/token exists to protect), just a cheap reject of the obvious
	// cross-site case.
	const origin = request.headers.get("Origin");
	if (origin && !ALLOWED_ORIGINS.includes(origin)) {
		return json({ error: "Invalid origin" }, 403);
	}

	// CF-Connecting-IP is set by Cloudflare's edge on every request and can't
	// be spoofed by the client - keying on it caps a scripted flood from one
	// source without needing a session/cookie. Falls back to a shared key
	// only in local dev (wrangler dev doesn't set the header), so this never
	// throws on a missing binding there.
	const clientIp = request.headers.get("CF-Connecting-IP") ?? "local-dev";
	const { success } = await env.CONTACT_RATE_LIMITER.limit({ key: clientIp });
	if (!success) {
		return json({ error: "Too many requests — please try again in a minute." }, 429);
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: "Invalid request body" }, 400);
	}

	const { name, email, message, interest, website } = body ?? {};

	// Honeypot field: real visitors never see or fill it (hidden via CSS in
	// the form itself); bots that fill every field trip this silently.
	if (website) {
		return json({ ok: true });
	}

	if (!name || !email || !message) {
		return json({ error: "Name, email, and message are required." }, 400);
	}
	if (!isValidEmail(email)) {
		return json({ error: "Enter a valid email address." }, 400);
	}
	if (name.length > 200 || email.length > 200 || message.length > 5000) {
		return json({ error: "One of the fields is too long." }, 400);
	}

	const raw = buildRawEmail({ name, email, message, interest });
	const emailMessage = new EmailMessage(FROM_ADDRESS, CONTACT_TO, raw);

	// Email is the guaranteed channel - the visitor's response depends only on
	// it. The Leads-table forward runs alongside it (not after) but is
	// best-effort and never affects what the visitor sees; see lead-forward.js.
	const [emailResult] = await Promise.allSettled([
		env.CONTACT_EMAIL.send(emailMessage),
		forwardLeadToErp({ name, email, message, interest }),
	]);

	if (emailResult.status === "rejected") {
		console.error("send_email error:", emailResult.reason);
		return json(
			{ error: "Message could not be sent right now — please email directly instead." },
			502,
		);
	}

	return json({ ok: true });
}

// Cloudflare's static-assets binding auto-redirects any *.html URL to its
// extensionless form (307) via its default html_handling behavior. That's
// fine for normal pages, but Google's site-verification fetcher won't follow
// redirects - it needs a literal 200 at the exact *.html URL it was given.
// Served directly here instead of via env.ASSETS.fetch() to sidestep that
// redirect entirely, rather than disabling html_handling site-wide (which
// would break the clean extensionless URLs every other page relies on).
const GOOGLE_SITE_VERIFICATION = {
	"/google1dc7e3b5d5d6c264.html": "google-site-verification: google1dc7e3b5d5d6c264.html\n",
};

// Legacy URLs Google still has on file: the pre-Astro site's Blazor nav
// routes (which 404'd there too) and the deleted hero-exploration preview
// pages. Permanent-redirected to the closest section so Search Console
// stops reporting them as 404s and any residual link equity lands on the
// real page.
const LEGACY_REDIRECTS = {
	"/about": "/#about",
	"/contact": "/#contact",
	"/education": "/#about",
	"/listen": "/#listen",
	"/photogallery.html": "/#gallery",
	"/preview-graded-expand": "/",
	"/preview-shape-antenna": "/",
	"/preview-tv-leadsheet": "/",
};

// The pre-Astro site served sheet music from /sheetMusic/<CamelCaseName>.pdf;
// files now live in /sheetmusic/ with kebab-case names. Google still has the
// old URLs (Search Console 404s), so match on a normalized key (lowercase,
// alphanumerics only) and 301 to the current file, with a few aliases where
// the old name isn't just a re-spelling. Anything unmatched goes to the
// sheet-music section rather than a dead end.
const SHEET_MUSIC_FILES = {
	adagioandallegrohandel: "adagio-and-allegro-handel.pdf",
	aebersoldtrack6: "aebersold-track-6.png",
	alegrettoarensky: "alegretto-arensky.pdf",
	ariosobach: "arioso-bach.pdf",
	ariososinfoniabach: "arioso-sinfonia-bach.pdf",
	bachpreludepage2: "bach-prelude-page2.pdf",
	bachprelude: "bach-prelude.pdf",
	billiesbouncebb: "billies-bounce-bb.pdf",
	chansondeprintempspage2: "chanson-de-printemps-page2.png",
	concertinoguildhaud: "concertino-guildhaud.pdf",
	cornbreadbb: "corn-bread-bb.pdf",
	cornbreadleemorganeb: "corn-bread-lee-morgan-eb.pdf",
	diversecharlieparker: "diverse-charlie-parker.pdf",
	fantasypieceschumann: "fantasy-piece-schumann.pdf",
	furelise: "fur-elise.pdf",
	gbluesmelodies: "g-blues-melodies.jpg",
	gblues: "g-blues.jpg",
	habanera: "habanera.pdf",
	handelsonateno1: "handel-sonate-no1.pdf",
	hesapirate: "hes-a-pirate.pdf",
	inthehallofthemountainking: "in-the-hall-of-the-mountain-king.pdf",
	misamorescervantes: "mis-amores-cervantes.pdf",
	musictheoryquizaebersold: "music-theory-quiz-aebersold.pdf",
	nowsthetime: "nows-the-time.pdf",
	ochristmastreecl: "o-christmas-tree-cl.pdf",
	putyourrecordson: "put-your-records-on.pdf",
	rainbowroad: "rainbow-road.pdf",
	rhapsodyinbluecl: "rhapsody-in-blue-cl.pdf",
	rhapsodypage1: "rhapsody-page1.pdf",
	rigaudon: "rigaudon.pdf",
	rubankbookofsolosintermediate: "rubank-book-of-solos-intermediate.pdf",
	sleighride: "sleigh-ride.jpg",
	spidermanbb: "spiderman-bb.pdf",
	starwars: "star-wars.pdf",
	supermarioeb: "super-mario-eb.pdf",
	takemeouttotheballgame: "take-me-out-to-the-ballgame.pdf",
	valsetristegliere: "valse-triste-gliere.pdf",
	wewishyouamerrychristmas: "we-wish-you-a-merry-christmas.pdf",
	wiithemebb: "wii-theme-bb.pdf",
	wiithemeeb: "wii-theme-eb.pdf",
	yaketysax: "yakety-sax.pdf",
	youbelongwithme: "you-belong-with-me.jpg",
	youvegotafriendinme: "youve-got-a-friend-in-me.jpg",
};
const SHEET_MUSIC_ALIASES = {
	wewishyouamerry34: "we-wish-you-a-merry-christmas.pdf",
	adagioandallegrobyhandel: "adagio-and-allegro-handel.pdf",
};

function legacySheetMusicTarget(pathname) {
	const match = pathname.match(/^\/sheetMusic\/([^/]+)$/);
	if (!match) return null;
	let name;
	try {
		name = decodeURIComponent(match[1]);
	} catch {
		return "/#sheet-music";
	}
	const key = name.toLowerCase().replace(/\.[a-z]+$/, "").replace(/[^a-z0-9]/g, "");
	const file = SHEET_MUSIC_ALIASES[key] ?? SHEET_MUSIC_FILES[key];
	return file ? `/sheetmusic/${file}` : "/#sheet-music";
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		const sheetMusicTarget = legacySheetMusicTarget(url.pathname);
		if (sheetMusicTarget) {
			return Response.redirect(new URL(sheetMusicTarget, url).href, 301);
		}

		const legacyPath = url.pathname.replace(/\/+$/, "");
		if (legacyPath in LEGACY_REDIRECTS) {
			return Response.redirect(new URL(LEGACY_REDIRECTS[legacyPath], url).href, 301);
		}

		if (url.pathname === "/api/contact") {
			if (request.method !== "POST") {
				return json({ error: "Method not allowed" }, 405);
			}
			return handleContact(request, env);
		}

		if (url.pathname in GOOGLE_SITE_VERIFICATION) {
			return new Response(GOOGLE_SITE_VERIFICATION[url.pathname], {
				headers: { "Content-Type": "text/html; charset=utf-8" },
			});
		}

		return env.ASSETS.fetch(request);
	},
};
