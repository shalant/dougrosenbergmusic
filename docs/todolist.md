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
   - [ ] Attaching a custom domain to the Cloudflare Worker is still an open, undecided item. **Now
         a prerequisite, not just an open question** (2026-09-06): a real contact form is wanted,
         same pattern as `haxbyte.com`'s (a Worker + Cloudflare's native `send_email` binding, see
         `docs/todolist.md`'s new Contact Form item below) — that binding needs its `from` address
         on a domain with active Email Routing in this Cloudflare account, which the current
         `workers.dev` subdomain isn't. Asked whether to borrow `haxbyte.com`'s already-verified
         Email Routing setup for now vs. wait for `dougrosenberg.com`'s own domain to be attached
         here — decided to wait, so this domain decision blocks the contact form specifically, not
         just "nice to have eventually."
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
   - [ ] **Round 2, remaining:** a real unit/E2E test suite (Lighthouse CI covers the build+audit
         half of Testing/QA now, but not this half).
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
   - [ ] **Round 2, part 6 (2026-09-06): mobile breakpoint-gap check — partial, blocked on a real
         tool limitation.** Inventoried every breakpoint in the codebase: 640/700/700/800/
         800/860/860/900px, across `StaffNav`, `HeroGraded`, `Performance`, `LeadSheetBarShape`,
         `SheetMusicLibrary`, `About`, `Credibility`. Structural read: `StaffNav` is
         `position: fixed` — an overlay, not an in-flow element competing for horizontal space —
         so the specific dead-zone failure mode `SITE_QUALITY_CHECKLIST.md` describes (a fixed-
         width in-flow nav and a sibling section fighting over the same row at different
         breakpoints) doesn't structurally apply the same way here; nothing in the other
         components' CSS branches on the nav's state either. That reasoning is as far as this
         session could verify, though: this browser session's viewport genuinely cannot be
         resized — `resize_window` reports success but `window.innerWidth` stays fixed
         (confirmed via direct JS check), and `window.resizeTo()` is blocked too. No real-device or
         actual-DevTools-responsive-mode check happened here, which is exactly what
         `SITE_QUALITY_CHECKLIST.md`'s own Mobile item requires ("not assumed from desktop-only
         testing") — this is desktop-only-and-then-some. **Needs a human check**: resize an actual
         browser window (or a real phone) through 640-900px and watch specifically for the fixed
         nav visually colliding with section headings as they scroll past the top-right corner,
         and for the antenna/now-playing/scroll-cue elements HeroGraded hides at ≤640px.
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
- [ ] **`site/public/sheetmusic/` is 88MB** — some individual scanned PDFs run 5-10MB (e.g.
      `rubank-book-of-solos-intermediate.pdf` at 10.6MB). Real payload weight, but recompressing
      scanned sheet music risks making actual notation illegible for the students this feature is
      for - needs a careful, visually-verified pass per file, not a bulk automated one. Deferred
      rather than rushed.
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
- [ ] Once the checklist pass is clean, consider whether this project becomes an informal
      case-study reference for the client-musician-site pitch (`SITE_BUILD_CHECKLIST.md`'s whole
      reason for existing) — not a launch requirement, just worth deciding deliberately rather
      than defaulting either way.
- [ ] **Refine the design system, then use it to develop a meaningful logo** (2026-09-06, no
      timeline yet — "at some point"). `docs/style-guide.md` is the current design-system doc to
      refine; per `SITE_QUALITY_CHECKLIST.md`'s Design System item, a logo (if it becomes part of
      this) should end up as clean vector SVG source, not just a raster export — `haxbyte`'s own
      still-open "redraw logo SVGs from DALL-E reference (currently PNG only)" item is the real
      cautionary example of skipping that step.
