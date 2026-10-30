import { test, expect } from '@playwright/test';

// Home mobile Lighthouse sat at 86-88 (LCP 3.4s), under the 0.9 gate, because
// the hero photo (the LCP element) shared bandwidth with images far below the
// fold. Marking the hero photo high priority and lazy-loading the Dev carousel's
// first screenshot (94KB, several screens down) took it to 92-93 (LCP 2.8s) on
// 2026-10-29. This pins both attributes so a refactor can't quietly undo them.
test('the hero photo is high priority and the below-the-fold Dev screenshot is lazy', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero__photo')).toHaveAttribute('fetchpriority', 'high');
  await expect(page.locator('#dev-screen-img')).toHaveAttribute('loading', 'lazy');
});
