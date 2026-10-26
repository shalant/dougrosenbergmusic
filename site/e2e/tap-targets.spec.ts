import { test, expect } from '@playwright/test';

// Tap targets that measured under size on a phone in the 2026-10-16 audit.
// Each is grown with padding (or an invisible ::before) that leaves the
// visual layout unchanged, so these check the hit area, not the look.
test.describe('phone tap targets', () => {
  test.skip(({ isMobile }) => !isMobile, 'touch sizes');

  test('dev reel channel lights take a tap anywhere in a 24x44 area', async ({ page }) => {
    await page.goto('/');
    await page.locator('.dev__remote').scrollIntoViewIfNeeded();
    // elementFromPoint, not the bounding box: the extension is a pseudo-element.
    const hits = await page.locator('.dev__remote-led').evaluateAll((leds) =>
      leds.map((led) => {
        const r = led.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        return [-20, 0, 20].every((dy) => document.elementFromPoint(x, y + dy) === led);
      })
    );
    expect(hits.length).toBe(7);
    expect(hits.every(Boolean)).toBe(true);
  });

  // A seventh channel (2026-10-25) made the remote wider than the preview
  // on a 320px screen; its left arrow sat off screen.
  test('the dev remote stays on screen at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/');
    await page.locator('.dev__remote').scrollIntoViewIfNeeded();
    const box = await page.locator('.dev__remote').boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  });

  test('/easternblok Listen links are at least 44px tall', async ({ page }) => {
    await page.goto('/easternblok');
    await page.locator('summary', { hasText: '2006' }).click();
    const box = await page.locator('.gig__listen').first().boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  });

  test('press outlet links clear the 24px minimum', async ({ page }) => {
    await page.goto('/');
    const heights = await page.locator('.ledger__cite a').evaluateAll((links) =>
      links.map((a) => a.getBoundingClientRect().height)
    );
    expect(heights.length).toBeGreaterThan(0);
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(24);
  });
});
