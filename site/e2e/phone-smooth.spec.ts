import { test, expect, type Browser } from '@playwright/test';

// Phone smoothness (2026-11-19). On a phone the page stuttered. Measured with
// the browser's own task timer (docs/DESIGN_NOTES.md): at rest it used about
// 17% to 30% of the main thread, from looped animations of --hue and of the
// individual translate/rotate/scale properties; while scrolling, about 45
// scroll-linked animations were re-evaluated every frame. Now touch devices
// keep the drifting glow and smoke (by `transform`) but have no color cycle
// and no scroll-linked reveals; a mouse-and-screen device keeps all of it.

const touchContext = (browser: Browser) =>
  browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, reducedMotion: 'no-preference' });

const scrollLinked = () =>
  document.getAnimations().filter((a) => a.timeline && a.timeline.constructor.name !== 'DocumentTimeline').length;

test('touch: almost nothing is scroll-linked (only the hero photo drift)', async ({ browser }) => {
  const ctx = await touchContext(browser);
  const page = await ctx.newPage();
  await page.goto('/');
  expect(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)).toBe(false);
  expect(await page.evaluate(scrollLinked)).toBeLessThanOrEqual(1);
  // And the content is simply there: no reveal hides it.
  for (const sel of ['.scroll-rise', '.heading-reveal']) {
    const names = await page.locator(sel).evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
    expect(names.length).toBeGreaterThan(0);
    expect(new Set(names), sel).toEqual(new Set(['none']));
  }
  await ctx.close();
});

test('touch: the staff divider labels are shown rather than waiting for a scroll or a hover', async ({ browser }) => {
  const ctx = await touchContext(browser);
  const page = await ctx.newPage();
  await page.goto('/');
  const labels = await page.locator('.staff-divider__label').evaluateAll((els) =>
    els.map((el) => ({ opacity: getComputedStyle(el).opacity, maxWidth: getComputedStyle(el).maxWidth }))
  );
  expect(labels.length).toBeGreaterThan(3);
  for (const l of labels) {
    expect(l.opacity).toBe('1');
    expect(l.maxWidth).not.toBe('0px');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await ctx.close();
});

test('touch: a block below the fold rises in once when it arrives, and the page stays free of scroll-linked animations', async ({ browser }) => {
  const ctx = await touchContext(browser);
  const page = await ctx.newPage();
  await page.goto('/');
  const target = page.locator('.performance__artists');
  await expect(target).toHaveClass(/tr-wait/);
  expect(await target.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
  await target.scrollIntoViewIfNeeded();
  await expect(target).not.toHaveClass(/tr-wait/, { timeout: 4000 });
  expect(await target.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  expect(await page.evaluate(scrollLinked)).toBeLessThanOrEqual(1);
  await ctx.close();
});

test('touch: nothing is held hidden for a reader who asks for reduced motion', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  expect(await page.locator('.tr-wait').count()).toBe(0);
  await ctx.close();
});

test('mouse and screen: the scroll-linked reveals are still there', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto('/');
  if (!(await page.evaluate(() => CSS.supports('animation-timeline: view()')))) test.skip(true, 'no scroll timelines in this browser');
  if (!(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches))) test.skip(true, 'this project has no mouse');
  expect(await page.evaluate(scrollLinked)).toBeGreaterThan(10);
  await ctx.close();
});
