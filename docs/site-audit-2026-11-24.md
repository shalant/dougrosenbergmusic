# Site audit, 2026-11-24

Spot audit of `master` at 198aee7 and the live site against `SITE_QUALITY_CHECKLIST.md`. It covers what could
be checked by command, test or screenshot; items not listed were **not checked**.

## Passed

- 85 unit tests, lint, `astro check` (0 errors, 1 hint), build, CSP hash check (21 hashes).
- Browser suite: 497 passed, 64 skipped, 7 failed in the full local run. The three files holding all 7
  failures then passed alone (64 of 64), so they are treated as load flakiness. CI E2E, Lighthouse, lint and
  type check passed on this commit.
- HTTP redirects to HTTPS; HSTS, CSP, Referrer-Policy, Permissions-Policy and nosniff are set.
- `/`, `/press`, `/easternblok`, `/easternblok/press`, `robots.txt`, sitemap and `llms.txt` return 200; an
  unknown path returns 404.
- Each of the four pages has one `h1`, one `main`, a canonical URL, an `og:image`, and no image without `alt`.
- Contact form: origin check, rate limiter and honeypot in `worker.js`.
- Sheet-music PDF headers: `X-Frame-Options: SAMEORIGIN`; pages `DENY`.

## Findings

1. **Footer shows a domain that does not resolve**: "Liner notes · dougrosenbergmusic.com"
   (`site/src/components/Footer.astro`). The site is `dougrosenberg.com`.
2. **Dependencies:** `npm audit` reports 41 vulnerabilities (6 low, 11 moderate, 23 high, 1 critical,
   `proxy-addr`). With `--omit=dev` it reports 8 (2 moderate, 6 high), including `vite`, `undici` and `zod`.
   The site ships as static files plus one Worker; whether any of these reach production was not analysed.
3. **No branch protection on `master`** (known, Doug's decision).
4. **Dead press links** (404, DNS failure or refused): chicagoist.com (the *Better Than TV* review on
   `/press`), booboorecords.com (`/press`), biconews.com, revuemagazine.net, easternblok.net/calendar.html,
   propculture.com, chicago.floodmagazine.com, tollbooth.org, benningtonbanner.com `e-week` (all on
   `/easternblok/press`). Pointing them at Wayback copies would fix it. 403s, timeouts and certificate errors
   from other outlets were not counted; they may only block automated requests.

## Not checked

Search Console, analytics settings, real-device behaviour, keyboard walk-through, a fresh Lighthouse run by
hand, a real contact form send, and the sheet-music viewer in a real browser (Chrome stopped responding).

## Fixed the same day (branch `fix-footer-links-deps-2026-11-24`)

- **Finding 1:** the footer now reads `dougrosenberg.com`.
- **Finding 4:** the nine dead links are marked `linkDead` in the press data and are no longer linked. Five
  offer an archived copy (chicagoist, booboorecords, biconews, tollbooth, easternblok.net). Four show "no live
  page": benningtonbanner, floodmagazine and propculture have no Wayback capture; the revuemagazine capture
  does not mention the band, so it is not offered.
- **Finding 2, partly:** targeted `npm update` plus `sharp` 0.35.5 (Astro is now 7.4.13). The critical
  advisory is gone and `npm audit --omit=dev` reports 0. 23 remain in dev tools (5 low, 4 moderate, 14 high);
  clearing them needs major upgrades such as `@lhci/cli`, not done. Do not run a bare `npm audit fix` here:
  it hoisted `cookie` 0.4.2 from the Lighthouse tool and broke the Astro build.
- CSP hashes regenerated. 88 unit tests, build, CSP check, lint, `astro check`, and the browser suite
  (504 passed, 64 skipped, 0 failed, 3 workers).
- The newer Astro needs Node 22.23.4 or later; CI (all four workflows) moved from 22.12.0 to 22.23.5 and
  `engines` was raised to match.
