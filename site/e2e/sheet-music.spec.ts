import { test, expect } from '@playwright/test';

test.describe('sheet music library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#sheet-music').scrollIntoViewIfNeeded();
  });

  // The list was capped at 420px and the viewer floored at 420px, so on a tall
  // desktop window the card was about 60% filled. Both columns now stretch to
  // the card's full inner height.
  test('on desktop the list and the viewer fill the card', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('#sheet-music').scrollIntoViewIfNeeded();
    await page.locator('.sheet-music__item').first().click();

    const m = await page.evaluate(() => {
      const box = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
      const panel = document.querySelector('.sheet-music__panel')!;
      const pad = parseFloat(getComputedStyle(panel).paddingTop);
      const p = panel.getBoundingClientRect();
      return {
        inner: p.height - pad * 2,
        innerBottom: p.bottom - pad,
        listBottom: box('.sheet-music__list').bottom,
        viewerHeight: box('.sheet-music__viewer').height,
        frameBottom: box('.sheet-music__frame').bottom,
        panelHeight: p.height,
      };
    });
    expect(m.panelHeight).toBeGreaterThanOrEqual(560);
    expect(Math.abs(m.listBottom - m.innerBottom)).toBeLessThanOrEqual(2);
    expect(Math.abs(m.viewerHeight - m.inner)).toBeLessThanOrEqual(2);
    expect(Math.abs(m.frameBottom - m.innerBottom)).toBeLessThanOrEqual(2);
  });

  test('searching filters the list to matching titles only', async ({ page }) => {
    const totalCount = await page.locator('.sheet-music__item').count();

    await page.locator('[data-sheet-search]').fill('bach');

    const visibleItems = page.locator('.sheet-music__item:visible');
    const visibleCount = await visibleItems.count();
    expect(visibleCount).toBeGreaterThan(0);
    expect(visibleCount).toBeLessThan(totalCount);

    for (const item of await visibleItems.all()) {
      const title = (await item.textContent())?.toLowerCase() ?? '';
      expect(title).toContain('bach');
    }
  });

  test('a search with no matches hides every item', async ({ page }) => {
    await page.locator('[data-sheet-search]').fill('zzz-not-a-real-piece-zzz');
    await expect(page.locator('.sheet-music__item:visible')).toHaveCount(0);
  });

  test('clicking a piece opens the viewer with the correct title', async ({ page }) => {
    await expect(page.locator('[data-viewer-empty]')).toBeVisible();
    await expect(page.locator('[data-viewer-active]')).toBeHidden();

    const firstItem = page.locator('.sheet-music__item').first();
    const title = await firstItem.textContent();
    await firstItem.click();

    await expect(page.locator('[data-viewer-empty]')).toBeHidden();
    await expect(page.locator('[data-viewer-active]')).toBeVisible();
    await expect(page.locator('[data-viewer-title]')).toHaveText(title?.trim() ?? '');
    await expect(firstItem).toHaveClass(/is-active/);
  });

  test('the "open in new tab" link points at the actual sheet music file', async ({ page }) => {
    await page.locator('.sheet-music__item').first().click();
    const href = await page.locator('[data-viewer-link]').getAttribute('href');
    expect(href).toMatch(/\/sheetmusic\/.+\.(pdf|png|jpg)$/);
  });
});
