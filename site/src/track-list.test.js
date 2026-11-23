import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { m4aDurationSeconds, formatDuration } from './lib/m4a-duration.js';
import { getPlayable } from './lib/playable-tracks.js';

// A minimal MP4: ftyp, then moov > mvhd (version 0) with timescale 1000 and the given duration.
function mp4(durationMs, { version = 0 } = {}) {
  const u32 = (n) => Buffer.from([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
  const box = (type, ...parts) => {
    const body = Buffer.concat(parts);
    return Buffer.concat([u32(8 + body.length), Buffer.from(type, 'latin1'), body]);
  };
  const mvhd =
    version === 0
      ? box('mvhd', Buffer.from([0, 0, 0, 0]), u32(0), u32(0), u32(1000), u32(durationMs), Buffer.alloc(80))
      : box('mvhd', Buffer.from([1, 0, 0, 0]), Buffer.alloc(8), Buffer.alloc(8), u32(1000), Buffer.concat([u32(0), u32(durationMs)]), Buffer.alloc(80));
  return Buffer.concat([box('ftyp', Buffer.from('M4A ', 'latin1'), u32(0)), box('moov', mvhd)]);
}

test('reads the duration from a version 0 and a version 1 movie header', () => {
  assert.equal(m4aDurationSeconds(mp4(417000)), 417);
  assert.equal(m4aDurationSeconds(mp4(358500, { version: 1 })), 358.5);
});

test('returns null for anything that is not a readable MP4', () => {
  assert.equal(m4aDurationSeconds(Buffer.from('not an mp4 at all')), null);
  assert.equal(m4aDurationSeconds(Buffer.alloc(0)), null);
  assert.equal(m4aDurationSeconds(Buffer.concat([Buffer.from([0, 0, 0, 40]), Buffer.from('moov'), Buffer.alloc(4)])), null);
});

test('formats minutes and seconds', () => {
  assert.equal(formatDuration(417), '6:57');
  assert.equal(formatDuration(358.9), '5:58');
  assert.equal(formatDuration(65), '1:05');
  assert.equal(formatDuration(null), '');
  assert.equal(formatDuration(0), '');
});

test('with no audio files there is nothing to play', () => {
  const r = getPlayable('/', new URL('./no-such-public-dir/', import.meta.url).pathname);
  assert.equal(r.tracks.length, 0);
});

// The real files are committed; their lengths came from the Amazon MP3s (6:57, 7:28, 5:58).
const real = new URL('../public/audio/better-than-tv.m4a', import.meta.url);
test('the real tracks report their true lengths', { skip: !existsSync(real) }, () => {
  const r = getPlayable('/', new URL('../public/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  assert.deepEqual(
    r.tracks.map((t) => t.length),
    ['6:57', '5:57', '7:27'],
  );
  assert.deepEqual(
    r.tracks.map((t) => t.title),
    ['Better Than TV', 'Mato Grosso', 'Dirty Basement Jazz'].filter((t) => r.tracks.some((x) => x.title === t)),
  );
});
