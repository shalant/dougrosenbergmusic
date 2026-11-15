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

Page order, top to bottom: Hero → color-bar divider (see Brand direction) → Listen (recordings) → About → Performance (venues, artists performed with) → Career Highlights (guest-artist schools, New Trier High School, affiliations, degrees) → Photo Gallery → Private Lessons (added 2026-09-30; subjects on a five-line "staff," `--note-lessons` blue, nav note + divider) → Sheet Music Library (private-student practice pieces) → Contact. Performance, the fuller Career Highlights content, Sheet Music Library, and Gallery were ported over from the live Blazor site's content — the original constraints below only covered Hero/Listen/About/Career Highlights/Contact.

**Nav:** a corner "staff" element, not a traditional bar. Desktop (>860px): a single-row horizontal staff of five colored note-blobs (one per section: Hero/Listen/About/Career Highlights/Contact), scroll-tracked so the current section's note glows and the rest dim. Went through several size passes before landing here — started at 3x scale with a rising-diagonal layout (too large, interfered with the hero photo), flattened to one row, then a further size reduction. Below 860px the desktop staff hides entirely (hover-to-reveal doesn't work on touch, and it's genuinely optional per the "secondary to the scroll" rule) and a small hamburger toggle opens a dropdown list reusing the same five colors and section labels.

## Brand direction — exploratory, not locked

A second design layer beyond the constraints below: the debut album is called *Better Than TV*, and the track list ("Dirty Basement Jazz," "The Comeback," "A Higher Standard," "Forged Stability") has a specific wry, unpretentious voice that generic saxophone/notation iconography couldn't carry. Two pieces of this are live in the actual build:

- **Color-bar divider** — the five section colors already used in the corner nav, reused as a TV test-pattern strip between Hero and Listen, with staff hairlines etched through it and a brief "tuning in" flicker on load. Gives the five colors an actual reason to exist instead of being arbitrary.
- **On Air** — the "Now Playing" pill in the hero now shows a pulsing red dot and "ON AIR" instead of a waveform. The hero scroll cue is labeled "CH +" (channel up, not scroll down).

A wider set of ideas — a channel-dial badge, a TV-guide-style listing for Listen, a VHS timestamp, the track titles used as real page copy (section cues, a footer sign-off, a ticker) — were explored but not committed; see `ui-lab/artifacts/dougrosenbergmusic/better-than-tv-brand.html` for the full pass with a read on which ones are worth pursuing versus which are novelty. An earlier, wider 23-mark logo/icon exploration (`brand-riff.html`) and a favicon-legibility test (`favicon-concepts.html`) are archived there too — the icon-based direction was explicitly rejected as too generic before landing on the album-title concept above.

**Hero smoke/motion: wide exploration, not decided (2026-09-09).** The hero's existing ambient haze (`hero__haze` in `HeroGraded.astro`) was the starting point for a much longer pass on making the header's smoke and motion do more — see `ui-lab/artifacts/dougrosenbergmusic/hero-smoke-exploration.html` for the full 35-round set. Threads explored: ambient haze refinements and a directional gust; the "Now Playing" pill visually emitted from the bell (a signal line, then a cartoon dialogue-bubble trail); a full text-right redesign (name raised into the photo's empty half instead of overlaid bottom-left); the name's own letters color-shifted or "smoke-lit" via `background-clip: text`, including a version sourced from the actual photo's baked-in haze pixels via a masked crop rather than a synthetic gradient; per-letter proximity tracking (a script tints each letter individually by live distance to the moving smoke); and a `perspective`/`preserve-3d` depth rig (photo, bell, and text each at their own simulated distance, swaying slowly) merged with the photo-smoke orbit so it moves through a real Z-axis. Two real bugs found and fixed along the way, worth knowing if this gets picked back up: `padding-top: %` on a flex container resolves against the containing block's *width*, not height, which silently broke an "aligned" layout that looked identical on paper; and `offset-path`/`offset-distance` (the "correct" CSS way to animate something along a circular path) didn't actually animate when tested live, so circular motion has to go through a plain `translate()` keyframe loop instead. Leaning toward extracting 2–3 of the strongest elements rather than shipping the fully combined final round, given the accumulated JS cost (continuous per-letter tracking + a 3D rig is the heaviest combination tried) — not decided yet.

**Logo: designed and shipped (2026-09-07).** `docs/todolist.md`'s "refine the design system, then develop a meaningful logo" item — rather than another icon set, tested whether the one system-level idea above (the color-bar test-pattern strip) condenses into an actual standalone mark, since that's specific to this brand in a way the shelved sax/notation icons never were. ~45 concepts explored across several rounds in `ui-lab/artifacts/dougrosenbergmusic/logo-from-testcard.html` (a bars roundel, a bare "DR" filled with the same five bars, a TV-silhouette screen showing the DR bars, plus refinements of each — favicon-scale tests, monochrome/print variants, antenna on/off, split-color letterforms). The winner: a TV silhouette (leaning fully into the "Better Than TV" idea above, not just the test-pattern strip) with "DR" filling the screen, each letter split horizontally into two of the five section colors — literally the letters as the test card, inside the TV the whole brand joke is about. Now the site's actual logo (`site/src/components/Logo.astro`, a fixed top-left home link) and favicon (`site/public/favicon.svg`). Both use static vector `<path>` data for the D/R glyphs extracted directly from the site's own self-hosted Fraunces font — not live text — so neither depends on a webfont loading correctly, matching how the favicon was already pure geometry before. `StaffNav`'s "Home" note was removed as redundant once the logo covered that job, and a separate pre-existing decorative antenna on `HeroGraded.astro` (built as an explicit stand-in for a future logo in that exact corner) was removed once the real logo took its place. See `docs/todolist.md`'s custom-items log for the fuller build/bug-fix history.

> **Superseded 2026-10-25:** the site went back to musician first, with web design as a quieter
> secondary line (see `docs/music-first-plan-2026-10-25.md`). The layout below still describes the
> hero structure; its dev-pitch copy and services list were removed. The same day, a hierarchy
> pass enlarged the headline, turned the eyebrow into Doug's name, and replaced the "now playing"
> chips and the terminal pill with a row of the four record covers.

## Dev-services hero pivot — exploratory, branch `hero-riff-14`, not yet merged (2026-09-15)

A third design layer, separate from both the locked musician-bio hero above and the TV/"Better Than TV" brand layer: pitches Doug's own web-design/dev practice from the hero itself, rather than only via the `DEV` nav link out to dougrosenbergdev.com. **Supersedes, for this hero variant only:** the "On Air" pill and "CH +" scroll cue described under Brand direction above are gone from the current `HeroGraded.astro` markup — replaced by the elements below. The musician-bio copy/constraints section further down is unchanged and still describes the locked baseline this branch diverges from.

Originated from a 14-riff exploration artifact (right-column content block, left-aligned text overlapping the subject rather than hugging the frame edge, dev-services copy). Riff 14 specifically — the photo's own baked-in smoke animated in place, rather than inventing new smoke elsewhere — was the one ported into the real component. Iterated further from there, in order:

- **Photo panned left.** `object-position`'s X axis turned out to have zero slack at this crop's aspect ratio (the box is wider than the photo, so `cover` is already width-bound — only the Y axis has room). Worked around with a small `scale()` + `translateX()` on `.hero__photo`, which needed `object-position`'s Y value pulled back too so the scale's symmetric crop didn't eat into the hat brim's headroom.
- **Eyebrow shrunk** (0.72rem → 0.62rem) — kept for context, de-emphasized rather than removed.
- **Every chip and CTA wired to a real destination**: the four "now playing" chips (pulled from `Listen.astro`'s track list) each link to their actual Amazon album page; the CTA buttons point at dougrosenbergdev.com and dougrosenbergdev.com/webdesign.
- **`--glow` flipped from powder blue (`#7fb0ff`) to a seafoam sibling of `--note-highlights`'s teal (`#52d1a6`, vs. `--note-highlights`'s `#4fb894`)** — Doug preferred the seafoam from the original artifact; picked a close-but-distinct shade rather than the exact same hex so the hero/career-highlights rows in the mobile staff-menu stay visually distinguishable. Site-wide token, so this also recolors the nav's "hero" note and the Intro segment of `LeadSheetBarShape`. `Logo.astro`'s two-tone mark (hardcoded `#7fb0ff` + `#4fb894`, independent of the token) was already pairing both hues and didn't need to change.
- **A rotating typed "command line" element added** — a skewed, dark terminal-style pill in the empty lower-left of the frame, separate from the CTA buttons (additive, not a replacement — Doug was explicit about keeping both). A vanilla-JS typewriter cycles through four destinations not otherwise surfaced in the hero (listen / lessons / private events / portfolio) at ~10s each, pausing on hover/focus so the link text can't change under a mid-click or mid-read, and collapsing to a static first item under `prefers-reduced-motion`. Lessons and private events both point at `#contact` — neither has its own page yet, so real inquiries for either go through that form.

**Housekeeping done alongside the design work, not yet on `master`:** `e2e/smoke.spec.ts`'s hero-copy assertion updated to match the new headline (the old one checked for "Doug"/"Rosenberg" in the `<h1>`, which the pivoted copy no longer contains); `public/_headers`'s CSP `script-src` gained the hash for the new terminal-widget inline script (7 hashes now — see that file's own regen instructions, and `docs/todolist.md`'s "Round 1" entry for why this is a recurring gotcha, not a one-off).

**Not yet decided:** whether this hero replaces the locked musician-bio one, coexists as some kind of split, or stays a parked exploration. This section is a snapshot of what's built on the branch, not a decision record.

## Concrete constraints — locked in and built (2026-08-28)

- [x] **Layout:** sound-driven, single continuous scroll. Full-bleed hero photo with glowing name overlay → a "Now Playing" player/waveform strip near the top (not buried behind a Listen nav click) → About, asymmetric (photo offset, text runs alongside, not centered/stacked) → upcoming shows/press → a real, prominent "Book Me" contact CTA (not a footer icon). No traditional top-nav-with-six-equal-tabs; nav (if any) is minimal/secondary to the scroll itself.
- [x] **Signature motif:** sheet music / staff lines. Thin horizontal staff-line texture used structurally (section backgrounds, dividers), with content deliberately breaking the "notes" metaphor here and there — ties to "composer" specifically, distinct from the current live site's tremolo-slash nav marks.
- [x] **Type (my call, easy to override):** Fraunces (expressive serif with real character and a genuine italic, good for the name treatment and editorial-style pull quotes — liner-notes energy) paired with Work Sans for body/UI (quiet, legible, lets Fraunces carry the personality) and JetBrains Mono for small utility labels (track numbers, meta) — deliberately not IBM Plex Mono, to avoid echoing haxbyte's pairing. **Update, 2026-10-30:** JetBrains Mono was dropped (Doug found three families too many); those labels now use Work Sans. See `docs/style-guide.md`, Typography.
- [x] **Color (my call, easy to override):** keep the existing site's dark/moody/cinematic base (deep near-black navy) and its glowing blue for the name treatment specifically, carrying that mood forward per the "riff on, don't blank-slate" instruction — but add a warm brass/amber accent tied to the actual instrument (the saxophone itself) as a second color, used for the staff-line motif and CTA, so the palette isn't just a single blue note.

## Hero motion: taken out, not decided (2026-10-28)

Two pieces of hero motion were removed during the UI-to-85 work, and Doug is **not settled** on
whether they should stay gone. Treat both as open, not as deliberate removals.

- **Floating "now playing" chips from the saxophone bell** (removed 2026-10-25, music-first plan
  step 2, PR #97). Four drifting chips linking to the four records were replaced by a static row
  of record covers. The stated reasons were that the chips sat at opacity 0 under reduced motion
  (so those visitors never saw them) and that they only repeated the records' Amazon links. Both
  are fixable without removing the chips. Doug likes them. They are in git history before that
  date and archived in `ui-lab` (`hero-terminal-widget.html`).
- **Headline shimmer** (removed 2026-10-28, UI plan step 5). The headline's slow 16-second green
  gradient sweep is gone on every screen size; the headline is solid text with "TV" in the logo's
  test-card colors and a one-time flicker. Removed to stop the sweep leaving arbitrary letters
  green, but it also took out the continuous motion, which was not Doug's call. Options if it
  returns: a light sweep across "Better Than" with T and V fixed, or a shifting glow inside T and V
  only. Keep it off or frozen at 1024px and below (the old mobile Lighthouse hit came from
  continuous repainting).

### Update, 2026-10-29: smoke and headline shading added

Doug approved the animated smoke from `docs/hero-haze-preview-2026-10-29.html` and it shipped in
`HeroGraded.astro` ("Lean haze", strength 0.65, smoke blob on, headline shading on). That brings
back continuous hero motion in a different form from the shimmer: noise clipped to "Better Than"
drifts grey to near-white on a 28s loop while T and V keep their test-card colors, over four
drifting haze layers and two torn grey smoke shapes. The shimmer itself stays gone.

What moves now: on desktop, the four haze layers (13 to 26s loops), the two smoke shapes (36s and
47s) and the headline shading (28s). At 1024px and below the drifting haze is replaced by two
static layers cross-fading over 40s, one smoke shape sits still, and the headline shading holds
still. Under `prefers-reduced-motion` all of it is still at every width. Plus the fade-up on load
and the one-time TV flicker. The sax-bell chips are still undecided.

### Update, 2026-10-30: the haze drifts on phones, with a lite mode for weak devices

Doug looked at the site on a phone and saw no haze motion: the 1024px-and-under tier from
2026-10-29 swapped the drifting haze for two near-still layers. That tier was a guard from the old
mobile Lighthouse hit, which came from filter-based layers; the current layers animate only
transform and opacity, and a local Lighthouse run with the full haze on a phone scored 96 to 97
(LCP 2.4s, TBT 0, CLS 0), so the guard was removed. The headline shading still holds still at
1024px and below because it repaints text.

Weak devices and connections get a still hero instead, through `data-fx="lite"` on the hero
(`HeroGraded.astro`, script at the bottom of the file). Lite is chosen when the browser reports
Save-Data, a 2G or 3G connection, 2 GB of memory or less, or 2 cores or fewer, or when a frame-rate
check in the first seconds sees more than 40% of frames over 50ms (a stand-in for under about 20
fps). Lite keeps the smoke in place but frozen: haze layers hold their starting positions, smoke
shape a is frozen, b is dropped. The verdict is remembered for the tab session. The drift also
pauses (`data-live="false"`) while the hero is scrolled out of view or the tab is hidden.
`?fx=lite` and `?fx=full` force either state, for checking by eye and for tests (headless Chromium
has no GPU and would trip the frame-rate check). The resting layers (`hero__rest`) are gone.
The hero image is only 41 KB, so a poor connection costs little; the lite mode is about CPU and GPU.
Limits: the frame-rate check can misread a busy first few seconds (a big scroll right after load)
as a weak device, and the result is a still hero, not a broken one. Not measured on a real phone.

### Update, 2026-11-14: the frame-rate check no longer sticks

Doug's own desktop (16 cores, 32 GB, 4g, `deviceMemory` 32) had `sessionStorage.fx = "lite"` and no
moving smoke; `?fx=full` brought it back. Hardware and connection checks were clean, so the
frame-rate check had tripped on one bad 2.5s window after load, and the verdict was remembered for
the whole tab. Changes in `HeroGraded.astro`: two bad windows in a row are needed; a frame gap over
1s (throttled tab) restarts the window; the check is skipped on 8 or more cores; and a frame-rate
verdict applies to that page view only (only the device and connection checks are stored). Why it
tripped is not known; it was not reproduced on real hardware, only with faked slow frames.
Regression tests in `e2e/hero-haze.spec.ts` (all three failed against the old code).

### Update, 2026-11-14: color blobs on the left of the hero

Doug asked for subtle blobs moving around the left of the screen, slowly passing through all the
nav colors. Added three soft radial glows in `HeroGraded.astro` (`.hero__hues`, left 52% of the
hero, strength 0.7). Each cycles through the seven `--note-*` tones in nav order (hero green,
listen brass, about orange, highlights green, lessons blue, contact purple, dev red) over 84s, 98s
and 112s, started at different offsets, while drifting on irregular keyframe paths of 47s, 61s and
73s. Nothing is random at runtime (no JS); the uneven stops and mismatched lengths make it read
that way. The color is a registered `@property --hue`, so the gradient repaints each blob's own
small layer per frame; the rest is transform only. Where `@property` is unsupported a blob holds
its first tone. Lite mode, reduced motion and the off-screen pause treat the blobs like the haze.
Checked by eye in two screenshots 20s apart on a 1440px build (green wash, then blue and amber).

Later the same day, after seeing it on the dev server, Doug asked for the blobs to be 50% less
visible: the hero blobs went from strength 0.7 to 0.35 and the page-wide glows from 0.5 to 0.25
(the figures quoted below are the original ones). He also found the dev server "twitchy"; see the
measurement note at the end of the next section. After a look on desktop he then asked for them
slightly more visible, so the final values are 0.45 for the hero blobs and 0.35 for the page-wide
glows (set 2026-11-14).

CSP note, 2026-11-14: PR #121 (the blobs) reached `master` without regenerating the script-src hash
for the hero's inline script, which the blobs change had edited (the line that mirrors `data-fx` to
`<html>`). Live, the browser therefore blocked that script: lite mode, the frame-rate watchdog and
the off-screen pause did not run on dougrosenberg.com, while all the CSS animation still did.
Found by comparing the live page's inline-script hashes with its `Content-Security-Policy` header;
fixed in the following branch by regenerating with `npm run verify-csp -- --write`. Run
`npm run build && npm run verify-csp` before merging any change to an inline script.

### Update, 2026-11-14: the same glows across the whole page background

Doug found the plain charcoal background a little boring and asked for the blobs over the entire
viewport at any scroll position. Added `AmbientHues.astro` (home page only): a fixed layer behind
the page with four larger, fainter blobs (strength 0.5, 36 to 50vw with a pixel floor for phones),
each on its own uneven path (67 to 89s) and color cycle (91 to 117s, offset). The hero keeps its
own left-side blobs over the photo (the photo is opaque, so the fixed layer is hidden behind it).
`@property --hue` and `@keyframes hue-cycle` moved to `global.css` so the two layers share one
color timeline.

To let the layer show, section backgrounds that were opaque `--bg` (Intro, Listen, Performance,
Lessons, Sheet Music, Dev, FAQ) are `transparent`; they were the body color anyway, so nothing
else changes. The raised bands (About, Career Highlights, Gallery) are 78% opaque so they keep
their band look and let a hint through. Contact's fade into the footer now starts from transparent
(an opaque start left a hard seam under FAQ, caught in a screenshot). The hero photo and the footer
stay opaque on purpose. Lite mode reaches the fixed layer through `data-fx="lite"` on `<html>`
(set by the hero script); reduced motion stills it; a hidden tab is paused by the browser.

Limits: home page only. The archive pages, Eastern Blok pages and 404 keep the plain background,
because the lite/watchdog script lives in the hero and would need to be shared first. The glows sit
behind text, so Lighthouse's contrast check can't see them; at strength 0.5 the brightest spot is
about 16% tone over the charcoal, which I judged by eye from screenshots at three scroll positions,
not by measured contrast. Mobile Lighthouse on the production build: performance 97, accessibility
100, best practices 100, SEO 100 (LCP 2.4s, TBT 0, CLS 0), the same as before the layer. Not looked
at on a real phone.

Twitchiness (Doug, dev server, same day): not reproduced, cause not confirmed. Headless Chromium
here has no GPU, so everything runs at about 15 to 20 fps and absolute numbers mean nothing; the
relative cost while scrolling the production build for 8s (frames drawn: more is better) was 181 with
no blobs, 164 with only the hero blobs, 138 with the page-wide layer but color cycling off, 136 with
everything on. So the page-wide layer is the costly part, and the animated color is not. Two
suspects remain, neither tested on real hardware: (1) every path uses `ease-in-out` per keyframe
segment, so each blob slows to a near stop and speeds up again at each of its four or five stops,
which reads as surging; (2) the dev server injects styles late and hot-reloads, which restarts
animations. Possible fix for (1), not done: animate x, y and scale as separate properties with
different periods and `alternate`, instead of multi-stop paths.

## Light theme draft (2026-11-15, branch `light-mode-draft-2026-11-15`, not merged)

Doug asked for a light version drafted on a branch, informed by current musician sites and 2027
design trends. The token values and rules are in `docs/style-guide.md` under "Themes"; this is
the why.

**What working musicians' sites do (sampled 2026-11-15 by pulling each homepage's CSS).** Most
current jazz-artist sites are light or mixed, not dark: Kamasi Washington (white and `#fafafa`
with `#272727` blocks), Joshua Redman (white), Jacob Collier (white with black bands), Immanuel
Wilkins (white with `#222` sections), Makaya McCraven and Nubya Garcia (black and white, photo
led). The closest to this site is saxophonist Melissa Aldana: a near-white `#fcfcff` page with a
warm amber accent (`#ed9c35`). The common pattern is a light page where photos and album art
carry the color, and dark used in blocks for pictures. A small sample, read from stylesheets
rather than screenshots, so treat it as a direction rather than a survey.

**What the 2027 trend pieces agree on** (agency blogs, so opinion, not data): warm off-whites
instead of pure white, with charcoal instead of black; editorial type (a serif display face
paired with a grotesque, big scale contrast), which this site already has with Fraunces and Work
Sans; visible human craft and analog texture over polished generic surfaces; motion only where it
explains something; accessibility as a baseline; and glassmorphism, decorative gradients and
motion on every surface fading as differentiators. Several predict "ambient" design that follows
the visitor's context, which the follow-the-system default does in its simplest form.

**How the draft applies it:**
- **Paper, not white.** `#f4efe6` is an LP-sleeve stock, close to the off-whites the trend pieces
  name. The ink is a warm charcoal, `#1f1b16`.
- **Accents deepened, not swapped.** Each nav tone keeps its hue and drops in lightness until it
  clears AA as text on all three light surfaces, so the six-color system still reads as itself.
  Brass becomes a dark ochre and seafoam a deep green.
- **Dark plates.** The hero photo, the footer and the Dev TV stay dark. This matches the "dark
  blocks for pictures" pattern on the artist sites, and it reads as an album: a paper sleeve with a
  dark cover photo and a dark back cover. It also avoids re-tuning the hero's haze, scrims and
  blobs, which were tuned against dark over three weeks.
- **Craft over polish.** A static paper grain (one SVG noise tile, no animation) on the light page
  only. The page-wide color glows stay on: on paper they read as faint watercolor washes.
- **Toggle in the site's voice.** "Lights up" / "Lights down", a stage-lights switch with a brass
  dot, in the footer and beside the back link on the archive pages.

**Open before merge:** the default (system-following, or dark unless chosen), whether the fixed
nav needs a toggle, real-device checks, and a Lighthouse run in light. Tracked in
`docs/todolist.md`'s "Light-mode refactor" item.

## Reference

- Existing live site: dougrosenberg.com (current Blazor build, code in `newMusicWebsiteJan26`) — the current visual mood (dark/cinematic/glowing type) is a real asset worth carrying forward in spirit, even in a fully custom rebuild.
- `ui-lab` repo — local archive of UI experiments; check there first for anything reusable. This project's nav and brand explorations are archived under `artifacts/dougrosenbergmusic/`, including ideas that didn't make the cut (see Brand direction above).
- **Pre-launch quality checklist:** before calling this site done, check it against the canonical checklist in the `career-development` repo — not duplicated here on purpose (it's a living doc that gets updated independently; a copy would drift stale). Local: `../career-development/docs/SITE_QUALITY_CHECKLIST.md`. Remote: https://github.com/shalant/career-development/blob/main/docs/SITE_QUALITY_CHECKLIST.md
