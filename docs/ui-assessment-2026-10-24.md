# UI/UX assessment snapshot, 2026-10-24

A point-in-time review of the live site, written down so the work can be deferred without
losing the findings. Nothing here has been acted on.

**Goal set by Doug on 2026-10-24:** the site's UX/UI should be clearly exceptional on first
inspection by a casual onlooker or a software developer.

## What was reviewed, and what wasn't

- Reviewed: `https://dougrosenberg.com/` (hero, intro, "For businesses", Listen/Recordings,
  About) plus `/press` and `/easternblok` (top of each), in Chrome at 1440x900.
- **Not reviewed:** mobile. The attempt to resize the browser to phone width didn't take, so
  every screenshot was desktop. Treat the mobile score below as a placeholder.
- Not reviewed: the lower half of the home page (highlights, lessons, sheet music, FAQ,
  contact), `/easternblok/press`, hover states, keyboard focus, motion with
  `prefers-reduced-motion`, and any other browser than Chrome.
- The comparison to other musician sites is from general knowledge of how working jazz and
  session-musician sites tend to look, not from visiting specific sites in this session.

## Score: 70 / 100

| Area | Score | Notes |
|---|---|---|
| Identity and distinctiveness | 17 / 20 | The staff-line nav, note-shaped icons, dividers that stretch into labeled pills, the DR TV-logo and the photo with floating track tags are original. Nothing else looks like it. |
| First impression (hero) | 12 / 20 | Strong photo, but the pitch is small beside it and the hero has too many parts (see findings 1 and 2). |
| Craft and polish | 13 / 20 | Overlap bugs (nav over content, carousel controls over the preview) and a few repeated template patterns. |
| Typography and hierarchy | 12 / 15 | Coherent serif + italic + mono pairing. Loses points for small body copy, low-contrast grey, a centered intro among left-aligned sections. |
| Content and archive pages | 7 / 10 | `/press` and `/easternblok` are well written, with a good timeline strip on `/press`, but visually plainer than the home page. |
| Mobile | 9 / 15 | **Unverified.** Held at a middling provisional score. Could move 10 points either way. |

## How that compares

- **Against typical musician sites: clearly above.** Most working jazz and session
  musicians' sites are Squarespace or Wix templates: a hero photo, a bio, a gig list, a
  contact form. This site has a point of view and custom interaction, which puts it near the
  top of that group. Rough standing: top 10%.
- **Against the stated goal ("clearly exceptional to any onlooker or developer"): not there
  yet.** That bar is portfolio-grade, the kind of site a designer-developer would be proud to
  have featured. At 70, this reads as "good, distinctive and well built", not "exceptional on
  first glance". The gap is mostly the hero and polish, not the idea.
- **Against its own pitch:** the page sells web design to developers and small businesses.
  A client or hiring developer compares it to other freelance developer portfolios, and that
  is a harder crowd than other musicians. Against that group it is average-to-good at 70.

## Findings, ranked by impact

1. **The hero's hierarchy is weak.** "I make websites that sound like you." is the right
   line but is set at about 36px beside a full-bleed photo, so it reads as a caption. Above
   and below it sit: a tiny all-caps kicker ("FORMERLY ON STAGE, NOW BEHIND THE SCREEN"), one
   accented phrase in the headline, a four-item list (Web Design / Development / Branding /
   Ongoing Support, repeated as chips in the next section), two buttons, floating track tags
   and a "listen now" chip. Candidate fix: larger headline, drop the four-item list, drop the
   kicker or the accent.
2. **Proof comes too late.** The one live-site preview (Guacamayo) is two screens down, small,
   with carousel controls laid over it. A developer or prospective client wants to see work in
   or directly under the hero.
3. **Overlap and layering bugs.** The semi-transparent nav pill sits over album covers and
   the carousel preview while scrolling. The carousel controls sit over the preview's bottom
   edge.
4. **Repeated template chrome.** Tiny tracked all-caps eyebrows ("FOR BUSINESSES", "LISTEN",
   "ABOUT") duplicate what the staff dividers already say. The four album cards share one
   radius and one shade. Tags in the businesses block are small mono chips.
5. **Archive pages don't carry the home page's visual language.** `/press` and `/easternblok`
   are narrow text columns on near-black with no color or note-icon language. The `/press`
   timeline strip is the best element and could be larger and use the amber accent.
6. **Smaller notes.** Muted grey body text at small size on near-black; the intro paragraph
   is centered while the rest is left-aligned.

## What to keep

The staff-line navigation, the divider pills, the logo, the color-coded note icons and the
serif/italic/mono type system. The 2026-10-17 decision to keep the header always visible
stands.

## Suggested order when this is picked up

1. Rework the hero hierarchy and bring one project preview up near it. First check whether
   the current hero is the "Riff 14" port (see `docs/HeroDesigns`) or a stopgap, because that
   decides whether this is a swap or a redesign.
2. Fix the nav and carousel overlap.
3. Remove the eyebrows and vary the card treatment.
4. Carry the home page's visual language into the archive pages.
5. Do a real mobile pass (390px and 768px), plus keyboard focus and reduced motion, and
   re-score. Run the `site-audit` agent against `SITE_QUALITY_CHECKLIST` for the objective
   items.

## Re-score, 2026-10-25: about 78 / 100

After PR #97 (hero hierarchy, "Better Than TV" headline, record row). Reviewed this time: the
full home page at 1440px and 390px, the hero at 15 sizes from 360x740 to 2560x1440, `/press`
and `/easternblok`, and the hero's hover, focus and reduced-motion states. Same reviewer who
built the hero, so read the gain as "clearly better", not a measurement.

| Area | Was | Now | Why |
|---|---|---|---|
| Identity and distinctiveness | 17 | 18 | The headline now ties to the TV logo; the "Side A / Side B" footer is a strong touch. |
| First impression (hero) | 12 | 17 | Names Doug, big headline, records in the first screen, holds up at every size. Nothing playable; the shimmer leaves arbitrary letters green. |
| Craft and polish | 13 | 14 | Hero bugs fixed; carousel overlap, gallery pill and a `/press` typo remain. |
| Typography and hierarchy | 12 | 12 | Eyebrow-per-section template, centered intro and contact, small grey type. |
| Content and archive pages | 7 | 7 | Unchanged. |
| Mobile | 9 (unverified) | 10 | Now checked; the hero is solid, the rest is long and list-heavy. |

Plan to reach 85: `docs/ui-85-plan-2026-10-25.md`.

## Re-score, 2026-10-29: about 85 / 100

After steps 1 to 5 of the plan and the axe and Lighthouse fixes. Reviewed: every home page
section at 1440px and 390px (screenshots with reduced motion on, so the hero's motion is not part
of this score). Not re-viewed: `/press`, `/easternblok` and `/easternblok/press`, so that row is
provisional. Same reviewer who built most of it, so treat it as a consistency check, not a
measurement; I'd allow three points either way. The fixed logo shows on top of some section
screenshots; that comes from how they were captured and is not a bug.

| Area | Was | Now | Why |
|---|---|---|---|
| Identity and distinctiveness | 18 | 18 | TV logo, staff nav and Side A / Side B footer still carry it. |
| First impression (hero) | 17 | 18 | Solid headline with the test-card T and V; the shimmer flaw is gone. |
| Craft and polish | 14 | 16 | Gallery pill, `/press` typo, focus states and lightbox fixed. Gaps listed below. |
| Typography and hierarchy | 12 | 13 | Eyebrows gone, intro left-aligned. Some small grey text remains. |
| Content and archive pages | 7 | 8 (provisional) | Not re-viewed this pass. |
| Mobile | 10 | 12 | All 13 sections checked at 390px: no horizontal overflow, layouts hold. |

Craft gaps found in that pass, and what happened to each (branch `ui-craft-polish-2026-10-29`):
- FAQ as five identical rounded cards: now ruled rows. Fixed.
- "Send Message" in the mono face while every other button is bold sans: fixed.
- "Tech" alone on a second line in the About tags: fixed with a narrower measure (two and two on
  desktop, one, one, two on a phone).
- Highlights: "Lake Forest Country Day School" as a stray bold line under a bullet list: now its own
  heading and bullet, like the New Trier block.
- `/easternblok` layout shift of 0.10: traced to `62ch` column widths and fallback fonts with
  different metrics; fixed (see `docs/ui-85-plan-2026-10-25.md`, "Craft pass, 2026-10-29").
- Left on purpose: press outlet links stay about 32px tall (their CSS records that 44px would
  overlap the quote above; they clear WCAG 2.5.8's 24px).
- Decided 2026-10-30: heading style alternated roman and italic (Recordings, Highlights, Private
  lessons, Quick answers, On record and In Frame roman; On the Road, Sheet Music Library,
  "I also build sites like this one." and "Let's make some music." italic). Doug deferred the call;
  the rule is now: labels roman, full-sentence headings italic, so On the Road and Sheet Music
  Library went roman. Written in `docs/style-guide.md` and checked by `e2e/heading-style.spec.ts`.
- Archive pages re-viewed 2026-10-29 evening (`/press`, `/easternblok`, `/easternblok/press` at
  1440px and 390px): they hold together and carry the home page's language (staff, noteheads,
  ruled rows, wanted box). One bug found and fixed: on the Eastern Blok press timeline the album
  labels "Goran Ivanovic Group" and "Folk Tales", a year apart, printed on top of each other (the
  overlap was there at every width, including 1440px). A label within a year of the one before it
  now drops to a second row; `e2e/press-strip.spec.ts` checks the label boxes at 320, 390, 768
  and 1440px and fails without the fix. That moves the archive row from provisional 8 to a firm
  8/10: the pages are plainer than the home page, and `/press` leaves the right 40% of the
  desktop page empty by design (a 42rem reading column).
- Fixed 2026-10-30 (branch `lists-ruled-rows-2026-10-30`): the Highlights credentials (0.86rem
  grey bullets) are now ruled rows like the FAQ, role at 0.95rem in full-strength text with the
  years right-aligned (they stay right-aligned when they wrap), and the "Artists performed with"
  names went from 0.9rem grey to 0.98rem full-strength, matching the school list above them.
  `e2e/list-rows.spec.ts` checks size, rule and overflow at 320, 390 and 1440px and fails on the
  old build.
- Open, content not code: one gallery photo (the red-lit one) is grainy next to sharp ones.

## Home mobile performance, 2026-10-29 (evening)

Home mobile Lighthouse had been 86 to 88 locally (LCP 3.4s), under the 0.9 gate, with or
without the hero haze. The LCP element is the hero photo (`hero.webp`, 42KB). Disabling the haze,
the headline shading, the photo's CSS filter, the scanlines/vignette and the photo's transform each
changed first paint by less than the run-to-run noise (about 150ms), so the haze is not the cost.
What did move it: the photo shared bandwidth with the Dev carousel's first screenshot
(`guacamayo.jpg`, 94KB, several screens down, not lazy). Added `fetchpriority="high"` and
`decoding="async"` to the hero photo and `loading="lazy"` to that screenshot: Lighthouse mobile
92, 93, 93 (was 86 to 88), LCP 2.8 to 2.9s, CLS 0. `e2e/image-priority.spec.ts` pins both
attributes and fails without them. The Dev screen has a fixed aspect ratio, so lazy loading adds no
shift.

## Mobile refinement round, 2026-10-30

Branch `mobile-refinement-2026-10-30`. Reviewed the home page section by section at 390px and
360px (device scale 2, reduced motion on), then measured every page at 390px for text size and tap
targets, and checked horizontal overflow at 320, 360, 390 and 430px (none on any of the five pages).
The fixed logo and menu button show on top of some section screenshots; that is how they were
captured, not a bug.

Found and fixed:
- **Tiny text.** The audit counted text at 9.6 to 12px across the site (253 gig dates at 12px, gig
  tags at 10.4px, the Dev screen chips at 9.6px, most captions and metadata at 11.2 to 11.5px).
  Dropping JetBrains Mono (PR #110) made it worse: those sizes were tuned for a mono face with a
  taller x-height, so Work Sans at the same size reads smaller. Raised 38 declarations to a floor of
  0.8rem (12.8px) for text people read and 0.75rem (12px) for tracked uppercase labels. The rule is
  now in `docs/style-guide.md`.
- Send Message was 43px tall; now `min-height: 44px`.
- The two Dev buttons stacked at different widths on a phone; now one full-width pair at 520px
  and below.
- The gallery hint said "drag or scroll" on a touch screen; it now says "swipe" (and keeps
  "auto-playing" only when the reel autoplays).

Checked and left alone:
- The About photo's narrower, offset frame stays (recorded in `docs/todolist.md` as the intended
  asymmetric layout, not a bug).
- The Dev carousel remote over the preview stays (Doug's call); its LEDs are 26px but take a tap in
  a 24x44 area (`e2e/tap-targets.spec.ts`).
- Press outlet links stay 32 to 36px tall on purpose (see `QuoteLedger.astro`).

`e2e/mobile-refinement.spec.ts` guards all four fixes; its text and hint tests fail on the build
before this change.

Not checked: a real phone. Everything above is headless Chromium at phone sizes, so touch feel,
scroll momentum, safe-area insets and the haze motion on a GPU are still unverified.

## Related

- Rubric: `career-development/docs/SITE_QUALITY_CHECKLIST.md`
- Existing design explorations: `docs/HeroDesigns`, `docs/DESIGN_NOTES.md`, `docs/style-guide.md`
