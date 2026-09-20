import { test, expect } from '@playwright/test';

test.describe('desktop staff nav', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop-only nav bar');

  test('clicking a note scrolls the matching section into view', async ({ page }) => {
    await page.goto('/');
    await page.locator('.staff-nav__note[data-target="contact"]').click();
    await expect(page.locator('#contact')).toBeInViewport();
  });

  test('the Dev note scroll-jumps to the dev section instead of leaving the page', async ({ page }) => {
    await page.goto('/');
    await page.locator('.staff-nav__note[data-target="dev"]').click();
    await expect(page.locator('#dev')).toBeInViewport();
  });

  test('the active note tracks scroll position', async ({ page }) => {
    await page.goto('/');
    // Only dev/listen/about/career-highlights/contact have a corresponding nav
    // note - hero/performance/sheet-music/gallery are real sections but
    // aren't linked from the corner nav.
    await page.locator('#career-highlights').scrollIntoViewIfNeeded();
    // IntersectionObserver needs a beat to fire after the programmatic scroll.
    await expect(page.locator('.staff-nav__note[data-target="career-highlights"]')).toHaveClass(/is-active/, {
      timeout: 3000,
    });
  });
});

test.describe('mobile hamburger nav', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only hamburger');

  test('toggle opens the menu, a jump link closes it and scrolls', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('[data-menu-toggle]');
    const panel = page.locator('[data-menu-panel]');

    await expect(panel).toBeHidden();
    await toggle.click();
    await expect(panel).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.locator('.staff-menu__item[data-target="about"]').click();
    await expect(panel).toBeHidden();
    await expect(page.locator('#about')).toBeInViewport();
  });

  test('the Dev item in the mobile menu scroll-jumps to the dev section, same as the others', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu-toggle]').click();
    await page.locator('.staff-menu__item[data-target="dev"]').click();
    await expect(page.locator('[data-menu-panel]')).toBeHidden();
    await expect(page.locator('#dev')).toBeInViewport();
  });
});
