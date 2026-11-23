import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tracks } from './data/tracks.js';
import { BELL, bellInBox, coverPlacement, parsePosition, proximity, createOnsetDetector } from './lib/bell-geometry.js';

test('every track has a unique id and files under audio/', () => {
  assert.equal(new Set(tracks.map((t) => t.id)).size, tracks.length);
  for (const t of tracks) {
    assert.match(t.file, /^audio\/[a-z0-9-]+\.m4a$/, t.id);
    assert.match(t.lo, /^audio\/[a-z0-9-]+-lo\.m4a$/, t.id);
    assert.ok(t.title.length > 0);
  }
});

test('Doug picked exactly these three tracks, in this order', () => {
  assert.deepEqual(
    tracks.map((t) => t.title),
    ['Better Than TV', 'Mato Grosso', 'Dirty Basement Jazz'],
  );
});

test('coverPlacement: a 3:2 box shows the whole photo with no offset', () => {
  const p = coverPlacement(1500, 1000);
  assert.deepEqual([p.iw, p.ih, p.ox, p.oy], [1500, 1000, 0, 0]);
});

test('coverPlacement: a wide box overflows vertically and a tall box horizontally', () => {
  const wide = coverPlacement(1536, 600, [0.5, 0.14]);
  assert.equal(wide.iw, 1536);
  assert.ok(wide.ih > 600 && wide.oy < 0);
  assert.ok(Math.abs(wide.oy - (600 - 1024) * 0.14) < 1e-9);
  const tall = coverPlacement(400, 800, [0.36, 0.14]);
  assert.ok(tall.iw > 400 && tall.ox < 0);
});

test('bellInBox: on an exact 3:2 box the bell sits at its measured fractions', () => {
  const b = bellInBox(1536, 1024);
  assert.ok(Math.abs(b.x - 552) < 1e-9 && Math.abs(b.y - 347) < 1e-9);
  assert.ok(Math.abs(b.u - 15.36) < 1e-9);
  assert.equal(BELL.tiltDeg, -12);
});

test('bellInBox: the light-theme print crop keeps the bell inside the box', () => {
  // about 480 x 700 at object-position 36% 14%
  const b = bellInBox(480, 700, [0.36, 0.14]);
  assert.ok(b.x > 40 && b.x < 440 && b.y > 40 && b.y < 660);
});

test('bellInBox: a dark phone crop pushes the bell off the left edge', () => {
  // 390 x 800 at object-position 50% 14%: the bell is near the left edge, which is
  // why the component hides the bell when its center is not comfortably on screen.
  const b = bellInBox(390, 800, [0.5, 0.14]);
  assert.ok(b.x < 60);
});

test('parsePosition reads percent pairs and falls back otherwise', () => {
  assert.deepEqual(parsePosition('36% 14%'), [0.36, 0.14]);
  assert.deepEqual(parsePosition('50% 14%'), [0.5, 0.14]);
  assert.deepEqual(parsePosition('10px 5px', [0.5, 0.2]), [0.5, 0.2]);
  assert.deepEqual(parsePosition(undefined), [0.5, 0.5]);
});

test('proximity: far is 0, on the bell is 1, and it rises monotonically', () => {
  assert.equal(proximity(5000, 1000), 0);
  assert.equal(proximity(0, 1000), 1);
  assert.equal(proximity(30, 1000), 1);
  let prev = -1;
  for (let d = 400; d >= 0; d -= 20) {
    const v = proximity(d, 1000);
    assert.ok(v >= prev, `not monotonic at ${d}`);
    prev = v;
  }
  assert.equal(proximity(10, 0), 0);
});

test('onset detector: a steady tone gives no rings, a jump gives one, and alpha stays low', () => {
  const d = createOnsetDetector();
  let t = 0;
  let fired = 0;
  for (let i = 0; i < 120; i++) fired += d.push(0.4, (t += 16)) > 0 ? 1 : 0;
  assert.ok(fired <= 1, 'a steady level should settle quickly'); // the first frame can read as a jump
  const a = d.push(0.95, (t += 600));
  assert.ok(a > 0 && a <= 0.34, `alpha ${a} should be capped at .34`);
  assert.equal(d.push(0.95, (t += 16)), 0, 'respects the minimum gap');
});

test('onset detector: never exceeds the cap however hard the hit is', () => {
  const d = createOnsetDetector();
  d.push(0.01, 0);
  assert.ok(d.push(1, 1000) <= 0.34);
});
