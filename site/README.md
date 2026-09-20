# dougrosenbergmusic — site

Astro rebuild of Doug Rosenberg's musician site (saxophonist/composer/educator). See `../README.md` and `../docs/DESIGN_NOTES.md` for the project's purpose and design decisions — this file just covers running the app.

## Structure

```
site/
├── public/            static assets (images, sheet music PDFs, favicon) and _headers —
│                       Cloudflare security headers, including the CSP script-src hashes
│                       (see _headers' own comments for how to regenerate them)
├── src/
│   ├── components/    one .astro file per section (HeroGraded, DevServices, Listen,
│   │                  About, Performance, CareerHighlights, Gallery, SheetMusicLibrary,
│   │                  Contact) plus shared chrome (Logo, StaffNav)
│   ├── layouts/       BaseLayout.astro — wraps every page, mounts Logo + StaffNav
│   ├── pages/         index.astro — the single page, assembles the sections in order
│   ├── styles/        global.css — design tokens (color, type, staff-line texture)
│   └── worker.js      Cloudflare Worker — handles POST /api/contact, falls back to
│                       static assets for everything else
├── e2e/               Playwright specs — run against a production build, not dev
└── package.json
```

## Commands

| Command             | Action                                                  |
| :------------------ | :------------------------------------------------------- |
| `npm install`        | Install dependencies                                     |
| `npm run dev`        | Start local dev server at `localhost:4321`               |
| `npm run build`      | Build production site to `./dist/`                       |
| `npm run preview`    | Preview the build locally before deploying                |
| `npm run test:e2e`   | Run Playwright E2E tests against a production build       |
| `npx lhci autorun`   | Run the Lighthouse CI audit (`lighthouserc.json`) against `./dist/` |

Deploys are automatic: Cloudflare's dashboard git integration builds and runs `npx wrangler deploy`
straight off `master` on every push — there's no manual deploy command. PRs into `master` run the
Lighthouse and E2E workflows as quality gates (`.github/workflows/`) but don't deploy anything
themselves.

Full Astro docs: https://docs.astro.build
