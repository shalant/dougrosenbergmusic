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

## Re-score, 2026-10-30: about 90 / 100

After PRs #104 to #114 (craft polish, hazy hero, home mobile performance, press timeline fix, two
fonts instead of three, ruled-row lists, mobile text floor, haze on phones with a lite mode, the
heading rule). Same reviewer who built most of it, so allow three points either way; read it as a
consistency check, not a measurement. Doug confirmed on his own phone that the site "looks great on
mobile" (2026-10-30), which is the first real-device check in this series.

| Area | Was (10-29) | Now | Why |
|---|---|---|---|
| Identity and distinctiveness | 18 | 18 | Unchanged; two typefaces make the identity cleaner, not stronger. |
| First impression (hero) | 19 | 19 | Haze on phones is in PR #113 and not yet seen by Doug on a device, so no credit yet. |
| Craft and polish | 16 | 17 | Heading rule written and tested, lists restyled, small-text floor, 44px submit, matched Dev buttons. Left: the grainy gallery photo, the sax-bell chips undecided. |
| Typography and hierarchy | 13 | 14 | Three families down to two, no visible text under 12px on a phone, heading rule. |
| Content and archive pages | 8 | 9 | Performance and Highlights no longer the weakest blocks; archive pages hold up. |
| Mobile | 12 | 13 | Doug's phone check; text floor; haze motion still unverified. |

What would move it past 90: seeing the haze run smoothly on a real phone and laptop (first
impression and mobile), a sharper replacement for the red-lit gallery photo, and a decision on the
sax-bell chips. The remaining points are mostly judgement on identity (how much a stranger would
remember the site) that this reviewer can't measure.

## Cross-browser and interaction-state pass, 2026-10-30

Branch `cross-browser-and-states-2026-10-30`. Two parts of the craft work, both measured.

**Cross-browser.** Ran the whole e2e suite, plus screenshots of the hero and three sections, in
Playwright's Firefox 155, desktop WebKit 26.6 and an iPhone 14 WebKit profile (Chromium was all it
had ever seen).
- Firefox and desktop WebKit each pass all 126 tests when run alone; iPhone WebKit passes after two
  fixes to the tests themselves (`mouse.wheel` is unsupported in mobile WebKit, and resizing an
  emulated phone to 1440px stopped its IntersectionObserver reporting, which a real phone can't
  do). Running all three engines in parallel produced 24 timeouts that pass when run alone, so the
  suite takes `--workers=3` and a quiet machine.
- Firefox renders the home page and the archive pages the same as Chromium.
- All five scroll-driven animations are behind `@supports (animation-timeline: view())`, so older
  Safari gets plain visible content. `100dvh` has a `100vh` fallback. Two `backdrop-filter` rules
  lacked the `-webkit-` prefix (gallery lightbox, `.cta-secondary`); added.
- **Not a bug, and nearly mistaken for one:** in Playwright's WebKit the headline and italic type look
  much heavier and bold buttons look regular. A lab page with the same font files showed that build
  ignores variable-font weights entirely, even with `font-variation-settings`. It is Playwright's
  Windows WebKit, not Safari on an iPhone or Mac. Declaring the fonts as weight ranges changed
  nothing there and was reverted. **Real Safari is still unchecked**: look at the type on a real
  iPhone or Mac.
- `playwright.config.ts` now has opt-in Firefox, WebKit and iPhone projects (`E2E_ENGINES=all`);
  CI stays Chromium-only.

**Interaction states.** Hovered and focused every interactive element on `/`, `/press`,
`/easternblok` and `/easternblok/press` (320 in all) and listed the ones with no visible change. A
first run with reduced motion on wrongly flagged elements whose hover is a motion effect, so it was
rerun with normal motion and deeper child sampling. Real gaps, now fixed:
- Accordion rows (FAQ, press years, show years, "More video") had no hover cue; the "+" now swells.
- Plain inline links (archived copy, sources, outlet names) had no hover cue; the underline turns
  brass and thickens. (Text color can't be the cue: component rules set link colors with higher
  specificity than a global rule can match.)
- Contact fields and the sheet-music search had no hover cue; the border brightens, and focus still
  wins.
- Keyboard focus was invisible on the active Dev remote light, where focus lands first: its glow rule
  came later than the focus ring and replaced it. Both show now.
- A failed contact-form validation only printed one line. Now each field that needs fixing gets
  `aria-invalid` and a red border (kept while focused), the cursor moves to the first, and a
  malformed email is caught on the page (same regex as the Worker) before the round trip.
Left alone: the first gallery thumbnail and the first remote light show "no hover change" only
because they are the active ones.

Guarded by `e2e/interaction-states.spec.ts` and `e2e/contact-validation.spec.ts`; both fail on the
build before this change.

## Related

- Rubric: `career-development/docs/SITE_QUALITY_CHECKLIST.md`
- Existing design explorations: `docs/HeroDesigns`, `docs/DESIGN_NOTES.md`, `docs/style-guide.md`

## Edge states, 2026-10-31

Branch `edge-states-2026-10-31`. Looked at what a visitor sees when something is empty or fails.
- Sheet-music search with no matches: was a blank list, now a line naming the search and what to do.
- Sheet-music image that fails to load: was an empty frame, now a message. PDFs in the iframe can't
  be checked from the page, so "Open in new tab" remains the fallback.
- 404 page: returns status 404 and links home; no change needed.
- Gallery lightbox not yet examined.

## Good cop and bad cop, 2026-11-01

Doug asked for both lenses, the way `dougrosenbergdev/UI_AUDIT_PLAN.md` uses them (good cop 89, bad
cop 76 there). That file never defines them, so they are defined here:

- **Good cop:** the six-area rubric above, scored on what the site achieves. This is the series
  that reads about 90 (2026-10-30).
- **Bad cop:** a skeptical stranger who has seen a thousand musician and portfolio sites. They
  take points for anything that is stock, repeated, hard to read, or forgettable, and give no
  credit for effort, tests or intent. A separate lens, not comparable to the good-cop number.

Bad-cop pass: live `https://dougrosenberg.com/` at 1440px, scrolled hero through Dev. Not
viewed: Contact and footer, `/press`, `/easternblok`, mobile. My judgment, same
reviewer who built most of the site.

**Bad cop: about 78 / 100.** What costs points:
1. **The nav pill prints over body text.** The semi-transparent six-blob nav sits on top of the
   About paragraph and the press sidebar while scrolling, and the words run through it. First
   logged 2026-10-24 as finding 3 and still visible.
2. **Walls of dot-separated names.** On the Road, "Artists performed with" and the Highlights
   university list are plain text runs. They are the longest stretch with no image, rule or
   change in scale, and the middle of the page blurs together.
3. **Same dark navy in every section.** The staff dividers separate sections, but nothing else
   changes between Recordings, About, On the Road and Highlights, so the scroll feels long.
4. **Left-hugging columns.** The intro, Highlights and About copy sit in a column starting at
   x=245 with the right 40% empty, and there is roughly 250px of dead space under About.
5. **Four identical album cards.** One size, one grey caption style. Reasonable for a discography,
   but the stock grid of the page.
6. **Dev block still has the remote over the preview and two stacked buttons** (Doug's call on
   the remote, recorded 2026-10-30), and it is the only coral section.

What the bad cop concedes: the hero, DR logo, staff dividers, ruled-row lists and heading rule
are not stock, and a stranger would remember the hero.

Cheapest points to win back: stop the nav showing text through it (give the pill a solid or
blurred backing), and break one of the name walls with a larger-scale treatment.

### Bad-cop fixes, 2026-11-01 (branch `ui-bad-cop-fixes-2026-11-01`)

Doug kept the nav's look ("novel") and the Dev section as they are, and asked for points 2 to 5.
- **Nav (point 1):** pill background raised from 0.65 to 0.75 alpha, nothing else changed. The phone
  hamburger button stays at 0.65.
- **Name walls (2):** Chicago venues in the display face at headline size; the seven collaborators
  named in the About paragraph set as large italic names above the rest of "Artists performed with";
  the first four schools in Highlights set the same way. Every name still appears exactly once. Which
  names lead is my pick, from the About sentence and Doug's own school order; swap freely.
- **Same navy everywhere (3):** About is a raised band (`--bg-elevated`, hairline rules, faint brass
  wash behind the photo), alternating with the plain sections and the Highlights band.
- **Left-hugging columns (4):** intro lede 56rem and up to 1.75rem (was 44rem, 1.4rem); About's
  bottom padding cut so the strip under it is shorter.
- **Identical albums (5):** from 760px the debut gets a 1.8fr column, bigger cover and title; the
  other three sit beside it. Phones keep the compact rows.
- Guarded by `e2e/bad-cop-fixes.spec.ts` (5 tests, all fail on the build before this change).
  Full Chromium e2e: 143 passed, 16 phone-only skipped. Not re-scored and not checked on a phone.
- Gotcha: another process held the default e2e port 4322, so the first full run tested the wrong
  site and nearly everything timed out. Run with `E2E_PORT=4391`.
- Gotcha 2 (2026-11-01): `npm run test:e2e` serves the prebuilt `dist/` and never rebuilds, so
  after editing `site/src` run `npm run build` first. Checking "does the new test fail on the old
  code" by stashing `site/src` alone passed all 5, because `dist/` still held the new build. The
  valid check is a separate checkout of the old commit, built on its own: all 5 failed there
  (nav alpha 0.65, lede 704px, lead cover 253px, About bg equal to its neighbours, feature
  lists absent), and all 5 pass on the new code.

## Phone check and re-score, 2026-11-01

PR #118 is merged and live (the live HTML carries `album--lead`, `performance__venue-list--marquee`
and `career-highlights__feature`). Same reviewer who built the site, so allow three points either
way.

**Phone check.** Live `https://dougrosenberg.com/` in Playwright's Pixel 7 emulation (412px wide),
full page scrolled and screenshotted, plus measurements. This is an emulator, not a real phone;
Doug's own-device check from 2026-10-30 predates these changes and is still the only real-device
one.
- No sideways scroll (document width 412 = viewport 412). The only elements wider than the viewport
  are the gallery reel, inside its clipped container.
- No visible text under 12px.
- Marquee Chicago venues stack in one column in the display face; the "National and international"
  list keeps two columns; the lead artists and first four schools wrap cleanly in italic with the
  rest set small below. No clipping, no overlap beyond the fixed logo and menu, which are meant to
  stay.
- The lead names measure 16.45:1 (artists, venues) and 14.87:1 (schools) against their section
  background on phone and desktop. In screenshots they looked dim only because the scroll-reveal
  was mid-fade.
- The lead-album layout is desktop only by design, so there is nothing to see on a phone.
- Not checked: the hero and Dev block on a phone this round, the haze motion
  (still unverified on a real device).

**Good cop: about 92 / 100** (was about 90 on 2026-10-30).

| Area | Was | Now | Why |
|---|---|---|---|
| Identity and distinctiveness | 18 | 18 | Unchanged. |
| First impression (hero) | 19 | 19 | Hero not touched; haze still not seen on a device. |
| Craft and polish | 17 | 18 | Nav text no longer prints through the pill; sections alternate plain and raised; empty-state and cross-browser fixes from 10-30 and 10-31. |
| Typography and hierarchy | 14 | 15 | The long name lists now have a scale change instead of one flat run. |
| Content and archive pages | 9 | 9 | Unchanged. |
| Mobile | 13 | 13 | Emulated check is clean but adds no new real-device evidence. |

**Bad cop: about 84 / 100** (was about 78), on desktop only for the changed sections. What is
left:
1. ~~The Recordings lead album is tall and the other three sit top-aligned beside it, leaving
   about 250px of empty space under them.~~ Fixed the same day (see below).
2. The intro and About copy still start at the left of the content column. About is tighter, but a
   stranger would still call the layout left-weighted.
3. Dev block unchanged (Doug's call, 2026-10-30): remote over the preview, two stacked buttons,
   the only coral section.
4. Not viewed this round: hero, Dev, Contact, `/press`, `/easternblok`.

Of the earlier bad-cop list, points 2, 3 and 5 (name walls, same navy, identical albums) read as
fixed on the live desktop page. Point 4 (left-hugging columns) is improved, not fixed. Point 1
(nav over text) rests on the alpha test (0.75, passing); I did not scroll a live desktop page to
watch text pass under the pill. Point 6 is Doug's deliberate call.

### Recordings dead space, 2026-11-01 (branch `rescore-2026-11-01`)

From 760px the three group records are now rows (cover 120 to 190px, title and blurb beside it)
stacked in the right column, with the debut spanning all three rows on the left, instead of four
columns in one row. Measured on a local build: the two columns end within 2px of each other at 1440
(621 vs 623), 17px at 1024 and 39px at 768, where the old layout left 161px at 1440. Below 760px
nothing changes. New test `the three small albums end level with the lead` in
`e2e/bad-cop-fixes.spec.ts` fails on the previous layout (161px) and passes now; the debut-lead
width test still holds. Full e2e, both projects, fresh build: 281 passed, 39 skipped. Looked at
1440 and 768 by eye; not checked on a real phone (phones are unchanged).

## Fresh pass, 2026-11-15

Scored with the shared system in `career-development/docs/UX_UI_SCORING.md`, with the same six areas and
weights as above. Live `https://dougrosenberg.com/` (after PR #122) at 1440px, dark theme, scrolled hero
to footer in Chrome. Not viewed: mobile, `/press`, `/easternblok`, `/easternblok/press`, open
FAQ items, the bottom of the Dev block (the remote covered it), and the hero haze motion (still frames only,
so still unverified on a real device). Same reviewer who built most of the site, so allow about three points
either way. Archive and mobile rows carry the 11-01 scores forward, unre-viewed.

**Good cop: about 92 / 100** (unchanged). Identity 18, hero 19, craft 18, typography 15, archive 9
(carried), mobile 13 (carried). The Recordings lead and three rows still end level, the name lists keep
their scale change, the sheet-music empty state and the footer read well. Nothing regressed; nothing new
earned a point.

**Bad cop: about 83 / 100** (was about 84 on 2026-11-01). What costs points:
1. **The nav pill still prints over text.** At alpha 0.75 the pill is translucent enough that the
   "Goran Ivanovic Group" title, the "Cedar Cultural Center" venue, the "Eastern Blok" sidebar text and the
   "Send Message" button all show through it. Same flaw as 2026-10-24 finding 3 and 11-01 point 1, and the
   cheapest points left. The 11-01 note said I had not watched text pass under the pill; this pass did.
2. ~~**"On record" has dead space.** An empty gap between the 2008 and 2004 quote rows, and the "Eastern Blok"
   sidebar bracket runs well past its content.~~ Checked at rest the same day and dropped: the gap is the
   2.5rem break between the two eras, and the bracket spans its era's five quotes with the label centered
   (`PressTimeline.astro`, bracket 495px tall, label block about 190px). Designed, not a bug. Whether a
   label floating mid-rule reads well is a taste call; top-aligning it is a one-line change if wanted.
3. **Still left-weighted.** The intro and About copy sit in the left half with the right side empty, and
   Contact leaves a lot of space under its heading.
4. Dev block unchanged (Doug's call, 2026-10-30): remote over the preview, the only coral section. Not
   counted.

Cheapest next points: give the nav pill a blurred backing (done on `nav-liquid-glass-2026-11-15`), then use the empty right half of the page.

| Date | Lens | Build scored | Score | What changed or cost points |
|---|---|---|---|---|
| 2026-11-15 | good cop | live after #122, desktop dark | about 92 | Unchanged from 11-01; mobile and archive carried forward |
| 2026-11-15 | bad cop | live after #122, desktop dark | about 83 | Nav pill overprint still visible; left-weighted columns ("On record" gap dropped, by design) |

### Nav liquid glass, 2026-11-15 (branch `nav-liquid-glass-2026-11-15`)

Bad-cop point 1 (nav pill prints over text) turned out to be a bug, not a tradeoff. On the live site the
nav's computed `backdrop-filter` was `none`: the build kept only `-webkit-backdrop-filter` and dropped the
unprefixed property, so Chrome never blurred, and the 0.65 to 0.75 alpha bumps of 2026-11-01 were fighting
a missing blur. Doug likes the pills and the liquid-glass look, so the pills are unchanged and the tray now
blurs for real: unprefixed `backdrop-filter: blur(18px) saturate(1.5)`, tint lowered to 0.55, inset top and
bottom highlights. The same fix applies to the phone toggle and menu. Checked on a local build at 1440px:
the "Goran Ivanovic Group" title under the tray no longer reads through it. Not checked: a real phone, Safari
(it now gets the unprefixed property, supported from Safari 18; older Safari falls back to the flat tint).
The site is dark only by design (`docs/style-guide.md`), so there is no light theme to check.

`e2e/bad-cop-fixes.spec.ts`: the old "at least 75% opaque" test is replaced by "the nav tray blurs what
scrolls under it" (computed blur at least 14px). Full e2e, both projects, fresh build: 303 passed, 39
skipped. The old code's failure is evidenced by the live site returning `none`, not by a rebuilt old
checkout. Two other `-webkit-`-only blurs remain (`.cta-secondary`, gallery lightbox); left for Doug's call.

| Date | Lens | Build scored | Score | What changed or cost points |
|---|---|---|---|---|
| 2026-11-15 | bad cop | local build, desktop dark, estimate | about 85 | Nav overprint resolved by a real blur; left-weighted columns still open. "On record" gap checked and dropped, see the 2026-11-15 fresh-pass entry |

### Right-half layout, 2026-11-15 (branch `right-half-intro-contact-2026-11-15`)

Bad-cop point "still left-weighted" (Doug picked from prototypes, 2026-11-15):
- **Intro:** from 900px the lede shares its row with a facts rail, ruled rows like the On record ledger
  (Debut, Degree, Stages, Also), using only facts already in the paragraph. Below 900px the rail stacks
  under the lede. The paragraph stays as the visible answer for search; the rail is a second view of it, so
  keep the two in sync.
- **Contact:** a portrait under the heading with About's offset brass frame, hidden below 900px so the form
  stays close on phones. It is `images/gallery/formal.jpg` (the studio portrait), not the hero photo that the
  hero and About already use. Decorative, so empty alt; lazy, with width and height set. Swap the file to
  change it.
- **Tests:** new `e2e/right-half.spec.ts` (rail right of the lede and reaching the content edge; four rows
  matching the paragraph; stacks without sideways scroll at 320, 390, 768; portrait beside the form at 4:5;
  hidden on phones; lazy, sized, not the hero). Two existing tests changed: the "lede spans 800px" test in
  `bad-cop-fixes.spec.ts` is gone (the lede now shares the row), and the smoke test for the 30 to 60 word
  direct answer now counts the `.intro__text` paragraph, not the whole section, which the rail would push to
  70. Full e2e both projects 315 passed plus the smoke fix, unit 64/64, lint and `verify-csp` clean.
- **Checked:** the real page at 1440px in Chrome. Not checked: a real phone, Safari. Not re-scored; I expect
  about +2 on the bad cop.

## Light theme pass, 2026-11-15 (branch `light-mode-draft-2026-11-15`)

First score of the light theme, at Doug's ask. Same six areas and weights as above, so the numbers sit
beside the dark series, but they score a different theme: compare light only with later light scores.
Viewed: a local build of the branch at `76b06af`, light theme, reduced motion for layout, home page top to
footer at 1440x900, `/press` and `/easternblok` at 1440, and the home page in Playwright phone emulation at
390x844. The hero's blob and smoke motion was seen in still frames at full motion. Not viewed: a real phone or
laptop, Safari, `/easternblok/press`, open FAQ items, the gallery lightbox, the form's error and sent states.
Same reviewer who built the light theme, so allow about three points either way.

**Good cop: about 89 / 100** (dark is about 92).

| Area | Dark (11-15) | Light | Why |
|---|---|---|---|
| Identity and distinctiveness | 18 | 17 | Paper, ink and a serif are the common look among jazz artist sites (see "Light theme draft" in `DESIGN_NOTES.md`), so light starts closer to the pack. The staff dividers, sleeve hero, liner-notes footer and "Lights up / Lights down" keep it his. |
| First impression (hero) | 19 | 18 | The sleeve front with the drifting color glow and the sepia smoke is strong and reads cleanly. It gives up the cinematic full-screen opening, and photo left, text right is a more familiar layout. Motion not seen on a device. |
| Craft and polish | 18 | 17 | Every flipping color is a token, AA measured across four pages, plates for the footer and Dev TV, smoke kept out from under the type. Costs: the black scan edges on two album covers, and the sheet-music panel reads beige on beige. |
| Typography and hierarchy | 15 | 15 | Ink on paper suits the serif; the scale changes in the name lists carry over. |
| Content and archive pages | 9 | 9 | Both archive pages read well on paper with their own switch; the right 40% is still empty, as in dark. |
| Mobile | 13 | 13 | Emulator only: stacks cleanly, no sideways scroll. Provisional until a real phone. |

**Bad cop: about 80 / 100.** What costs points:
1. ~~**Black edges on album covers.** `better-than-tv.jpg` and `underwater.jpg` carry black scan borders in the
   files themselves. On navy they vanished; on paper the lead album gets a black strip top and bottom, and
   Underwater a thick black base. Fix: crop the two files.~~ Fixed the same day, see below.
2. ~~**One paper for every section.** The About band is a shade lighter and Highlights a shade darker, but on
   cream the steps are smaller than the navy ones, so the middle of the page runs together again (11-01
   point 3, back in light only).~~ Fixed the same day, see below.
3. ~~**Same photo twice in a row.** The hero print and the About print are the same photo in the same brass
   frame, one screen apart.~~ Fixed 2026-11-15 night, see below.
4. ~~**Empty halves.** Quick answers, the Dev intro and the archive pages leave their right side empty. Not new
   to light, but paper shows empty space more than a dark ground does.~~ Fixed for Quick answers and the archive headers 2026-11-15 night; the Dev section was never empty (its site preview fills the right), so that part of the point was my misread.
5. ~~**Sheet-music panel looks washed out.** The beige panel on beige paper, with faint staff lines, has the
   least contrast of any block on the page (text still passes AA).~~ Fixed the same day, see below.

Not counted: the fixed logo and menu over content while scrolling on phones (deliberate, kept on purpose
2026-10-17), the Dev remote over the preview (Doug's call, 2026-10-30).

What the bad cop concedes: the sleeve hero with color leaking around the print, the staff dividers with
their colored heads, the paper grain, the dark liner-notes footer as a back cover, and the "Lights up"
switch. A stranger would remember the hero and the footer.

Cheapest points: crop the two album covers (point 1), then step the band colors further apart in light
(point 2).

| Date | Lens | Build scored | Score | What changed or cost points |
|---|---|---|---|---|
| 2026-11-15 | good cop | `light-mode-draft-2026-11-15` at 76b06af, light, desktop plus phone emulation | about 89 | First light score; dark is about 92 |
| 2026-11-15 | bad cop | same | about 80 | Black edges on two album covers, sections run together on paper, hero and About share a photo, empty halves |

### Light easy wins, 2026-11-15 (same branch)

Doug asked for the two cheapest light bad-cop points:
- **Covers (point 1):** cropped the black scan bars off `better-than-tv.jpg` (12 rows top, 8 bottom, now
  500x444) and `underwater.jpg` (20 and 20, now 500x460; the `/easternblok` size map updated to match). This
  also changes dark, where the bars were invisible anyway. New unit test `src/album-covers.test.js` checks
  all four edges of every cover; it fails on the old files (Better Than TV's top edge averages luma 1.0) and
  passes now. `sharp` is pinned as a dev dependency at the version Astro already installed (0.35.4) so the
  test doesn't lean on a transitive package.
- **Bands (point 2):** new `--band-raised` and `--band-sunk` tokens. Dark maps them to `--bg-elevated` and
  `--surface`, so dark is unchanged. Light uses `#fffdf9` (About) and a kraft `#e5dbc9` (Highlights, In
  Frame): 1.10:1 and 1.15:1 from the paper, up from 1.06:1 and 1.08:1. `--surface` itself is unchanged, so
  forms and panels keep their measured contrast. New test in `e2e/theme.spec.ts`; it fails with the old
  colors (1.06) and passes now. The AA sweep passes on the new bands.
- Full Playwright both projects 342 passed, unit 65/65, lint, astro check and `verify-csp` clean. Looked at
  Recordings, Highlights and In Frame at 1440 in light. Not re-scored and not checked on a real device; I
  expect about +2 on the light bad cop.

### Sheet-music folder, 2026-11-15 (same branch)

Light bad-cop point 5, at Doug's ask. In light the library is a kraft folder holding a manuscript page: the
panel takes `--band-sunk`, and the empty viewer, its prompt patch and the search box take `--band-raised`,
with the viewer's staves at 20% ink instead of 14% and a soft drop shadow under the page. Light-only rules in
`SheetMusicLibrary.astro`; dark is unchanged. Measured before: the empty viewer was the same tone as the panel
(1.00:1). New test in `e2e/theme.spec.ts` (folder at least 1.09:1 from the paper, page at least 1.2:1 from the
folder and lighter) fails without the rules and passes with them. Full Playwright 344 passed, unit 65/65,
lint, astro check and `verify-csp` clean, AA sweep included. Looked at it at 1440 and in phone emulation at
390; not checked on a real device. Not re-scored.

### Light remaining points and re-score, 2026-11-15 night (branch `light-polish-2026-11-15`)

PR #126 merged the light theme at 8:10pm Central; the covers, bands and sheet-music commits came after it, so
this branch carries them again on top of master plus the work below. Doug asked for every open item at once.
- **Same photo (point 3):** About now uses `gallery/sepia.jpg`, so hero, About and Contact show three
  different pictures. Its `width`/`height` attributes briefly stretched the frame to 1080px tall (the
  attribute beat `aspect-ratio`); `height: auto` fixes it and a test holds the 4:5 ratio.
- **Empty halves (point 4):** Quick answers is two columns from 1000px (heading, a "Send a message"
  button, and the questions on the right). Each archive page has an "On this page" rail right of the title
  block (`ArchiveLayout` `toc` prop; ruled numbered rows, hidden below 1000px), with a scroll margin so
  jumped-to headings clear the logo. Tests fail on the old code (6 of 11) and pass now.
- **404:** it already had the nav's switch (the open item was stale); a test now flips the theme there.
- **Default theme:** decided, keep following the system.
- **Lighthouse (light, local build, mobile):** performance 94 to 96 (dark 96), accessibility,
  best practices and SEO 100; desktop performance 100. A first batch read 74 in dark because my own browser
  tests were running at the same time; repeat runs on an idle machine agreed. The `preferredColorScheme`
  flag is 0 for dark and 1 for light, which I had backwards at first; the final screenshots confirmed it.

Whole-page look: the home page full length at 1440 in light, plus `/easternblok`, `/press` and the 404 at
1440, and the home page on a phone at 390 earlier the same day (emulator). Not viewed: a real phone or
laptop, Safari, the form's error and sent states. Same reviewer who built it, so allow about three points
either way.

**Good cop: about 91 / 100** (was about 90). Identity 17, hero 18, craft 18, typography 15, archive pages
10 (the rail gives them structure; was 9), mobile 13 (still emulator only).

**Bad cop: about 86 / 100** (was about 84). What is left:
1. **About and Contact portraits are close cousins.** Same suit and pose, one sepia and one cool grey, a few
   screens apart. A third kind of photo (live, or with the band) in one of them would break it.
2. **Left-weighted sections remain.** Private lessons and On the Road still start at the left of the column,
   as in dark.
3. Dev block unchanged (Doug's call, 2026-10-30).

| Date | Lens | Build scored | Score | What changed or cost points |
|---|---|---|---|---|
| 2026-11-15 | good cop | `light-polish-2026-11-15`, light, desktop plus phone emulation | about 91 | Archive rail earns a point; mobile still unverified on a device |
| 2026-11-15 | bad cop | same | about 86 | Photo repeat and empty halves fixed; portraits similar; left-weighted sections |

## Re-score after the motion and page-change rounds, 2026-11-19 (branch `rescore-2026-11-19`)

Whole-page re-score after PRs #130 to #132 merged (page texture and panel grain, micro-interactions,
magnetic buttons, hero drift, heading reveals, and the static on page changes), per the rule "re-score the
whole page after each merge". Same six areas and weights as above.

**Viewed:** `master` at 9399ae1 on the dev server. Chromium at 1440x900 and Playwright Pixel 7 emulation, dark and
light, reduced motion for layout. Home page sections at 1440 (hero, Recordings, About, Highlights, Lessons,
Dev, FAQ, Contact, footer, In Frame) and at phone width (hero, Recordings, Highlights, Contact), `/press` in
light, and the arriving static on `/press` at phone width (a still frame). The Astro dev toolbar shows at
the bottom of every capture because it is the dev server; it is not part of the site and is not counted.
**Not viewed:** a real phone or laptop, Safari, Firefox, the new motion at full speed (magnetic lean, hero drift,
heading reveals, album tilt were seen only through tests and earlier stills), `/easternblok` and
`/easternblok/press` this round (captured, not looked at), open FAQ items, the lightbox, the form's error and
sent states. Same reviewer who built these changes, so allow about three points either way.

**Good cop: dark about 93, light about 92** (was about 92 and about 91 on 2026-11-15).

| Area | Pts | Dark | Light | Why |
|---|---|---|---|---|
| Identity and distinctiveness | 20 | 19 | 18 | The static and channel label now carry across page changes, and the paper and navy grain make the middle of the page feel like a surface. Light is still closer to the common ink-on-paper look. |
| First impression (hero) | 20 | 19 | 18 | Unchanged: the photo, smoke and glow in dark, the framed sleeve in light. The hero drift is not credited until it is seen on a device. |
| Craft and polish | 20 | 18 | 18 | Texture and panel grain are real gains. Held back because most of the new motion has been seen only in tests and emulation. |
| Typography and hierarchy | 15 | 15 | 15 | Unchanged. |
| Content and archive pages | 10 | 9 | 10 | `/press` in light now fills its right side with the contents list and the timeline. Dark archive pages were not re-viewed, so dark stays at 9. |
| Mobile | 15 | 13 | 13 | Stacks cleanly, no sideways scroll, tap targets tested. Still emulator only, so provisional. |

**Bad cop: dark about 84, light about 87** (was about 83 and about 86). What costs points:
1. ~~**Empty right of Recordings at 1440.** The lead cover is big, but the three stacked albums and their short
   copy leave roughly the right third blank.~~ Fixed 2026-11-19, see below. (On a closer look the hollow was
   under each short blurb, beside its 190px cover, not at the far right.)
2. ~~**Lessons is left-weighted with dead space under it.** The text block sits left and the Subjects list is
   short; about 200px of empty ground follows before Sheet Music begins.~~ Left-weighting fixed 2026-11-19; the gap before Sheet Music is only about 40px smaller (see the second pass below).
3. ~~**The same portrait three times.** The Contact photo is also the first frame in In Frame, and About and
   Contact are both a framed saxophone portrait of the same man, one screen from the Gallery.~~ Fixed 2026-11-19, see below.
4. **Small grey body text on navy.** The About paragraph and the Lessons second paragraph are low in contrast
   next to the headings, though they pass AA.
5. **Motion is the part a stranger cannot see in a still.** Nothing here is a flaw, but none of it has been felt
   on a phone, and Doug found the first micro-interactions barely noticeable.

Not counted: the fixed logo and menu over content on phones (deliberate, 2026-10-17), the Dev remote over the
preview (Doug's call, 2026-10-30), the dev toolbar in the captures.

What the bad cop concedes: the hero (photo, smoke, color leaking around the print), the staff dividers with
their colored heads, the liner-notes footer, "Lights up" with the channel dial, and now the static with the
green channel label. A stranger would remember the hero, the footer and the TV-channel change.

Cheapest points: use a different photo for the Contact portrait (point 3); let the Recordings copy grow or
sit lower to balance the right side (point 1); give Lessons a second visual or tighten the gap (point 2).
The biggest unknown is the real-device check, which could move Mobile and Craft by several points either way.

| Date | Lens | Build scored | Score | What changed or cost points |
|---|---|---|---|---|
| 2026-11-19 | good cop | `master` at 9399ae1, dark, desktop plus phone emulation | about 93 | Texture, grain and the page-change static add; motion not yet seen on a device |
| 2026-11-19 | good cop | same, light | about 92 | `/press` right side now filled; mobile still unverified on a device |
| 2026-11-19 | bad cop | same, dark | about 84 | Empty right of Recordings, Lessons dead space, same portrait repeated |
| 2026-11-19 | bad cop | same, light | about 87 | Same three, softer on paper |

### Three bad-cop points fixed, 2026-11-19 (branch `polish-three-2026-11-19`)

- **Contact portrait (point 3):** now `gallery/lakebluff.jpg`, Doug's pick from his gallery: a smiling outdoor shot, the one portrait on the page that is not a serious studio pose. It is no longer the first In Frame frame. A test checks it differs from the About photo and from `formal.jpg`.
- **Recordings (point 1):** at 760px and up each group record's text column is as tall as its cover: larger title and blurb (1.3rem, 0.95rem) and a "Listen on Amazon" cue on the cover's bottom edge (also on the lead record). The cue is decoration; the whole record was already the link.
- **Lessons (point 2):** Subjects list widened (22rem to 27rem), larger type (1.45rem) and rows, larger note-head dots, and the section's bottom padding trimmed. (First written as "Sheet Music starts about 60px sooner"; measured in the second pass it is about 40px less empty ground under the list, and the Sheet Music heading sits 13px lower because the list got taller.)

Not re-scored: this round was viewed in screenshots at 1440 (dark and light) and phone width only; the next whole-page re-score will say what it is worth. Not seen on a real phone.

## Re-score after the three fixes, 2026-11-19 (second pass, branch `rescore-2026-11-19b`)

Whole-page re-score after PR #134 merged (Contact portrait, Recordings rows, Lessons balance), per the rule
"re-score the whole page after each merge". Same six areas and weights as above.

**Viewed:** `master` at c895b0a on the dev server. Chromium at 1440x900 and Playwright Pixel 7 emulation, dark and
light, reduced motion for layout. Home sections at 1440, with Recordings, Lessons and Contact, On the Road,
Sheet Music and Highlights looked at in detail; `/press` and `/easternblok` in dark; `/easternblok/press` in
light; `/easternblok` in light on the phone; Lessons on the phone in dark. This pass looked at the Eastern Blok
pages, which the first pass skipped. **Not viewed:** a real phone or laptop, Safari, Firefox, the new motion at
full speed, open FAQ items, the lightbox, form error and sent states, the lower half of the Eastern Blok pages
(photos, video, members, shows). The dev toolbar at the bottom of the captures is the dev server, not the site.
Same reviewer who built these changes, so allow about three points either way.

**A correction to the fix notes above:** the Lessons change did not move Sheet Music "about 60px sooner". Measured
from the same scroll position, the Sheet Music heading sits 13px lower than before (the bigger list made the
section taller), and the empty ground under the tallest block fell from about 230px to about 187px, so about
40px less. The left-weighting is fixed; the gap is only a little smaller.

**Good cop: dark about 94, light about 93** (was about 93 and about 92 earlier today).

| Area | Pts | Dark | Light | Why |
|---|---|---|---|---|
| Identity and distinctiveness | 20 | 19 | 18 | Unchanged. |
| First impression (hero) | 20 | 19 | 18 | Unchanged. |
| Craft and polish | 20 | 19 | 19 | One point for the three fixes: the repeated portrait is gone (the smiling Lake Bluff photo reads as a different person's page section), Recordings rows are full, and Lessons is balanced. Held back because motion is still unseen on a device. |
| Typography and hierarchy | 15 | 15 | 15 | Unchanged. |
| Content and archive pages | 10 | 9 | 10 | Both archive pages carry the contents list on the right and read well. Dark keeps its point for the long Eastern Blok story text. |
| Mobile | 15 | 13 | 13 | Emulator only, so provisional. The Lessons subject rows got roomier on the phone (see below). |

**Bad cop: dark about 86, light about 88** (was about 84 and about 87 earlier today). What costs points:
1. ~~**Still about 190px of empty ground after Lessons** before the Sheet Music heading. Mostly the next section's own
   top padding.~~ Fixed 2026-11-19, see the fixes below.
2. ~~**A text wall on `/easternblok`.** The story is long paragraphs in the left column with only the contents list
   beside it, on desktop and phone. A pull quote or photo would break it. The page's lower half was not viewed.~~ Fixed 2026-11-19, see the fixes below. (The lower half was viewed this round: photos, albums, press ledger and shows are rich; only the story opened as a wall.)
3. ~~**Phone Lessons rows are airy.** The larger subject type and padding made the five rows about 90px each on a
   phone (they were about 62px), which pushes Sheet Music further down for little gain. The desktop sizes were
   not meant to carry over.~~ Fixed 2026-11-19, see the fixes below.
4. ~~**On the Road is thin at the bottom right.** The National and international columns end around the fourth row
   while Chicago runs to six, so the lower right is empty.~~ Fixed 2026-11-19, see the fixes below.
5. **Motion is still the part a stranger cannot see in a still**, and none of it has been felt on a phone.

~~The same portrait three times~~ and ~~empty hollows in Recordings~~ are fixed and not counted.

Not counted: the fixed logo and menu over content on phones (deliberate, 2026-10-17), the Dev remote over the
preview (Doug's call, 2026-10-30), the dev toolbar in the captures.

What the bad cop concedes: the hero (photo, smoke, color leaking around the print), the staff dividers, the
liner-notes footer, "Lights up" with the channel dial and the static with its green channel label, and the
Recordings shelf, which now reads as a shelf instead of a list.

Cheapest points: tighten the phone Lessons rows (point 3), break the Eastern Blok story with a pull quote or
photo (point 2), and trim the Sheet Music top padding after Lessons (point 1). The biggest unknown is still the
real-device check.

| Date | Lens | Build scored | Score | What changed or cost points |
|---|---|---|---|---|
| 2026-11-19 | good cop | `master` at c895b0a, dark, desktop plus phone emulation | about 94 | Portrait, Recordings and Lessons fixes add a point of craft; motion not seen on a device |
| 2026-11-19 | good cop | same, light | about 93 | Same; archive pages read well on paper |
| 2026-11-19 | bad cop | same, dark | about 86 | Lessons gap remains, Eastern Blok text wall, roomy phone Lessons rows |
| 2026-11-19 | bad cop | same, light | about 88 | Same, plus the thin lower right of On the Road |

### Four more bad-cop points fixed, 2026-11-19 (branch `polish-four-2026-11-19`)

- **Lessons to Sheet Music gap (point 1):** the two sections now read as one block. Lessons bottom padding trimmed again and Sheet Music top padding cut to `clamp(2rem, 4vw, 3.5rem)`. Measured by the new test (box to box, 1440, reduced motion) the gap between the list and the Sheet Music heading went from about 161px to about 81px.
- **Eastern Blok story (point 2):** the first paragraph is split in two with a pull quote between them, in the display italic with a brass rule. It is the ledger's first quote (All About Jazz, Budd Kopman, 2006), read from the same data so it cannot drift, and it links to the review. I did not use the Los Angeles Times or Time Out lines from the 2007 press bio: the page itself says those original articles were never found.
- **Phone Lessons rows (point 3):** back to the compact size at 760px and under (1.2rem type, 0.95rem padding), 61px each. (I wrote "about 90px" for the roomy rows from a screenshot; the test measured 75px before the fix.)
- **On the Road (point 4):** the national venue list now fills the height of the Chicago list (rows spread, last row level with Chicago's last line) and is a touch larger (1.05rem).

Point 5 (motion unseen on a device, same reviewer) is not something a code change can fix. It needs Doug on a real phone and laptop; the checklist is in the PR description.
Not re-scored: this round was seen in screenshots at 1440 and phone width only.

## Re-score, 2026-11-21 (branch `rescore-2026-11-21`)

Reviewer: Claude, the same model that built most of the site, so allow about three points either way. Fresh
captures of `master` after #138 (the hero load, nav, knob, light blobs and Contact photo changes), made against
the dev server with reduced motion: full page at 1440x900 and 390x844, dark and light. Seen in screenshots only.
Not viewed: a real phone or laptop, motion, the archive pages (`/press`, `/easternblok`) and any state other than
the resting page. Lazy images (the Contact portrait, the Dev TV) showed empty in the full-page strips and loaded
when scrolled to, so those were checked by scrolling, not counted as bugs.

**Good cop: dark about 94, light about 93** (unchanged). Weights as above. Today's work is polish inside points
already earned: the knob numbers, the see-through nav without a border, and the light-mode blobs now showing
(light first impression stays at 18; they were a gap in a point already scored). Mobile stays at 13 of 15: the
phone work since 2026-11-19 was measured on an emulator, which the rules do not credit.

**Bad cop: dark about 88, light about 90** (was about 86 and about 88). The four points fixed on 2026-11-19 are
now confirmed in fresh screenshots (Lessons to Sheet Music reads as one block, the Eastern Blok story has its
pull quote, the phone Lessons rows are compact, On the Road's right column fills), so they are struck and not
counted. What still costs points:
1. **Small text.** The commonest body text under 13px was the quote sources in "On record" (12.8px) and the rail
   beside it, plus the Recordings cue and phone blurb. ~~Fixed 2026-11-21, now 14px (13.6px for the cue).~~
   The uppercase eyebrow labels (12 to 12.8px) stay: small caps read larger.
2. **Contact portrait lopsided.** At 320px it left about 270px of empty ground before the form. ~~Widened to
   420px.~~ New cost, smaller: it now runs about 260px below the form's bottom edge, so the right column ends
   early on desktop.
3. ~~**Name walls in Highlights.** "Artists performed with" and the schools list are still long runs of names, with
   only two scales (italic leaders, then plain) to break them.~~ Fixed 2026-11-21, see below.
4. **Motion and phone feel are unverified on a device.** Same as every round since 2026-11-15.

Not counted: the "On record" rail's brass bracket with its text centered in a tall frame (a deliberate brace
motif, `PressTimeline.astro`), the Astro dev toolbar in the captures, the fixed logo and menu on phones, the Dev
remote over the preview.

Cheapest points next: trimming the Contact portrait to about 380px or giving
the form's column something under the button (point 2).

| Date | Lens | Build scored | Score | What changed or cost points |
|---|---|---|---|---|
| 2026-11-21 | good cop | `master` after #138, dark, desktop plus phone screenshots | about 94 | Unchanged; polish only; mobile still emulator-only |
| 2026-11-21 | good cop | same, light | about 93 | Unchanged; blobs now visible |
| 2026-11-21 | bad cop | same, dark | about 88 | Four 2026-11-19 fixes confirmed; small text fixed; Highlights name walls and the Contact column ending early remain |
| 2026-11-21 | bad cop | same, light | about 90 | Same, softer on paper |

### Fixed in this branch, 2026-11-21

- **Small text:** quote sources, the "On record" rail (meta, lineage), and the Recordings blurb and cue are 14px
  (rail link 13px, cue 13.6px). Test: `e2e/readable-text.spec.ts` (failed on the old build, four of four).
- **Contact portrait:** 420px wide, same test file.
- **Name walls (bad-cop point 3):** the Highlights school list and "Artists performed with" (24 names) were
  dot-separated runs under the italic leaders. They are ruled column lists now: each name a row with a hairline
  above (the site's ruled-row style), flowing down columns. Artists: two columns on a phone (one column was about
  900px tall), up to five on desktop. Schools: one column on a phone, three to four on desktop. Tests in
  `e2e/text-flow.spec.ts` replace the old orphan-dot checks (six of eight failed on the old build). Seen at 1440
  and 390, dark and light. Not re-scored: scores above are as of the start of this branch.

## Re-score, 2026-11-24 (branch `todo-schema-score-2026-11-24`)

Reviewer: Claude, the same model that built most of the site, so allow about three points either way. Fresh
captures of the **live** home page (`master` at 198aee7) with reduced motion: full page at 1440x900 and a
Pixel 7 emulation, dark and light, seen as contact sheets plus the two dark heroes. Not viewed: motion, the
archive pages, interaction states, the player bar. Real-device evidence: Doug reported 2026-11-24 that
scrolling "looks great" on his phone over Wi-Fi.

**Good cop: dark about 95, light about 94** (was 94 / 93). The "Hear it" track list puts playable music on the
page, and mobile gets one point back (14 of 15) for the first real-device report. Cellular is unchecked.

**Bad cop: dark about 89, light about 90** (was 88 / 90). Brass buttons and the track list help. What costs:
1. **The Contact portrait still runs well below the form**, so the right column ends early on desktop.
2. **The sheet-music viewer is a large blank staff panel** until a piece is picked (desktop).
3. **The phone page is very long** (about 14,000px), and the school list under Highlights is one long
   single column.
4. ~~**Footer kicker names `dougrosenbergmusic.com`**, which does not resolve in DNS (`Footer.astro`).~~ Fixed
   the same day. Not re-scored.
5. **Motion is unverified by the reviewer.**

Not counted: the desktop bell button being nearly invisible at rest (documented design in
`docs/bell-player-2026-11-22.md`), though a stranger looking at a still would not know the hero plays music.

| Date | Lens | Build scored | Score | What changed or cost points |
|---|---|---|---|---|
| 2026-11-24 | good cop | live, `master` at 198aee7, dark | about 95 | Track list; first real-phone report |
| 2026-11-24 | good cop | same, light | about 94 | Same |
| 2026-11-24 | bad cop | same, dark | about 89 | Contact column, blank viewer, long phone page, wrong domain in footer |
| 2026-11-24 | bad cop | same, light | about 90 | Same |
