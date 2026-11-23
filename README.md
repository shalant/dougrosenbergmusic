# dougrosenbergmusic

The site for Doug Rosenberg, a Chicago jazz saxophonist, composer and educator: [dougrosenberg.com](https://dougrosenberg.com). It is an Astro **rebuild**, not a migration of the old Blazor code, started as a deliberate exploration: work in Astro again after enjoying it on haxbyte.com, and move away from generic AI-default UI patterns toward custom, considered design.

**Status (2026-11-22):** live on Cloudflare Workers (static assets plus a small Worker for the contact form's email), deployed automatically from `master`. Musician first, web design as the quieter second line (since 2026-10-25). Two themes, dark and light, switched with the channel knob in the nav. Ongoing work happens on feature branches merged into `master` by pull request. See `docs/todolist.md` for what is in flight and `docs/DESIGN_NOTES.md` for the design record.

## What is on the site

- **Hero:** Doug's graded portrait with a drifting haze (still on phones and weak devices), the album title "Better Than TV" as the headline, and a row of the record covers. In the light theme it re-composes as a print on paper.
- **Music player:** a play button in the mouth of the saxophone in the hero photo, a player bar that stays while you scroll, and a **"Hear it" track list** in the Recordings section. Three tracks from *Better Than TV* are self-hosted as AAC in `site/public/audio/` (with a low-bandwidth copy for data-saver and slow connections). One audio engine drives all three controls. See `docs/bell-player-2026-11-22.md`.
- **Recordings, About, Performance history, Career highlights, Press timeline, Gallery, Lessons, Sheet music library, Dev (web design), FAQ, Contact** on one scroll-tracked page, plus separate Press and Eastern Blok pages.
- **Buttons:** brass pills in the light theme (green in dark); a barely-there magnetic lean on mouse devices only.
- **Phone smoothness:** the page keeps a documented budget on touch devices (no scroll-linked animation, no endless loops, cheap glow and bell). `?fx=lite` forces the light-weight mode and `?off=...` switches single hero layers off for diagnosis (see `site/README.md`).

## Structure

- `site/`: the Astro app (`npm run dev` from there). Its own `README.md` covers commands, structure, adding songs and the diagnostic switches.
- `docs/`: design decisions and plans, the style guide (`docs/style-guide.md`, tokens and rules, each with its test), the to-do list, and dated notes for bigger changes (bell player, dark-hero smoothness, UI assessments).
- `press/`: the press and review index behind the Press page.

## How work is done here

- **Branch, then pull request.** Never commit to `master`. Push a feature branch and open a PR; Doug merges. Cloudflare builds and deploys from `master`, so a merge is a deploy.
- **No commits 8:30am to 5pm CT, Monday to Friday** (Doug's day-job hours). Work and stage freely; hold the commit until after hours or the weekend.
- **Tests before "done":** `npm test` (unit), `npm run lint`, `npm run build` then `npm run verify-csp`, and `npm run test:e2e` from `site/`. Changing any inline script changes its CSP hash; regenerate with `npm run verify-csp -- --write`.
- **Docs travel with the change:** update the relevant doc in the same branch.

## Design intent

Avoid the common AI-generated-site tells (centered hero plus two buttons, glassmorphism and gradient mesh, default system fonts, uniform rounded cards, safe symmetric spacing). Two typefaces only (Fraunces and Work Sans). Decisions recorded as deliberate in the docs are binding: raise them before reversing one.
