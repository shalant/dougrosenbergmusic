# Style Guide

**Status (2026-09-06):** written from the actual, current state of `site/src/styles/global.css`
and the component files — not aspirational. If a value below disagrees with the code, the code is
right and this doc is stale; fix the doc, not the other way around. See `docs/DESIGN_NOTES.md` for
the *why* behind these choices (the constraints, the things deliberately avoided, the brand
direction still being explored); this doc is the *what* — the actual token values and patterns to
reuse when building something new.

## Colors

All defined as CSS custom properties in `global.css`'s `:root`. This is a **dark-only** site —
`color-scheme: dark` is set explicitly, there's no light-theme token set and no toggle (a
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
| `--brass` | `#cf9a4f` | Primary accent — eyebrows, CTAs, active states |
| `--brass-soft` | `rgba(207, 154, 79, 0.14)` | Brass at low opacity — subtle fills/glows |
| `--glow` | `#7fb0ff` | Secondary accent (hero note, text-shadow glow) |
| `--glow-soft` | `rgba(127, 176, 255, 0.16)` | Glow at low opacity |
| `--staff-line` / `--staff-line-strong` | `rgba(233, 237, 245, 0.09)` / `0.16` | The staff-line background texture (see Component Patterns) |

**Section note colors** (`--note-hero`, `--note-listen`, `--note-about`, `--note-cred`,
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

## Typography

Three font families, each self-hosted as woff2 (`site/public/fonts/`, `@font-face` rules at the
top of `global.css` — no Google Fonts `<link>`/`@import`, see that file's own comment for why and
how to add a new weight).

- `--font-display`: **Fraunces** — headings, hero name, section titles. Weights actually loaded:
  italic 400/500, normal 500/600. Used almost everywhere in italic for section headings
  (`font-style: italic; font-weight: 500`), normal+600 for sub-headings/stat numbers.
- `--font-body`: **Work Sans** — body copy. Weights: 400 (default), 500 (`<strong>` inside
  `.credibility__bullets`), 700 (bare `<strong>` elsewhere, browser default bold).
- `--font-mono`: **JetBrains Mono** — eyebrows, nav labels, captions, metadata. Weights: 400, 600.

**Before adding a new weight/style combo**, check it's actually needed (a real rendered use, not
just declared) — a false-positive from a decorative empty `<i>` tag registering as "Work Sans
italic" in computed style, despite rendering no visible text, was caught and excluded during the
font self-hosting migration (`docs/todolist.md`'s round 2 part 1). Verify with a computed-style
sweep across the live DOM, not just a source grep.

**Type scale** (all `font-size: clamp(min, preferred, max)`, so exact rendered size varies by
viewport — these are the three clamp arguments):

| Role | Clamp | Where |
|---|---|---|
| Hero name (largest) | `3rem, 9vw, 6.5rem` | `HeroGraded` |
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
| Compact/embedded band | `2.5rem, 5vw, 3.5rem` | `Credibility` (sits inside a bordered band, not full-bleed) |
| Closing section | `5rem, 12vw, 8.5rem` (top only) | `Contact` — extra breathing room before the final CTA |

Container width: `.wrap` (`global.css`) caps content at `max-width: 1180px`, horizontal padding
`clamp(1.25rem, 4vw, 3rem)`. Use this class rather than a one-off max-width on a new section.

## Breakpoints

No shared breakpoint tokens — each component declares its own `@media (max-width: …)` inline.
Current values in use: **640px** (`HeroGraded` — hides antenna/scroll-cue, stacks the now-playing
pill), **700px** (`Performance`, `LeadSheetBarShape`), **800px** (`SheetMusicLibrary`, `About` —
grids go single-column), **860px** (`StaffNav` — desktop nav hides, hamburger takes over), **900px**
(`Credibility` — 3-column grid stacks). See `docs/todolist.md`'s round 2 part 6 for a structural
read on why these being uncoordinated is lower-risk here than on a typical site (`StaffNav` is
`position: fixed`, not competing for in-flow horizontal space with siblings) — but that was a code
read, not a live-viewport check; treat new breakpoint additions as needing an actual resize test,
not just a plausible-sounding number.

## Component Patterns

- **Buttons/pills/badges**: `border-radius: 999px` — the standard for any pill-shaped CTA, tag, or
  badge (`.contact__cta`, `.gallery__filter`, `.credibility__list li`, nav notes' hover labels).
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
