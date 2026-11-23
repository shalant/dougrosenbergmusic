import { test, expect } from '@playwright/test';

// The bigger motion round (2026-11-17). See docs/style-guide.md "Motion":
// - section headings clip-and-rise on scroll, never inside another reveal;
// - the hero photo drifts slower than the page in dark, with no gap ever;
// - call-to-action buttons lean toward a real pointer and ease home.

const HEADINGS = ['.listen__heading', '.faq__heading', '.contact__heading', '.performance__heading', '.career-highlights__title'];

test.describe('heading reveal', () => {
  test('each section heading reveals when motion is allowed and not otherwise', async ({ browser }) => {
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      const ctx = await browser.newContext({ reducedMotion });
      const page = await ctx.newPage();
      await page.goto('/');
      // Scroll-linked, so mouse-and-screen devices only (2026-11-19).
      const fine = await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches);
      for (const sel of HEADINGS) {
        const name = await page.locator(sel).first().evaluate((el) => getComputedStyle(el).animationName);
        if (reducedMotion === 'reduce' || !fine) expect(name, sel).toBe('none');
        else expect(name, sel).toContain('heading-reveal');
      }
      await ctx.close();
    }
  });

  test('a revealing heading is never inside another reveal, or the two would stack', async ({ page }) => {
    await page.goto('/');
    const nested = await page.locator('.heading-reveal').evaluateAll((els) => els.filter((el) => el.closest('.scroll-rise')).length);
    expect(nested).toBe(0);
  });

  test('a heading is fully visible once it is scrolled into the middle of the screen', async ({ page }) => {
    await page.goto('/');
    for (const sel of HEADINGS) {
      const el = page.locator(sel).first();
      await el.evaluate((node) => node.scrollIntoView({ block: 'center' }));
      await expect.poll(() => el.evaluate((n) => getComputedStyle(n).opacity), { message: sel }).toBe('1');
    }
  });
});

test.describe('hero parallax', () => {
  test('the photo drifts as the hero scrolls away, and a gap never shows', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'dark', reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto('/');
    // The drift is for a mouse-and-screen device only (see the touch test below).
    if (!(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches))) test.skip(true, 'touch-emulating project');
    const photo = page.locator('.hero__photo');
    expect(await photo.evaluate((el) => getComputedStyle(el).animationName)).toContain('hero-drift');
    for (const y of [0, 300, 600, 890]) {
      await page.evaluate((to) => window.scrollTo(0, to), y);
      await page.waitForTimeout(150);
      const { photoTop, photoBottom, heroTop, heroBottom } = await page.evaluate(() => {
        const p = document.querySelector('.hero__photo')!.getBoundingClientRect();
        const h = document.querySelector('.hero')!.getBoundingClientRect();
        return { photoTop: p.top, photoBottom: p.bottom, heroTop: h.top, heroBottom: h.bottom };
      });
      expect(photoTop, `scrolled ${y}`).toBeLessThanOrEqual(heroTop + 0.5);
      expect(photoBottom, `scrolled ${y}`).toBeGreaterThanOrEqual(heroBottom - 0.5);
    }
    await page.evaluate(() => window.scrollTo(0, 450));
    await expect.poll(() => photo.evaluate((el) => getComputedStyle(el).translate)).not.toMatch(/^(none|0px( 0px)?)$/);
    await ctx.close();
  });

  // 2026-11-21: Doug felt the scroll off the hero was twitchy on his phone
  // (the rest of the page was fine). The drift scales and shifts a full-screen
  // photo on every scrolled frame, and 100dvh resized the hero as the address
  // bar collapsed. On touch the photo holds still and the hero keeps one height.
  test('on a touch device the photo does not drift and the hero does not resize with the address bar', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'dark', reducedMotion: 'no-preference', viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto('/?fx=full');
    expect(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)).toBe(false);
    expect(await page.locator('.hero__photo').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
    const css = await page.evaluate(() =>
      [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules].map((r) => r.cssText); } catch { return []; } }).join('\n')
    );
    expect(css).not.toMatch(/\.hero\b[^}]*min-height:\s*100dvh/);
    await ctx.close();
  });

  test('light theme and reduced motion keep the photo still', async ({ browser }) => {
    const light = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference' });
    const lp = await light.newPage();
    await lp.goto('/');
    expect(await lp.locator('.hero__photo').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
    await light.close();
    const still = await browser.newContext({ colorScheme: 'dark', reducedMotion: 'reduce' });
    const sp = await still.newPage();
    await sp.goto('/');
    expect(await sp.locator('.hero__photo').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
    await still.close();
  });
});

test.describe('magnetic buttons', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop pointer');

  test('a button leans toward the pointer when it is near and eases home when it leaves', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('.hero__ctas .cta').first();
    const box = (await cta.boundingBox())!;
    const home = await cta.evaluate((el) => el.getBoundingClientRect().x);
    // Barely-there (2026-11-22): leans at most 3px, from 40px away.
    await page.mouse.move(box.x + box.width + 20, box.y + box.height / 2);
    await expect.poll(() => cta.evaluate((el) => parseFloat(el.style.getPropertyValue('--mx') || '0'))).toBeGreaterThan(1.5);
    expect(await cta.evaluate((el) => parseFloat(el.style.getPropertyValue('--mx') || '0'))).toBeLessThanOrEqual(3.01);
    expect(await cta.evaluate((el) => el.getBoundingClientRect().x)).toBeGreaterThan(home + 0.5);
    await page.mouse.move(box.x + box.width + 60, box.y + box.height / 2);
    await expect.poll(() => cta.evaluate((el) => parseFloat(el.style.getPropertyValue('--mx') || '0'))).toBe(0);
    await page.mouse.move(box.x + box.width + 20, box.y + box.height / 2);
    await expect.poll(() => cta.evaluate((el) => parseFloat(el.style.getPropertyValue('--mx') || '0'))).toBeGreaterThan(1.5);
    await page.mouse.move(box.x + box.width / 2, box.y + 600);
    await expect.poll(() => cta.evaluate((el) => parseFloat(el.style.getPropertyValue('--mx') || '0'))).toBe(0);
  });

  test('it never leans under reduced motion', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    const cta = page.locator('.hero__ctas .cta').first();
    const box = (await cta.boundingBox())!;
    await page.mouse.move(box.x + box.width + 40, box.y + box.height / 2);
    await page.waitForTimeout(400);
    expect(await cta.evaluate((el) => el.style.getPropertyValue('--mx'))).toBe('');
    await ctx.close();
  });
});
