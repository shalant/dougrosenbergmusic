# The bell player (2026-11-22)

A play button in the mouth of the saxophone in the hero photo, and a player bar that
slides up when it is pressed. Built from Doug's picks in the `ui-lab` studies
(`artifacts/dougrosenbergmusic/bell-play.html`, version 3 "closing ring", and the Rings
effect from `out-of-the-bell.html`). Branch `bell-player-2026-11-22`.

## Status

- **Live with the real files (2026-11-22).** The three songs are Doug's Amazon MP3
  purchases of Better Than TV (about 300 kbps, 6:57, 7:28 and 5:58), encoded with ffmpeg
  (`ffmpeg-static` from npm, nothing installed system-wide) to AAC .m4a: full quality at
  160 kbps (7-9 MB each) and a low-bandwidth copy at 72 kbps (3-4 MB each), metadata and
  cover art stripped, `+faststart`. Swap in lossless masters later under the same names.
  The component still renders nothing if no file exists at build time. No durations are
  typed anywhere; they are read from the files.
- Verified in Chrome with the real files (plays, clock and duration, rings, bar, "Get the
  album" link), and in the browser suite: bell on the horn in both themes at desktop size,
  hover focus, press-to-play, next/previous/close, ring opacity cap, a phone-size light hero.
  The suite (chromium and mobile-chrome) and 76 unit tests pass, plus lint. The repo's
  phone-smoothness test caught a looping `scale` animation on touch; it is now `transform`.
- The player bar has a "Get the album" link to the same Amazon page as the hero's cover.
- Not yet checked by a person on a real phone (iOS Safari silent switch, lock-screen
  controls, Save-Data). The code paths exist; Doug checks real devices himself.

## Adding the songs

Put two files per track in `site/public/audio/`. The names are fixed by
`site/src/data/tracks.js` (change them there, in one place, if a title changes):

| Track | Full quality | Low bandwidth |
|---|---|---|
| Better Than TV | `better-than-tv.m4a` | `better-than-tv-lo.m4a` |
| Mato Grosso | `mato-grosso.m4a` | `mato-grosso-lo.m4a` |
| Dirty Basement Jazz | `dirty-basement-jazz.m4a` | `dirty-basement-jazz-lo.m4a` |

Encode from a lossless master (WAV or FLAC), never from a YouTube or MP3 copy:

```
ffmpeg -i master.wav -c:a aac -b:a 160k -movflags +faststart better-than-tv.m4a
ffmpeg -i master.wav -c:a aac -b:a 72k  -movflags +faststart better-than-tv-lo.m4a
```

`+faststart` puts the index at the front so playback starts before the file is
downloaded. Roughly 1.2 MB per minute at 160 kbps and 0.5 MB at 72. `-lo` is optional;
without it everyone gets the full file. It is chosen on Save-Data or a 3G-or-slower
connection. If a track is remastered, give the file a new name (`-v2`): `/audio/*` is
cached for a year, immutable.

Then `npm run build`, check the hero, commit on a branch. A track whose full-quality file
is missing is skipped; if none exist the bell and bar are absent.

## How it behaves

- **Bell button.** Faint and softly blurred at rest. As a mouse nears it sharpens, grows,
  leans toward the pointer, and its outline ring closes (focus at about a third of the
  photo's width out, full within 3.5%). Keyboard focus shows it fully. Touch has no
  pointer, so it rests at medium focus and holds still. Hit area is larger than the
  drawn button, at least 44px.
- **While playing** the button rests at focus .38 (the study had .5) and every ring is
  capped at opacity .34 (the study went to .95). Doug found the first version intense.
- **Rings** leave the bell on loudness onsets of the real audio (Web Audio analyser) on a
  mouse-and-screen device, at least 520 ms apart. On touch they pulse on a gentle fixed
  beat (every 1.4 s). While nothing plays, one faint ring every 5 s is a hint.
- **Player bar.** Fixed at the bottom: play/pause, title, "n of 3" and time, seek, previous,
  next, close. Keeps playing while you scroll, continues to the next track, stops after
  the last. Lock-screen and media-key controls via the Media Session API.
- **Position.** Calculated from the photo's real crop (`lib/bell-geometry.js`): the bell was
  measured on `hero-graded.webp` at (552, 347) of 1536x1024, tilted -12 degrees. The layer
  carries the same scale, shift and scroll drift as the dark hero's photo, and clips to the
  print in the light hero.
- **Hidden when it would be wrong:** when the crop puts the bell off screen or under the
  headline, the bell is hidden and the Listen button remains the way in.

## Decisions to keep

- **No analyser on touch.** Routing an `<audio>` element through Web Audio makes the iOS
  silent switch mute it. On desktop the element is routed only after the context is
  confirmed running; routing is one-way, and a suspended context would freeze the track
  (found while testing with no audio device).
- **Reduced motion and `data-fx="lite"`:** no rings, no tilt, no breathing. The button and
  bar still work.
- **No third-party player or embed.** The CSP allows none, deliberately. Self-hosted audio
  needs no CSP change. The component's script is bundled, so no new inline-script hash was
  needed (`npm run verify-csp` passes).
- `HeroGraded.astro` is untouched. The component moves its own layer into `.hero__print`
  with a script, so with no script nothing shows.
- If the hero photo's crop or object-position changes, re-check the bell. The layer's
  scale/shift/drift copy `.hero__photo`'s rules and must be kept in step.

## Known gaps

- **Dark hero on a phone (fixed 2026-11-22, Doug's call):** the portrait crop used to cut the
  horn off the left edge, so phones in dark saw no bell. At 640px and under, the dark hero
  photo now uses `object-position: 36% 14%` (the light theme's value) and
  `translate(-5%, 3%)` after the 1.08 scale, which brings the bell to about 28% of the width
  at every phone height and moves Doug right and down. The 3% down uses slack the scale
  already crops, so no bare strip shows. `BellPlayer.astro`'s layer copies that transform.
  Trade-offs: his face now sits right of center, nearer the hamburger button; more hat and
  headroom show above him; the horn's body runs under the left of the headline (the scrim
  keeps it legible). The bell is still hidden where the text would cover it (checked against
  the real text lines): the 320x568 phone in dark. Checked at 12 sizes in both themes.
- The hero's primary button still scrolls to the Listen section; it does not play.
- A manual low-data toggle in the bar was considered and not built (Save-Data and slow
  connections switch to the `-lo` files automatically). That detection uses the Network
  Information API, which Chrome and Android expose but iOS Safari and Firefox do not, so an
  iPhone on a bad connection still gets the 160 kbps file. There is also no "buffering"
  message yet; on a stall the time simply stops.

## Connection and smoothness

- Nothing audio loads with the page (`preload="none"`): the cost of the feature at load is a
  small script, and the bell does not appear until the hero photo has loaded.
- The bell layer is absolutely positioned, so it causes no layout shift.
- Touch devices: no scroll listener and no scroll-linked animation (the bell layer's drift is
  desktop-only), and no endless animation at all. Weak devices and slow links (`data-fx="lite"`)
  get no rings or tilt.
- Desktop: one `getBoundingClientRect` per pointer move while the hero is on screen; rings are
  transform/opacity animations; the ring loop runs only while a track plays and the hero is
  visible; the 5-second hint ring is gated the same way.

## Phone twitch fix (2026-11-22)

Doug found the hero twitchy on his phone after #142. Measured on an emulated iPhone 13 at 4x
slower CPU (frames over 20 ms in 12 s at rest, and in 10 s while playing, three runs each):
the live version dropped frames in most runs (dark: 2, 2, 0 at rest and 2, 3, 2 playing; light:
0 at rest and 1, 4, 2 playing); after the fix, none in 12 runs. Two causes, both mine:

- A looping "breathe" animation on touch. Removed; touch now holds still at medium focus.
- Rings drawn as SVG ellipses with `vector-effect: non-scaling-stroke`: the browser redraws
  that on every frame while it scales. Now a plain bordered `div` animated by transform and
  opacity only (the hairline thickens a little as it grows, and is nearly gone by then).
  On touch the rings also travel less far (4.5x, not 6x), the hint ring is every 9 s (was 5)
  and the playing pulse every 2.2 s (was 1.4).

A regression test (`e2e/bell-player.spec.ts`, "touch: the bell runs no endless animation...")
guards both. The headless test is a proxy: it shows the relative difference, not a real
phone's GPU, so Doug still checks on the device.
