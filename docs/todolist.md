# Todo List

**Status (2026-09-06):** hero/nav direction is locked (full-bleed graded hero + static-abbreviation
staff nav, with a "DEV" note linking to dougrosenbergdev.com). GitHub Pages is retired; the site
now lives solely on Cloudflare Workers static-assets
(https://dougrosenbergmusic.doug-rosenberg.workers.dev). This doc tracks what's left, in order.

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
   - [ ] Attaching a custom domain to the Cloudflare Worker is still an open, undecided item.
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
   - [ ] **Round 2, remaining:** Performance/Lighthouse audit proper (PSI quota still exhausted -
         retry later, or find another way to get real Core Web Vitals), Analytics (no GA4/Web
         Analytics installed), Design System (no written style-guide doc yet, though the token
         layer in `global.css` already exists), Interaction & Visual Polish (systematic sweep, not
         yet done), Mobile breakpoint-gap check (`SITE_QUALITY_CHECKLIST.md`'s known dead-zone
         failure mode — untested here), Testing/QA (no automated test suite, no CI), Content
         basics (nav/footer 404 sweep, stale-date check).
   - [x] **Round 2, part 3 (2026-09-06): analytics.** Enabled Cloudflare Web Analytics — same
         choice haxbyte made, for the same reason (zero-config, no cookie-consent overhead, unlike
         GA4). Registered `dougrosenbergmusic.doug-rosenberg.workers.dev` as a manual-setup site
         (it's a Workers subdomain, not a DNS zone, so automatic setup wasn't offered) via the
         Cloudflare dashboard, then added the resulting beacon `<script>` to `BaseLayout.astro`
         and allowed `static.cloudflareinsights.com`/`cloudflareinsights.com` in `_headers`'s CSP
         — same two allowances haxbyte's CSP carries. The beacon token isn't a secret; it's a
         public per-site ID meant to ship in every page's HTML. Verified: build succeeds, the
         script's external `src=` correctly excludes it from the inline-script hash set (still
         only 4 hashes), no code-level issues found. **Not yet verified live** — need to confirm
         the beacon actually fires with no CSP console violations once this deploys, same
         verification pattern as round 1's CSP.

## Custom items (this project specifically)

- [ ] **Sheet Music Library is missing 7 pieces** that exist on the live dougrosenberg.com
      (Blazor) site: Ferling #12 alla furioso, Ferling #6 G major, Ferling #8, Ferling #18 in Bb,
      New York, Spiderman (Cl), Super Mario (Bb). Need the source PDF/image for each before they
      can be added to `site/src/components/SheetMusicLibrary.astro`. (See also root `TODO.md`.)
- [ ] **`site/public/sheetmusic/` is 88MB** — some individual scanned PDFs run 5-10MB (e.g.
      `rubank-book-of-solos-intermediate.pdf` at 10.6MB). Real payload weight, but recompressing
      scanned sheet music risks making actual notation illegible for the students this feature is
      for - needs a careful, visually-verified pass per file, not a bulk automated one. Deferred
      rather than rushed.
- [ ] Once the checklist pass is clean, consider whether this project becomes an informal
      case-study reference for the client-musician-site pitch (`SITE_BUILD_CHECKLIST.md`'s whole
      reason for existing) — not a launch requirement, just worth deciding deliberately rather
      than defaulting either way.
