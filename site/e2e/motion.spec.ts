import { test, expect } from '@playwright/test';

// Motion pass (2026-10-17): fewer idle loops, hover movement only where
// hover is real, and scroll reveals on the sections that had no motion.

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop pointer');

  test('only the active staff-nav note loops; the rest sit still', async ({ page }) => {
    await page.goto('/');
    await page.locator('#career-highlights').scrollIntoViewIfNeeded();
    const active = page.locator('.staff-nav__note[data-target="career-highlights"]');
    await expect(active).toHaveClass(/is-active/, { timeout: 3000 });

    const names = await page.locator('.staff-nav__note:not(.is-active) .staff-nav__blob').evaluateAll((blobs) =>
      blobs.map((b) => getComputedStyle(b).animationName)
    );
    expect(names.length).toBeGreaterThan(0);
    expect(new Set(names)).toEqual(new Set(['none']));
    expect(await active.locator('.staff-nav__blob').evaluate((b) => getComputedStyle(b).animationName)).toBe('breathe-active');
  });

  test('a still nav note answers the pointer instead', async ({ page }) => {
    await page.goto('/');
    const note = page.locator('.staff-nav__note[data-target="contact"]');
    await note.hover();
    await expect.poll(() => note.locator('.staff-nav__blob').evaluate((b) => getComputedStyle(b).scale)).toBe('1.1');
  });

  test('hover movement still works with a mouse', async ({ page }) => {
    await page.goto('/');
    const album = page.locator('#listen .album').first();
    await album.hover();
    await expect.poll(() => album.evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
  });

  test('a Lessons subject keeps its place on hover; only its dot moves', async ({ page }) => {
    await page.goto('/');
    const item = page.locator('.lessons__subjects li').first();
    const before = await item.evaluate((el) => getComputedStyle(el).paddingLeft);
    await item.hover();
    await expect.poll(() => item.locator('.lessons__dot').evaluate((d) => getComputedStyle(d).scale)).toBe('1.35');
    expect(await item.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe(before);
  });

  test('footer social underlines grow in on hover', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('.site-footer__socials a').first();
    const underline = () => link.evaluate((el) => getComputedStyle(el, '::after').scale);
    expect(await underline()).toBe('0 1');
    await link.hover();
    await expect.poll(underline).toBe('1');
  });
});

test.describe('touch', () => {
  test.skip(({ isMobile }) => !isMobile, 'touch device');

  // On a phone :hover sticks to the last thing tapped, so hover movement
  // would stay stuck on. Playwright's hover() still sets :hover here, which
  // is exactly the sticky state being guarded against.
  test('hover movement is off where there is no real hover', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => matchMedia('(hover: hover)').matches)).toBe(false);
    for (const sel of ['#listen .album', '.hero .cta-primary', '.logo']) {
      const el = page.locator(sel).first();
      await el.hover();
      await page.waitForTimeout(400);
      expect(await el.evaluate((n) => getComputedStyle(n).transform), sel).toBe('none');
    }
  });
});

test('Highlights, Performance and press rows use the shared scroll reveal and end fully visible', async ({ page }) => {
  await page.goto('/');
  const supported = await page.evaluate(() => CSS.supports('animation-timeline: view()'));
  for (const sel of ['.career-highlights__block', '.performance__venue-group', '.performance__artists', '.ledger__row']) {
    const el = page.locator(sel).first();
    if (supported) {
      expect(await el.evaluate((n) => getComputedStyle(n).animationName), sel).toBe('scroll-rise');
    }
    await el.evaluate((n) => n.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect.poll(() => el.evaluate((n) => getComputedStyle(n).opacity), { message: sel }).toBe('1');
  }
});

test('the press bracket ends fully drawn once scrolled into view', async ({ page }) => {
  await page.goto('/');
  const bracket = page.locator('.era__bracket').first();
  await bracket.evaluate((n) => n.scrollIntoView({ block: 'start', behavior: 'instant' }));
  // Progress, not the clip-path string: Chromium sometimes serializes the
  // finished value as inset(-8px -8px calc(0% - 8px)). No animation (no
  // scroll-timeline support) means the bracket was never clipped.
  await expect
    .poll(() =>
      bracket.evaluate((n) => {
        const anim = n.getAnimations()[0];
        return anim ? anim.effect!.getComputedTiming().progress : 1;
      })
    )
    .toBe(1);
});

test('press bracket links are named by their label alone', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.era__link').first()).toHaveAccessibleName('The archive');
});

test('reduced motion turns the reveals off', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const sel of ['.career-highlights__block', '.ledger__row', '.era__bracket']) {
    expect(await page.locator(sel).first().evaluate((n) => getComputedStyle(n).animationName), sel).toBe('none');
  }
});
