// The tracks that can actually be played, for both the hero's bell player and the
// Listen section's track list (2026-11-22). Server-side only (build time): a track
// is playable only when its file exists in public/audio/, and its length is read
// from the file. If no file exists the list is empty and neither feature renders.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tracks, ALBUM, ARTIST, ARTWORK, BUY_URL } from '../data/tracks.js';
import { m4aDurationSeconds, formatDuration } from './m4a-duration.js';

export function getPlayable(base = '/', publicDir = join(process.cwd(), 'public')) {
  const have = (file) => existsSync(join(publicDir, file));
  const list = tracks
    .filter((t) => have(t.file))
    .map((t) => {
      const seconds = m4aDurationSeconds(readFileSync(join(publicDir, t.file)));
      return { id: t.id, title: t.title, src: `${base}${t.file}`, lo: t.lo && have(t.lo) ? `${base}${t.lo}` : null, seconds, length: formatDuration(seconds) };
    });
  return { album: ALBUM, artist: ARTIST, artwork: `${base}${ARTWORK}`, buyUrl: BUY_URL, tracks: list };
}
