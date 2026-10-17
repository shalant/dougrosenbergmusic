import { test, expect } from '@playwright/test';

// The URL hash used to stay on whichever anchor was clicked last: the
// "Let's Talk" CTA wrote #contact, and neither scrolling away nor the logo
// cleared it (reported 2026-10-16). It now follows the section in view.
test.describe('url hash follows the visible section', () => {
  const hash = (page: import('@playwright/test').Page) => page.evaluate(() => window.location.hash);

  test('a CTA anchor sets #contact, and the logo clears it back at the top', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[data-cta="dev-primary"]').click();
    await expect.poll(() => hash(page)).toBe('#contact');

    await page.locator('a.logo').click();
    await expect.poll(() => hash(page), { timeout: 10_000 }).toBe('');
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 10_000 }).toBeLessThan(50);
  });

  test('scrolling away from the clicked anchor updates the hash', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[data-cta="dev-primary"]').click();
    await expect.poll(() => hash(page)).toBe('#contact');

    await page.evaluate(() => document.getElementById('sheet-music')!.scrollIntoView({ behavior: 'instant' }));
    await expect.poll(() => hash(page), { timeout: 10_000 }).toBe('#sheet-music');
  });

  test('scrolling adds no history entries', async ({ page }) => {
    await page.goto('/');
    const before = await page.evaluate(() => window.history.length);
    await page.evaluate(() => document.getElementById('gallery')!.scrollIntoView({ behavior: 'instant' }));
    await expect.poll(() => hash(page), { timeout: 10_000 }).toBe('#gallery');
    expect(await page.evaluate(() => window.history.length)).toBe(before);
  });

  test('a deep link keeps its hash on load', async ({ page }) => {
    await page.goto('/#contact');
    await page.waitForTimeout(800);
    expect(await hash(page)).toBe('#contact');
  });
});
