import { test, expect } from '@playwright/test';

// Light theme brass buttons (2026-11-22, Doug picked "Brass"). Light gets a lit brass
// primary and a brass outline secondary; dark keeps the green; focus keeps its ring.

const theme = (page: import('@playwright/test').Page, t: 'light' | 'dark') => page.addInitScript((v) => localStorage.setItem('theme', v), t);

test('light: the hero primary is brass with a cream label, the secondary a brass outline', async ({ page }) => {
  await theme(page, 'light');
  await page.goto('/');
  const s = await page.locator('.hero__ctas .cta-primary').evaluate((el) => ({ bg: getComputedStyle(el).backgroundImage, color: getComputedStyle(el).color }));
  expect(s.bg).toContain('linear-gradient');
  expect(s.color).toBe('rgb(255, 250, 240)');
  const sec = await page.locator('.hero__ctas .cta-secondary').evaluate((el) => ({ color: getComputedStyle(el).color, border: getComputedStyle(el).borderTopColor }));
  expect(sec.color).toBe('rgb(138, 85, 20)');
  expect(sec.border).toBe('rgb(138, 85, 20)');
});

test('light: keyboard focus keeps a visible ring on the brass button', async ({ page }) => {
  await theme(page, 'light');
  await page.goto('/');
  await page.locator('.hero__ctas .cta-primary').focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  const shadow = await page.locator('.hero__ctas .cta-primary').evaluate((el) => getComputedStyle(el).boxShadow);
  expect(shadow).toMatch(/0px 0px 0px 3px/);
});

test('light: the contact Send button matches', async ({ page }) => {
  await theme(page, 'light');
  await page.goto('/');
  const bg = await page.locator('.contact__submit').evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(bg).toContain('linear-gradient');
});

test('dark: the primary stays the green', async ({ page }) => {
  await theme(page, 'dark');
  await page.goto('/');
  const s = await page.locator('.hero__ctas .cta-primary').evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, img: getComputedStyle(el).backgroundImage }));
  expect(s.img).toBe('none');
  expect(s.bg).toBe('rgb(82, 209, 166)');
});

test('light: the Dev section keeps its own red primary', async ({ page }) => {
  await theme(page, 'light');
  await page.goto('/');
  const bg = await page.locator('.dev__ctas .cta-primary').evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(bg).toBe('none');
});
