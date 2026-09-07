import { test, expect } from '@playwright/test';

test.describe('sheet music library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#sheet-music').scrollIntoViewIfNeeded();
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
