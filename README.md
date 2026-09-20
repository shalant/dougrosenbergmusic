# dougrosenbergmusic

Astro port of dougrosenberg.com — Doug's musician/saxophonist site (currently live as a Blazor site, see the older `newMusicWebsiteJan26` repo). This repo is a **fresh rebuild**, not a migration of the old code — a deliberate exploration project to (1) work in Astro again after enjoying it on haxbyte.com, and (2) move away from generic AI-default UI patterns toward more custom, considered design.

**Status (2026-09-20):** live at [dougrosenberg.com](https://dougrosenberg.com), replacing the old Blazor/GitHub Pages site. Deployed on Cloudflare Workers (static assets + a small Worker for the contact form's email send), with the domain cutover, HTTPS, and Search Console/sitemap submission all complete. All content sections from the old site are ported (recordings, about, performance history, teaching/education, sheet music library, photo gallery, contact) alongside a custom scroll-tracked corner nav. Ongoing work happens on feature branches merged into `master` via PR — Cloudflare auto-builds and deploys straight from `master`. See `docs/DESIGN_NOTES.md` for the design record and `docs/todolist.md` for what's currently in flight.

## Structure

- `site/` — the actual Astro app (`npm run dev` from here).
- `docs/` — design decisions, content/IA planning, and the style-differentiation notes driving this rebuild.

## Design intent (starting point, not yet finalized)

The explicit goal is to avoid the common AI-generated-site tells (centered hero + two buttons, glassmorphism/gradient-mesh, default system fonts, uniform rounded-corner cards, safe symmetric spacing). Concrete constraints to commit to before building — see `docs/DESIGN_NOTES.md`.
