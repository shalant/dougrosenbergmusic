# Entity consistency checklist (GEO / AEO)

Goal: make "Doug Rosenberg" resolve to one clear entity across the web, so
search and AI assistants repeat the same facts. Assistants build an entity
from facts that agree across many independent sources — the fastest win is
making every profile you control say the same thing and link back.

Written 2026-09-30. Everything here is manual (accounts / logins), except
the `sameAs` update at the bottom, which is a small code change.

## 1. Canonical facts (copy these exactly)

- **Name:** Doug Rosenberg (not "Douglas" / "Doug R." — pick one form and keep it;
  the LinkedIn URL uses `douglasrosenberg`, so consider "Doug (Douglas) Rosenberg"
  there only if LinkedIn requires it)
- **One-line bio (≈50 words, same as the site intro):**
  > Doug Rosenberg is a Chicago-based web designer and developer who builds websites
  > for musicians and small businesses, covering design, development, branding, and
  > ongoing support. He is also a jazz saxophonist, composer, and educator, with the
  > debut album *Better Than TV* (2014) and a New England Conservatory degree.
- **Short bio (≈15 words, for bios with tight limits):** Chicago web designer and
  developer, and jazz saxophonist, composer, and educator.
- **Primary site:** https://dougrosenberg.com/ · **Dev/portfolio:** https://dougrosenbergdev.com/
- **Location:** Chicago, IL · **Contact:** doug.rosenberg@gmail.com

## 2. Profiles to audit (bio text + website link)

Open each, paste the matching bio, and make the website link the canonical URL
(with trailing slash consistency — no `www`, `https` only).

| Profile | URL | Bio to use | Link to |
| --- | --- | --- | --- |
| YouTube | https://youtube.com/@dougrosenberg2361 | one-line | dougrosenberg.com |
| Instagram | https://instagram.com/shalantdoro | short | dougrosenberg.com |
| LinkedIn | https://linkedin.com/in/douglasrosenberg | one-line (About) + headline | dougrosenberg.com |
| GitHub | https://github.com/shalant | short (profile README / bio) | dougrosenbergdev.com |
| Amazon album pages | Better Than TV, Goran Ivanovic Group, Underwater, Folk Tales | n/a | check artist name spelling matches |
| Bandcamp / Spotify / Apple Music | (check which exist) | short | dougrosenberg.com |
| Eastern Blok / Goran Ivanovic pages | (band sites, if any) | credit line | dougrosenberg.com |

## 3. Knowledge sources assistants lean on

- [ ] **MusicBrainz** — artist entry with albums and credits (Better Than TV 2014, Eastern Blok, Goran Ivanovic Group). Requires a free account.
- [ ] **Discogs** — check for existing credits; claim/complete.
- [ ] **AllMusic** — check existing entry (can't self-edit; note spelling only).
- [ ] **Wikidata** — only if notability criteria are met (independent coverage: Chicago Tribune quote, venue listings). Don't create a promotional entry; skip if unsure.
- [ ] **Google Business Profile** — only if offering local services under a business name.

## 4. Third-party mentions (slower, highest value)

- [ ] Ask collaborators/venues to list Doug with a link on their bio/credits pages
- [ ] Ask clients on the dev portfolio (Guacamayo, GigSync, etc.) for a "site by Doug Rosenberg" link or short testimonial with permission
- [ ] Useful, non-promotional answers on Reddit/Quora on topics you genuinely know (musician websites, jazz education)

## 5. After profiles exist: update `sameAs` (code change)

Add each verified profile URL to `personSchema.sameAs` in
`site/src/layouts/BaseLayout.astro` (and mirror in `site/public/llms.txt`).
Only add profiles that actually exist and link back — `sameAs` should be a
verified two-way claim. Candidates: MusicBrainz, Discogs, Bandcamp, Spotify.

## 6. Measure

- Bing Webmaster Tools → AI Performance: citations for dougrosenbergdev.com were 0 on 2026-09-29. Recheck monthly.
- Search Console → Performance: name-query impressions/position for dougrosenberg.com.
- Manually ask a few assistants "Who is Doug Rosenberg the Chicago saxophonist / web developer?" monthly and note what they say and cite.
