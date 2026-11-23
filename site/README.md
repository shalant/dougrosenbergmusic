# dougrosenbergmusic: site

Astro rebuild of Doug Rosenberg's musician site (saxophonist, composer, educator). See `../README.md` and `../docs/DESIGN_NOTES.md` for the project's purpose and design decisions. This file covers running and changing the app.

## Structure

```
site/
├── public/            static assets and _headers (Cloudflare security headers, including the
│   │                   CSP script-src hashes; see _headers' own comments)
│   ├── audio/         the playable tracks: NAME.m4a (full quality) and NAME-lo.m4a (low bandwidth)
│   ├── images/        photos, album covers, the baked hero photo
│   ├── fonts/         self-hosted Fraunces and Work Sans
│   └── sheetmusic/    the sheet music PDFs and images
├── src/
│   ├── components/    one .astro file per section (HeroGraded, Listen, About, Performance,
│   │                  CareerHighlights, Gallery, Lessons, SheetMusicLibrary, DevServices, Faq,
│   │                  Contact, ...) plus shared chrome (Logo, StaffNav) and behaviors
│   │                  (BellPlayer, MagneticButtons, AmbientHues, PageChannel)
│   ├── data/          tracks.js (the playable tracks), press and show data
│   ├── lib/           pure helpers with unit tests (bell geometry, MP4 duration, playable tracks)
│   ├── layouts/       BaseLayout.astro, wraps every page
│   ├── pages/         index, press, easternblok, 404
│   ├── styles/        global.css: design tokens (color, type), shared buttons, themes
│   └── worker.js      Cloudflare Worker: POST /api/contact, legacy URL redirects, static assets
├── e2e/               Playwright specs, run against a production build
├── scripts/           verify-csp-hashes.mjs, bake-photo-grades.mjs, indexnow.mjs
└── package.json
```

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the dev server at `localhost:4321` |
| `npm run build` | Build the production site to `./dist/` |
| `npm test` | Unit tests (`node --test src/**/*.test.js`) |
| `npm run lint` | ESLint |
| `npx astro check` | Type check |
| `npm run verify-csp` | Check `public/_headers`' CSP hashes match the build; add `-- --write` to regenerate them |
| `npm run test:e2e` | Playwright tests against `./dist/` (does **not** rebuild; run `npm run build` first or you test stale output). Chromium and mobile Chrome by default; Firefox and WebKit with `E2E_ENGINES=all` |
| `npx lhci autorun` | Lighthouse CI audit (`lighthouserc.json`) against `./dist/` |

Deploys are automatic: Cloudflare's git integration builds and runs `npx wrangler deploy` straight off `master` on every push; there is no manual deploy command. PRs into `master` run the Lighthouse and E2E workflows as quality gates but do not deploy anything.

## Adding or changing the songs

The bell play button, the player bar and the "Hear it" list read one list, `src/data/tracks.js`, and use a track only when its file exists in `public/audio/` at build time. With no files, none of them render.

1. Encode from a lossless master (WAV or FLAC), never from a YouTube or MP3 copy:
   ```
   ffmpeg -i master.wav -c:a aac -b:a 160k -movflags +faststart better-than-tv.m4a
   ffmpeg -i master.wav -c:a aac -b:a 72k  -movflags +faststart better-than-tv-lo.m4a
   ```
2. Put both files in `public/audio/` under the names `tracks.js` lists (`NAME.m4a`, `NAME-lo.m4a`). A remastered track gets a new file name (`-v2`): `/audio/*` is cached for a year.
3. `npm run build`. Track lengths are read from the files themselves, so nothing is typed in by hand.

The `-lo` copy is used on Save-Data and 3G-or-slower connections where the browser reports them (Chrome and Android; iOS Safari and Firefox do not). Details and decisions: `../docs/bell-player-2026-11-22.md`.

## Diagnostic switches (URL)

- `?fx=lite` forces the lightweight motion mode; `?fx=full` forces the full one.
- `?off=scan,haze,hues,smoke,vignette,scrim,ambient,bell,photoscale,all` hides single hero layers (or all of them) so a real phone can show which one costs frames. Unknown names are ignored. See `../docs/dark-hero-smooth-2026-11-22.md`.

## Rules worth knowing before changing things

- **Phone smoothness:** on touch devices nothing animates endlessly or by scroll, loops use `transform` and `opacity` only, and no live blur or blend mode sits over scrolling content. Tests enforce this (`e2e/phone-smooth.spec.ts`, `e2e/hero-haze.spec.ts`, `e2e/hero-layers.spec.ts`).
- **Every inline script has a CSP hash** in `public/_headers`. Edit a script, rebuild, run `npm run verify-csp -- --write`.
- **Light theme buttons are brass, dark stays green** (`docs/style-guide.md`, pinned by `src/brass-button.test.js`).
- **Third parties are blocked by the CSP on purpose:** audio is self-hosted, and there are no embeds.

Full Astro docs: https://docs.astro.build
