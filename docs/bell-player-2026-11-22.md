# The bell player (2026-11-22)

A play button in the mouth of the saxophone in the hero photo, and a player bar that
slides up when it is pressed. Built from Doug's picks in the `ui-lab` studies
(`artifacts/dougrosenbergmusic/bell-play.html`, version 3 "closing ring", and the Rings
effect from `out-of-the-bell.html`). Branch `bell-player-2026-11-22`.

## Status

- **Dormant until the audio exists.** The component renders nothing unless a track's
  file is in `site/public/audio/` at build time, so the hero is unchanged today. Nothing
  fake ships: no placeholder audio, no invented durations (they are read from the files).
- Built and verified with three temporary test tones (removed before the commit): bell on
  the horn in both themes at desktop size, hover focus, press-to-play, the clock running,
  next/previous/close, ring opacity cap, a phone-size light hero. 460 browser tests pass
  (chromium and mobile-chrome), plus 76 unit tests and lint.
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
  pointer, so it rests at medium focus and breathes slowly. Hit area is larger than the
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

- **Dark hero on a phone:** the portrait crop cuts the horn off the left edge, so the bell
  is hidden there and phones in dark see no bell. Options (Doug's call): shift the phone
  photo crop so the horn shows, or let the hero's "Listen to the music" button start the
  first track on that layout. The light hero on a phone shows the bell.
- The hero's primary button still scrolls to the Listen section; it does not play.
- A manual low-data toggle in the bar was considered and not built (Save-Data and slow
  connections switch to the `-lo` files automatically).
