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
    for (const id of ['hero', 'dev', 'listen', 'about', 'performance', 'credibility', 'sheet-music', 'gallery', 'contact']) {
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
    const portfolioLink = page.locator('#dev a[href="https://dougrosenbergdev.com/webdesign"]');
    await expect(portfolioLink).toHaveAttribute('target', '_blank');
  });
});
