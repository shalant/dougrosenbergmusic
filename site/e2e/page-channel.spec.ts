import { test, expect } from '@playwright/test';

// Changing page = changing channel (2026-11-19). A press on a link to another
// page cuts to static, then the new page opens under the static and clears it.
// See src/components/PageChannel.astro.

test.describe('page change', () => {
  test('a link to another page cuts to static, lands, and clears with a channel label', async ({ page }) => {
    await page.goto('/press');
    await page.evaluate(() => {
      (window as any).__sawStatic = false;
      new MutationObserver(() => {
        if (document.querySelector('.channel-static')) (window as any).__sawStatic = true;
      }).observe(document.body, { childList: true });
    });
    await page.locator('.logo').click();
    await expect.poll(() => page.evaluate(() => (window as any).__sawStatic)).toBe(true);
    await page.waitForURL((u) => u.pathname === '/' || u.pathname === '/index.html');

    // The new page opens with the static already up, labelled, then clears.
    await expect(page.locator('.channel-osd')).toContainText('CH 03');
    await expect(page.locator('.channel-osd')).toContainText('HOME');
    await expect(page.locator('html')).not.toHaveClass(/channel-arriving/, { timeout: 4000 });
  });

  test('the arriving page paints static before its own content', async ({ page }) => {
    await page.goto('/press');
    await page.evaluate(() => sessionStorage.setItem('channel-in', String(Date.now())));
    await page.goto('/');
    // Straight after load the flag is consumed and the class is on (or already
    // clearing), never left behind.
    expect(await page.evaluate(() => sessionStorage.getItem('channel-in'))).toBeNull();
    await expect(page.locator('html')).not.toHaveClass(/channel-arriving/, { timeout: 4000 });
  });

  test('a stale hand-off flag does not draw static', async ({ page }) => {
    await page.goto('/press');
    await page.evaluate(() => sessionStorage.setItem('channel-in', String(Date.now() - 60000)));
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/channel-arriving/);
  });

  test('a jump within the same page is left to the smooth scroll', async ({ page }) => {
    await page.goto('/');
    await page.locator('.logo').click();
    await page.waitForTimeout(300);
    expect(await page.locator('.channel-static').count()).toBe(0);
    expect(await page.evaluate(() => sessionStorage.getItem('channel-in'))).toBeNull();
  });

  test('a modified click and an outside link are left alone', async ({ page }) => {
    await page.goto('/press');
    await page.evaluate(() => {
      const a = document.createElement('a');
      a.id = 'probe-ext';
      a.href = 'https://example.com/';
      a.textContent = 'x';
      document.body.append(a);
      document.addEventListener('click', (e) => e.preventDefault(), true);
    });
    // preventDefault above cancels the real navigation so this stays on the page.
    await page.locator('#probe-ext').click();
    await page.locator('.logo').click({ modifiers: ['Control'] });
    await page.waitForTimeout(300);
    expect(await page.locator('.channel-static').count()).toBe(0);
  });
});

test('reduced motion: a link just navigates, with no static', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/press');
  await page.locator('.logo').click();
  await page.waitForURL((u) => u.pathname === '/' || u.pathname === '/index.html');
  expect(await page.locator('.channel-static').count()).toBe(0);
  await expect(page.locator('html')).not.toHaveClass(/channel-arriving/);
  await ctx.close();
});
