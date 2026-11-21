// Bakes the page's photo grades into the image files (2026-11-20).
//
// The hero, About and Contact photos were graded live with a CSS `filter`
// (sepia/saturate/brightness/contrast, or grayscale/sepia/saturate). A CSS
// filter on a large scrolling image is repainted on the CPU in Firefox on a
// phone: measured in Firefox, taking the hero's filter off halved the time per
// scrolled frame (about 58ms to 28ms). Baked into the pixels it costs nothing.
// Same maths as the CSS filter functions (sRGB, clamped after each step), so
// the look is the same. The originals stay untouched (the Gallery still shows
// them); this writes the *-graded copies the page uses.
//
//   node scripts/bake-photo-grades.mjs
//
// Re-run it if a source photo or a grade changes, and commit the outputs.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const pub = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');

const sepia = (a) => {
  const k = 1 - a;
  return [
    [0.393 + 0.607 * k, 0.769 - 0.769 * k, 0.189 - 0.189 * k],
    [0.349 - 0.349 * k, 0.686 + 0.314 * k, 0.168 - 0.168 * k],
    [0.272 - 0.272 * k, 0.534 - 0.534 * k, 0.131 + 0.869 * k],
  ];
};
const saturate = (s) => [
  [0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s],
  [0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s],
  [0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s],
];
const grayscale = (g) => {
  const k = 1 - g;
  return [
    [0.2126 + 0.7874 * k, 0.7152 - 0.7152 * k, 0.0722 - 0.0722 * k],
    [0.2126 - 0.2126 * k, 0.7152 + 0.2848 * k, 0.0722 - 0.0722 * k],
    [0.2126 - 0.2126 * k, 0.7152 - 0.7152 * k, 0.0722 + 0.9278 * k],
  ];
};

async function grade(input, output, steps, format) {
  let buf = await sharp(input).removeAlpha().toColourspace('srgb').raw().toBuffer({ resolveWithObject: true });
  let { data, info } = buf;
  const again = () => sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } });
  for (const step of steps) {
    let img = again();
    if (step.matrix) img = img.recomb(step.matrix);
    else if (step.brightness) img = img.linear(step.brightness, 0);
    else if (step.contrast) img = img.linear(step.contrast, 255 * (0.5 - 0.5 * step.contrast));
    data = await img.raw().toBuffer();
  }
  const out = again();
  const written = await (format === 'webp' ? out.webp({ quality: 80 }) : out.jpeg({ quality: 86, mozjpeg: true })).toFile(output);
  console.log(`${path.relative(pub, output)}  ${(written.size / 1024).toFixed(0)} KB  ${info.width}x${info.height}`);
}

const m = (matrix) => ({ matrix });
await grade(path.join(pub, 'hero.webp'), path.join(pub, 'hero-graded.webp'), [m(sepia(0.18)), m(saturate(1.08)), { brightness: 1.22 }, { contrast: 1.06 }], 'webp');
const photo = [m(grayscale(0.35)), m(sepia(0.18)), m(saturate(1.1))];
await grade(path.join(pub, 'gallery', 'sepia.jpg'), path.join(pub, 'gallery', 'sepia-graded.jpg'), photo, 'jpeg');
await grade(path.join(pub, 'gallery', 'formal.jpg'), path.join(pub, 'gallery', 'formal-graded.jpg'), photo, 'jpeg');

// Small covers for the hero's 64px record row (2026-11-20). The row used the
// full album covers (30 to 73 KB each, about 190 KB in all, three times the
// hero photo) and they competed with the photo for a slow connection.
// 160px covers 2.5x density at the row's largest size.
for (const name of ['better-than-tv', 'goran-ivanovic-group', 'underwater', 'folk-tales']) {
  const out = path.join(pub, 'albums', `${name}-160.webp`);
  const info = await sharp(path.join(pub, 'albums', `${name}.jpg`)).resize(160, 160, { fit: 'cover' }).webp({ quality: 80 }).toFile(out);
  console.log(`albums/${name}-160.webp  ${(info.size / 1024).toFixed(1)} KB`);
}
