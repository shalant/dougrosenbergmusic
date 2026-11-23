import { test, expect } from '@playwright/test';

// Dark hero on a phone (2026-11-22). Doug, on a Galaxy S21 in Firefox, found the
// dark hero rough to scroll while the light hero was fine. On touch the scanlines
// are off (they used a blend mode (it forces an off-screen draw of everything under
// them every frame) and the still haze and hue blobs no longer get their own
// graphics layers. `?off=` switches single layers off so a real phone can find
// what still costs frames.

const touch = { viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, reducedMotion: 'no-preference' as const };

test('touch: no scanline layer, and the still blobs hold no will-change layers', async ({ browser }) => {
  const ctx = await browser.newContext(touch);
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.hero__scan')!).display)).toBe('none');
  const willChange = await page.evaluate(() =>
    [...document.querySelectorAll('.haze-blob, .hue-blob')].map((el) => getComputedStyle(el).willChange),
  );
  expect(willChange.length).toBe(7);
  for (const w of willChange) expect(w).toBe('auto');
  await ctx.close();
});

test('a mouse-and-screen device keeps the overlay scanlines', async ({ page }) => {
  await page.goto('/');
  test.skip(await page.evaluate(() => matchMedia('(hover: none), (pointer: coarse)').matches), 'touch project');
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.hero__scan')!).mixBlendMode)).toBe('overlay');
});

test('?off= hides the named layers and ignores anything else', async ({ page }) => {
  await page.goto('/?off=scan,haze,<script>,bell');
  const shown = (sel: string) => page.evaluate((s) => getComputedStyle(document.querySelector(s)!).display, sel);
  expect(await shown('.hero__scan')).toBe('none');
  expect(await shown('.hero__haze')).toBe('none');
  expect(await shown('.hero__scrim')).not.toBe('none');
  expect(await page.evaluate(() => document.documentElement.dataset.off)).toBe('scan haze bell');
});

test('?off=all hides every hero layer and the page glow', async ({ page }) => {
  await page.goto('/?off=all');
  for (const sel of ['.hero__scan', '.hero__screen-vignette', '.hero__scrim', '.hero__haze', '.hero__hues', '.hero__smoke', '.ambient']) {
    expect(await page.evaluate((s) => getComputedStyle(document.querySelector(s)!).display, sel), sel).toBe('none');
  }
});

// Phone (2026-11-22): Doug's layer-by-layer test on a Galaxy S21 in Firefox found the
// fixed page glow and the bell layer the two biggest costs. On touch the glow is painted
// on the page background (no layer), and the bell has no hero-sized transformed layer,
// no rings and no stacked 3D edge layers, but must still sit on the horn.
test('touch: the page glow is painted on the page background, not a fixed layer', async ({ browser }) => {
  const ctx = await browser.newContext(touch);
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.ambient')!).display)).toBe('none');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
  expect((bg.match(/radial-gradient/g) ?? []).length).toBe(4);
  await ctx.close();
});

test('a mouse-and-screen device keeps the fixed drifting glow', async ({ page }) => {
  await page.goto('/');
  test.skip(await page.evaluate(() => matchMedia('(hover: none), (pointer: coarse)').matches), 'touch project');
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.ambient')!).display)).not.toBe('none');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundImage)).not.toContain('radial-gradient');
});

test('touch: the bell is a flat button on the horn with no layer of its own and no rings', async ({ browser }) => {
  const ctx = await browser.newContext(touch);
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto('/');
  if ((await page.locator('.bellp').count()) === 0) test.skip(true, 'no audio in this build');
  await page.waitForTimeout(600);
  const layer = await page.evaluate(() => {
    const l = document.querySelector('.bellp-layer')!;
    const cs = getComputedStyle(l);
    return { transform: cs.transform, overflow: cs.overflow, off: l.hasAttribute('data-off') };
  });
  expect(layer).toEqual({ transform: 'none', overflow: 'visible', off: false });
  const photo = (await page.locator('.hero__photo').boundingBox())!;
  const b = (await page.locator('.bellp').boundingBox())!;
  expect(b.x).toBeGreaterThan(photo.x);
  expect(b.x + b.width / 2).toBeLessThan(photo.x + photo.width * 0.45); // the horn is in the left of the frame
  expect(b.y + b.height / 2).toBeGreaterThan(photo.y + 100);
  expect(b.width).toBeGreaterThanOrEqual(43);
  expect(await page.locator('.bellp__ring--dark').evaluate((el) => getComputedStyle(el).display)).toBe('none');
  await page.locator('.bellp').click();
  await page.waitForTimeout(2500);
  expect(await page.locator('.bellp-ring').count()).toBe(0);
  await ctx.close();
});
