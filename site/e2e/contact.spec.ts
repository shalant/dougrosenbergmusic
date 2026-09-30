import { test, expect } from '@playwright/test';

test.describe('contact form', () => {
  test('a successful send resets the form, jumps to the top, and shows a toast', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
    await page.goto('/');
    await page.locator('#contact-form').scrollIntoViewIfNeeded();
    await page.fill('#contact-name', 'Test Person');
    await page.fill('#contact-email', 'test@example.com');
    await page.fill('#contact-message', 'Hello there');
    await page.click('.contact__submit');

    const toast = page.locator('#contact-toast');
    await expect(toast).toContainText('Message sent');
    await expect(toast).toBeVisible();
    await expect(page.locator('#contact-name')).toHaveValue('');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  });

  test('a failed send keeps the visitor at the form with an inline error and no toast', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 502, contentType: 'application/json', body: '{"error":"Message could not be sent right now"}' }));
    await page.goto('/');
    await page.locator('#contact-form').scrollIntoViewIfNeeded();
    await page.fill('#contact-name', 'Test Person');
    await page.fill('#contact-email', 'test@example.com');
    await page.fill('#contact-message', 'Hello there');
    await page.click('.contact__submit');

    await expect(page.locator('#contact-form-status')).toContainText('could not be sent');
    await expect(page.locator('#contact-toast')).not.toHaveClass(/toast--visible/);
    await expect(page.locator('#contact-name')).toHaveValue('Test Person');
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
  });

  test('the whole form fits on screen below the fixed header when scrolled into view', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.querySelector('#contact-name')!.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.waitForTimeout(300);
    const viewport = page.viewportSize()!;
    const name = await page.locator('#contact-name').boundingBox();
    const submit = await page.locator('.contact__submit').boundingBox();
    // Clear of the fixed logo/menu bar (~75px tall)...
    expect(name!.y).toBeGreaterThanOrEqual(80);
    // ...and the submit button is on screen with the form's top - only asserted
    // on real phone heights, where the point of the compact layout is that
    // nothing in the form is cut off.
    if (viewport.width <= 640 && viewport.height >= 800) {
      expect(submit!.y + submit!.height).toBeLessThanOrEqual(viewport.height);
    }
  });
});
