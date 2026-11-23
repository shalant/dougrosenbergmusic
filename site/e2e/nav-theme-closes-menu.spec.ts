import { test, expect } from '@playwright/test';

// The mobile menu closes after the light/dark switch inside it is pressed (2026-11-22,
// Doug on his phone: the menu stayed open over the page he had just changed). The theme
// still changes, and the menu still works as before afterwards.

test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'the menu panel is the phone nav');

  test('pressing the light/dark switch changes the theme and closes the menu', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('[data-menu-toggle]');
    const panel = page.locator('[data-menu-panel]');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const before = await page.evaluate(() => document.documentElement.dataset.theme);
    await panel.locator('[data-theme-toggle]').click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).not.toBe(before);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).not.toHaveClass(/is-open/);
    await expect(panel).toHaveAttribute('aria-hidden', 'true');
  });

  test('the menu can be opened again and still jumps to a section', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('[data-menu-toggle]');
    await toggle.click();
    await page.locator('[data-menu-panel] [data-theme-toggle]').click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.locator('.staff-menu__item[data-target="contact"]').click();
    await expect(page.locator('#contact')).toBeInViewport();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
