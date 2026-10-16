import { test, expect } from '@playwright/test';

// The home page's Press timeline and the two pages it leads to (added
// 2026-10-15). For now the timeline is the only way into /easternblok and
// /press, so these links must work.
test.describe('press timeline and archive pages', () => {
  test('home page timeline shows the approved quotes grouped by project', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('#press');
    await expect(section.locator('h2')).toHaveText('On record');
    await expect(section.locator('.era--eastern-blok .ledger__row')).toHaveCount(5);
    await expect(section.locator('.era--leader .ledger__row')).toHaveCount(1);
    await expect(section.locator('.ledger__name').first()).toHaveText('Doug Rosenberg');
  });

  test('timeline links lead to /easternblok and /press', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#press .era--eastern-blok .era__link')).toHaveAttribute('href', '/easternblok');
    await expect(page.locator('#press .era--leader .era__link')).toHaveAttribute('href', '/press');
  });

  test('outlet links open the original review in a new tab', async ({ page }) => {
    await page.goto('/');
    const outletLinks = page.locator('#press .ledger__cite a');
    await expect(outletLinks).toHaveCount(4);
    for (const link of await outletLinks.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('href', /^https:\/\//);
    }
  });

  test('/easternblok renders as a draft archive page', async ({ page }) => {
    await page.goto('/easternblok');
    await expect(page.locator('h1')).toHaveText('Eastern Blok');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://dougrosenberg.com/easternblok');
    await expect(page.locator('.album')).toHaveCount(3);
    await expect(page.locator('.ledger__row')).toHaveCount(5);
    await expect(page.locator('.placeholder').first()).toBeVisible();
  });

  test('/easternblok links the band to Doug in its structured data', async ({ page }) => {
    await page.goto('/easternblok');
    const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s));
    const band = schemas.find((s) => s['@type'] === 'MusicGroup');
    expect(band.name).toBe('Eastern Blok');
    expect(band.alternateName).toBe('Goran Ivanovic Group');
    expect(band.member).toEqual([{ '@id': 'https://dougrosenberg.com/#person' }]);
    expect(schemas.some((s) => s['@id'] === 'https://dougrosenberg.com/#person')).toBe(true);
  });

  test('/press renders and links to the band archive', async ({ page }) => {
    await page.goto('/press');
    await expect(page.locator('h1')).toHaveText('On record');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('.ledger__row')).toHaveCount(1);
    await expect(page.locator('a.band-link')).toHaveAttribute('href', '/easternblok');
  });

  test('archive pages link home instead of using the in-page nav', async ({ page }) => {
    for (const path of ['/easternblok', '/press']) {
      await page.goto(path);
      await expect(page.locator('.staff-nav')).toHaveCount(0);
      await expect(page.locator('a.logo')).toHaveAttribute('href', '/');
      await expect(page.locator('.archive__back')).toHaveAttribute('href', '/#press');
    }
  });

  test('draft pages stay out of the sitemap', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).toContain('<loc>https://dougrosenberg.com/</loc>');
    expect(sitemap).not.toContain('/press');
    expect(sitemap).not.toContain('/easternblok');
  });

  test('archive pages have no horizontal overflow', async ({ page }) => {
    for (const path of ['/', '/easternblok', '/press']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});
