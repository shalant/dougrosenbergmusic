import { test, expect } from '@playwright/test';

// The hero's smoke (ported 2026-10-29, see HeroGraded.astro). Drifting haze is
// the desktop tier; at 1024px and under it must be swapped for the cheap tier
// because continuous repaint is what sank the mobile Lighthouse score. And
// under prefers-reduced-motion nothing in it may move at any width.
const hazeAnimations = async (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const names = (selector: string) =>
      Array.from(document.querySelectorAll(selector)).map((el) => getComputedStyle(el).animationName);
    return {
      blobs: names('.haze-blob'),
      smokeShapes: names('.hero__blob'),
      headline: names('.hero__main'),
      rest: names('.hero__rest-a, .hero__rest-b'),
      hazeDisplay: getComputedStyle(document.querySelector('.hero__haze')!).display,
      restDisplay: getComputedStyle(document.querySelector('.hero__rest')!).display,
    };
  });

test('desktop hero smoke drifts', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const state = await hazeAnimations(page);
  expect(state.hazeDisplay).toBe('block');
  expect(state.restDisplay).toBe('none');
  expect(state.blobs).toHaveLength(4);
  for (const name of [...state.blobs, ...state.smokeShapes, ...state.headline]) expect(name).not.toBe('none');
});

for (const width of [1024, 768, 390]) {
  test(`hero smoke is the resting tier at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const state = await hazeAnimations(page);
    expect(state.hazeDisplay).toBe('none');
    expect(state.restDisplay).toBe('block');
    expect(state.smokeShapes[0]).toBe('none');
    expect(state.headline).toEqual(['none']);
    // the only thing still animating is the slow cross-fade of the two static layers
    expect(state.rest.every((name) => name !== 'none')).toBe(true);
  });
}

for (const width of [1440, 390]) {
  test(`hero smoke is still under reduced motion at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const state = await hazeAnimations(page);
    for (const name of [...state.blobs, ...state.smokeShapes, ...state.headline, ...state.rest]) {
      expect(name).toBe('none');
    }
  });
}
