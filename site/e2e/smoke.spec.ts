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

  test('direct-answer intro sits right under the hero', async ({ page }) => {
    await page.goto('/');
    const intro = page.locator('#intro');
    await expect(intro).toContainText('Chicago-based web designer and developer');
    const words = (await intro.innerText()).trim().split(/\s+/).length;
    expect(words).toBeGreaterThanOrEqual(30);
    expect(words).toBeLessThanOrEqual(60);
  });

  test('FAQ renders five questions and matching FAQPage JSON-LD', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#faq details')).toHaveCount(5);
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = schemas.map((s) => JSON.parse(s)).find((s) => s['@type'] === 'FAQPage');
    expect(faq.mainEntity).toHaveLength(5);
    const visible = await page.locator('#faq summary').allTextContents();
    expect(faq.mainEntity.map((q: { name: string }) => q.name)).toEqual(visible.map((t) => t.trim()));
  });

  test('structured data parses and includes Person, WebPage and MusicAlbum', async ({ page }) => {
    await page.goto('/');
    const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s));
    const types = schemas.flatMap((s) => (s['@graph'] ? s['@graph'].map((n: { '@type': string }) => n['@type']) : [s['@type']]));
    expect(types).toEqual(expect.arrayContaining(['Person', 'WebSite', 'WebPage', 'FAQPage', 'MusicAlbum']));
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
