# dougrosenbergmusic — site

Astro rebuild of Doug Rosenberg's musician site (saxophonist/composer/educator). See `../README.md` and `../docs/DESIGN_NOTES.md` for the project's purpose and design decisions — this file just covers running the app.

## Structure

```
site/
├── public/            static assets (images, sheet music PDFs, favicon)
├── src/
│   ├── components/    one .astro file per section (Hero, Listen, About, Performance,
│   │                  Credibility, SheetMusicLibrary, Gallery, Contact, StaffNav,
│   │                  TestPatternBar)
│   ├── layouts/       BaseLayout.astro — wraps every page, mounts StaffNav
│   ├── pages/         index.astro — the single page, assembles the sections in order
│   └── styles/        global.css — design tokens (color, type, staff-line texture)
└── package.json
```

## Commands

| Command           | Action                                        |
| :----------------- | :--------------------------------------------- |
| `npm install`       | Install dependencies                            |
| `npm run dev`       | Start local dev server at `localhost:4321`      |
| `npm run build`     | Build production site to `./dist/`              |
| `npm run preview`   | Preview the build locally before deploying      |

Full Astro docs: https://docs.astro.build
