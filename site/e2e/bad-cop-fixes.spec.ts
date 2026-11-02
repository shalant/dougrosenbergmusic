import { test, expect } from '@playwright/test';

// Bad-cop pass, 2026-11-01 (docs/ui-assessment-2026-10-24.md): the nav pill let
// text print through it, three name lists were walls of small type, every
// section sat on the same navy, the intro hugged the left edge, and the four
// albums were identical squares. Each test fails on the build before this change.

test.describe('desktop layout', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout');
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the nav pill is at least 75% opaque', async ({ page }) => {
    await page.goto('/');
    const bg = await page.locator('.staff-nav').evaluate((el) => getComputedStyle(el).backgroundColor);
    const alpha = Number(bg.match(/rgba\([^)]*,\s*([\d.]+)\)/)?.[1] ?? 1);
    expect(alpha).toBeGreaterThanOrEqual(0.75);
  });

  test('featured names are set large and every artist appears once', async ({ page }) => {
    await page.goto('/');
    const names = await page.locator('.performance__artists li').allTextContents();
    expect(new Set(names).size).toBe(names.length);
    expect(names).toHaveLength(34);
    const featured = await page.locator('.performance__artists-feature li').first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(featured).toBeGreaterThanOrEqual(24);
    const chicago = await page.locator('.performance__venue-list--marquee li').first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(chicago).toBeGreaterThanOrEqual(20);
    const school = await page.locator('.career-highlights__feature li').first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(school).toBeGreaterThanOrEqual(20);
  });

  test('the About band has its own background', async ({ page }) => {
    await page.goto('/');
    const bg = (sel: string) => page.locator(sel).evaluate((el) => getComputedStyle(el).backgroundColor);
    const about = await bg('#about');
    expect(about).not.toBe(await bg('#listen'));
    expect(about).not.toBe(await bg('#performance'));
  });

  test('the intro lede spans most of the content width', async ({ page }) => {
    await page.goto('/');
    const width = await page.locator('.intro__text').evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeGreaterThanOrEqual(800);
  });

  test('the debut album leads, wider than the other three', async ({ page }) => {
    await page.goto('/');
    const widths = await page.locator('#listen .album__cover').evaluateAll((imgs) => imgs.map((i) => i.getBoundingClientRect().width));
    expect(widths).toHaveLength(4);
    expect(widths[0]).toBeGreaterThan(widths[1] * 1.4);
    expect(Math.abs(widths[1] - widths[2])).toBeLessThan(2);
  });

  // 2026-11-01, second pass: in one 4-column row the tall lead left ~250px of
  // empty space under the other three. They now stack beside it.
  test('the three small albums end level with the lead, no dead space under them', async ({ page }) => {
    await page.goto('/');
    const bottoms = await page.locator('#listen .album').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().bottom));
    expect(bottoms).toHaveLength(4);
    expect(Math.abs(bottoms[0] - bottoms[3])).toBeLessThan(40);
  });
});
