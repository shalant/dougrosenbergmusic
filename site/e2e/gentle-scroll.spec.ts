import { test, expect } from '@playwright/test';

// Gentle scrolling (2026-11-22). The page glides to anchors and menu jumps, but not for
// anyone who asks for reduced motion; inner scrollers keep their overscroll to
// themselves; and the jumps all use the same native smooth scroll.

test('smooth scrolling is on by default and off under reduced motion', async ({ browser }) => {
  const on = await browser.newContext({ reducedMotion: 'no-preference' });
  const p1 = await on.newPage();
  await p1.goto('/');
  expect(await p1.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('smooth');
  await on.close();
  const off = await browser.newContext({ reducedMotion: 'reduce' });
  const p2 = await off.newPage();
  await p2.goto('/');
  expect(await p2.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await off.close();
});

test('under reduced motion a nav jump lands without gliding', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto('/');
  await page.locator('[data-menu-toggle]').click();
  await page.locator('.staff-menu__item[data-target="contact"]').click();
  // No glide: the section is in view almost at once, not after a long animation.
  await expect(page.locator('#contact')).toBeInViewport({ timeout: 1500 });
  await ctx.close();
});

test('inner scrollers keep their overscroll to themselves', async ({ page }) => {
  await page.goto('/');
  const gal = await page.locator('.reel-thumbs').evaluate((el) => getComputedStyle(el).overscrollBehaviorX);
  expect(gal).toBe('contain');
  const sheet = await page.locator('.sheet-music__list').evaluate((el) => getComputedStyle(el).overscrollBehaviorY);
  expect(sheet).toBe('contain');
});

test('the page itself keeps the browser default overscroll (pull to refresh still works)', async ({ page }) => {
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overscrollBehaviorY)).toBe('auto');
  expect(await page.evaluate(() => getComputedStyle(document.body).overscrollBehaviorY)).toBe('auto');
});
