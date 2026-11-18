import { test, expect } from '@playwright/test';

// Micro-interactions (2026-11-17). See docs/style-guide.md "Motion" for the
// rules these check:
// - every home section has a scroll reveal (.scroll-rise; Recordings, Lessons
//   subjects and FAQ rows cascade), off under
//   reduced motion, and never leaves content hidden at rest;
// - a press squeezes an accordion's "+" (the :active rule beats :hover);
// - the contact status message eases in;
// - links ease their underline instead of snapping.

const REVEALS = ['.about__body', '.album', '.lessons__body', '.lessons__subjects li', '.faq__item', '.gallery__head'];

// The Contact form deliberately has no reveal: a form that is shifted while it
// scrolls into view makes focus and scroll-to-field land under the fixed
// header, and a scale would shrink its tap targets (2026-11-17).

test.describe('scroll reveals', () => {
  test('each home section has a reveal that runs when motion is allowed', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    await page.goto('/');
    for (const sel of REVEALS) {
      const name = await page.locator(sel).first().evaluate((el) => getComputedStyle(el).animationName);
      expect(name, sel).toContain('scroll-rise');
    }
    await ctx.close();
  });

  test('reduced motion turns every reveal off', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    for (const sel of REVEALS) {
      const name = await page.locator(sel).first().evaluate((el) => getComputedStyle(el).animationName);
      expect(name, sel).toBe('none');
    }
    await ctx.close();
  });

  test('a revealed block is fully visible once it is scrolled into the middle of the screen', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    await page.goto('/');
    for (const sel of REVEALS) {
      const el = page.locator(sel).first();
      await el.evaluate((node) => node.scrollIntoView({ block: 'center' }));
      await expect.poll(() => el.evaluate((n) => getComputedStyle(n).opacity), { message: sel }).toBe('1');
    }
    await ctx.close();
  });
});

test.describe('press and message feedback', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop pointer');


  test('an album cover tilts toward the pointer and settles flat when it leaves', async ({ page }) => {
    await page.goto('/');
    const album = page.locator('#listen .album').first();
    const art = album.locator('.album__art');
    await album.scrollIntoViewIfNeeded();
    const flat = await art.evaluate((el) => getComputedStyle(el).transform);
    const box = (await art.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.15);
    await expect.poll(() => art.evaluate((el) => getComputedStyle(el).transform)).not.toBe(flat);
    expect(await album.evaluate((el) => el.style.getPropertyValue('--tx'))).not.toBe('');
    await page.mouse.move(box.x - 60, box.y - 60);
    await expect.poll(() => album.evaluate((el) => el.style.getPropertyValue('--tx'))).toBe('');
  });

  test('pressing an FAQ row squeezes its "+"', async ({ page }) => {
    await page.goto('/');
    const row = page.locator('.faq__item summary').first();
    await row.scrollIntoViewIfNeeded();
    await row.hover();
    await page.mouse.down();
    await expect.poll(() => row.evaluate((el) => getComputedStyle(el, '::after').scale)).toBe('0.8');
    await page.mouse.up();
  });

  test('the contact status message eases in when it appears', async ({ page }) => {
    await page.goto('/');
    const status = page.locator('#contact-form-status');
    expect(await status.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
    await status.evaluate((el) => {
      el.textContent = 'Please enter your name.';
    });
    expect(await status.evaluate((el) => getComputedStyle(el).animationName)).toContain('status-in');
  });

  test('links ease their underline color and thickness', async ({ page }) => {
    await page.goto('/press');
    const prop = await page.locator('main a').first().evaluate((el) => getComputedStyle(el).transitionProperty);
    expect(prop).toContain('text-decoration-color');
    expect(prop).toContain('text-decoration-thickness');
  });
});
