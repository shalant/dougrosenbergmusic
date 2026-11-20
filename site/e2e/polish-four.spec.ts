import { test, expect } from '@playwright/test';

// Four bad-cop points from the 2026-11-19 second re-score
// (docs/ui-assessment-2026-10-24.md). Before: about 187px of empty ground
// between the Lessons list and the Sheet Music heading, phone Lessons rows
// about 90px, the national venue list ending about 70px above the Chicago
// list, and /easternblok opening on a wall of text.

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout');

  test('Sheet Music follows Private lessons closely (they are one block)', async ({ browser }) => {
    // Reduced motion so the scroll reveals' offsets do not move the boxes.
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    const gap = await page.evaluate(() => {
      const lastRow = document.querySelector('.lessons__subjects li:last-child')!.getBoundingClientRect();
      const cta = document.querySelector('.lessons__cta')!.getBoundingClientRect();
      const heading = document.querySelector('.sheet-music__heading')!.getBoundingClientRect();
      return heading.top - Math.max(lastRow.bottom, cta.bottom);
    });
    expect(gap).toBeLessThan(135);
    await ctx.close();
  });

  test('the national venue list ends where the Chicago list ends', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const { chicago, national } = await page.evaluate(() => {
      const last = (sel: string) => {
        const items = document.querySelectorAll(sel + ' li');
        return items[items.length - 1].getBoundingClientRect().bottom;
      };
      return { chicago: last('.performance__venue-list--marquee'), national: last('.performance__venue-list--two-col') };
    });
    // The last national row is a shorter line, so allow for its smaller height.
    expect(Math.abs(chicago - national)).toBeLessThan(14);
  });
});

test('phone: Lessons subject rows stay compact', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto('/');
  const heights = await page.locator('.lessons__subjects li').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
  expect(heights.length).toBe(5);
  for (const h of heights) expect(h).toBeLessThan(72);
  await ctx.close();
});

test('/easternblok story is broken by one review quote, read from the ledger', async ({ page }) => {
  await page.goto('/easternblok');
  const pull = page.locator('.pull__quote');
  await expect(pull).toHaveCount(1);
  const ledgerFirst = await page.locator('.ledger__quote p').first().innerText();
  expect(ledgerFirst).toContain((await pull.innerText()).replace(/[“”"]/g, '').trim());
  const link = page.locator('.pull__cite a');
  await expect(link).toHaveAttribute('href', /allaboutjazz\.com/);
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAccessibleName(/All About Jazz.*opens in a new tab/);
  // It sits inside the story, between its paragraphs.
  expect(await page.locator('#story').locator('xpath=..').locator('.pull').count()).toBe(1);
});
