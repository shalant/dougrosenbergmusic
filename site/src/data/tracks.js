// The tracks the hero's bell plays (2026-11-22). Doug picked these three from
// Better Than TV. Audio is self-hosted (the CSP allows nothing third-party and
// that is deliberate), so each track is two files in site/public/audio/:
//
//   file  full quality, AAC in .m4a, about 160 kbps
//   lo    optional low-bandwidth copy, about 64 kbps, used on Save-Data and
//         slow connections
//
// A track appears only when its `file` exists at build time (BellPlayer.astro
// checks), so the bell stays out of the hero until real audio is dropped in
// and the site is rebuilt. Nothing here is a placeholder to ship: see
// docs/bell-player-2026-11-22.md for the encode commands and file names.
//
// Titles and the album are Doug's own (press/better-than-tv-reviews-
// 2026-10-23.md lists all three on Better Than TV). Durations are read from
// the audio itself, never typed here.
export const ALBUM = 'Better Than TV';
export const ARTIST = 'Doug Rosenberg';
export const ARTWORK = 'images/albums/better-than-tv-160.webp';

export const tracks = [
  { id: 'better-than-tv', title: 'Better Than TV', file: 'audio/better-than-tv.m4a', lo: 'audio/better-than-tv-lo.m4a' },
  { id: 'mato-grosso', title: 'Mato Grosso', file: 'audio/mato-grosso.m4a', lo: 'audio/mato-grosso-lo.m4a' },
  { id: 'dirty-basement-jazz', title: 'Dirty Basement Jazz', file: 'audio/dirty-basement-jazz.m4a', lo: 'audio/dirty-basement-jazz-lo.m4a' },
];
