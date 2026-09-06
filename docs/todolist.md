# Todo List

**Status (2026-09-06):** hero/nav direction is locked (full-bleed graded hero + static-abbreviation
staff nav, with a "DEV" note linking to dougrosenbergdev.com). Live on both GitHub Pages and
Cloudflare Workers static-assets (https://dougrosenbergmusic.doug-rosenberg.workers.dev). This doc
tracks what's left, in order.

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
   - [ ] Decide whether/when to point a custom domain at it and retire the GitHub Pages workflow,
         or run both in parallel for a while. Both are currently live simultaneously.
3. **Run the full checklist pass** against the live Cloudflare URL: `SITE_BUILD_CHECKLIST.md`
   §3–8 + all 68 items in `SITE_QUALITY_CHECKLIST.md`. Expect multiple rounds — items like
   contrast, `:focus-visible` states, and breakpoint gaps tend to surface fixes that need
   re-checking.

## Custom items (this project specifically)

- [ ] **Sheet Music Library is missing 7 pieces** that exist on the live dougrosenberg.com
      (Blazor) site: Ferling #12 alla furioso, Ferling #6 G major, Ferling #8, Ferling #18 in Bb,
      New York, Spiderman (Cl), Super Mario (Bb). Need the source PDF/image for each before they
      can be added to `site/src/components/SheetMusicLibrary.astro`. (See also root `TODO.md`.)
- [ ] Confirm the Cloudflare migration doesn't break the `/dougrosenbergmusic/` base-path asset
      URLs fixed for GitHub Pages (`site/astro.config.mjs`'s `base`) — Cloudflare Pages/Workers
      serving from an apex or subdomain won't need that prefix, so `astro.config.mjs` and every
      `import.meta.env.BASE_URL` usage need revisiting together, not left over from the GH Pages setup.
- [ ] Once the checklist pass is clean, consider whether this project becomes an informal
      case-study reference for the client-musician-site pitch (`SITE_BUILD_CHECKLIST.md`'s whole
      reason for existing) — not a launch requirement, just worth deciding deliberately rather
      than defaulting either way.
