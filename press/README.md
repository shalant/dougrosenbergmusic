# Press and review archive

Started 2026-10-05. Collects press coverage that names Doug Rosenberg (saxophone) so it can be cited on the site and kept from link rot.

## Status

As of 2026-10-05 no review of the CD *Better Than TV* has been found. A Wayback Machine sweep of dougrosenberg.com (press, music, bio, products pages, 2013-2017), the CD Baby album page (2014, 2016) and Bandcamp turned up none, and neither did a first web search pass. The "Chicago Tribune" quote in the bio and label copy has no located source; it predates the CD's release, so it should not be presented as a review of it.

## Files

- `candidates.json` is the index. Every entry starts `verified: false` until Doug confirms it.
  - `about`: `this-cd` (the CD itself), `other-album` (Doug as a sideman on someone else's album), `person` (Doug generally, including live shows).
  - `kind`: `review`, `preview`, `feature`, `listing` (retail or radio page, not a review), `quote` (source unknown).
  - `namesDoug`: whether the text actually names him. Only entries where this is true can be used as credits.
  - `quote`: short attributed pull-quotes only.

## What does not go in this repo

Full page copies, screenshots and photos. The reviews are the publishers' copyright, and the repo may be public. Full snapshots go to a private store (Azure Blob, container not yet chosen) plus a Wayback Save Page Now link in `archiveUrl`. No storage account keys.

## Still to collect

- Doug's own Chicago concert reviews (Bob Moses; Ernest Dawkins, Live the Spirit) and the reviews of a Robert "Baabe" Irving III album.
- The original Chicago Tribune article behind the quote.
- `archiveUrl` for every entry that has a live `url`.
