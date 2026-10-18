import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('homepage loads with correct title and hero content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Doug Rosenberg/);
    await expect(page.locator('h1')).toContainText('websites');
    await expect(page.locator('h1')).toContainText('sound like you');
  });

  // 210 of 400 Cloudflare Web Analytics visits in the 30 days to 2026-10-15
  // had host `localhost`: the analytics scripts ran during dev and test runs.
  test('analytics scripts are not loaded on localhost', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('script[src*="cloudflareinsights.com"]')).toHaveCount(0);
    await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(0);
  });

  test('analytics scripts are loaded on a real hostname', async ({ page, baseURL }) => {
    // Chrome resolves *.localhost to loopback, and "site.localhost" is not
    // "localhost", so it stands in for a production hostname here.
    const url = new URL(baseURL ?? 'http://localhost');
    url.hostname = 'site.localhost';
    await page.route(/cloudflareinsights\.com|googletagmanager\.com/, (route) => route.abort());
    await page.goto(url.toString());
    await expect(page.locator('script[src*="cloudflareinsights.com"]')).toHaveCount(1);
    await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(1);
  });

  test('every major section renders', async ({ page }) => {
    await page.goto('/');
    for (const id of ['hero', 'dev', 'listen', 'about', 'performance', 'career-highlights', 'press', 'lessons', 'sheet-music', 'gallery', 'contact']) {
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

  test('structured data entities link to one Person via @id', async ({ page }) => {
    await page.goto('/');
    const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s));
    const nodes = schemas.flatMap((s) => (s['@graph'] ? s['@graph'] : [s]));
    const person = nodes.find((n) => n['@type'] === 'Person' && n.sameAs);
    const website = nodes.find((n) => n['@type'] === 'WebSite');
    const webpage = nodes.find((n) => n['@type'] === 'WebPage');
    expect(person['@id']).toBe('https://dougrosenberg.com/#person');
    expect(website.publisher['@id']).toBe(person['@id']);
    expect(webpage.isPartOf['@id']).toBe(website['@id']);
    expect(webpage.mainEntity['@id']).toBe(person['@id']);
    const betterThanTv = nodes.find((n) => n['@type'] === 'MusicAlbum' && n.name === 'Better Than TV');
    expect(betterThanTv.byArtist['@id']).toBe(person['@id']);
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

  // Internal dev notes used to ship as HTML comments (7 on the home page,
  // ~4.5% of its bytes; found 2026-10-11). They're Astro {/* */} comments
  // now, which the build strips.
  for (const path of ['/', '/easternblok', '/press', '/no-such-page']) {
    test(`no HTML comments in the served page (${path})`, async ({ request }) => {
      const html = await (await request.get(path)).text();
      expect(html).not.toContain('<!--');
    });
  }
});
