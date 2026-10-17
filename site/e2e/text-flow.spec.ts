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

// Every row of a dot-separated list should start flush with the section's
// text column (its leading dot clipped away), and no single item may wrap.
// The old markup ended wrapped lines with a stray "·" and split names
// ("Bobby / Broom") across lines.
async function rowStarts(page: Page, listSelector: string, alignSelector: string) {
  return page.evaluate(
    ([listSel, alignSel]) => {
      const list = document.querySelector(listSel)!;
      const alignLeft = document.querySelector(alignSel)!.getBoundingClientRect().left;
      const items = Array.from(list.children) as HTMLElement[];
      const textLeft = (li: HTMLElement) => {
        const range = document.createRange();
        range.selectNodeContents(li.lastChild ?? li);
        return range.getClientRects()[0].left;
      };
      const rows = new Map<number, HTMLElement>();
      const rowEnds = new Map<number, HTMLElement>();
      for (const li of items) {
        const top = Math.round(li.getBoundingClientRect().top);
        if (!rows.has(top)) rows.set(top, li);
        rowEnds.set(top, li);
      }
      // Anything drawn after an item's text (the old ::after separator)
      // widens the item past its text: that was the orphan dot at line end.
      const trailing = [...rowEnds.values()].filter((li) => {
        const range = document.createRange();
        range.selectNodeContents(li.lastChild ?? li);
        const rects = range.getClientRects();
        return li.getBoundingClientRect().right - rects[rects.length - 1].right > 1;
      }).map((li) => li.textContent);
      return {
        rows: rows.size,
        trailing,
        offsets: [...rows.values()].map((li) => Math.round(textLeft(li) - alignLeft)),
        wrapped: items.filter((li) => {
          const range = document.createRange();
          range.selectNodeContents(li);
          const lines = new Set(Array.from(range.getClientRects()).map((r) => Math.round(r.top)));
          return lines.size > 1;
        }).map((li) => li.textContent),
      };
    },
    [listSelector, alignSelector]
  );
}

for (const width of [360, 390]) {
  test.describe(`dot-separated lists at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test('Highlights school list', async ({ page }) => {
      await page.goto('/');
      const result = await rowStarts(page, '.career-highlights__list', '.career-highlights__title');
      expect(result.rows).toBeGreaterThan(1);
      expect(result.offsets.every((o) => Math.abs(o) <= 1)).toBe(true);
      expect(result.wrapped).toEqual([]);
      expect(result.trailing).toEqual([]);
    });

    test('Artists performed with', async ({ page }) => {
      await page.goto('/');
      const result = await rowStarts(page, '.performance__artists-flow', '.performance__artists .performance__venue-label');
      expect(result.rows).toBeGreaterThan(1);
      expect(result.offsets.every((o) => Math.abs(o) <= 1)).toBe(true);
      expect(result.wrapped).toEqual([]);
      expect(result.trailing).toEqual([]);
    });
  });
}
