import { test, expect } from '@playwright/test';

// Bad-cop point "still left-weighted" (docs/ui-assessment-2026-10-24.md,
// 2026-11-15): the intro lede filled the left 60% under the hero and Contact
// left a void under its heading. The intro now pairs the lede with a facts
// rail, and Contact puts a portrait under its heading (desktop only).

test.describe('intro facts rail', () => {
  test('sits to the right of the lede and reaches the right edge of the content column', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const lede = await page.locator('.intro__text').boundingBox();
    const rail = await page.locator('.intro__facts').boundingBox();
    const wrap = await page.locator('.intro__grid').boundingBox();
    expect(lede && rail && wrap).toBeTruthy();
    expect(rail!.x).toBeGreaterThanOrEqual(lede!.x + lede!.width);
    // The rail ends at the wrap's content edge, so nothing is left empty on the right.
    const wrapStyle = await page.locator('.intro__grid').evaluate((el) => parseFloat(getComputedStyle(el).paddingRight));
    expect(Math.abs(rail!.x + rail!.width - (wrap!.x + wrap!.width - wrapStyle))).toBeLessThan(2);
  });

  test('has four fact rows that match the paragraph, and the paragraph stays visible text', async ({ page }) => {
    await page.goto('/');
    const rows = await page.locator('.intro__fact').allTextContents();
    expect(rows).toHaveLength(4);
    const para = (await page.locator('.intro__text').innerText()).replace(/\s+/g, ' ');
    for (const fact of ['Better Than TV', 'New England Conservatory', 'Millennium Park', 'Green Mill', 'Symphony Center', 'websites']) {
      expect(para.toLowerCase()).toContain(fact.toLowerCase());
      expect(rows.join(' ').toLowerCase()).toContain(fact.toLowerCase());
    }
  });

  for (const width of [320, 390, 768]) {
    test(`stacks under the lede without sideways scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const lede = await page.locator('.intro__text').boundingBox();
      const rail = await page.locator('.intro__facts').boundingBox();
      expect(rail!.y).toBeGreaterThanOrEqual(lede!.y + lede!.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }
});

test.describe('contact portrait', () => {
  test('fills the left column under the heading on desktop, beside the form', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const photo = page.locator('.contact__photo');
    await photo.scrollIntoViewIfNeeded();
    await expect(photo).toBeVisible();
    const sub = await page.locator('.contact__sub').boundingBox();
    const box = await photo.boundingBox();
    const form = await page.locator('.contact__form-wrap').boundingBox();
    expect(box!.y).toBeGreaterThan(sub!.y + sub!.height);
    expect(box!.x + box!.width).toBeLessThanOrEqual(form!.x);
    // Roughly 4:5, so the offset frame lines up the way About's does.
    expect(Math.abs(box!.height / box!.width - 1.25)).toBeLessThan(0.02);
  });

  test('is a decorative, lazy, sized image that is not the hero or About photo', async ({ page }) => {
    await page.goto('/');
    const img = page.locator('.contact__photo');
    expect(await img.getAttribute('alt')).toBe('');
    expect(await img.getAttribute('loading')).toBe('lazy');
    expect(await img.getAttribute('width')).toBe('1080');
    expect(await img.getAttribute('height')).toBe('1350');
    const src = await img.getAttribute('src');
    expect(src).not.toContain('hero.webp');
    const res = await page.request.get(src!);
    expect(res.status()).toBe(200);
  });

  test('is hidden below 900px so the form stays under the heading', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/');
    await expect(page.locator('.contact__photo')).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
