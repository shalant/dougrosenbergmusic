# dougrosenbergmusic

Astro port of dougrosenberg.com — Doug's musician/saxophonist site (currently live as a Blazor site, see the older `newMusicWebsiteJan26` repo). This repo is a **fresh rebuild**, not a migration of the old code — a deliberate exploration project to (1) work in Astro again after enjoying it on haxbyte.com, and (2) move away from generic AI-default UI patterns toward more custom, considered design.

**Status (2026-08-28):** substantially built, not deployed. All content sections from the live site are ported (recordings, about, performance history, teaching/education, sheet music library, photo gallery, contact), plus a custom scroll-tracked corner nav. A brand concept beyond the base visual system — built around the debut album's own title rather than generic musician iconography — is mid-exploration, not finalized. Still no committed decision on whether/when this replaces the live site. See `docs/DESIGN_NOTES.md` for the full design record.

## Structure

- `site/` — the actual Astro app (`npm run dev` from here).
- `docs/` — design decisions, content/IA planning, and the style-differentiation notes driving this rebuild.

## Design intent (starting point, not yet finalized)

The explicit goal is to avoid the common AI-generated-site tells (centered hero + two buttons, glassmorphism/gradient-mesh, default system fonts, uniform rounded-corner cards, safe symmetric spacing). Concrete constraints to commit to before building — see `docs/DESIGN_NOTES.md`.
