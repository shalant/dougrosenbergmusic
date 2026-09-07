import { test, expect } from '@playwright/test';

test.describe('desktop staff nav', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop-only nav bar');

  test('clicking a note scrolls the matching section into view', async ({ page }) => {
    await page.goto('/');
    await page.locator('.staff-nav__note[data-target="contact"]').click();
    await expect(page.locator('#contact')).toBeInViewport();
  });

  test('the active note tracks scroll position', async ({ page }) => {
    await page.goto('/');
    // Only hero/listen/about/credibility/contact have a corresponding nav
    // note - performance/sheet-music/gallery are real sections but aren't
    // linked from the corner nav.
    await page.locator('#credibility').scrollIntoViewIfNeeded();
    // IntersectionObserver needs a beat to fire after the programmatic scroll.
    await expect(page.locator('.staff-nav__note[data-target="credibility"]')).toHaveClass(/is-active/, {
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

  test('the Dev link in the mobile menu navigates away, not a scroll jump', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu-toggle]').click();
    const devLink = page.locator('.staff-menu__item.note--dev');
    await expect(devLink).toHaveAttribute('href', 'https://dougrosenbergdev.com');
  });
});
