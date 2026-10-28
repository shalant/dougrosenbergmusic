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

  test('/easternblok renders as a published archive page', async ({ page }) => {
    await page.goto('/easternblok');
    await expect(page.locator('h1')).toHaveText('Eastern Blok');
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://dougrosenberg.com/easternblok');
    await expect(page.locator('.album')).toHaveCount(3);
    await expect(page.locator('.ledger__row')).toHaveCount(5);
    await expect(page.locator('.placeholder')).toHaveCount(0);
    await expect(page.locator('#story')).toBeVisible();
    await expect(page.locator('.archive')).toContainText('saxophone, flute and clarinet');
    await expect(page.locator('.members li')).toHaveCount(4);
  });

  test('/easternblok lists the show history by year, ending with the 2011 Schubas show', async ({ page }) => {
    await page.goto('/easternblok');
    const years = page.locator('.showlog .year');
    await expect(years).toHaveCount(8);
    await expect(years.first().locator('.year__label')).toHaveText('2005');
    // Rows are in the HTML even while their year is closed.
    await expect(page.locator('.gig')).toHaveCount(253);
    const year2011 = years.filter({ has: page.locator('.year__label', { hasText: '2011' }) });
    await year2011.locator('summary').click();
    await expect(year2011.locator('.gig').last().locator('.gig__venue')).toHaveText('Schubas');
    await expect(year2011.locator('.gig').last()).toBeVisible();
  });

  test('/easternblok show recordings link to the Internet Archive', async ({ page }) => {
    await page.goto('/easternblok');
    const listen = page.locator('.gig__listen');
    await expect(listen).toHaveCount(29);
    await expect(listen.first()).toHaveAttribute('href', /^https:\/\/archive\.org\/details\//);
    await expect(page.locator('.gig__tag', { hasText: 'announced' })).toHaveCount(11);
  });

  test('/easternblok show-log notes keep their spaces', async ({ page }) => {
    // Regression: Astro dropped the space where a line break met {expr} or a link.
    await page.goto('/easternblok');
    await expect(page.locator('.showlog__summary')).toContainText('and Poland. 29 have');
    await expect(page.locator('.showlog__source')).toContainText('saved by the Wayback Machine');
    await expect(page.locator('.showlog__source')).toContainText('to June 2009. 11 shows');
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
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('.wall__list').first()).toBeVisible();
    await expect(page.locator('a.band-link')).toHaveAttribute('href', '/easternblok/press');
  });

  test('/press band paragraph keeps its space before the count', async ({ page }) => {
    // Regression (2026-10-25): same Astro whitespace drop as the show log,
    // rendering "Goran Ivanovic Group.60 pieces".
    await page.goto('/press');
    await expect(page.locator('section[aria-labelledby="band"] p')).toContainText(/Ivanovic Group\. \d+ pieces/);
  });

  test('archive pages link home instead of using the in-page nav', async ({ page }) => {
    for (const path of ['/easternblok', '/press']) {
      await page.goto(path);
      await expect(page.locator('.staff-nav')).toHaveCount(0);
      await expect(page.locator('a.logo')).toHaveAttribute('href', '/');
      await expect(page.locator('.archive__back')).toHaveAttribute('href', '/#press');
    }
  });

  test('published archive pages are in the sitemap', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    for (const path of ['', '/easternblok', '/easternblok/press', '/press']) {
      expect(sitemap).toContain(`<loc>https://dougrosenberg.com${path}${path ? '' : '/'}</loc>`);
    }
  });

  test('archive pages have no horizontal overflow', async ({ page }) => {
    for (const path of ['/', '/easternblok', '/press']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

// From 768px the fixed logo is 104px tall; the archive pages' "Back" link used
// to start 20px above its bottom edge, so the two tap targets overlapped.
test.describe('archive page header', () => {
  for (const width of [768, 860]) {
    test(`the back link clears the fixed logo at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/press');
      const gap = await page.evaluate(() => {
        const logo = document.querySelector('a.logo')!.getBoundingClientRect();
        const back = document.querySelector('.archive__back')!.getBoundingClientRect();
        return back.top - logo.bottom;
      });
      expect(gap).toBeGreaterThanOrEqual(0);
    });
  }
});
