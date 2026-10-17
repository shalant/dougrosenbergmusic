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

  test('the Lessons note jumps to the lessons section and the contact link still follows it', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.staff-nav__note')).toHaveCount(6);
    await page.locator('.staff-nav__note[data-target="lessons"]').click();
    await expect(page.locator('#lessons')).toBeInViewport();
    await expect(page.locator('#lessons h2')).toHaveText('Private lessons');
    await page.locator('#lessons .lessons__cta').click();
    await expect(page.locator('#contact')).toBeInViewport();
  });

  test('the active note tracks scroll position', async ({ page }) => {
    await page.goto('/');
    // Only dev/listen/about/career-highlights/lessons/contact have a corresponding nav
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

// The fixed logo + hamburger used to sit over body text all the way down the
// page on phones (2026-10-16 audit). They now slide away while scrolling down
// and come back on any scroll up. Only the visitor's own scrolling hides
// them, so each scroll here is preceded by the touchmove a finger drag sends.
async function scrollToY(page: import('@playwright/test').Page, y: number) {
  await page.evaluate((top) => {
    window.dispatchEvent(new Event('touchmove'));
    window.scrollTo(0, top);
  }, y);
}

test.describe('mobile header hides while scrolling down', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only behavior');

  for (const path of ['/', '/easternblok']) {
    test(`logo slides out on scroll down and back on scroll up (${path})`, async ({ page }) => {
      await page.goto(path);
      const logo = page.locator('.logo');
      await expect(logo).toBeInViewport();

      await scrollToY(page, 300);
      await scrollToY(page, 1200);
      await expect(logo).not.toBeInViewport();

      await page.evaluate(() => window.scrollBy(0, -200));
      await expect(logo).toBeInViewport();
    });
  }

  test('a CTA jump down the page leaves the header visible', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[data-cta="dev-primary"]').click();
    await expect(page.locator('#contact')).toBeInViewport();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-menu-toggle]')).toBeInViewport();
    await expect(page.locator('html')).not.toHaveClass(/chrome-hidden/);
  });

  test('the menu toggle hides with the logo and stays put while the menu is open', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('[data-menu-toggle]');

    await scrollToY(page, 300);
    await scrollToY(page, 1200);
    await expect(toggle).not.toBeInViewport();

    await page.evaluate(() => window.scrollBy(0, -200));
    await expect(toggle).toBeInViewport();
    await toggle.click();
    await scrollToY(page, 2000);
    await expect(toggle).toBeInViewport();
    await expect(page.locator('[data-menu-panel]')).toBeVisible();
  });
});

test.describe('desktop header stays fixed', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop-only');

  test('the logo ignores the scroll-hide state at desktop widths', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.evaluate(() => document.documentElement.classList.add('chrome-hidden'));
    await page.waitForTimeout(400);
    await expect(page.locator('.logo')).toBeInViewport();
  });
});
