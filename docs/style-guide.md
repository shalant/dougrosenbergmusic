# Style Guide

**Status (2026-09-06):** written from the actual, current state of `site/src/styles/global.css`
and the component files — not aspirational. If a value below disagrees with the code, the code is
right and this doc is stale; fix the doc, not the other way around. See `docs/DESIGN_NOTES.md` for
the *why* behind these choices (the constraints, the things deliberately avoided, the brand
direction still being explored); this doc is the *what* — the actual token values and patterns to
reuse when building something new.

## Colors

**Light theme (draft, 2026-11-15, branch `light-mode-draft-2026-11-15`):** see "Themes" at the
end of this section. Everything below the Themes heading still describes the dark set, which is
unchanged.

All defined as CSS custom properties in `global.css`'s `:root`. Until the light draft, this was a
**dark-only** site: `color-scheme: dark` set explicitly, no light-theme token set and no toggle (a
deliberate choice per `docs/DESIGN_NOTES.md`, tracked as a scoped future decision in
`docs/todolist.md`'s "Light-mode refactor" item, not something to bolt on ad hoc).

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0a0e17` | Page background |
| `--bg-elevated` | `#10162399` | Raised surfaces over the page bg (mobile nav dropdown) |
| `--surface` | `#131a26` | Section-level background variation (cards, panels) |
| `--text` | `#e9edf5` | Primary text |
| `--text-muted` | `rgba(233, 237, 245, 0.62)` | Secondary text (body copy, descriptions) |
| `--text-faint` | `rgba(233, 237, 245, 0.52)` | Tertiary text (captions, footer, empty states) |
| `--brass` | `#cf9a4f` | Primary accent — CTAs, active states, the hero's name line, archive-page eyebrows |
| `--brass-soft` | `rgba(207, 154, 79, 0.14)` | Brass at low opacity — subtle fills/glows |
| `--glow` | `#7fb0ff` | Secondary accent (hero note, text-shadow glow) |
| `--glow-soft` | `rgba(127, 176, 255, 0.16)` | Glow at low opacity |
| `--staff-line` / `--staff-line-strong` | `rgba(233, 237, 245, 0.09)` / `0.16` | The staff-line background texture (see Component Patterns) |

**Section note colors** (`--note-hero`, `--note-listen`, `--note-about`, `--note-highlights`,
`--note-contact`, `--note-dev`) — one muted jewel-tone per nav section, used by `StaffNav.astro`'s
corner nav. `--note-hero`/`--note-listen` reuse `--glow`/`--brass`; the rest (`#e0794f` orange,
`#4fb894` teal, `#b287df` purple, `#e05f6a` red for the external Dev link) are one-off hex values
not otherwise tokenized.

**Contrast is verified, not assumed** — every text color above was checked against its actual
background(s) during the round 1/round 2 checklist pass (`docs/todolist.md`), not just the
darkest/lightest pairing. `--text-faint` in particular was raised from an 0.4 to 0.52 alpha after a
real Lighthouse audit caught it failing AA at 3.4:1 in two places (`docs/todolist.md`'s round 2
part 6) — if you introduce a new text color or reuse an existing one in a new context (new
background), recompute contrast against *that specific* background rather than assuming an
existing pass elsewhere still holds.

### Themes (light draft, 2026-11-15)

Light is "liner-notes paper": a warm off-white page and warm charcoal ink, never pure white or pure
black. The same token names carry both sets, so components don't know which theme they're in.

| Token | Dark | Light | Light contrast as text (on `--bg` / `--bg-elevated` / `--surface`) |
|---|---|---|---|
| `--bg` | `#0a0e17` | `#f4efe6` | |
| `--bg-elevated` | `#101623` | `#fbf8f2` | |
| `--surface` | `#131a26` | `#ebe4d6` | |
| `--text` | `#e9edf5` | `#1f1b16` | 14.95 / 16.15 / 13.53 |
| `--text-muted` | text at 0.62 | text at 0.74 | 6.77 / 7.09 / 6.41 |
| `--text-faint` | text at 0.52 | text at 0.64 | 4.89 / 5.01 / 4.71 |
| `--brass` | `#cf9a4f` | `#8a5514` | 5.41 / 5.84 / 4.90 |
| `--glow` | `#52d1a6` | `#0b6e52` | 5.45 / 5.88 / 4.93 |
| `--note-about` | `#e0794f` | `#a33f15` | 5.59 / 6.04 / 5.06 |
| `--note-highlights` | `#4fb894` | `#1a6e4e` | 5.42 / 5.85 / 4.91 |
| `--note-lessons` | `#6fa8e8` | `#2a62a8` | 5.38 / 5.81 / 4.87 |
| `--note-contact` | `#b287df` | `#7a45b0` | 5.55 / 5.99 / 5.02 |
| `--note-dev` | `#e05f6a` | `#b3303d` | 5.38 / 5.81 / 4.87 |

Paper text on a filled `--glow`, `--brass` or `--note-dev` button measures 5.88, 5.84 and 5.81.

**Rules (each checked by `e2e/theme.spec.ts`):**

- **Where the switch is:** every page has one within reach without scrolling to the bottom. Home:
  the icon button at the end of the desktop nav staff and the pill in the phone menu (plus the
  footer). Archive pages: beside the back link. One script drives every `[data-theme-toggle]` on
  the page, so they always agree.
- **Which theme:** a choice saved by the toggle (`localStorage.theme`) wins; otherwise the
  system's `prefers-color-scheme`, followed live. The inline script at the top of
  `BaseLayout.astro`'s `<head>` sets `data-theme` on `<html>` before first paint. Without
  JavaScript the page is dark. Editing that script changes its hash: run
  `npm run verify-csp -- --write`.
- **Dark plates:** a picture or a physical object stays dark on the light page. Mark its root
  `.theme-plate` and every token inside it resolves to the dark set. Current plates: the footer
  (the sleeve's back cover) and the Dev section's TV screen and remote. Reach for a plate rather
  than re-tuning an overlay for light. (The hero was a plate in the first draft; see the next rule.)
- **The light hero is a sleeve (2026-11-15):** same photo, re-composed rather than re-graded. From
  1025px the photo is a print in the left column (5fr) with the About photo's 14px offset brass
  frame, and the name, title, CTAs and records sit beside it (6fr) in ink, aligned to the `.wrap`
  column. Below 1025px the print sits above the text; a short landscape screen goes back to two
  columns, starting right of the logo. The haze, hue blobs, smoke, scanlines, vignette, scrim and
  the smoke shading inside "Better Than" are off in light; T's top bar uses `--note-lessons`
  instead of the sky blue. Every light rule sits under `:root[data-theme='light']`, so the dark
  hero is unchanged (checked 2026-11-15: hero screenshots identical to master at 1440px and
  390px). The fixed logo must never sit on the print; the spec checks five viewport sizes.
- **No literal colors for anything that should flip.** Hairlines are
  `color-mix(in srgb, var(--text) N%, transparent)`, shadows
  `color-mix(in srgb, var(--shadow) N%, transparent)` (light's `--shadow` is a soft warm brown, so
  the same N gives a much lighter shadow), focus rings `var(--focus-ring)`, translucent nav fills
  `color-mix(in srgb, var(--bg) N%, transparent)`. Literal `rgba()` stays only where the color sits
  on a photo (hero overlays, gallery captions, the lightbox).
- **Contrast:** every visible text on the light page clears AA (4.5:1, or 3:1 for large text)
  against what it actually sits on. The spec measures this for every text element on `/`,
  `/press`, `/easternblok` and `/easternblok/press`, and skips plates and text over images or
  gradients.
- **Texture:** light gets a static paper grain (`--paper-grain`, one SVG noise tile on `body`);
  dark gets none. It never animates.
- **Tests:** `playwright.config.ts` pins every spec to `colorScheme: 'dark'`, because older specs
  assert dark values. A light-theme assertion opts in with `test.use({ colorScheme: 'light' })`.

## Typography

Two font families (JetBrains Mono was dropped 2026-10-30, see below), each self-hosted as woff2 (`site/public/fonts/`, `@font-face` rules at the
top of `global.css` — no Google Fonts `<link>`/`@import`, see that file's own comment for why and
how to add a new weight).

- `--font-display`: **Fraunces** — headings, hero name, section titles. Weights actually loaded:
  italic 400/500, normal 500/600. Used almost everywhere in italic for section headings
  (`font-style: italic; font-weight: 500`), normal+600 for sub-headings/stat numbers.
- `--font-body`: **Work Sans** — body copy. Weights: 400 (default), 500 (`<strong>` inside
  `.career-highlights__bullets`), 700 (bare `<strong>` elsewhere, browser default bold).
- **No monospace face (2026-10-30).** `--font-mono` / JetBrains Mono used to set nav labels, form
  labels, captions, metadata and archive eyebrows (49 uses). Doug found three families too many, so
  all of those now use `--font-body` (Work Sans) and keep their size, tracking and uppercase. Work
  Sans 600 resolves to the loaded 700. Don't add a third family back; if a label needs to look
  different, change its size, case or tracking.
- **Heading rule (2026-10-30):** a section label is roman (Recordings, On the Road, Highlights,
  Private lessons, In Frame, On record, Sheet Music Library, Quick answers); a heading that is a
  full sentence in Doug's voice is italic ("I also build sites like this one.", "Let's make some
  music."). Test: a home-page `h2` ending in `.`, `!` or `?` is italic, any other is roman
  (`e2e/heading-style.spec.ts`). Doug deferred the choice to Claude on 2026-10-30. New sections
  follow the rule, not the neighbours. Sub-headings (`h3`) stay Fraunces roman 600.
- **Label voice (2026-10-25):** in-section labels on the home page use the global `.label` class, Fraunces italic in `--text-muted` ("Chicago", "Artists performed with", "Subjects", "The records"), not tracked mono caps. The home page has no section-level eyebrows: the staff dividers and headings name each section.

**Minimum text size (2026-10-30):** no visible text under 12px on a phone. Tracked uppercase labels
are 0.75rem (12px); anything people read (captions, metadata, dates, tags) is 0.8rem (12.8px) or
larger. `e2e/mobile-refinement.spec.ts` fails if any visible text on `/`, `/press`, `/easternblok` or
`/easternblok/press` is smaller.

**Before adding a new weight/style combo**, check it's actually needed (a real rendered use, not
just declared) — a false-positive from a decorative empty `<i>` tag registering as "Work Sans
italic" in computed style, despite rendering no visible text, was caught and excluded during the
font self-hosting migration (`docs/todolist.md`'s round 2 part 1). Verify with a computed-style
sweep across the live DOM, not just a source grep.

**Type scale** (all `font-size: clamp(min, preferred, max)`, so exact rendered size varies by
viewport — these are the three clamp arguments):

| Role | Clamp | Where |
|---|---|---|
| Hero headline (largest) | `2.8rem, min(6.6vw, 12vh), 6rem` | `HeroGraded` (since 2026-10-25; short-landscape override `2rem, 12vh, 3.25rem`) |
| Section H2 (standard) | `2rem, 4vw, 2.75rem` | `Listen`, `Performance`, `Gallery`, `SheetMusicLibrary` — the default; reach for this first for any new section heading |
| Closing CTA heading | `2.2rem, 6vw, 3.75rem` | `Contact` |
| Stat number | `2.2rem, 5vw, 3.2rem` | `Performance`'s big numbers |
| 404 heading | `2rem, 5vw, 3rem` | one-off, close to standard but not identical |
| Blockquote | `1.2rem, 2.2vw, 1.55rem` | `About`'s pull-quote |

## Spacing

Section vertical rhythm, also `clamp()`-based (`padding-block`):

| Role | Clamp | Where |
|---|---|---|
| Standard section | `4rem, 9vw, 7rem` | Default — most sections |
| Compact/embedded band | `2.5rem, 5vw, 3.5rem` | `CareerHighlights` (sits inside a bordered band, not full-bleed) |
| Closing section | `5rem, 12vw, 8.5rem` (top only) | `Contact` — extra breathing room before the final CTA |

Container width: `.wrap` (`global.css`) caps content at `max-width: 1180px`, horizontal padding
`clamp(1.25rem, 4vw, 3rem)`. Use this class rather than a one-off max-width on a new section.

## Breakpoints

No shared breakpoint tokens — each component declares its own `@media (max-width: …)` inline.
Current values in use: **1024px** and **640px** (`HeroGraded` — right-hand column, then the
content block anchors to the bottom), **700px** (`Performance`, `LeadSheetBarShape`), **800px** (`SheetMusicLibrary`, `About` —
grids go single-column), **860px** (`StaffNav` — desktop nav hides, hamburger takes over), **900px**
(`CareerHighlights` — 3-column grid stacks). See `docs/todolist.md`'s round 2 part 6 for a structural
read on why these being uncoordinated is lower-risk here than on a typical site (`StaffNav` is
`position: fixed`, not competing for in-flow horizontal space with siblings) — but that was a code
read, not a live-viewport check; treat new breakpoint additions as needing an actual resize test,
not just a plausible-sounding number.

## Motion

Added 2026-10-17 (see `docs/todolist.md`, UI round part 5). Tokens live in `global.css` `:root`:

| Token | Value | Use |
|---|---|---|
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Small things that should bounce: icons, arrows, +/× indicators, nav notes |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Bigger things that should settle: covers, panels, pills, underlines |
| `--dur-fast` / `--dur-base` / `--dur-med` | `0.15s` / `0.2s` / `0.3s` | Hover, tap, focus and open/close feedback |
| `--dur-slow` | `0.45s` | Reveals and larger transitions |

How much, by kind:
- **Feedback** (hover, tap, focus): on nearly everything interactive. Small movement (scale up to
  about 1.05 on big things, about 1.15 on small icons). Hover-driven *movement* goes inside
  `@media (hover: hover)` with `:focus-visible` as its own rule, because `:hover` sticks on
  touch screens; touch gets an `:active` press instead.
- **Reveals** (scroll-driven, `animation-timeline: view()`): one per section at most. Reuse
  `.scroll-rise` (set `--rise-range` to retime it) rather than writing new keyframes. Keep
  `animation-timeline` in a separate, more specific rule (the minifier gotcha in
  `StaffDivider.astro`).
- **Ambient loops**: 1-2 per screen, slow (6s+), low contrast. The fixed nav's only loop is the
  active note's pulse.
- Everything off under `prefers-reduced-motion: reduce`; nothing hidden when scroll timelines
  aren't supported.

## Component Patterns

- **Buttons/pills/badges**: `border-radius: 999px` — the standard for any pill-shaped CTA, tag, or
  badge (`.contact__cta`, `.gallery__filter`, `.career-highlights__list li`, nav notes' hover labels).
- **Cards/panels**: small radii, `5px`–`9px` (`.sheet-music__panel`, `.staff-menu`, gallery cards
  at `6px`). Not a hard rule, just the observed range — pick something in it rather than a much
  larger/smaller value that would read as a different design language.
- **Circular elements**: `border-radius: 50%` for true circles (avatars, dots, the REC pulse
  indicator).
- **Organic "notehead" blobs**: irregular asymmetric radii (e.g.
  `58% 42% 63% 37% / 41% 55% 45% 59%`), one per `StaffNav` section note — a deliberate motif (see
  `docs/DESIGN_NOTES.md`'s "thing to actually avoid" list: this exists specifically so the nav
  doesn't read as generic perfect-circle dots). Each note also gets its own `animation-delay` on a
  shared `staff-breathe` keyframe so they don't pulse in lockstep.
- **Depth/shadows**: soft dark drop-shadows for elevation, `0 <y>px <blur>px -<spread>px
  rgba(0, 0, 0, 0.6-0.7)` — not a single fixed value, but everything in this project lands in that
  range. Focus/active rings use a different pattern: `0 0 0 <spread>px rgba(255, 255, 255, <alpha>)`
  as an inset-style ring rather than an offset shadow — see `StaffNav.astro`'s `:focus-visible`
  rules, including the fix for the *active* note's own pulse animation silently overriding a plain
  static ring declaration (`docs/todolist.md`'s round 1 notes) — a real gotcha if you add a new
  animated state that touches `box-shadow`.
- **Staff-line texture**: `.staff-lines` / `.staff-lines--strong` (`global.css`) — a pure-CSS
  repeating-gradient background (five thin lines, then a gap, matching a real music staff), used as
  a structural section-background motif rather than a decorative pattern. Reach for this before
  inventing a new background treatment for a new section.
- **Focus states**: every interactive element needs a real `:focus-visible` state, not just
  `:hover` — this was a real, shipped gap found via live testing (tabbing to an element), not a
  code read, in round 1. Verify by actually tabbing to new interactive elements, not by assuming a
  hover pass covered it.
- **Long lists of names (2026-11-01 rule)**: a run of names longer than about ten never ships as one
  block of body-size text. Lead with the marquee names in the display face (Fraunces, italic or
  500, `clamp(1.3rem, 2.8vw, 1.9rem)` or larger) and set the rest small beneath, each name once.
  Examples: `.performance__venue-list--marquee`, `.performance__artists-feature`,
  `.career-highlights__feature`. Checked by `e2e/bad-cop-fixes.spec.ts`.
- **Section rhythm (2026-11-01 rule)**: neighbouring sections must not share one flat background.
  Alternate plain `--bg` sections with raised bands (`--bg-elevated` or `--surface` plus hairline
  top and bottom rules): Recordings plain, About band, On the Road plain, Highlights band.
- **Lead item (2026-11-01 rule)**: a grid of equal items gets one lead at 760px and up (the debut
  album is `.album--lead`). The lead spans the rows of one column and the rest stack as rows in the
  other, so the two columns end level; a lead in a one-row grid leaves dead space under its
  neighbours (161px measured). Phones keep the plain rows. Checked by `e2e/bad-cop-fixes.spec.ts`.
- **Glass (2026-11-15 rule)**: write `backdrop-filter` unprefixed and nothing else. The build's CSS
  minifier keeps only one of a prefixed/unprefixed pair and kept `-webkit-backdrop-filter`, so
  Chrome and Firefox computed `backdrop-filter: none` and the "glass" nav was a flat translucent
  panel for months. Check any new glass with `getComputedStyle(el).backdropFilter` in Chrome, not by
  reading the source. The nav tray is the liquid-glass reference: tint 0.55, `blur(18px)
  saturate(1.5)`, inset top and bottom highlights. Checked by `e2e/bad-cop-fixes.spec.ts`. Still
  prefixed-only, so no blur in Chrome: `.cta-secondary` (`global.css`) and the gallery lightbox
  (`Gallery.astro`); decide per element whether to switch them.
