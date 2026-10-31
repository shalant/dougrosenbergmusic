import { test, expect } from '@playwright/test';

// Highlights credentials and the "Artists performed with" names were the
// smallest, dimmest text on the home page (0.86rem and 0.9rem in muted grey).
// They now read at body size in full-strength text, and the credentials are
// ruled rows with the years at the right edge (2026-10-30).
for (const width of [320, 390, 1440]) {
  test(`credential rows are body size and stay inside their column at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const rows = await page.locator('.career-highlights__bullets li').evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        const parent = el.parentElement!.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          text: el.textContent,
          fontSize: parseFloat(cs.fontSize),
          borderTop: cs.borderTopWidth,
          inside: r.left >= parent.left - 0.5 && r.right <= parent.right + 0.5,
          scrolls: el.scrollWidth > el.clientWidth + 1,
        };
      }),
    );
    expect(rows.length).toBe(8);
    for (const row of rows) {
      expect(row.fontSize, `${row.text} font size`).toBeGreaterThanOrEqual(15);
      expect(row.borderTop, `${row.text} rule`).toBe('1px');
      expect(row.inside, `${row.text} inside column`).toBe(true);
      expect(row.scrolls, `${row.text} overflows`).toBe(false);
    }
  });
}

test('artist names read at body size', async ({ page }) => {
  await page.goto('/');
  const size = await page.locator('.performance__artists-flow li').first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(size).toBeGreaterThanOrEqual(15);
});
