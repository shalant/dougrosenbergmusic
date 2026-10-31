import { test, expect } from '@playwright/test';

// Mobile refinement round, 2026-10-30. Switching the small labels from
// JetBrains Mono to Work Sans made them look smaller, and a phone audit found
// 253 gig dates at 12px, tags at 10.4px and Dev-screen chips at 9.6px. Floor:
// 12px for tracked uppercase labels, 12.8px for text people read.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

for (const path of ['/', '/press', '/easternblok', '/easternblok/press']) {
  test(`no visible text under 12px on a phone (${path})`, async ({ page }) => {
    await page.goto(path);
    await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
    const small = await page.evaluate(() => {
      const found: string[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = walker.nextNode())) {
        const text = (n.textContent || '').trim();
        const el = n.parentElement;
        if (!text || !el || el.closest('script,style,noscript,svg,.visually-hidden')) continue;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || cs.display === 'none') continue;
        const fs = parseFloat(cs.fontSize);
        if (fs < 11.99) found.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ${fs.toFixed(1)}px "${text.slice(0, 24)}"`);
      }
      return [...new Set(found)];
    });
    expect(small).toEqual([]);
  });
}

test('the contact submit button meets the 44px tap target', async ({ page }) => {
  await page.goto('/');
  const box = await page.locator('.contact__submit').boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
});

test('the two Dev buttons are the same width when stacked on a phone', async ({ page }) => {
  await page.goto('/');
  const widths = await page.locator('.dev__ctas > *').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
  expect(widths.length).toBe(2);
  expect(Math.abs(widths[0] - widths[1])).toBeLessThan(1);
});

test('the gallery hint says swipe on a touch screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-hint]')).toContainText('swipe');
  await expect(page.locator('[data-hint]')).not.toContainText('drag');
});
