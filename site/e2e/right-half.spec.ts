import { test, expect } from '@playwright/test';

// Bad-cop point "still left-weighted" (docs/ui-assessment-2026-10-24.md,
// 2026-11-15): the intro lede filled the left 60% under the hero and Contact
// left a void under its heading. The intro now pairs the lede with a facts
// rail, and Contact puts a portrait under its heading (desktop only).

test.describe('intro facts rail', () => {
  test('sits to the right of the lede and reaches the right edge of the content column', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const lede = await page.locator('.intro__text').boundingBox();
    const rail = await page.locator('.intro__facts').boundingBox();
    const wrap = await page.locator('.intro__grid').boundingBox();
    expect(lede && rail && wrap).toBeTruthy();
    expect(rail!.x).toBeGreaterThanOrEqual(lede!.x + lede!.width);
    // The rail ends at the wrap's content edge, so nothing is left empty on the right.
    const wrapStyle = await page.locator('.intro__grid').evaluate((el) => parseFloat(getComputedStyle(el).paddingRight));
    expect(Math.abs(rail!.x + rail!.width - (wrap!.x + wrap!.width - wrapStyle))).toBeLessThan(2);
  });

  test('has four fact rows that match the paragraph, and the paragraph stays visible text', async ({ page }) => {
    await page.goto('/');
    const rows = await page.locator('.intro__fact').allTextContents();
    expect(rows).toHaveLength(4);
    const para = (await page.locator('.intro__text').innerText()).replace(/\s+/g, ' ');
    for (const fact of ['Better Than TV', 'New England Conservatory', 'Millennium Park', 'Green Mill', 'Symphony Center', 'websites']) {
      expect(para.toLowerCase()).toContain(fact.toLowerCase());
      expect(rows.join(' ').toLowerCase()).toContain(fact.toLowerCase());
    }
  });

  for (const width of [320, 390, 768]) {
    test(`stacks under the lede without sideways scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const lede = await page.locator('.intro__text').boundingBox();
      const rail = await page.locator('.intro__facts').boundingBox();
      expect(rail!.y).toBeGreaterThanOrEqual(lede!.y + lede!.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }
});

test.describe('contact portrait', () => {
  test('fills the left column under the heading on desktop, beside the form', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const photo = page.locator('.contact__photo');
    await photo.scrollIntoViewIfNeeded();
    await expect(photo).toBeVisible();
    const sub = await page.locator('.contact__sub').boundingBox();
    const box = await photo.boundingBox();
    const form = await page.locator('.contact__form-wrap').boundingBox();
    expect(box!.y).toBeGreaterThan(sub!.y + sub!.height);
    expect(box!.x + box!.width).toBeLessThanOrEqual(form!.x);
    // Roughly 4:5, so the offset frame lines up the way About's does.
    expect(Math.abs(box!.height / box!.width - 1.25)).toBeLessThan(0.02);
  });

  test('is a decorative, lazy, sized image that is not the hero or About photo', async ({ page }) => {
    await page.goto('/');
    const img = page.locator('.contact__photo');
    expect(await img.getAttribute('alt')).toBe('');
    expect(await img.getAttribute('loading')).toBe('lazy');
    expect(await img.getAttribute('width')).toBe('1440');
    expect(await img.getAttribute('height')).toBe('1440');
    const src = await img.getAttribute('src');
    expect(src).not.toContain('hero.webp');
    // Not the About portrait, and not the gallery's first frame (it was both on
    // 2026-11-19 and read as the same photo three times).
    expect(src).not.toBe(await page.locator('.about__photo').first().getAttribute('src'));
    expect(src).not.toContain('formal.jpg');
    const res = await page.request.get(src!);
    expect(res.status()).toBe(200);
  });

  test('is hidden below 900px so the form stays under the heading', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/');
    await expect(page.locator('.contact__photo')).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});

// Light bad-cop points left open on 2026-11-15 (docs/ui-assessment-2026-10-24.md):
// the empty right of Quick answers and of the archive pages' headers, and the
// hero photo repeated in About.

// A .wrap's box includes its side padding; the content ends inside it.
async function contentRight(page: import('@playwright/test').Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const cs = getComputedStyle(el);
    return el.getBoundingClientRect().right - parseFloat(cs.paddingRight);
  });
}

test.describe('Quick answers uses both columns', () => {
  test('from 1000px the heading and an ask button sit left of the questions', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const heading = await page.locator('.faq__heading').boundingBox();
    const ask = page.locator('.faq__ask');
    await expect(ask).toBeVisible();
    await expect(ask).toHaveAttribute('href', '#contact');
    const list = await page.locator('.faq__list').boundingBox();
    const edge = await contentRight(page, '.faq__layout');
    expect(list!.x).toBeGreaterThanOrEqual(heading!.x + heading!.width);
    // the questions reach the content column's right edge (they stopped at 48rem before)
    expect(list!.x + list!.width).toBeGreaterThanOrEqual(edge - 2);
  });

  test('below 1000px the section is the single column it was', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/');
    await expect(page.locator('.faq__ask')).toBeHidden();
    const heading = await page.locator('.faq__heading').boundingBox();
    const list = await page.locator('.faq__list').boundingBox();
    expect(list!.y).toBeGreaterThanOrEqual(heading!.y + heading!.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});

test.describe('archive pages: the "On this page" rail', () => {
  for (const path of ['/press', '/easternblok', '/easternblok/press']) {
    test(`${path}: rail beside the title, every link lands on a heading`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      const rail = page.locator('.archive__toc');
      await expect(rail).toBeVisible();
      const title = await page.locator('.archive__title').boundingBox();
      const box = await rail.boundingBox();
      const edge = await contentRight(page, '.archive .wrap');
      expect(box!.x).toBeGreaterThanOrEqual(title!.x + title!.width);
      expect(box!.x + box!.width).toBeGreaterThanOrEqual(edge - 2);
      const hrefs = await rail.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
      expect(hrefs.length).toBeGreaterThan(3);
      for (const href of hrefs) {
        const h2 = page.locator(`.archive__section h2${href}`);
        await expect(h2, href).toHaveCount(1);
      }
      for (const a of await rail.locator('a').all()) {
        expect((await a.boundingBox())!.height).toBeGreaterThanOrEqual(43.5);
      }
    });

    test(`${path}: hidden below 1000px, no sideways scroll`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 900 });
      await page.goto(path);
      await expect(page.locator('.archive__toc')).toBeHidden();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }

  test('a jumped-to heading clears the fixed nav', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/easternblok');
    await page.locator('.archive__toc a[href="#members"]').click();
    await page.waitForTimeout(800);
    const top = await page.locator('#members').evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(116); // the logo ends at y=116
  });
});

test.describe('About has its own photo', () => {
  test('it is not the hero photo, loads, and keeps the 4:5 frame', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const src = await page.locator('.about__photo').getAttribute('src');
    const hero = await page.locator('.hero__photo').getAttribute('src');
    expect(src).not.toBe(hero);
    expect(src).not.toContain('hero.webp');
    expect((await page.request.get(src!)).status()).toBe(200);
    await page.locator('.about__photo').scrollIntoViewIfNeeded();
    const box = await page.locator('.about__photo').boundingBox();
    // the width/height attributes (for layout shift) must not beat the ratio
    expect(Math.abs(box!.height / box!.width - 1.25)).toBeLessThan(0.02);
  });
});

