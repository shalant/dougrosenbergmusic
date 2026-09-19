import { test, expect } from '@playwright/test';

test.describe('gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#gallery').scrollIntoViewIfNeeded();
  });

  // The reel's coverflow tilt (rotateY/translateZ inside a preserve-3d
  // track) takes panels out of the browser's own hit-testing - a real click
  // still opens the right photo because Gallery.astro resolves the panel
  // from the event's coordinates at the stage level rather than relying on
  // the click's target, but Playwright's actionability check doesn't know
  // that and sees the track "covering" the button. force: true skips that
  // check; it doesn't skip the coordinate-based click that actually happens.

  test('clicking a photo opens the lightbox with matching caption', async ({ page }) => {
    const firstPanel = page.locator('.reel-panel').first();
    const caption = await firstPanel.locator('.reel-panel__caption span').first().textContent();

    await firstPanel.click({ force: true });

    const lightbox = page.locator('[data-lightbox]');
    await expect(lightbox).toBeVisible();
    await expect(page.locator('[data-lightbox-caption]')).toHaveText(caption ?? '');
    await expect(page.locator('[data-lightbox-counter]')).toHaveText(/1 \/ \d+/);
  });

  test('Escape closes the lightbox', async ({ page }) => {
    await page.locator('.reel-panel').first().click({ force: true });
    await expect(page.locator('[data-lightbox]')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-lightbox]')).toBeHidden();
  });

  test('the right arrow key advances to the next photo', async ({ page }) => {
    await page.locator('.reel-panel').first().click({ force: true });
    await expect(page.locator('[data-lightbox-counter]')).toHaveText(/1 \/ \d+/);

    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-lightbox-counter]')).toHaveText(/2 \/ \d+/);
  });

  test('the close button closes the lightbox', async ({ page }) => {
    await page.locator('.reel-panel').first().click({ force: true });
    await page.locator('[data-lightbox-close]').click();
    await expect(page.locator('[data-lightbox]')).toBeHidden();
  });

  test('a thumbnail click moves the reel without opening the lightbox', async ({ page }) => {
    const thumb = page.locator('.reel-thumb').nth(5);
    await thumb.click();
    await expect(page.locator('[data-lightbox]')).toBeHidden();
    await expect(thumb).toHaveClass(/active/);
  });
});
