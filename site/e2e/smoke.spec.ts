import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('homepage loads with correct title and hero content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Doug Rosenberg/);
    await expect(page.locator('h1')).toContainText('Doug');
    await expect(page.locator('h1')).toContainText('Rosenberg');
  });

  test('every major section renders', async ({ page }) => {
    await page.goto('/');
    for (const id of ['hero', 'listen', 'about', 'performance', 'credibility', 'sheet-music', 'gallery', 'contact']) {
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

  test('Dev nav link points at dougrosenbergdev.com', async ({ page }) => {
    await page.goto('/');
    const devLink = page.locator('a.staff-nav__note.note--dev, a.staff-menu__item.note--dev').first();
    await expect(devLink).toHaveAttribute('href', 'https://dougrosenbergdev.com');
  });
});
