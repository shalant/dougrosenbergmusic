# Rebuilding dougrosenberg.com — a before/after case study (first draft)

> **Status: first draft, not yet published anywhere.** Written from the actual
> rebuild work in this repo, not from memory or marketing copy. Screenshots of
> the live Blazor site referenced below live in `docs/case-study-assets/` —
> captured 2026-09-06 so they'd survive past this session. Doug: treat this as
> raw material to cut down and put in your own voice, not a finished post. Undecided
> on purpose: where this actually gets published (a post on this site, a
> portfolio case study on dougrosenbergdev.com, or somewhere else entirely).

## The one-line version

The old site is a Blazor WebAssembly app built on a stock template — it does
its job, but reads as "one of a thousand sites built on this template" rather
than as something that belongs to a working jazz musician. The rebuild
(`dougrosenbergmusic`, this repo) keeps every real piece of content — bio,
performance history, albums, teaching background, sheet music library, photo
gallery, contact — but gives it an identity built around the one thing that's
actually distinctive here: notation. A staff-line nav with note-shaped section
markers, a warm broadcast-grade photo instead of a generic hero, a
self-hosted type system instead of a default Google Fonts stack.

## What the old site actually looks like

Four screenshots, so this isn't just asserted:

- `old-site-01-hero.jpg` — stock dark-blue template hero: sans-serif wordmark,
  generic glow/blur decoration bottom-right, a floating blue chat bubble that
  isn't tied to anything on the page.
- `old-site-02-about.jpg` — the bio, in a rounded card with the same
  glow-circle decoration repeating behind it.
- `old-site-06-sheet-music-library.jpg` — the existing Sheet Music Library:
  search box, a scrollable list of pieces, "Select a piece from the list to
  view." **This already exists on the live site** — it's not a new feature
  the rebuild is adding, it's content the rebuild needs to fully match before
  it can replace this page. (`docs/todolist.md` tracks the 7 pieces still
  missing on the new build.)
- `old-site-08-gallery-2-and-footer.jpg` — the photo gallery, and a real bug:
  the top-left tile shows raw alt text ("Better Than TV") instead of a photo —
  a broken image reference that's been live on the production site.

Worth noting for the case study angle: the old site's template look isn't
unique to a hand-rolled site — it's a recognizable Blazor/Bootstrap
component-library aesthetic (rounded cards, the specific blue accent, the
corner-blur decoration, the floating circular chat launcher). It works, but
it doesn't read as built *for* a saxophonist.

## What changed, concretely

**Visual identity.** Full-bleed, warm-graded hero photo (no template glow
circles) with a self-composed staff-notation nav — five section markers
positioned like notes on a staff line, each pulsing gently, labeled with
two-letter abbreviations that expand into full labels on hover. A sixth note
links out to dougrosenbergdev.com. Typography moved from a default sans stack
to a self-hosted pairing: Fraunces (display/italic) for the name and
headings, Work Sans for body copy, JetBrains Mono for the nav labels and
metadata — all four variable-font files served from the site's own domain,
not Google Fonts.

**Foundation.** Blazor WebAssembly (a full C# runtime shipped to the browser
for what is, in the end, a static content site) replaced with Astro,
prerendered to static HTML and served from Cloudflare's edge network. That
switch is what made the rest of the technical work possible to actually
verify:

- Real Lighthouse CI scores (90+ performance/best-practices/SEO, 95+
  accessibility) run against the production build on every PR — not
  estimated, not skipped.
- A 36-test Playwright E2E suite covering navigation, gallery, sheet music
  search, and mobile behavior, run on every PR against a real browser at
  real viewport widths.
- A real Content-Security-Policy with sha256-pinned inline scripts, HSTS,
  and the rest of the security-header baseline — verifiable via response
  headers, not just "should be fine."
- Every image and PDF asset audited for actual page weight instead of
  shipped as-is; see the sheet-music asset optimization pass merged
  alongside this draft for a concrete example (verified, not assumed —
  every recompressed file was re-rendered and pixel-diffed against the
  original before being accepted).

**Content.** About, performance history/credibility stats, albums, gallery,
and contact all carried over faithfully — same substance, same specifics
(venues, artists performed with, teaching history), new presentation. Sheet
Music Library is the one section still catching up to the old site's
existing library rather than already matching it.

## What's still open

This section exists so the case study stays honest instead of turning into a
launch announcement before launch happens:

- Sheet Music Library: 7 pieces short of the old site's list (`TODO.md`
  tracks exactly which).
- The custom domain (`dougrosenberg.com`) isn't attached to the new build
  yet — it's still only live at the Cloudflare Workers subdomain. Pointing
  the real domain at it is a real, semi-irreversible production step that
  hasn't happened.
- Contact is currently a plain `mailto:` link on the new build, matching
  function but not yet the richer Cloudflare-Worker-backed form that's
  planned once the domain question above is settled.

## Possible framing for the actual post

A few angles this draft could be cut down into, depending on where it ends
up living:

1. **"What a template costs you, and what it takes to fix it"** — aimed at
   other musicians/freelancers who inherited a generic site and are deciding
   whether a rebuild is worth it. Leads with the screenshots.
2. **A dev-portfolio case study** (for dougrosenbergdev.com) — leads with the
   technical migration (Blazor → Astro, the CI/testing setup, the verified
   asset-optimization pass) as a demonstration of engineering practice, with
   the musician content as the "real client" context.
3. **A short "see my journey" note** on this site itself — much shorter,
   just the hero screenshot side-by-side and two or three sentences, linking
   to the dev-portfolio version for anyone who wants the technical detail.

No decision needed tonight — just laying out the options since the shape of
the writing depends on which one it's for.
