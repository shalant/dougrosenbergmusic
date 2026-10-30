import { test, expect } from '@playwright/test';

// On /easternblok/press the timeline marks three album releases (2006, 2007,
// 2011) under the year axis. Labels are centred on their year and are wider
// than a year's width, so at 390px "Goran Ivanovic Group" and "Folk Tales" (a year
// apart) printed on top of each other (found 2026-10-29 reviewing the archive
// pages). A label within a year of the one before it now drops to a second row.
for (const width of [320, 390, 768, 1440]) {
  test(`album labels on the Eastern Blok press timeline do not overlap at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/easternblok/press');
    const boxes = await page.locator('.strip__album').evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { text: el.textContent, left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      }),
    );
    expect(boxes.length).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        const overlaps = a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        expect(overlaps, `${a.text} overlaps ${b.text}`).toBe(false);
      }
    }
  });
}
