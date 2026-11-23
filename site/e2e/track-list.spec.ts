import { test, expect } from '@playwright/test';

// The Listen section's "Hear it" track list (2026-11-22): plain play buttons for the
// tracks, driving the same player as the hero's bell. It renders only when audio
// exists in the build; the tests skip themselves otherwise.

const has = async (page: import('@playwright/test').Page) => (await page.locator('.hear__row').count()) > 0;

test('no audio: the Listen section is just the records (no list, no player)', async ({ page }) => {
  await page.goto('/');
  if (await has(page)) test.skip(true, 'audio is present in this build');
  await expect(page.locator('.hear')).toHaveCount(0);
  await expect(page.locator('.album').first()).toBeVisible();
});

test('the list shows the three tracks with their real lengths and a buy link', async ({ page }) => {
  await page.goto('/');
  if (!(await has(page))) test.skip(true, 'no audio in this build');
  const rows = page.locator('.hear__row');
  await expect(rows).toHaveCount(3);
  await expect(page.locator('.hear__name')).toHaveText(['Better Than TV', 'Mato Grosso', 'Dirty Basement Jazz']);
  await expect(page.locator('.hear__time')).toHaveText(['6:57', '5:57', '7:27']);
  await expect(rows.first()).toHaveAttribute('aria-label', 'Play Better Than TV, 6:57');
  const buy = page.locator('.hear__buy');
  await expect(buy).toHaveAttribute('href', /amazon\.com\/dp\/B00G9Y8TPE/);
  await expect(buy).toHaveAttribute('rel', /noopener/);
});

test('pressing a track plays it in the shared player, and pressing again pauses', async ({ page }) => {
  await page.goto('/');
  if (!(await has(page))) test.skip(true, 'no audio in this build');
  const rows = page.locator('.hear__row');
  await expect(page.locator('.bellp-bar')).toBeHidden();
  await rows.nth(1).click();
  await expect(page.locator('.bellp-bar')).toBeVisible();
  await expect(page.locator('.bellp-bar__title')).toHaveText('Mato Grosso');
  await expect(rows.nth(1)).toHaveAttribute('data-playing', '');
  await expect(rows.nth(1)).toHaveAttribute('aria-label', /^Pause Mato Grosso/);
  await expect(rows.nth(0)).not.toHaveAttribute('data-playing', '');
  await expect.poll(() => page.evaluate(() => document.querySelector('.bellp-bar [data-cur]')?.textContent), { timeout: 8000 }).not.toBe('0:00');
  // the bell and the bar agree
  await expect(page.locator('.bellp-layer')).toHaveAttribute('data-playing', '');
  await rows.nth(1).click();
  await expect(rows.nth(1)).not.toHaveAttribute('data-playing', '');
  await expect(rows.nth(1)).toHaveClass(/is-current/);
  await expect(rows.nth(1)).toHaveAttribute('aria-label', /^Play Mato Grosso/);
});

test('pressing another track switches to it, and the bar controls update the list', async ({ page }) => {
  await page.goto('/');
  if (!(await has(page))) test.skip(true, 'no audio in this build');
  const rows = page.locator('.hear__row');
  await rows.nth(0).click();
  await expect(rows.nth(0)).toHaveAttribute('data-playing', '');
  await rows.nth(2).click();
  await expect(page.locator('.bellp-bar__title')).toHaveText('Dirty Basement Jazz');
  await expect(rows.nth(2)).toHaveAttribute('data-playing', '');
  await expect(rows.nth(0)).not.toHaveAttribute('data-playing', '');
  await page.locator('[data-act="toggle"]').click();
  await expect(rows.nth(2)).not.toHaveAttribute('data-playing', '');
  await page.locator('[data-act="close"]').click();
  await expect(page.locator('.hear__row.is-current')).toHaveCount(0);
});

test('the list is keyboard operable and every row is a tappable size', async ({ page }) => {
  await page.goto('/');
  if (!(await has(page))) test.skip(true, 'no audio in this build');
  const row = page.locator('.hear__row').first();
  await row.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.bellp-bar')).toBeVisible();
  await expect(row).toHaveAttribute('data-playing', '');
  for (const r of await page.locator('.hear__row').all()) {
    const b = (await r.boundingBox())!;
    expect(b.height).toBeGreaterThanOrEqual(44);
  }
});
