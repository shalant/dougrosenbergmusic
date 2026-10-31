import { test, expect, type Page } from '@playwright/test';

// The hero's smoke (ported 2026-10-29, see HeroGraded.astro). Since 2026-10-30
// the haze drifts at every width, phones included, and a weak device or
// connection gets a still version instead (data-fx="lite"). ?fx=full and
// ?fx=lite force either state, which keeps these tests off the frame-rate
// watchdog (headless Chromium has no GPU and would trip it). Under
// prefers-reduced-motion nothing in it may move at any width.
const hazeState = async (page: Page) =>
  page.evaluate(() => {
    const names = (selector: string) =>
      Array.from(document.querySelectorAll(selector)).map((el) => getComputedStyle(el).animationName);
    return {
      fx: document.querySelector<HTMLElement>('.hero')!.dataset.fx ?? null,
      blobs: names('.haze-blob'),
      smokeShapes: names('.hero__blob'),
      smokeBDisplay: getComputedStyle(document.querySelector('.hero__blob--b')!).display,
      headline: names('.hero__main'),
      hazeDisplay: getComputedStyle(document.querySelector('.hero__haze')!).display,
    };
  });

for (const width of [1440, 1024, 768, 390]) {
  test(`hero smoke drifts at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/?fx=full');
    const state = await hazeState(page);
    expect(state.hazeDisplay).toBe('block');
    expect(state.blobs).toHaveLength(4);
    for (const name of [...state.blobs, ...state.smokeShapes]) expect(name).not.toBe('none');
    expect(state.smokeBDisplay).toBe('block');
    // headline shading is the one piece that repaints text, so phones and tablets hold it still
    for (const name of state.headline) expect(width > 1024 ? name !== 'none' : name === 'none').toBe(true);
  });
}

for (const width of [1440, 390]) {
  test(`?fx=lite holds the smoke still at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/?fx=lite');
    const state = await hazeState(page);
    expect(state.fx).toBe('lite');
    // smoke shape b is hidden outright (display none stops it); a is frozen
    for (const name of [...state.blobs, state.smokeShapes[0], ...state.headline]) expect(name).toBe('none');
    expect(state.smokeBDisplay).toBe('none');
  });
}

test('Save-Data puts the hero in lite mode', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', { value: { saveData: true, effectiveType: '4g' } });
  });
  await page.goto('/');
  expect((await hazeState(page)).fx).toBe('lite');
});

test('a 3G connection puts the hero in lite mode', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', { value: { saveData: false, effectiveType: '3g' } });
  });
  await page.goto('/');
  expect((await hazeState(page)).fx).toBe('lite');
});

test('a device with 2 GB of memory gets lite mode', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'deviceMemory', { value: 2 });
  });
  await page.goto('/');
  expect((await hazeState(page)).fx).toBe('lite');
});

test('a normal connection and device keep the full hero', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', { value: { saveData: false, effectiveType: '4g' } });
    Object.defineProperty(navigator, 'deviceMemory', { value: 8 });
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8 });
  });
  await page.goto('/?fx=full');
  expect((await hazeState(page)).fx).toBeNull();
});

test('the drift pauses when the hero is scrolled out of view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?fx=full');
  const playState = () =>
    page.evaluate(() => ({
      live: document.querySelector<HTMLElement>('.hero')!.dataset.live,
      state: getComputedStyle(document.querySelector('.haze-blob')!).animationPlayState,
    }));
  await expect.poll(playState).toEqual({ live: 'true', state: 'running' });
  await page.evaluate(() => document.querySelector('#listen')!.scrollIntoView());
  await expect.poll(playState).toEqual({ live: 'false', state: 'paused' });
});

for (const width of [1440, 390]) {
  test(`hero smoke is still under reduced motion at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const state = await hazeState(page);
    for (const name of [...state.blobs, ...state.smokeShapes, ...state.headline]) {
      expect(name).toBe('none');
    }
  });
}
