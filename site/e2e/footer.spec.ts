import { test, expect } from '@playwright/test';

// "Liner notes" footer (2026-10-18): Side A tracks this page, Side B
// cross-links off it, Personnel holds the social icons.
test('Side A tracks point at real sections of the page', async ({ page }) => {
  await page.goto('/');
  const tracks = page.getByRole('navigation', { name: 'On this page' }).getByRole('link');
  await expect(tracks).toHaveCount(6);
  for (const href of await tracks.evaluateAll((els) => els.map((a) => a.getAttribute('href')!))) {
    await expect(page.locator(href)).toHaveCount(1);
  }
});

test('Side B cross-links to the archive, press, the developer site and the rebuild post', async ({ page }) => {
  await page.goto('/');
  const side = page.getByRole('navigation', { name: 'More from Doug' });
  await expect(side.getByRole('link', { name: 'Eastern Blok archive' })).toHaveAttribute('href', '/easternblok');
  await expect(side.getByRole('link', { name: 'All press' })).toHaveAttribute('href', '/press');
  await expect(side.getByRole('link', { name: /^Want a site like this one\? dougrosenbergdev\.com/ })).toHaveAttribute('href', 'https://dougrosenbergdev.com');
  await expect(side.getByRole('link', { name: /^How this site was rebuilt/ })).toHaveAttribute('href', /rebuilding-musician-site-blazor-to-astro/);
});

test('back to top returns to the hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.site-footer').getByRole('link', { name: 'Back to top' })).toHaveAttribute('href', '#hero');
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  test('tracks stack in one column and take a full-height tap', async ({ page }) => {
    await page.goto('/');
    const cols = page.locator('.liner__col');
    const lefts = await cols.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().left)));
    expect(new Set(lefts).size).toBe(1);
    const heights = await page.locator('.liner__track').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'hover');

  test('a track title nudges right on hover without reflowing the row', async ({ page }) => {
    await page.goto('/');
    const track = page.locator('.liner__track').first();
    const before = await track.evaluate((el) => getComputedStyle(el).paddingLeft);
    await track.hover();
    await expect.poll(() => track.locator('.liner__title').evaluate((el) => getComputedStyle(el).translate)).toBe('4px');
    expect(await track.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe(before);
  });
});
