# Press index: shared schema and workflow

Several Claude sessions (and Doug) collect press, album and performance coverage in parallel. To keep their work from colliding, each session keeps its **own** JSON file in this schema, and `merge-press.cjs` combines them into one. Written 2026-10-05.

## Rules for every session

1. **Never switch branches in a shared checkout.** Each session works in its own git worktree on its own branch (see "Setup"). A `git checkout` in a shared folder changes the files under the other session.
2. **Edit only your own JSON file.** Never hand-edit `press.json`, which is generated.
3. **Pull quotes only in JSON.** Full pages, text and photos go in the shared archive folder, never in git (the repo is public and the pages are the publishers' copyright).
4. **Read the page before you set `verified: true`.** A search snippet is not verification.
5. **Check the person.** Several other Rosenbergs show up in results (bassist Marlene, guitarist Jimmy, reedist Scott). Put collisions in `rejected` with the reason.

## Entry fields

| Field | Meaning |
|---|---|
| `id` | Unique, stable. Convention: `outlet-slug-subject-yyyy[-mm]`, e.g. `aaj-folk-tales-2008`. Also the archive folder name. |
| `kind` | `review`, `preview`, `feature`, `interview`, `retrospective`, `listing` (calendar, retail or radio page; not a review), `recording` / `concert-recording`, `promo-bio` (band or label copy), `mention`, `listener-comment`, `quote` (source unknown). Add a new value only if none fits, and list it here. |
| `about` | `this-cd` (the CD *Better Than TV*), `other-album` (Doug as a sideman or in a band), `person` (Doug or a live show) |
| `band`, `album` | Optional. For band-project entries; `album` matches an `albums[].id`. |
| `title`, `outlet`, `author`, `date` | Citation. `date` is ISO (`2008-02-25`, `2006-06`, or a range `2003-01-23/2004-06-10`); `null` if unknown, never guessed. |
| `url` | The original page, or `null` if only a reproduction is known. |
| `archiveUrl` | A Wayback Machine link (Save Page Now or an existing capture). |
| `archive` | Folder name under `press-archive/` holding the full copy, or `null`. |
| `namesDoug` | `true` only if the text actually names him. |
| `rating` | If the outlet gave one (e.g. `3 stars`), else `null`. |
| `pullQuotes` | Array of short attributed quotes. Empty array if none. |
| `verified` | `true` if the page text was read on `accessed`. `false` if known only from a snippet or promo copy. |
| `accessed` | ISO date the text was read. |
| `approved` | `true` once Doug OKs the entry for public use on the site. Default `false`. |
| `notes`, `provenance` | Free text: why it matters, how it was found, caveats. |

The files can also carry `albums` (`{id, title, band, year, label, note}`), `rejected` (`{url, reason}`) and `unfetchedLeads` (`{url, note}`).

The merge script also reads the older field names `type` (→ `kind`), `publication` (→ `outlet`) and a single `quote` string (→ `pullQuotes`), so a session can adopt the shared names gradually.

## Merging

```
node press/merge-press.cjs --out press/press.json press/candidates.json <path-to-other-session's-file.json>
node --test press/merge-press.test.cjs
```

- Entries are matched by normalized URL (scheme, `www`, trailing slash, hash and tracking params ignored) or by `id`.
- On a match the entry that was actually read (`verified`) wins, then the one with more fields. Null fields are filled from the other, `pullQuotes` and `sources` are unioned, and the losing `id` is kept in `aliases`.
- The same `id` with two different URLs merges but prints a warning. Look at those by hand.
- `rejected` is unioned. A lead that has since become an entry or been rejected is dropped from `unfetchedLeads`.

## Setup (one session per worktree)

```
git worktree add ../dougrosenbergmusic-press better-than-tv-reviews-2026-10-04
```

Each worktree is a separate folder on its own branch. Stay in your own folder, and don't run `git checkout` or `git switch` in it.

## Saving full copies

```
node press/save-page.cjs ../press-archive <your-index.json> [--skip id,id] [--only id,id]
```

For each entry with a `url` (or an `archiveUrl` when the original is unknown) it tries the live page, falls back to the Wayback Machine, writes `page.html`, `text.txt`, `images.txt` and `source.txt` into `press-archive/<id>/`, and sets the entry's `archive` field. It skips entries already saved. **Photos are not downloaded:** `images.txt` only lists image URLs, so pick the ones that matter and save them into `images/` by hand. Check `text.txt` after each run, because a login wall or error page can still return HTTP 200.

## Shared archive folder

`C:\Users\digdr\Documents\coding\press-archive\` (outside every repo; see the README there). One subfolder per entry `id`: `page.html`, `text.txt`, `images/`, and `source.txt` with the URL and access date. A later step can back it up to a private Azure Blob container.
