# Music-first direction: plan, 2026-10-25

**Decision (Doug, 2026-10-25):** dougrosenberg.com is musician first, with freelance web design
as a quieter secondary line. This supersedes the September dev-services pivot (hero "I make
websites that sound like you", dev-pitch CTAs). The dougrosenbergdev.com link stays, quietly.
Source: Doug's career-development docs, as relayed in session.

The plan is split into branches, each its own session where noted. One focused branch per step;
merge each via PR before starting the next so later branches build on it.

## Step 1: Copy and metadata (Sonnet, branch `music-first-copy-2026-10-25`)

Mechanical copy edits. No visual redesign here.

- [x] **Hero copy** (`site/src/components/HeroGraded.astro`): eyebrow "Jazz saxophonist ·
      composer · educator · Chicago"; headline "Jazz saxophone, composed and played in
      Chicago."; remove the four-item services list; primary CTA "Listen to the music →" to
      `#listen`; secondary CTA "Book lessons" to `#lessons`. Remove/adjust the `data-cta`
      names and any CSS or tests that reference the removed service list and old CTAs. Keep
      the track chips and the "listen now" terminal widget.
- [x] **Intro** (`Intro.astro`): lead with the musician; one trailing sentence on web work.
- [x] **FAQ** (`Faq.astro`): musician-first "Who is Doug Rosenberg?"; lessons and
      recordings questions move up; the web-services question moves to fourth, reframed as
      "alongside music". The FAQPage JSON-LD is built from the same array, so it follows.
- [x] **`public/llms.txt`**: update together with the FAQ and Intro (the files say to).
- [x] **Schema and meta**: `index.astro` title, meta description, and WebPage `name`;
      `BaseLayout.astro` `jobTitle` (music first, Web Developer last), `knowsAbout`, WebSite
      `description`.
- [x] **Dev section** (`DevServices.astro`, `index.astro`): move it below Listen/About (or
      just before the FAQ); drop the "Formerly on stage. Now behind the screen." framing.
      Keep its dougrosenbergdev.com links. Confirm this order change with Doug first.
- [x] **Docs, same branch:** a decision note (this file serves as it), update
      `docs/todolist.md`, mark the hero-redesign docs as superseded (see memory
      `hero_redesign_business_pivot`), and update the SITE_OPS_REGISTRY entry if it describes
      the site's purpose.
- [x] **Verify:** `cd site`, run the unit tests, `astro check`, build, and the e2e suite.
      Grep for stale phrases ("sound like you", "web designer and developer", "Formerly on
      stage"), including tests that assert the old copy. Check the rendered page in a browser.
- [x] **Commit and PR** per the repo rules: a feature branch, never `master`; no commits
      8:30am-5pm CT Mon-Fri (the hook enforces this); commit body says why and what was
      verified. Open a PR; Doug merges.

**Status 2026-10-25:** all items done except the commit/PR (pending). The Dev section went to just
before the FAQ (Doug did not pick; reversible). The headline is the default one.

**Done when:** the PR is merged, no old-pitch copy remains, tests/build pass, and the todolist
records it.

**Status:** PR #96 merged 2026-10-25.

## Step 2: Hero hierarchy (Opus, new session, branch `music-first-hero-2026-10-25`)

Start by reading `docs/ui-assessment-2026-10-24.md` and this file. First check whether the
current hero is the "Riff 14" port or a stopgap; that decides swap vs redesign. Check `ui-lab`
and sibling repos for locked visual directions first.

**Answered 2026-10-25: it is the Riff 14 port, so this step is a redesign of the hierarchy.**
Riff 14 went into `HeroGraded.astro` in PR #27 (commit `538bc63`, 2026-09-14) and every later
hero commit iterated on it; step 1 changed only its copy. The riffs live in
`ui-lab/artifacts/dougrosenbergmusic/` (`hero-from-scratch-riffs.html`, plus the business-pivot
and 30-39 riff files), not in `docs/HeroDesigns`, which holds the AI-generated comps from
2026-09-13. Riff 14 was picked to sell web work, so its layout is not locked for music-first;
what the docs do lock is the logo, staff nav, divider pills, note colors, type system and the
always-visible header.

**First pass, 2026-10-25:** headline about 1.6x larger on three set lines; the eyebrow became
Doug's name; chips and terminal pill replaced by a row of the four record covers (the
music-first proof; nothing playable is possible without audio files, and the CSP blocks
embeds). Kept: photo, haze, broadcast grade, the italic accent phrase, both CTAs. See
`docs/todolist.md` for verification.

- Much larger headline; fewer hero parts (decide the fate of the chips, the terminal widget
  and the eyebrow).
- Music-first proof early: something playable or visible near the hero.
- Phone hero pass; the fixed header stays always visible (decision of 2026-10-17).
- Honest critique at each step; Doug enjoys iterating, so don't rush to converge.

## Later focused branches (each its own PR)

1. **Overlap fixes:** the nav pill over content while scrolling; the carousel controls over
   the preview.
2. **Template chrome:** remove the tiny all-caps eyebrows (the staff dividers already label
   sections); vary the card treatment; fix the centered-intro mismatch and the low-contrast
   small grey body text.
3. **Archive pages:** carry the home page's visual language into `/press` and `/easternblok`
   (enlarged amber timeline strip on `/press`).
4. **Mobile, keyboard focus and reduced-motion pass** at 390px and 768px; run the
   `site-audit` agent against `SITE_QUALITY_CHECKLIST`; re-score against the 70/100 baseline.

## Open questions for Doug

- ~~Final hero headline~~ **Decided 2026-10-25:** "Better Than TV" (the debut album's title) with
  the subtitle "original music composed and improvised", picked by Doug from ten variations.
- Dev section placement (below Listen/About vs just before the FAQ).
