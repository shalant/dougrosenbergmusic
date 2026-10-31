import { test, expect } from '@playwright/test';

// Interaction-state pass, 2026-10-30. An audit that hovered and focused every
// interactive element on the four pages found accordion rows, inline links and
// form fields with no hover cue, and a keyboard-focus bug on the active Dev
// remote light (its glow rule came later in the CSS than the focus ring and
// replaced it). Hover tests are desktop-only: phones have no hover.
test.describe('hover and focus feedback', () => {
  test.skip(({ isMobile }) => isMobile, 'hover is a pointer feature');

  test('an accordion row answers the pointer: the + swells', async ({ page }) => {
    await page.goto('/');
    const summary = page.locator('.faq__item summary').first();
    const scale = () => summary.evaluate((el) => getComputedStyle(el, '::after').scale);
    await page.mouse.move(2, 2);
    expect(await scale()).toBe('none');
    await summary.scrollIntoViewIfNeeded();
    await summary.hover();
    await expect.poll(scale).not.toBe('none');
  });

  test('the archive year rows also answer the pointer', async ({ page }) => {
    await page.goto('/easternblok');
    const summary = page.locator('.year summary').first();
    await summary.scrollIntoViewIfNeeded();
    await summary.hover();
    await expect
      .poll(() => summary.evaluate((el) => getComputedStyle(el, '::after').scale))
      .not.toBe('none');
  });

  test('a plain inline link on the press page turns its underline brass and thicker on hover', async ({ page }) => {
    await page.goto('/press');
    await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
    const link = page.locator('main a:not([class])', { hasText: 'archived copy' }).first();
    await link.scrollIntoViewIfNeeded();
    await page.mouse.move(2, 2);
    const underline = () => link.evaluate((el) => getComputedStyle(el).textDecorationColor);
    expect(await underline()).not.toBe('rgb(207, 154, 79)');
    await link.hover();
    await expect.poll(underline).toBe('rgb(207, 154, 79)');
  });

  test('contact fields brighten their border on hover, and focus still wins', async ({ page }) => {
    await page.goto('/');
    const name = page.locator('#contact-form input[type="text"]:not([tabindex="-1"])').first();
    await name.scrollIntoViewIfNeeded();
    await page.mouse.move(2, 2);
    const rest = await name.evaluate((el) => getComputedStyle(el).borderTopColor);
    await name.hover();
    await expect.poll(() => name.evaluate((el) => getComputedStyle(el).borderTopColor)).not.toBe(rest);
    await name.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(name).toBeFocused();
    await expect.poll(() => name.evaluate((el) => getComputedStyle(el).borderTopColor)).toBe('rgb(207, 154, 79)');
  });
});

test('keyboard focus shows on the active Dev remote light', async ({ page }) => {
  await page.goto('/');
  const led = page.locator('.dev__remote-led.is-active');
  await led.scrollIntoViewIfNeeded();
  await led.evaluate((el) => (el as HTMLElement).focus({ focusVisible: true } as FocusOptions));
  // the white focus ring and the green active glow, both present (poll: box-shadow transitions)
  await expect
    .poll(() => led.evaluate((el) => getComputedStyle(el).boxShadow))
    .toMatch(/^(?=.*rgba\(255, 255, 255, 0\.6\))(?=.*rgb\(79, 184, 148)/);
});
