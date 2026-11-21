import { test, expect } from '@playwright/test';

// 2026-11-21 re-score, bad-cop point 6 (small text). The most common sub-13px
// body text was the quote sources in "On record" (0.8rem = 12.8px), the rail
// beside it, and the Recordings cue and blurb. They are 14px now; uppercase
// eyebrow labels are left alone on purpose (small caps read larger). The Contact
// portrait also fills its column (420px, was 320px with 270px of empty ground).

const size = (page: import('@playwright/test').Page, sel: string) =>
  page.locator(sel).first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

test.describe('readable small text', () => {
  test('quote sources and the On record rail are at least 14px', async ({ page }) => {
    await page.goto('/');
    for (const sel of ['#press .ledger__cite', '#press .era__meta', '#press .era__lineage']) {
      expect(await size(page, sel), sel).toBeGreaterThanOrEqual(14);
    }
    expect(await size(page, '#press .era__link')).toBeGreaterThanOrEqual(13);
  });

  test('the Recordings blurbs are at least 13.5px on a phone and a desktop', async ({ page }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      expect(await size(page, '.album__blurb'), `width ${width}`).toBeGreaterThanOrEqual(13.5);
    }
  });

  test('the Recordings listen cue is at least 13.5px where it shows', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    expect(await size(page, '.album__cue')).toBeGreaterThanOrEqual(13.5);
  });

  test('the Contact portrait fills most of its column on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const box = await page.locator('.contact__photo').boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(400);
  });
});
