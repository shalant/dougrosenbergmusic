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

// Frame-rate watchdog (HeroGraded.astro). A real desktop (i7, 16 cores, 32 GB,
// 4g) landed in lite mode on 2026-11-14 with the smoke frozen: one bad 2.5s
// window right after load tripped the check, and the verdict was stored for the
// whole tab session. These tests fake slow frames by stretching
// requestAnimationFrame. Not run in parallel with the real GPU-less headless
// timing: hardwareConcurrency and the frame clock are both stubbed.
const stubFrames = (cores: number, slowUntilMs: number) => ({ cores, slowUntilMs });
const fakeSlowFrames = async (page: Page, { cores, slowUntilMs }: { cores: number; slowUntilMs: number }) => {
  await page.addInitScript(
    ({ cores, slowUntilMs }) => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { value: cores });
      Object.defineProperty(navigator, 'deviceMemory', { value: 8 });
      Object.defineProperty(navigator, 'connection', { value: { saveData: false, effectiveType: '4g' } });
      window.requestAnimationFrame = (cb) =>
        window.setTimeout(() => cb(performance.now()), performance.now() < slowUntilMs ? 100 : 16);
    },
    { cores, slowUntilMs },
  );
};
const heroFx = (page: Page) =>
  page.evaluate(() => ({
    fx: document.querySelector<HTMLElement>('.hero')!.dataset.fx ?? null,
    stored: sessionStorage.getItem('fx'),
  }));

test('sustained slow frames on a modest device settle to lite, without being remembered', async ({ page }) => {
  await fakeSlowFrames(page, stubFrames(4, 1e9));
  await page.goto('/');
  await expect.poll(async () => (await heroFx(page)).fx, { timeout: 20_000 }).toBe('lite');
  // a verdict from frame timing alone must not stick to the tab
  expect((await heroFx(page)).stored).toBeNull();
});

test('one bad window right after load does not freeze the smoke', async ({ page }) => {
  await fakeSlowFrames(page, stubFrames(4, 3500));
  await page.goto('/');
  await page.waitForTimeout(9_000);
  expect(await heroFx(page)).toEqual({ fx: null, stored: null });
});

test('a 16-core desktop is never judged by the frame-rate watchdog', async ({ page }) => {
  await fakeSlowFrames(page, stubFrames(16, 1e9));
  await page.goto('/');
  await page.waitForTimeout(9_000);
  expect(await heroFx(page)).toEqual({ fx: null, stored: null });
});

test('the drift pauses when the hero is scrolled out of view', async ({ page }) => {
  // no setViewportSize: resizing an emulated phone to 1440px keeps mobile WebKit's
  // IntersectionObserver from reporting, which a real phone can't do
  await page.goto('/?fx=full');
  const playState = () =>
    page.evaluate(() => ({
      live: document.querySelector<HTMLElement>('.hero')!.dataset.live,
      state: getComputedStyle(document.querySelector('.haze-blob')!).animationPlayState,
    }));
  const slowCi = { timeout: 15_000 }; // module scripts can start late on a loaded runner
  await expect.poll(playState, slowCi).toEqual({ live: 'true', state: 'running' });
  await page.evaluate(() => document.querySelector('#listen')!.scrollIntoView());
  await expect.poll(playState, slowCi).toEqual({ live: 'false', state: 'paused' });
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
