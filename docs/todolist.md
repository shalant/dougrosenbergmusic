# Todo List

**Status (2026-09-07, late evening):** hero/nav direction is locked (full-bleed graded hero + a
TV/DR logo top-left linking home + icon-marked staff nav, "DEV" note linking to
dougrosenbergdev.com). **The site is now fully live at https://dougrosenberg.com** — domain cutover
complete (DNS propagated, Custom Domain attached, `astro.config.mjs` updated), GitHub Pages
retired. A same-evening SEO/GEO pass added `llms.txt`, a `WebSite` JSON-LD block, and fixed a real
CSP hash bug that had silently broken `StaffNav`'s script in production. Two items are flagged for
Doug specifically, not done autonomously: submitting the sitemap to Search Console, and a decision
on Cloudflare's auto-injected AI-crawler-blocking `robots.txt` rule (see the domain-cutover
checklist under "Migrate deployment" for both). This doc tracks what's left, in order.

This project is also the reference build behind `career-development/projects/SITE_BUILD_CHECKLIST.md`
and `career-development/docs/SITE_QUALITY_CHECKLIST.md` — those two are the master checklists (living
docs, updated centrally when a new practice surfaces). This file doesn't duplicate them; it tracks
this project's own custom items and where it stands against them.

## Order of operations

1. **Finish basic content/build items** — this project isn't feature-complete yet.
2. **Migrate deployment from GitHub Pages to Cloudflare.** The master checklist specs
   Astro + Cloudflare, not GitHub Pages — several QA items below (security headers via
   `public/_headers`, HTTPS/HSTS, Core Web Vitals against the real production URL, a custom 404)
   can only be verified for real once the site is on its actual target host. Do this before the
   checklist pass, not after, to avoid auditing GitHub Pages and then re-auditing post-move.
   - [x] Repo-side prep done: `site/wrangler.jsonc` added (assets-only, no worker script needed —
         Contact.astro is a plain `mailto:` link, unlike haxbyte's email-handling worker).
         `astro.config.mjs`'s `base`/`site` are now conditional on `DEPLOY_TARGET=gh-pages` (set in
         `.github/workflows/deploy.yml`) so GitHub Pages keeps its `/dougrosenbergmusic/` subpath
         while a plain `npm run build` (what Cloudflare's dashboard runs) serves from root. Verified
         both build modes produce correct asset URLs.
   - [x] Connected the repo in the Cloudflare dashboard (Workers & Pages → Create) — done
         2026-09-06. Used a dedicated `dougrosenbergmusic` deploy token rather than reusing
         haxbyte's build token (scoped separately on purpose). Root directory `site`, build
         command `npm run build`, deploy command `npx wrangler deploy`. Build succeeded, live at
         https://dougrosenbergmusic.doug-rosenberg.workers.dev — verified in-browser, root-path
         asset URLs and the DEV nav link both render correctly.
   - [x] Replaced the placeholder `cloudflareSite` URL in `astro.config.mjs` with the real
         workers.dev URL above.
   - [x] GitHub Pages retired 2026-09-06: removed `.github/workflows/deploy.yml`, simplified
         `astro.config.mjs` back to a single hardcoded Cloudflare `site`/`base` (no more
         `DEPLOY_TARGET` conditional — there's only one deploy target now). The GitHub Pages site
         itself (`shalant.github.io/dougrosenbergmusic/`) was disabled directly via the GitHub API,
         outside this PR, since that's a repo-settings action, not a code change.
   - [x] **Domain cutover to dougrosenberg.com — LIVE as of 2026-09-07 evening.** Decided to proceed
         (previously an open/undecided item). Live DNS check before starting confirmed: registrar
         is GoDaddy, current host is GitHub Pages (apex A-records to GitHub's 4 IPs, `www` CNAMEd to
         `shalant.github.io`), no MX record (no email hosted at the domain), one `_dmarc` TXT record
         to preserve. The old site's nav sub-paths (`/about`, `/contact`, `/education`, `/listen`)
         all 404 on direct load — Blazor client routes with no SPA fallback — so nothing is actually
         indexed there to redirect.
         Steps, in order:
         1. [x] Added `dougrosenberg.com` as a Cloudflare zone ("Connect a domain") — DNS records
                scanned/imported correctly (4 GitHub Pages A-records, `www`→`shalant.github.io`
                CNAME, the `_dmarc` TXT, plus two GoDaddy helper CNAMEs — `_domainconnect` and a
                `pay.` one for GoDaddy Payments, both harmless either way).
         2. [x] Nameservers changed at GoDaddy to `carrera.ns.cloudflare.com` /
                `charles.ns.cloudflare.com`, done 2026-09-07 — confirmed correct on GoDaddy's own
                Nameservers screen. Propagation confirmed complete same day via `nslookup -type=NS`
                against both `8.8.8.8` and `1.1.1.1`; zone active, no downtime during the wait.
         3. [x] **Custom Domain attached 2026-09-07 evening.** First attempt via
                `npx wrangler deploy` (added `routes` with `custom_domain: true` for both hosts to
                `site/wrangler.jsonc`) failed: `Hostname 'dougrosenberg.com' already has externally
                managed DNS records` — the imported GitHub Pages A-records were blocking Cloudflare
                from provisioning its own. Doug deleted the 4 apex A-records and the `www` CNAME
                (kept `_domainconnect`, `pay.`, and `_dmarc` — unrelated/still needed) via the
                dashboard's DNS tab; re-ran `wrangler deploy` and both hosts attached cleanly.
                `wrangler` here is authenticated as Doug's own Cloudflare account with sufficient
                token scope (`workers_routes: write`, `ssl_certs: write`) to do this from the
                terminal — no dashboard click-through needed once the conflicting records were gone.
         4. [x] Updated `astro.config.mjs`'s `site` from the `workers.dev` URL to
                `https://dougrosenberg.com`; rebuilt and redeployed. Verified via `curl`: canonical
                tag and `sitemap-index.xml` both now reference the real domain.
         5. [x] Verified live: `curl -I` confirms HSTS/CSP/security headers present on the real
                domain; a real Lighthouse run against `https://dougrosenberg.com/` (not just local
                `dist/`) scores 87 performance / 100 accessibility / 100 best-practices / 92 SEO.
                The SEO score is capped by one thing outside this repo's control — see the
                Cloudflare AI-bot item below. Full section-by-section + mobile spot-check not yet
                done (screenshots, not just Lighthouse).
         6. [ ] Disable the old GitHub Pages site (Settings → Pages, on whichever repo currently
                serves it) — formal cleanup once DNS no longer points there. Not done — needs GitHub
                access to that specific repo (`newMusicWebsiteJan26` per `docs/DESIGN_NOTES.md`'s
                Reference section), unconfirmed whether this session has it.
         7. [ ] Submit the new sitemap to Google Search Console for the property, request
                re-indexing. **Needs Doug** — requires his Google account.
         **Separately decided, not coupled to the above:** eventually transfer domain
         *registration* itself from GoDaddy to Cloudflare Registrar too (wholesale pricing, free
         WHOIS privacy) — but that's an independent errand (unlock + EPP code + several-day ICANN
         wait), doesn't need to happen before or after the cutover above.
         **Now unblocked, not yet started:** a real contact form, same pattern as `haxbyte.com`'s (a
         Worker + Cloudflare's native `send_email` binding, see the Contact Form item below) — that
         binding needs Email Routing active on `dougrosenberg.com`. The domain is attached now, so
         this is technically unblocked, but standing up Email Routing is itself a mail-routing/
         integration change — held here for an explicit go-ahead rather than set up unasked, even
         though the wrangler token's scope (`email_routing: write`) could technically do it.
   - [x] **Cloudflare auto-injects an AI-crawler-blocking `robots.txt` block — flagged, not
         changed (2026-09-07).** Discovered while investigating a Lighthouse `robots.txt is not
         valid` finding against the live domain: Cloudflare's zone-level "Content Signals"/AI Crawl
         Control feature wraps this repo's actual `public/robots.txt` (a plain `Allow: /`) with an
         injected block that explicitly `Disallow`s `GPTBot`, `ClaudeBot`, `Google-Extended`,
         `Applebot-Extended`, and `meta-externalagent` — exactly the crawlers that feed AI answer
         engines (ChatGPT, Claude, Google AI Overviews, Apple Intelligence, Meta AI). This directly
         works against the GEO work below: content can't be cited by an answer engine whose crawler
         is blocked outright. **Deliberately not changed here** — this is a real content-licensing
         decision (allow AI training/citation vs. not), not a technical toggle, and needs Doug's
         call, not an autonomous one. The setting lives in the Cloudflare dashboard (Security →
         Bots, or similar — not confirmed exactly where) for the `dougrosenberg.com` zone; the
         `zone` scope on this session's wrangler token is read-only, so it couldn't be changed from
         here even if it were the right call to make unasked. Doug's own blog post on
         dougrosenbergdev.com (`Why GEO Doesn't Work in a Blazor WASM SPA`) covers exactly this
         class of problem on a different site — worth his own read for context on the framing.
   - [x] **SEO/GEO pass against the live domain (2026-09-07 evening).** Prompted by "implement SEO,
         GEO, and the easy items" while Doug was away — everything below is done without needing
         him, logged here rather than assumed obvious:
         - Fixed a stale `Sitemap:` URL in `public/robots.txt` (still pointed at the old
           `workers.dev` host).
         - Added `public/llms.txt`, following the same convention Doug already uses on
           dougrosenbergdev.com (`PortfolioNov25/src/BlazorApp/wwwroot/llms.txt`) — a plain-text
           orientation summary for AI systems, listing background, page sections, and contact info.
         - Added a `WebSite` JSON-LD block alongside the existing `Person` schema in
           `BaseLayout.astro`, matching the `Person`/`WebSite`/`SoftwareApplication` pattern his own
           portfolio site uses (no `SoftwareApplication` here — doesn't apply to a musician site).
         - Verified this site doesn't have the client-render-gating problem Doug's own GEO blog
           post found on his Blazor WASM portfolio: `curl`'d the live homepage directly and
           confirmed real content (bio text, venue names, album titles) is present in the plain
           HTML, not hidden behind JS hydration — Astro's static rendering already avoids that
           failure mode structurally.
         - Audited alt text on every `<img>` site-wide (About, Hero, Gallery, Listen, Sheet Music
           viewer) — all meaningful already, including the two dynamically-populated ones (gallery
           lightbox, sheet-music viewer image) which do get real alt text set via JS. No changes
           needed.
         - **Real bug found and fixed in the process, unrelated to SEO but caught while
           regenerating CSP hashes for the new `WebSite` script:** `public/_headers`'s CSP
           `script-src` hashes were stale from an *earlier* same-day StaffNav.astro edit (the
           logo-click preventDefault fix) that was deployed without ever regenerating hashes —
           meaning StaffNav's own script had been silently CSP-blocked in production since that
           deploy. Confirmed via direct DOM testing on the live site (an IntersectionObserver
           active-state check, not a click — this environment's browser automation doesn't support
           `scrollIntoView`/`scrollTo` with `behavior: 'smooth'` at all, which looked like a broken
           click at first and wasn't). Regenerated all 5 current hashes and redeployed; reconfirmed
           the active-state tracking now fires correctly on real scroll. Lesson: any StaffNav/
           Gallery/SheetMusicLibrary/BaseLayout script edit needs a hash regen before its next
           deploy, not just before merge — this one shipped without one.
         - Re-ran Lighthouse against the live domain after all fixes: best-practices 93 → 100
           (console-clean now); SEO holds at 92, capped by the Cloudflare robots.txt item above,
           outside this repo's control.
         - **Not done, needs Doug:** submitting the sitemap to Search Console (his Google account);
           the Cloudflare AI-bot-blocking decision above; verifying Cloudflare Web Analytics is
           still tracking correctly now that the beacon's registered hostname
           (`dougrosenbergmusic.doug-rosenberg.workers.dev`) differs from where it's actually served
           (`dougrosenberg.com`) — unconfirmed whether Web Analytics needs the new hostname added
           explicitly or auto-discovers it.
3. **Run the full checklist pass** against the live Cloudflare URL: `SITE_BUILD_CHECKLIST.md`
   §3–8 + all 68 items in `SITE_QUALITY_CHECKLIST.md`. Expect multiple rounds — items like
   contrast, `:focus-visible` states, and breakpoint gaps tend to surface fixes that need
   re-checking.
   - [x] **Round 1 (2026-09-06):**
     - Single `<main>` landmark added around every page's content (was missing entirely —
       `BaseLayout.astro` now wraps `<slot />`).
     - Real accessibility bug found and fixed: the primary desktop staff-nav had a `:hover` state
       but no `:focus-visible` state at all (same failure mode the checklist calls out from a
       prior project). Fixed in `StaffNav.astro` — then found a second-order bug while verifying
       it live: the *active* section's note has its own pulsing `breathe-active` animation that
       continuously redeclares `box-shadow` every frame, silently overriding the new focus ring
       whenever the active note was the one tabbed to. Fixed by disabling that animation on
       `:focus-visible`. Verified via direct DOM `.focus()` + computed-style checks in the
       browser, not just a code read.
     - Contrast-checked every accent color used as text (brass/orange/teal/purple/red/blue) against
       the dark background — all pass AA, 5.5:1–8.8:1. No dual-theme toggle exists (deliberate,
       per `docs/DESIGN_NOTES.md`), so only the one theme needed checking.
     - SEO foundation added: canonical tag, Open Graph + Twitter card tags, a real `og:image`
       cropped to 1200×630 from the hero photo (via ImageMagick, visually verified — not just
       trusted from the resize command), Person JSON-LD, `robots.txt`, and `sitemap.xml` via
       `@astrojs/sitemap`.
     - Custom `404.astro` page added (was the host's bare default before).
     - `public/_headers` added with HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy,
       and a CSP with sha256-pinned inline scripts (not `unsafe-inline`) — same pattern as
       haxbyte.com. Astro inlines every page's `<script>` bodies directly into the HTML, so each
       of the 4 unique inline scripts (Person JSON-LD, StaffNav, SheetMusicLibrary, Gallery) needed
       its own hash; verified by recomputing hashes against a fresh build and diffing against what
       shipped in `_headers`. Verified live post-deploy 2026-09-06 via `curl -sI` against the
       production URL — all headers present, CSP hashes match exactly, no console violations.
   - [x] **Round 2, part 1 (2026-09-06): font self-hosting.** Attempted a Performance audit first
         via the PageSpeed Insights API, but its public quota was exhausted for this environment
         (`429 rateLimitExceeded`) — fell back to manually inspecting real network requests
         instead. That surfaced the Google Fonts `@import` as an actual render-blocking
         cross-origin request (not just a checklist checkbox), so fixed it: downloaded the 4
         actual variable-font files Google serves for this family/weight/style set (verified via
         `getComputedStyle` across every element in the live DOM, including pseudo-elements — one
         "Work Sans italic" hit turned out to be a false positive from decorative empty `<i>` tags
         in `LeadSheetBarShape.astro`, not real rendered text), added them under
         `site/public/fonts/`, and replaced the `@import` with local `@font-face` rules in
         `global.css`. Dropped the now-unneeded `fonts.googleapis.com`/`fonts.gstatic.com`
         allowances from `_headers`'s CSP. Verified: build succeeds, all 4 CSP script hashes still
         match, no more cross-origin font requests (checked via live network-request capture),
         fonts render identically (screenshot-verified).
   - [x] **Round 2, part 2 (2026-09-06): static asset caching.** Manual performance check
         (PSI's quota still exhausted) via `curl -sI` against production found every asset -
         including `/_astro/*`'s content-hashed, provably-immutable bundles and the newly
         self-hosted font files - served with `Cache-Control: public, max-age=0, must-revalidate`.
         That's a Cloudflare Workers static-assets default, not anything this repo had set
         deliberately. Added explicit `Cache-Control` rules in `_headers`: `immutable`
         year-long caching for `/_astro/*` and `/fonts/*` (filenames change on content change, or
         I'd know to bump them), a more conservative week-long cache for `/images/*` and
         `/sheetmusic/*` (not content-hashed, could be swapped without a filename change).
         Also checked gallery/album image sizes while in there - all under 250KB, already
         lazy-loaded, no action needed.
   - [x] **Round 2, part 9 (2026-09-06): the rest of Interaction & Visual Polish, audited.**
         - Scroll-reveal animations: confirmed there are none anywhere on the site (only
           `IntersectionObserver` usage is `StaffNav`'s scroll-tracked nav highlighting, not
           content reveal; every `@keyframes`/`animation` is ambient/decorative — the nav-dot
           breathing pulse, the antenna signal blink, the REC dot, the scroll-cue bob). Not
           implementing any speculatively — adding fade-in/slide-up reveals is itself one of the
           more common generic-modern-site tells `docs/DESIGN_NOTES.md` explicitly tries to avoid,
           so whether to add them at all is a deliberate design call, not a default to reach for.
         - Shadow/depth consistency: audited every `box-shadow` declaration in the codebase. The
           variation that exists tracks real differences in scale (small buttons get tight
           shadows, the larger `staff-menu` dropdown gets a bigger one) and semantics (a static
           0.6-alpha ring for `:focus-visible` vs. a much fainter 0.14-alpha ring for the mobile
           menu's persistent "you are here" `is-active` dot vs. an animated pulsing ring for the
           desktop nav's active note) — no stray one-off found that doesn't trace back to an
           intentional distinction already documented in `docs/style-guide.md`.
         - Visual rhythm: `About` and `Performance` do run back-to-back on identical flat `--bg`
           with no staff-line texture or surface swap between them — the one real soft spot found.
           Not changed here: their content layouts (a photo+text grid vs. numeric stats/venue
           lists) already differ enough that this reads as a judgment call about the site's visual
           character, not an objective bug — the kind of decision this session's been deliberately
           leaving to a real design call rather than unilaterally reshuffling backgrounds.
   - [x] **Round 2, part 10 (2026-09-07): a real E2E test suite.** This closes out the last open
         round 2 item — Testing/QA now has both halves covered (Lighthouse CI = build+audit,
         this = does the interactive stuff actually work). Added `@playwright/test` +
         `site/e2e/*.spec.ts` (36 test cases across 2 browser projects: desktop Chrome + a
         Pixel 7 mobile profile) covering the site's real interactive surfaces: `StaffNav`
         scroll-jump + active-note tracking + the mobile hamburger menu, `Gallery`'s category
         filter + lightbox (open/close/Escape/arrow-key navigation), `SheetMusicLibrary`'s search
         + viewer, plus smoke tests (title, every section present, single `<main>`, the custom
         404, the Dev link's href). Runs against a real production build (`npm run build` +
         a static server), not the dev server. Wired into its own
         `.github/workflows/e2e.yml` (separate from `lighthouse.yml` so a slow/flaky E2E run never
         blocks the Lighthouse audit or vice versa).
         - Real bugs caught in the *tests themselves* while writing this, not the app: `astro
           preview` self-daemonizes in this Astro version (same as `astro dev` did all session) and
           exits immediately rather than staying in the foreground, which Playwright's `webServer`
           misreads as a startup failure - switched to a plain `http-server` static server instead
           (closer to production anyway, which is served by Cloudflare Workers static-assets, not
           `astro preview`). Also: `items.locator(':visible')` chained onto an existing locator
           searches for *descendants* matching `:visible`, not the items themselves filtered by
           visibility - a real locator-chaining mistake in the first draft of the search test that
           produced a false failure; fixed to a single compound selector
           (`.sheet-music__item:visible`) and re-verified the fix against a real debug script
           before trusting it. And an invalid test assumption: `StaffNav`'s nav notes only cover
           hero/listen/about/credibility/contact, not every section on the page (performance,
           sheet-music, and gallery have no corresponding nav note) - a test asserting an
           `[data-target="gallery"]` note existed was just wrong, not a real app bug.
         - `npm audit --omit=dev` still 0 vulnerabilities in production dependencies after adding
           `@playwright/test` and `http-server` as devDependencies.
   - [x] **Round 2, part 11 (2026-09-07): a final sweep against the master checklists while
         waiting on CI.** With the two master checklists mostly covered, swept the remaining
         un-verified items:
         - **Favicon at actual tab size** (`SITE_QUALITY_CHECKLIST.md`'s SEO category) — rendered
           `favicon.svg` through real Chromium with `page.emulateMedia()` actually forcing light
           and dark `prefers-color-scheme`, not just a differently-colored background (that
           distinction mattered: a first attempt without real color-scheme emulation made the
           dark-mode variant look broken/invisible, which was a flaw in the test, not the
           favicon). Confirmed clean and legible at 16px and 32px in both themes — the theme-aware
           `<style>`/`@media` trick inside the SVG works correctly in a real browser.
         - **No secrets committed** — grepped for API keys/secrets/passwords/tokens across
           `site/src` and config files; only hits were the word "secret" inside a code comment and
           an npm package name (`@azure/keyvault-secrets`, a transitive dependency), both harmless.
         - **No horizontal scroll on mobile** — measured `scrollWidth` vs. `clientWidth` at 300–428px
           via a real headless-browser check (not assumed). Found a real, small (6px) overflow at
           320px specifically: `.contact__cta`'s pill padding pushed the full email address past
           the viewport at that width. Fixed with a `@media (max-width: 360px)` override tightening
           the pill's padding/gap; re-verified 300–428px are all now overflow-free.
         - Re-verified after the fix: build succeeds, all 32 E2E tests still pass, Lighthouse CI
           assertions still pass.
   - [x] **Round 2, part 8 (2026-09-06): hover/focus-visible parity sweep.** Systematically
         cross-referenced every `:hover` selector against a matching `:focus-visible` across all
         components (round 1 only fixed this for `StaffNav`, never swept the rest of the site for
         the same gap). Found 6 more: `.contact__cta`, `.gallery__filter`, `.gallery__lightbox-nav`,
         `.now-playing`, `.album`, `.sheet-music__item` — all had `:hover` with zero
         `:focus-visible`. Fixed all 6: pill-shaped elements (`.contact__cta`, `.now-playing`,
         `.gallery__filter`) got a suppressed default outline + a custom ring matching `StaffNav`'s
         round 1 pattern; rectangular elements just mirror their existing `:hover` treatment onto
         `:focus-visible` since the browser's default outline already reads fine on them. Verified
         all 6 via direct DOM `.focus()` + computed-style checks — not just a code read. One,
         `.gallery__lightbox-nav`, initially looked broken (`:focus-visible` matched but `opacity`
         computed style didn't update) across several attempts; root cause was a stale
         computed-style artifact specific to testing a just-unhidden element in this browser
         automation session (`nav.matches(':focus-visible')` and its actual applied style
         genuinely diverged until a forced reflow via `offsetHeight`), not a real CSS bug — the
         rule itself was confirmed correctly written, correctly scoped, and correctly specific via
         direct CSSOM inspection throughout. Also re-verified: build succeeds, all 4 CSP hashes
         unaffected (CSS-only changes), Lighthouse CI assertions still pass.
   - [x] **Round 2, part 7 (2026-09-06): design-system doc.** Added `docs/style-guide.md` — colors
         (with the contrast-verification story, not just the values), typography (families,
         weights actually loaded, a real type scale table pulled from every `font-size: clamp(...)`
         in the codebase), spacing (`padding-block` scale), breakpoints (with a pointer back to the
         round 2 part 6 caveat about them being unverified live), and component patterns (pill/card/
         circle radii, the organic notehead-blob motif, shadow/focus-ring conventions, the
         staff-line background texture). Written from the actual current code, not aspirationally —
         explicitly says so, and to fix the doc rather than the code if they ever disagree.
   - [x] **Round 2, part 6 (2026-09-07): mobile breakpoint-gap check — actually verified this
         time, real bugs found and fixed.** The `resize_window`/`window.resizeTo()` limitation from
         the first attempt was real, but turned out to be specific to the interactive browser
         session — worked around it by using Puppeteer-core + chrome-launcher directly (both
         already installed as Lighthouse's own dependencies) to drive a separate headless Chrome
         with real device-metrics emulation, serving the built `dist/` via `http-server` locally.
         Captured real full-page and scroll-positioned screenshots at 375/390/639/641/768/822/861
         and a spread of desktop widths up to 1920px. Found two real, screenshot-verified bugs and
         fixed both:
         - **Gallery grid was effectively single-column on every phone width** —
           `repeat(auto-fill, minmax(200px, 1fr))`'s 200px floor never fits two columns below
           ~450px, turning 18 photos into ~8000px of single-file scrolling (measured: the gallery
           section alone was 48% of the entire page's height at 375px). Added a
           `@media (max-width: 480px)` override dropping the floor to 140px. Verified: gallery
           height at 390px dropped from 8166px to 2348px (71% reduction), now a real 2-column grid
           — screenshot-confirmed, not just measured.
         - **Sheet Music Library's empty-state viewer reserved a 420px-tall mostly-blank dashed
           box on mobile** — that height only exists to match the list column in the desktop
           side-by-side grid; stacked on mobile it's just wasted scroll before any content.
           Added a mobile override reducing `.sheet-music__viewer`'s min-height to 180px — doesn't
           affect the *active* viewer once a piece is picked, since its own frame's 380px
           min-height still grows the container as needed. Verified: 420px → 180px, confirmed
           both by direct measurement and screenshot.
         - **A third, bigger finding, not fixed here:** the desktop `StaffNav`/hero-photo
           composition was suspected to have a narrow "dead zone" around 861px (just above the nav
           breakpoint) where the fixed nav overlaps the subject's face. Actual measurement across
           861 through 1920px showed this isn't a narrow zone at all — the nav sits close to or
           directly over the face across nearly the *entire* range the desktop nav is visible,
           only clearly resolving at very wide (>1920px) viewports. This is a hero-composition
           issue (how `object-position` on the photo interacts with a right-anchored fixed nav),
           not a quick CSS tweak — needs real visual iteration, not a rushed fix. Flagged as its
           own item below rather than attempted under time pressure.
   - [x] **Round 2, part 3 (2026-09-06): analytics.** Enabled Cloudflare Web Analytics — same
         choice haxbyte made, for the same reason (zero-config, no cookie-consent overhead, unlike
         GA4). Registered `dougrosenbergmusic.doug-rosenberg.workers.dev` as a manual-setup site
         (it's a Workers subdomain, not a DNS zone, so automatic setup wasn't offered) via the
         Cloudflare dashboard, then added the resulting beacon `<script>` to `BaseLayout.astro`
         and allowed `static.cloudflareinsights.com`/`cloudflareinsights.com` in `_headers`'s CSP
         — same two allowances haxbyte's CSP carries. The beacon token isn't a secret; it's a
         public per-site ID meant to ship in every page's HTML. Verified: build succeeds, the
         script's external `src=` correctly excludes it from the inline-script hash set (still
         only 4 hashes), no code-level issues found. Verified live post-deploy 2026-09-06: beacon
         script loads (200) and its RUM POST fires (204), no CSP console violations.
   - [x] **Round 2, part 4 (2026-09-06): content basics + a real Lighthouse run.** Nav/footer/
         album link sweep — all clean; two Amazon links initially looked dead via `curl` but that
         was Amazon's bot detection (TLS reset), not real breakage — confirmed live in an actual
         browser. Copyright year is already computed via `new Date().getFullYear()`, never stale.
         Set up `@lhci/cli` locally (`site/lighthouserc.json`, modeled on haxbyte's config) to
         finally get a real Lighthouse audit, sidestepping PSI's exhausted API quota entirely —
         `staticDistDir` serves the built `dist/` locally, no external API needed. First real
         numbers: index.html 93 performance / 96 a11y / 96 best-practices / 100 SEO; 404.html
         98-99 / 100 / 96 / 100. Investigated the two dents: `errors-in-console` was a
         beacon-CORS artifact specific to testing against `localhost` (already confirmed clean on
         the real domain above, not a real bug); `color-contrast` was real — `--text-faint`
         (`.about__quote cite`'s attribution line, the sheet-music empty-state message) measured
         3.4:1 against its actual backgrounds, below the 4.5:1 AA minimum my earlier manual audit
         never caught (it only checked accent colors, not this token). Fixed by raising
         `--text-faint`'s alpha 0.4 → 0.52 in `global.css` (computed against `--bg`, `--surface`,
         and the gallery lightbox's overlay color — all land at 4.9-5.0:1 now, verified
         programmatically before touching the file).
   - [x] Re-ran `@lhci/cli` after the contrast fix — confirmed 100 a11y on both pages (the first
         rerun attempt hit a `staticDistDir` path-resolution issue, not a real regression: it
         resolves relative to whatever directory the `lhci` process actually runs from, and that
         run's shell command chain had ended back at the repo root instead of `site/`, so
         `./dist` pointed at a nonexistent folder one level up from the real build output).
         Final scores: index.html 93 performance / **100 a11y** / 96 best-practices / 100 SEO;
         404.html 99 / **100** / 96 / 100. The remaining 96 best-practices point on both pages is
         the beacon-CORS-on-localhost artifact, already confirmed clean on the real domain.
   - [x] **Round 2, part 5 (2026-09-06): Lighthouse CI wired into GitHub Actions.** Added
         `.github/workflows/lighthouse.yml` (PR + push on `master`, mirrors haxbyte's own
         Lighthouse CI workflow almost exactly) so every future PR gets this same audit
         automatically instead of relying on a manual local run. Installed `@lhci/cli@0.14.0` as a
         pinned devDependency (same version verified locally, matching haxbyte's pattern of
         pinning rather than an unversioned `npx` fetch in CI) — pulled in 15 vulnerabilities in
         its own transitive tree, but `npm audit --omit=dev` confirms 0 in production
         dependencies; this tool never ships in the built site, only runs standalone in CI/locally,
         same trade-off haxbyte already accepted for the identical tool. Added `.lighthouseci/` to
         `.gitignore` (local report artifacts, shouldn't be committed).

## Custom items (this project specifically)

- [ ] **Sheet Music Library is missing 7 pieces** that exist on the live dougrosenberg.com
      (Blazor) site: Ferling #12 alla furioso, Ferling #6 G major, Ferling #8, Ferling #18 in Bb,
      New York, Spiderman (Cl), Super Mario (Bb). Need the source PDF/image for each before they
      can be added to `site/src/components/SheetMusicLibrary.astro`. (See also root `TODO.md`.)
- [x] **`site/public/sheetmusic/` is 88MB** — investigated 2026-09-06 overnight (PR #18,
      `optimize-sheetmusic-assets`). Built a verified recompress-and-diff script (PyMuPDF +
      Pillow): only accepts a recompressed file if it renders near-pixel-identical to the
      original. Result: most of the payload is PDFs whose embedded images are already
      JPEG-compressed, so there was nothing safe to win there without real PDF tooling
      (Ghostscript-style mask-aware resampling, not installed here) — also tried detecting
      fully-occluded duplicate images (a scan-export artifact) and the verification step
      correctly rejected the one candidate it found when removing the "duplicate" actually
      changed the render. 3 files did get verified, real reductions: `sleigh-ride.jpg` -44.5%,
      `aebersold-track-6.png` -10%, `g-blues.jpg` -5.4%. Remaining ~90MB needs either better
      tooling or accepting the payload as-is — not a rushed bulk pass either way.
- [x] **Hero photo / desktop nav composition overlap** — fixed 2026-09-06 overnight (PR #19,
      `fix-hero-nav-overlap`). Re-investigated with real Playwright screenshots at 12 widths
      (861-1920px): the earlier root-cause guess above (object-position drift) didn't hold up —
      the photo's framing was actually fine and consistent across the whole range. The real
      cause was `.staff-nav`'s fixed 456px width consuming a much bigger share of the viewport
      in the narrow 861-1010px band just above the mobile-hamburger breakpoint. Fixed by scaling
      the nav down from its own fixed top-right corner in that band only — every note's relative
      spacing comes along for free, no changes needed to the per-note pixel offsets or the photo.
      Verified clear at 861px (previously the worst case) and no jump/overlap at the 1010px
      transition boundary.
- [ ] **Light-mode refactor.** Site is currently dark-only by deliberate choice (see
      `docs/DESIGN_NOTES.md`) — no toggle, no `prefers-color-scheme` handling. Per
      `SITE_QUALITY_CHECKLIST.md`'s Design System category, dual-theme support (if added) needs to
      be a scoped decision up front — palette, toggle mechanism (manual override persisted to
      `localStorage`, applied via an inline blocking script before paint to avoid a flash-of-
      wrong-theme, per `SITE_BUILD_CHECKLIST.md` §3), and how far it extends across the site — not
      bolted on reflexively. Every accent color (`--note-*`, `--brass`, etc.) would need its own
      light-theme contrast check, same rigor as the dark-mode pass already done in round 1/round 2
      — a light background raises the AA bar for anything currently relying on a near-black
      backdrop.
- [ ] **Contact form wanted** (2026-09-06), same pattern as `haxbyte.com`'s — a real Worker (not
      assets-only like this project's current `wrangler.jsonc`) handling `POST /api/contact` via
      Cloudflare's native `send_email` binding (no third-party API/secret needed), falling back to
      `env.ASSETS.fetch()` for everything else. Blocked on the custom-domain decision above (see
      that item for why). When unblocked, `haxbyte/site/src/worker.js` +
      `haxbyte/site/src/pages/contact.astro` are the reference implementation to adapt: origin
      check, honeypot field, server-side validation (length caps, email format), a
      `CONTACT_TO`/`FROM_ADDRESS`/`ALLOWED_ORIGIN` set of constants to update for this site, and
      the client-side fetch+status-message handling. The account-level destination-address
      verification for `doug.rosenberg@gmail.com` should already carry over from haxbyte's setup
      (verified once per Cloudflare account, not per Worker) — confirm that rather than assuming.
- [ ] **No branch protection on `master`** (checked 2026-09-07 via `gh api repos/.../branches/
      master/protection` — 404, confirmed off). A real `SITE_QUALITY_CHECKLIST.md` Security item,
      but deliberately not enabled here without asking first — the wrong rule (e.g. "require an
      approving review") would block solo merging on a single-contributor repo like this one.
      Worth deciding what protection actually makes sense here (e.g. "require status checks to
      pass" without requiring a review) rather than defaulting to GitHub's stricter presets.
- [ ] Once the checklist pass is clean, consider whether this project becomes an informal
      case-study reference for the client-musician-site pitch (`SITE_BUILD_CHECKLIST.md`'s whole
      reason for existing) — not a launch requirement, just worth deciding deliberately rather
      than defaulting either way.
- [x] **Before/after case study draft written and published** (draft: 2026-09-06 overnight, PR #20
      `case-study-draft`, this repo). Decided on the dev-portfolio framing: published as a real
      blog post on **dougrosenbergdev.com** (separate repo, `shalant/PortfolioNov25`) —
      `/blog/rebuilding-musician-site-blazor-to-astro`, PR #55 (post) + PR #56 (added the 8
      old-site screenshots as a gallery, both merged 2026-09-07). Live and verified: renders on
      `/blog`, its own `/blog/{slug}` route, and `/blog/archive`; `sitemap.xml`/`llms.txt` updated
      to match. `docs/case-study-draft.md` + `docs/case-study-assets/` remain in *this* repo as the
      source material/backup, not duplicated content to maintain going forward.
- [x] **StaffNav abbreviations replaced with icons** (2026-09-07, PR #22 `staff-nav-icons`,
      merged): HE/LI/AB/CR/CO → home/music-note/user/award/mail line icons (DEV stays text).
      Also renamed the two labels that read oddly in the hover tooltip: "Hero" → "Home", "Credibility"
      → "Highlights" — grepped `site/src` first to confirm neither word appeared anywhere else on
      the page before renaming.
- [x] **Logo designed and shipped** (2026-09-07). `docs/style-guide.md` refinement deferred —
      the logo work ended up self-contained and didn't require a broader design-system pass first.
      Per `SITE_QUALITY_CHECKLIST.md`'s Design System item, ships as clean vector SVG source (real
      `<path>` geometry, not a raster export) — avoids `haxbyte`'s still-open "redraw logo SVGs
      from DALL-E reference" cautionary example.
      - [x] **Round 3 groundwork (2026-09-07):** tested whether the already-committed color-bar
            test-pattern strip (see `docs/DESIGN_NOTES.md`'s Brand direction) condenses into a
            standalone mark, rather than starting a new icon set. ~45 concepts explored in
            `ui-lab/artifacts/dougrosenbergmusic/logo-from-testcard.html` across several rounds —
            a bars roundel, a bare "DR" filled with the same five bars, a TV-silhouette screen
            showing the DR bars, and refinements on all three (favicon-scale tests, monochrome/
            print variants, antenna on/off, split-color letterforms).
      - [x] **Shipped (2026-09-07):** the winning direction — a TV silhouette with "DR" filling
            the screen, each letter split horizontally into two of the five section colors — is
            now the site's actual logo and favicon. `site/src/components/Logo.astro` (new): a
            fixed top-left home link, wrapping the mark; `site/public/favicon.svg`: same mark,
            tighter-cropped viewBox so it fills more of the tab icon. Both use **static vector
            `<path>` data for the D/R glyphs**, not live text — extracted directly from the site's
            own self-hosted Fraunces font (`site/public/fonts/fraunces-normal.woff2`, via a
            temporary `wawoff2` + `opentype.js` decode/parse script, not committed) so neither the
            favicon nor the logo depend on a webfont being loaded to render correctly, matching
            how the existing favicon.svg was already pure geometry with zero font dependency. Real
            bug caught and fixed before shipping: coloring the letters via plain vertical bands
            (agnostic to the glyph shapes) cut a color boundary straight through the R's stem, and
            since serif feet flare wider than the stem, they poked into the neighboring band as
            small disconnected fragments that read as a rendering glitch, not a color choice —
            fixed by using a **horizontal** split instead (crosses the stem at a constant width,
            no serif to flare into it), confirmed via a large-scale diagnostic render before
            trusting the fix at thumbnail size.
      - [x] **StaffNav's "Home" note removed** (2026-09-07): now redundant with the new logo/home
            link. Removed from both the desktop note row and the mobile dropdown, remaining notes
            (Listen/About/Highlights/Contact) and the Dev link re-flowed to close the gap, nav's
            fixed width shrunk to match (456px → 380px). The unused `home` icon and the now-dead
            `'hero'` entry in the scroll-tracking `sectionIds` list were removed too, and the
            hardcoded "first note defaults to active on load" behavior was dropped (verified via
            direct DOM inspection, not just a screenshot, that no note now falsely shows active
            while viewing the hero — nothing was relying on that default).
      - [x] **A separate, pre-existing decorative antenna on `HeroGraded.astro` removed**
            (2026-09-07): a CSS-only "rabbit ears" detail in the hero's own top-left corner,
            explicitly built (per its own code comment) to occupy the one corner the old
            right-anchored nav didn't reach — i.e. it was always a stand-in for a future logo.
            Once `Logo.astro` took that corner for real, the two visually collided; removed the
            `antenna` prop, the conditional markup, and the associated CSS/keyframes entirely
            rather than leaving a now-dead toggle.
      - All 36 E2E tests still pass; full build verified in a real browser (favicon at actual tab
        size, logo's home link click-through, hover/focus states) before/after each change.
