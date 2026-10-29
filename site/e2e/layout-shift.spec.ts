import { test, expect } from '@playwright/test';

// /easternblok scored a Lighthouse mobile layout shift of 0.10 (2026-10-29):
// the page painted in system fonts, and when Work Sans and Fraunces arrived
// the lead paragraph and "The story" section rewrapped and moved 25px. The
// causes were `62ch` column widths (a ch is the width of a "0" in whichever
// font is active) and fallback faces with different metrics from the web
// fonts.
//
// A timing test (delay the fonts, watch layout-shift entries) proved flaky:
// the same build shifted or didn't depending on which side of first paint the
// fonts landed. This measures the cause instead. It loads each page twice,
// once with the web fonts blocked (so only the fallback faces draw) and once
// with them, and compares where the first section sits. The gap between the
// two is how far the page jumps when the swap happens, whatever the timing.
// The rewrap depends on the exact width, so it runs at the two sizes
// Lighthouse measured, 412px mobile and 1350px desktop.
const sizes = [
  { width: 412, height: 823 },
  { width: 1350, height: 940 },
];

for (const size of sizes) {
  for (const path of ['/easternblok', '/press', '/easternblok/press']) {
    test(`${path} at ${size.width}px sits in the same place with fallback or web fonts`, async ({ browser, baseURL }) => {
      const measure = async (blockFonts: boolean) => {
        const context = await browser.newContext({ viewport: size, baseURL });
        const page = await context.newPage();
        if (blockFonts) await page.route('**/fonts/*.woff2', (route) => route.abort());
        await page.goto(path, { waitUntil: 'networkidle' });
        const top = await page.locator('.archive__section').first().evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
        await context.close();
        return top;
      };
      const withFallback = await measure(true);
      const withWebFonts = await measure(false);
      expect(Math.abs(withFallback - withWebFonts)).toBeLessThanOrEqual(8);
    });
  }
}
