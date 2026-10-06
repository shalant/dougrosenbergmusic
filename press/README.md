# Press and review archive

Started 2026-10-05. Collects press coverage that names Doug Rosenberg (saxophone) so it can be cited on the site and kept from link rot.

## Status

As of 2026-10-05 no review of the CD *Better Than TV* has been found. A Wayback Machine sweep of dougrosenberg.com (press, music, bio, products pages, 2013-2017), the CD Baby album page (2014, 2016) and Bandcamp turned up none, and neither did a first web search pass. The "Chicago Tribune" quote in the bio and label copy has no located source; it predates the CD's release, so it should not be presented as a review of it.

## Files

- `candidates.json` is this session's index, in the shared schema. Field meanings, the merge rules and the multi-session workflow are in `SCHEMA.md`. `verified` means the page text was read on `accessed`; `approved` stays `false` until Doug OKs an entry for the public site.
- `merge-press.cjs` merges the per-session JSON files into `press.json` (generated, not committed yet). `merge-press.test.cjs` tests it: `node --test press/merge-press.test.cjs`.

## What does not go in this repo

Full page copies, screenshots and photos. The reviews are the publishers' copyright, and the repo is public. They go in the shared `press-archive/` folder next to the repos (see its README), and later a private Azure Blob backup. Each entry's `archive` field names its folder; `archiveUrl` holds a Wayback link. No storage account keys.

## Still to collect

- Doug's own Chicago concert reviews (Bob Moses; Ernest Dawkins, Live the Spirit) and the reviews of a Robert "Baabe" Irving III album.
- The original Chicago Tribune article behind the quote.
- Full copies in `press-archive/` and `archiveUrl` for every entry that has a live `url`.
- Folding in the Goran Ivanovic / Eastern Blok index from the other session (`site/src/data/eastern-blok-press.json` on `eastern-blok-press-2026-10-04`) via the merge script.
