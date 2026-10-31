import { test, expect } from '@playwright/test';

// Edge states, 2026-10-31. A sheet-music search with no hits used to leave a
// blank list, and an image piece that failed to load left an empty frame.
test.describe('sheet music edge states', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#sheet-music').scrollIntoViewIfNeeded();
  });

  test('a search with no hits says so, and clearing it brings the list back', async ({ page }) => {
    const none = page.locator('[data-sheet-none]');
    await expect(none).toBeHidden();
    await page.locator('[data-sheet-search]').fill('zzzz');
    await expect(none).toBeVisible();
    await expect(none).toContainText('zzzz');
    await page.locator('[data-sheet-search]').fill('');
    await expect(none).toBeHidden();
    expect(await page.locator('.sheet-music__item:visible').count()).toBeGreaterThan(5);
  });

  test('an image piece that fails to load shows a message, and the next piece clears it', async ({ page }) => {
    await page.route('**/sheetmusic/sleigh-ride.jpg', (route) => route.abort());
    await page.locator('.sheet-music__item', { hasText: 'Sleigh Ride' }).click();
    const error = page.locator('[data-viewer-error]');
    await expect(error).toBeVisible();
    await expect(page.locator('[data-viewer-image]')).toBeHidden();
    await page.locator('.sheet-music__item', { hasText: 'Habanera' }).click();
    await expect(error).toBeHidden();
  });
});

test('the 404 page offers a way back and keeps the site chrome', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('link', { name: /Back to the top/ })).toHaveAttribute('href', '/');
});
