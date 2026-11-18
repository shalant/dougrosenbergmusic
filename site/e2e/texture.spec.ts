import { test, expect } from '@playwright/test';

// Page texture (2026-11-17). See docs/style-guide.md "Themes" for the rule:
// every page, not just home, carries the ambient glows (from BaseLayout) and
// a body grain in both themes, so no page is a flat color.

const PAGES = ['/', '/press', '/easternblok', '/easternblok/press'];

for (const colorScheme of ['dark', 'light'] as const) {
  for (const path of PAGES) {
    test(`${path} has glows and grain in ${colorScheme}`, async ({ browser }) => {
      const ctx = await browser.newContext({ colorScheme });
      const page = await ctx.newPage();
      await page.goto(path);
      await expect(page.locator('.ambient .ambient-blob')).toHaveCount(4);
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
      expect(bg).toContain('data:image/svg+xml');
      await ctx.close();
    });
  }
}

// The raised bands are 78% opaque and the footer is opaque, so the body grain
// barely reaches them. Each paints its own grain (2026-11-17).
for (const colorScheme of ['dark', 'light'] as const) {
  test(`dark panels carry their own grain in ${colorScheme}`, async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme });
    const page = await ctx.newPage();
    await page.goto('/');
    for (const sel of ['.about', '.career-highlights', '.gallery', '.site-footer']) {
      const bg = await page.locator(sel).first().evaluate((el) => getComputedStyle(el).backgroundImage);
      expect(bg, sel).toContain('data:image/svg+xml');
    }
    await ctx.close();
  });
}
