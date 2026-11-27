// gtag.js is about 180 KB. Loading it during first paint cost about 3s of
// simulated mobile LCP (2026-11-26), so it must wait for an interaction or for
// 3.5s after load. This runs BaseLayout's real inline script against a
// fake page; e2e can't see it, since the script skips analytics on localhost.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const layout = readFileSync(new URL('./layouts/BaseLayout.astro', import.meta.url), 'utf8');
const script = [...layout.matchAll(/^\t\t<script>\r?\n([\s\S]*?)^\t\t<\/script>/gm)]
  .map((m) => m[1])
  .find((body) => body.includes('googletagmanager.com/gtag/js'));

function run({ hostname = 'dougrosenberg.com', readyState = 'loading' } = {}) {
  const appended = [];
  const listeners = {};
  const timers = [];
  const window = { location: { hostname } };
  const context = {
    window,
    document: {
      readyState,
      head: { appendChild: (el) => appended.push(el) },
      createElement: () => ({ setAttribute() {} }),
      addEventListener() {},
    },
    addEventListener: (type, fn) => (listeners[type] ??= []).push(fn),
    removeEventListener: (type, fn) => {
      listeners[type] = (listeners[type] ?? []).filter((f) => f !== fn);
    },
    setTimeout: (fn, ms) => timers.push({ fn, ms }),
  };
  vm.runInNewContext(script, context);
  const fire = (type) => [...(listeners[type] ?? [])].forEach((fn) => fn());
  const gtags = () => appended.filter((el) => el.src?.includes('googletagmanager.com'));
  return { window, fire, gtags, timers };
}

test('the analytics script block is found', () => {
  assert.ok(script);
});

test('gtag.js is not requested while the page is loading', () => {
  assert.equal(run().gtags().length, 0);
});

test('consent default and config are queued before gtag.js arrives', () => {
  const queued = run().window.dataLayer.map((args) => `${args[0]} ${args[1]}`);
  assert.equal(queued[0], 'consent default');
  assert.ok(queued.includes('config G-BGSJ1FWPTF'));
});

test('the first interaction loads gtag.js, once', () => {
  for (const type of ['pointerdown', 'keydown', 'scroll', 'touchstart']) {
    const page = run();
    page.fire(type);
    page.fire('scroll');
    page.fire('keydown');
    assert.equal(page.gtags().length, 1, type);
  }
});

test('with no interaction it loads 3.5s after load', () => {
  const page = run();
  assert.equal(page.timers.length, 0);
  page.fire('load');
  assert.equal(page.gtags().length, 0);
  assert.equal(page.timers[0].ms, 3500);
  page.timers[0].fn();
  assert.equal(page.gtags().length, 1);
});

test('an already loaded page schedules it straight away', () => {
  assert.equal(run({ readyState: 'complete' }).timers[0].ms, 3500);
});

test('localhost never loads it', () => {
  const page = run({ hostname: 'localhost' });
  page.fire('scroll');
  page.fire('load');
  assert.equal(page.gtags().length, 0);
});
