import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('homepage loads with correct title and hero content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Doug Rosenberg/);
    await expect(page.locator('h1')).toContainText('websites');
    await expect(page.locator('h1')).toContainText('sound like you');
  });

  test('every major section renders', async ({ page }) => {
    await page.goto('/');
    for (const id of ['hero', 'dev', 'listen', 'about', 'performance', 'career-highlights', 'sheet-music', 'gallery', 'contact']) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test('single <main> landmark exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toHaveCount(1);
  });

  test('custom 404 page renders for an unknown path', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('off-book');
  });

  test('the dev section has a real external portfolio link, since the nav pill now stays on-page', async ({ page }) => {
    await page.goto('/');
    // The dedicated "See More of My Work" CTA was cut (redundant with the
    // channel-surf screen right next to it) - the screen itself is now
    // this section's real external link, defaulting to the first channel.
    const screenLink = page.locator('#dev-screen');
    await expect(screenLink).toHaveAttribute('href', /^https:\/\/dougrosenbergdev\.com\//);
    await expect(screenLink).toHaveAttribute('target', '_blank');
  });
});
