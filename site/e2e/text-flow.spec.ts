import { test, expect, type Page } from '@playwright/test';

// Text-wrapping regressions found in the 2026-10-16 mobile audit.

test('the intro keeps the space before the album title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.intro__text')).toContainText('debut album Better Than TV');
});

test('sheet music rows use the page font, not the browser button default', async ({ page }) => {
  await page.goto('/');
  const [item, body] = await Promise.all([
    page.locator('.sheet-music__item').first().evaluate((el) => getComputedStyle(el).fontFamily),
    page.locator('body').evaluate((el) => getComputedStyle(el).fontFamily),
  ]);
  expect(item).toBe(body);
});

// 2026-11-21: the Highlights school list and "Artists performed with" were
// dot-separated runs (a name wall). They are ruled columns now: each name is a
// row with a hairline above it, no name wraps mid-name on a phone, and the
// columns are narrower than the section on every width.
async function columnState(page: Page, listSelector: string) {
  return page.evaluate((sel) => {
    const list = document.querySelector<HTMLElement>(sel)!;
    const items = Array.from(list.children) as HTMLElement[];
    const lefts = new Set(items.map((li) => Math.round(li.getBoundingClientRect().left)));
    return {
      count: items.length,
      columns: lefts.size,
      ruled: items.every((li) => getComputedStyle(li).borderTopWidth === '1px'),
      noDots: items.every((li) => getComputedStyle(li, '::before').content === 'none' || getComputedStyle(li, '::before').content === 'normal'),
      overflow: list.scrollWidth > list.clientWidth + 1,
    };
  }, listSelector);
}

// [list, [width, minimum columns]...]: the artists list is two columns on a
// phone (24 rows in one column was about 900px tall); the school list is ten
// rows and stays one column there, like the ruled rows below it.
const lists: Array<[string, Array<[number, number]>]> = [
  ['.career-highlights__list', [[360, 1], [390, 1], [1440, 3]]],
  ['.performance__artists-flow', [[360, 2], [390, 2], [1440, 4]]],
];

for (const [sel, widths] of lists) {
  for (const [width, minCols] of widths) {
    test(`${sel} is a ruled column list at ${width}px`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await ctx.newPage();
      await page.goto('/');
      const r = await columnState(page, sel);
      expect(r.ruled, 'every name has a hairline above').toBe(true);
      expect(r.noDots, 'no separator dots').toBe(true);
      expect(r.overflow, 'no horizontal overflow').toBe(false);
      expect(r.columns, 'columns').toBeGreaterThanOrEqual(minCols);
      await ctx.close();
    });
  }
}
