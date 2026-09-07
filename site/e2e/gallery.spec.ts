import { test, expect } from '@playwright/test';

test.describe('gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#gallery').scrollIntoViewIfNeeded();
  });

  test('filtering by category hides non-matching cards', async ({ page }) => {
    const cards = page.locator('.gallery__card');
    const totalCount = await cards.count();

    await page.locator('.gallery__filter[data-category="Studio"]').click();

    const studioCards = page.locator('.gallery__card[data-category="Studio"]');
    const studioCount = await studioCards.count();
    expect(studioCount).toBeGreaterThan(0);
    expect(studioCount).toBeLessThan(totalCount);

    for (const card of await studioCards.all()) {
      await expect(card).toBeVisible();
    }
    const nonStudioCards = page.locator('.gallery__card:not([data-category="Studio"])');
    for (const card of await nonStudioCards.all()) {
      await expect(card).toBeHidden();
    }
  });

  test('clicking a card opens the lightbox with matching caption', async ({ page }) => {
    const firstCard = page.locator('.gallery__card').first();
    const caption = await firstCard.locator('.gallery__caption').textContent();

    await firstCard.click();

    const lightbox = page.locator('[data-lightbox]');
    await expect(lightbox).toBeVisible();
    await expect(page.locator('[data-lightbox-caption]')).toHaveText(caption ?? '');
    await expect(page.locator('[data-lightbox-counter]')).toHaveText(/1 \/ \d+/);
  });

  test('Escape closes the lightbox', async ({ page }) => {
    await page.locator('.gallery__card').first().click();
    await expect(page.locator('[data-lightbox]')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-lightbox]')).toBeHidden();
  });

  test('the right arrow key advances to the next photo', async ({ page }) => {
    await page.locator('.gallery__card').first().click();
    await expect(page.locator('[data-lightbox-counter]')).toHaveText(/1 \/ \d+/);

    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-lightbox-counter]')).toHaveText(/2 \/ \d+/);
  });

  test('the close button closes the lightbox', async ({ page }) => {
    await page.locator('.gallery__card').first().click();
    await page.locator('[data-lightbox-close]').click();
    await expect(page.locator('[data-lightbox]')).toBeHidden();
  });
});
