import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Light-theme brass buttons (2026-11-22). The label sits on a vertical gradient,
// so every stop, hover stops included, has to keep the label at 4.5:1 or better.
const css = readFileSync(new URL('./styles/global.css', import.meta.url), 'utf8');
const token = (name) => new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css)?.[1];
const lum = (hex) => {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('the brass button tokens exist', () => {
  for (const n of ['label', 'top', 'mid', 'bot', 'top-hover', 'mid-hover', 'bot-hover']) assert.ok(token(`btn-brass-${n}`), n);
});

test('the label keeps 4.5:1 on every gradient stop, hover included', () => {
  const label = token('btn-brass-label');
  for (const n of ['top', 'mid', 'bot', 'top-hover', 'mid-hover', 'bot-hover']) {
    const r = ratio(label, token(`btn-brass-${n}`));
    assert.ok(r >= 4.5, `${n}: ${r.toFixed(2)}:1`);
  }
});

test('the brass outline text on paper keeps 4.5:1', () => {
  assert.ok(ratio('#8a5514', '#f4efe6') >= 4.5);
});

test('every brass override is scoped to the light theme, so dark keeps the green', () => {
  const start = css.indexOf('/* Light theme: brass buttons');
  const block = css.slice(start, css.indexOf('/* Magnetic buttons', start));
  const selectors = block.match(/[^{}]+\{/g).map((s) => s.trim()).filter((s) => !s.startsWith('/*') && !s.startsWith('@media'));
  for (const sel of selectors) assert.match(sel, /:root\[data-theme='light'\]/, sel);
});
