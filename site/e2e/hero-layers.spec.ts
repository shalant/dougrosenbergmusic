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
