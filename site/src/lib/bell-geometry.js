// Where the saxophone bell is on screen, and how close the pointer is to it.
// Pure functions (no DOM) so they are unit-tested; BellPlayer.astro feeds them
// measurements.
//
// The bell opening was measured on hero-graded.webp (1536 x 1024): center
// (552, 347), the opening about 140 px wide, tilted about -12 degrees.
export const PHOTO = { w: 1536, h: 1024 };
export const BELL = { x: 552 / PHOTO.w, y: 347 / PHOTO.h, widthPct: 9.4, heightPct: 6.8, tiltDeg: -12 };

// Where an object-fit: cover image of PHOTO's size lands inside a box. `pos`
// is object-position as fractions (0..1). Returns the drawn image size and its
// offset inside the box (negative where the image overflows).
export function coverPlacement(boxW, boxH, pos = [0.5, 0.5], photo = PHOTO) {
  const s = Math.max(boxW / photo.w, boxH / photo.h);
  const iw = photo.w * s;
  const ih = photo.h * s;
  return { iw, ih, ox: (boxW - iw) * pos[0], oy: (boxH - ih) * pos[1] };
}

// Bell center inside the box, plus `u`, one percent of the drawn image width
// (the unit the bell's CSS is sized in).
export function bellInBox(boxW, boxH, pos) {
  const { iw, ih, ox, oy } = coverPlacement(boxW, boxH, pos);
  return { x: ox + BELL.x * iw, y: oy + BELL.y * ih, u: iw / 100 };
}

// object-position as fractions from a computed style string such as
// "36% 14%". Anything that is not a pair of percentages falls back to the
// given default, since keywords are already resolved by getComputedStyle.
export function parsePosition(value, fallback = [0.5, 0.5]) {
  const m = /^\s*(-?[\d.]+)%\s+(-?[\d.]+)%\s*$/.exec(String(value ?? ''));
  return m ? [Number(m[1]) / 100, Number(m[2]) / 100] : fallback;
}

// 0 when the pointer is far, 1 when it is on the bell. `dist` and `width` are
// in the same unit (the width of the photo on screen). The pointer starts to
// register at about a third of the photo's width and the button is fully
// focused within 3.5% of it, with a smooth curve between.
export function proximity(dist, width, { start = 0.3, inner = 0.035 } = {}) {
  if (!(width > 0)) return 0;
  const k = Math.min(1, Math.max(0, 1 - (dist / width - inner) / start));
  return k * k * (3 - 2 * k);
}

// Onset detector for the rings. Feed it the loudness of the low and mid band
// (0..1) once per frame. It keeps a slow average and reports a ring when the
// level jumps clearly above it, no more often than `gapMs`. The ring's
// strength (alpha) is capped low on purpose: the first version read as
// intense (Doug, 2026-11-22).
export function createOnsetDetector({ gapMs = 520, ratio = 1.3, floor = 0.04, minAlpha = 0.16, maxAlpha = 0.34 } = {}) {
  let avg = 0;
  let last = -Infinity;
  return {
    push(level, nowMs) {
      const fired = level > avg * ratio + floor && nowMs - last >= gapMs;
      const over = level - avg;
      avg = avg * 0.94 + level * 0.06;
      if (!fired) return 0;
      last = nowMs;
      return Math.min(maxAlpha, Math.max(minAlpha, minAlpha + over * 0.6));
    },
    reset() {
      avg = 0;
      last = -Infinity;
    },
  };
}
