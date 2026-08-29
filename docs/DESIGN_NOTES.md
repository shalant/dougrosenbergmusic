# Design Notes

**Status (2026-08-28):** the layout/type/color/motif constraints below are locked and built — see "Current build" for what actually exists. A second layer, a brand concept built around the debut album's own title, is mid-exploration and explicitly not locked yet — see "Brand direction."

## Why this rebuild exists

Two honest, separate reasons (2026-08-28):
1. Wanted to build with Astro again after enjoying it on haxbyte.com.
2. Want to move fully away from the typical "AI-produced" UI look and do more deliberate custom work.

This is an exploration/craft project, not a "the site needs this" project — no pressure to ship on a timeline, but also don't let it eat time that should go to higher-leverage things (freelance leads, the day-job architect track) while it's still in the "wanted to build something" phase.

## The thing to actually avoid

The common AI-generated-site tells, named specifically so they're checkable, not just vibed:
- Centered hero + tagline + two buttons
- Glassmorphism / gradient-mesh backgrounds as the default "premium" treatment
- Default system-ui/Inter-everywhere typography
- Every card using the same rounded-corner + soft-shadow treatment
- Perfectly safe, symmetric spacing with no real visual rhythm

## Current build (2026-08-28)

Page order, top to bottom: Hero → color-bar divider (see Brand direction) → Listen (recordings) → About → Performance (venues, artists performed with) → Credibility (guest-artist schools, teaching experience, degrees) → Sheet Music Library (private-student practice pieces) → Photo Gallery → Contact. Performance, the fuller Credibility content, Sheet Music Library, and Gallery were ported over from the live Blazor site's content — the original constraints below only covered Hero/Listen/About/Credibility/Contact.

**Nav:** a corner "staff" element, not a traditional bar. Desktop (>860px): a single-row horizontal staff of five colored note-blobs (one per section: Hero/Listen/About/Credibility/Contact), scroll-tracked so the current section's note glows and the rest dim. Went through several size passes before landing here — started at 3x scale with a rising-diagonal layout (too large, interfered with the hero photo), flattened to one row, then a further size reduction. Below 860px the desktop staff hides entirely (hover-to-reveal doesn't work on touch, and it's genuinely optional per the "secondary to the scroll" rule) and a small hamburger toggle opens a dropdown list reusing the same five colors and section labels.

## Brand direction — exploratory, not locked

A second design layer beyond the constraints below: the debut album is called *Better Than TV*, and the track list ("Dirty Basement Jazz," "The Comeback," "A Higher Standard," "Forged Stability") has a specific wry, unpretentious voice that generic saxophone/notation iconography couldn't carry. Two pieces of this are live in the actual build:

- **Color-bar divider** — the five section colors already used in the corner nav, reused as a TV test-pattern strip between Hero and Listen, with staff hairlines etched through it and a brief "tuning in" flicker on load. Gives the five colors an actual reason to exist instead of being arbitrary.
- **On Air** — the "Now Playing" pill in the hero now shows a pulsing red dot and "ON AIR" instead of a waveform. The hero scroll cue is labeled "CH +" (channel up, not scroll down).

A wider set of ideas — a channel-dial badge, a TV-guide-style listing for Listen, a VHS timestamp, the track titles used as real page copy (section cues, a footer sign-off, a ticker) — were explored but not committed; see `ui-lab/artifacts/dougrosenbergmusic/better-than-tv-brand.html` for the full pass with a read on which ones are worth pursuing versus which are novelty. An earlier, wider 23-mark logo/icon exploration (`brand-riff.html`) and a favicon-legibility test (`favicon-concepts.html`) are archived there too — the icon-based direction was explicitly rejected as too generic before landing on the album-title concept above.

## Concrete constraints — locked in and built (2026-08-28)

- [x] **Layout:** sound-driven, single continuous scroll. Full-bleed hero photo with glowing name overlay → a "Now Playing" player/waveform strip near the top (not buried behind a Listen nav click) → About, asymmetric (photo offset, text runs alongside, not centered/stacked) → upcoming shows/press → a real, prominent "Book Me" contact CTA (not a footer icon). No traditional top-nav-with-six-equal-tabs; nav (if any) is minimal/secondary to the scroll itself.
- [x] **Signature motif:** sheet music / staff lines. Thin horizontal staff-line texture used structurally (section backgrounds, dividers), with content deliberately breaking the "notes" metaphor here and there — ties to "composer" specifically, distinct from the current live site's tremolo-slash nav marks.
- [x] **Type (my call, easy to override):** Fraunces (expressive serif with real character and a genuine italic, good for the name treatment and editorial-style pull quotes — liner-notes energy) paired with Work Sans for body/UI (quiet, legible, lets Fraunces carry the personality) and JetBrains Mono for small utility labels (track numbers, meta) — deliberately not IBM Plex Mono, to avoid echoing haxbyte's pairing.
- [x] **Color (my call, easy to override):** keep the existing site's dark/moody/cinematic base (deep near-black navy) and its glowing blue for the name treatment specifically, carrying that mood forward per the "riff on, don't blank-slate" instruction — but add a warm brass/amber accent tied to the actual instrument (the saxophone itself) as a second color, used for the staff-line motif and CTA, so the palette isn't just a single blue note.

## Reference

- Existing live site: dougrosenberg.com (current Blazor build, code in `newMusicWebsiteJan26`) — the current visual mood (dark/cinematic/glowing type) is a real asset worth carrying forward in spirit, even in a fully custom rebuild.
- `ui-lab` repo — local archive of UI experiments; check there first for anything reusable. This project's nav and brand explorations are archived under `artifacts/dougrosenbergmusic/`, including ideas that didn't make the cut (see Brand direction above).
- **Pre-launch quality checklist:** before calling this site done, check it against the canonical checklist in the `career-development` repo — not duplicated here on purpose (it's a living doc that gets updated independently; a copy would drift stale). Local: `../career-development/docs/SITE_QUALITY_CHECKLIST.md`. Remote: https://github.com/shalant/career-development/blob/main/docs/SITE_QUALITY_CHECKLIST.md
