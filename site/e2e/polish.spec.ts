import { test, expect } from '@playwright/test';

// UI round 2 (2026-10-17): layout touch-ups from the mobile audit plus the
// CSS-only micro-interactions. Phone checks run in the mobile project only.

test.describe('phone layout', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  test('Recordings are compact rows, not full-width cards', async ({ page }) => {
    await page.goto('/');
    const heights = await page.locator('#listen .album').evaluateAll((cards) => cards.map((c) => c.getBoundingClientRect().height));
    expect(heights).toHaveLength(4);
    expect(Math.max(...heights)).toBeLessThan(200);
  });

  test('Dev and Contact start from the left edge like every other section', async ({ page }) => {
    await page.goto('/');
    for (const sel of ['#dev h2', '#contact h2']) {
      expect(await page.locator(sel).evaluate((el) => getComputedStyle(el).textAlign)).toMatch(/left|start/);
    }
  });

  // 360/390, not the Pixel 7's 412: the old flex-wrap only went uneven
  // (1-1-2) below about 400px.
  for (const width of [360, 390]) {
    test(`/easternblok members sit in a 2x2 grid at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/easternblok');
      const tops = await page.locator('.members li').evaluateAll((items) => items.map((li) => Math.round(li.getBoundingClientRect().top)));
      expect(new Set(tops).size).toBe(2);
    });
  }

  test('/easternblok albums are rows with a small cover', async ({ page }) => {
    await page.goto('/easternblok');
    const widths = await page.locator('.album__cover').evaluateAll((imgs) => imgs.map((img) => img.getBoundingClientRect().width));
    expect(Math.max(...widths)).toBeLessThanOrEqual(120);
  });
});

test('/easternblok show counts line up in one column', async ({ page }) => {
  await page.goto('/easternblok');
  const lefts = await page.locator('.year__count').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().left)));
  expect(lefts.length).toBeGreaterThan(1);
  expect(new Set(lefts).size).toBe(1);
});

test('the FAQ divider has its own icon, not About\'s', async ({ page }) => {
  await page.goto('/');
  const icons = await page.locator('.staff-divider').evaluateAll((divs) =>
    Object.fromEntries(divs.map((d) => [d.textContent!.trim(), d.querySelector('svg')!.innerHTML]))
  );
  expect(icons.FAQ).toBeTruthy();
  expect(icons.FAQ).not.toBe(icons.About);
});

test('the reel labels sit on their own dark chip', async ({ page }) => {
  await page.goto('/');
  for (const sel of ['#dev-screen-live', '#dev-screen-count']) {
    expect(await page.locator(sel).evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  }
});

test('FAQ questions show a +/× indicator that turns when opened', async ({ page }) => {
  await page.goto('/');
  const summary = page.locator('.faq__item summary').first();
  const indicator = () => summary.evaluate((el) => {
    const s = getComputedStyle(el, '::after');
    return { content: s.content, rotate: s.rotate };
  });
  expect((await indicator()).content).toBe('"+"');
  await summary.click();
  await expect.poll(async () => (await indicator()).rotate).toBe('45deg');
  await expect(page.locator('.faq__item').first().locator('p')).toBeVisible();
});

test('press entries end fully visible once scrolled into view', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('.ledger__row');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await rows.nth(i).evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect.poll(() => rows.nth(i).evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('press entries are never hidden by the scroll reveal', async ({ page }) => {
    await page.goto('/');
    const opacities = await page.locator('.ledger__row').evaluateAll((rows) => rows.map((r) => getComputedStyle(r).opacity));
    expect(opacities.every((o) => o === '1')).toBe(true);
  });
});

// UI round 3 (2026-10-17): hover/press feedback and the sending state.
test.describe('hover and progress feedback', () => {
  test.skip(({ isMobile }) => isMobile, 'hover states');

  test('CTA arrows nudge forward on hover and stay out of the link name', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('a[data-cta="hero-primary"]');
    await expect(cta).toHaveAccessibleName('Listen to the music');
    await cta.hover();
    await expect.poll(() => cta.locator('.cta__arrow').evaluate((el) => getComputedStyle(el).translate)).toBe('4px');
  });

  test('album covers push in on hover', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('#listen .album').first();
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await expect.poll(() => card.locator('.album__cover').evaluate((el) => getComputedStyle(el).scale)).toBe('1.04');
  });

  test('the send button animates while a message is sending', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('.contact__submit');
    expect(await button.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
    await button.evaluate((el: HTMLButtonElement) => (el.disabled = true));
    expect(await button.evaluate((el) => getComputedStyle(el).animationName)).toBe('contact-sending');
  });
});
