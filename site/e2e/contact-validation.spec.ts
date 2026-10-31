import { test, expect } from '@playwright/test';

// A failed contact-form validation used to show one line of text and leave the
// cursor wherever it was. Now it marks each field that needs fixing
// (aria-invalid, red border), puts the cursor in the first, and catches a
// malformed email before the round trip (2026-10-30).
test.describe('contact form validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/contact', (route) => {
      throw new Error('a form that failed validation must not reach the server');
    });
    await page.goto('/');
    await page.locator('#contact-form').scrollIntoViewIfNeeded();
  });

  test('submitting an empty form marks all three fields and focuses the first', async ({ page }) => {
    await page.locator('.contact__submit').click();
    for (const id of ['name', 'email', 'message']) {
      await expect(page.locator(`#contact-${id}`)).toHaveAttribute('aria-invalid', 'true');
    }
    await expect(page.locator('#contact-name')).toBeFocused();
    await expect(page.locator('#contact-form-status')).toHaveText('Please fill in your name, email, and message.');
  });

  test('typing in a marked field clears only that field', async ({ page }) => {
    await page.locator('.contact__submit').click();
    await page.locator('#contact-name').fill('Pat');
    await expect(page.locator('#contact-name')).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#contact-email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('a malformed email is caught on the page and the email field is focused', async ({ page }) => {
    await page.locator('#contact-name').fill('Pat');
    await page.locator('#contact-email').fill('not-an-email');
    await page.locator('#contact-message').fill('Hello');
    await page.locator('.contact__submit').click();
    await expect(page.locator('#contact-email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#contact-email')).toBeFocused();
    await expect(page.locator('#contact-name')).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#contact-form-status')).toContainText('email address');
  });

  test('a marked field keeps its red border while it has focus', async ({ page }) => {
    await page.locator('.contact__submit').click();
    await expect(page.locator('#contact-name')).toBeFocused();
    await expect
      .poll(() => page.locator('#contact-name').evaluate((el) => getComputedStyle(el).borderTopColor))
      .toBe('rgb(224, 95, 106)');
  });
});
