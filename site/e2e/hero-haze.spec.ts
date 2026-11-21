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
    if (!(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches))) test.skip(true, 'touch devices hold the glow and smoke still (2026-11-20)');
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

// Color blobs on the left (2026-11-14): three glows that wander the left half
// and slowly pass through the nav tones. Same lite / reduced-motion / pause
// rules as the haze.
const hueState = (page: Page) =>
  page.evaluate(() => {
    const blobs = Array.from(document.querySelectorAll<HTMLElement>('.hue-blob'));
    return blobs.map((el) => {
      const box = el.getBoundingClientRect();
      return {
        animation: getComputedStyle(el).animationName,
        hue: getComputedStyle(el).getPropertyValue('--hue').trim(),
        centerX: box.left + box.width / 2,
        viewport: window.innerWidth,
      };
    });
  });

for (const width of [1440, 390]) {
  test(`the color blobs wander the left half and change color at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/?fx=full');
    if (!(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches))) test.skip(true, 'touch devices hold the glow and smoke still (2026-11-20)');
    // The color cycle runs only on a mouse-and-screen device (2026-11-19); a
    // touch device keeps the drift with each blob holding its own tone.
    const cycles = await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches);
    const first = await hueState(page);
    expect(first).toHaveLength(3);
    for (const blob of first) {
      if (cycles) expect(blob.animation).toContain('hue-cycle');
      else expect(blob.animation).not.toContain('hue-cycle');
      expect(blob.animation).toContain('hue-path');
      expect(blob.centerX).toBeLessThan(blob.viewport * 0.5);
    }
    await page.waitForTimeout(4_000);
    const later = await hueState(page);
    // every blob has moved on to a different color in 4s (a full tour takes 84 to 112s)
    if (cycles) later.forEach((blob, i) => expect(blob.hue).not.toBe(first[i].hue));
    else {
      later.forEach((blob, i) => expect(blob.hue).toBe(first[i].hue));
      expect(new Set(later.map((b) => b.hue)).size).toBe(3);
    }
    for (const blob of later) expect(blob.centerX).toBeLessThan(blob.viewport * 0.6);
  });
}

test('the color blobs sit still in lite mode', async ({ page }) => {
  await page.goto('/?fx=lite');
  for (const blob of await hueState(page)) expect(blob.animation).toBe('none');
});

test('the color blobs sit still under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?fx=full');
  for (const blob of await hueState(page)) expect(blob.animation).toBe('none');
});

// Page-wide ambient glows (2026-11-14, AmbientHues.astro): a fixed layer behind
// the whole page. It must stay fixed while scrolling, show through the
// sections (they used to paint an opaque --bg), and follow the lite and
// reduced-motion rules.
const ambientState = (page: Page) =>
  page.evaluate(() => {
    const layer = document.querySelector<HTMLElement>('.ambient')!;
    const blobs = Array.from(document.querySelectorAll<HTMLElement>('.ambient-blob'));
    return {
      position: getComputedStyle(layer).position,
      top: layer.getBoundingClientRect().top,
      animations: blobs.map((el) => getComputedStyle(el).animationName),
      hues: blobs.map((el) => getComputedStyle(el).getPropertyValue('--hue').trim()),
    };
  });

test('the ambient glows stay fixed while the page scrolls and keep changing color', async ({ page }) => {
  await page.goto('/?fx=full');
  if (!(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches))) test.skip(true, 'touch devices hold the glow and smoke still (2026-11-20)');
  const first = await ambientState(page);
  expect(first.position).toBe('fixed');
  expect(first.animations).toHaveLength(4);
  const cycles = await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches);
  for (const name of first.animations) {
    expect(name).toContain('ambient-path');
    if (cycles) expect(name).toContain('hue-cycle');
    else expect(name).not.toContain('hue-cycle');
  }
  await page.evaluate(() => document.querySelector('#lessons')!.scrollIntoView());
  await page.waitForTimeout(3_000);
  const later = await ambientState(page);
  expect(later.top).toBe(0);
  if (cycles) later.hues.forEach((hue, i) => expect(hue).not.toBe(first.hues[i]));
  else later.hues.forEach((hue, i) => expect(hue).toBe(first.hues[i]));
});

// Phone smoothness (2026-11-19). The page used about 17% of the browser's main
// thread at rest, from the glow's color cycle (it repaints four big gradients
// every frame) and from looping the individual translate/rotate/scale
// properties, which are main-thread work; `transform` is not. On a touch
// device no loop may animate --hue or those properties.
test('on a touch device the glow and smoke are still, and nothing cycles color or moves by the slow properties', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto('/?fx=full');
  expect(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)).toBe(false);
  const loops = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.effect && (a.effect as KeyframeEffect).getTiming().iterations === Infinity && (a as CSSAnimation).animationName)
      .map((a) => {
        const kf = (a.effect as KeyframeEffect).getKeyframes();
        const props = new Set<string>();
        for (const k of kf) for (const p of Object.keys(k)) if (!['offset', 'easing', 'composite', 'computedOffset'].includes(p)) props.add(p);
        return { name: (a as CSSAnimation).animationName, props: [...props] };
      })
  );
  // Stilled in 2026-11-20: in Firefox on a phone the drifting layers doubled the
  // time per scrolled frame. Only the page's own entrances may still loop.
  for (const loop of loops) {
    expect(loop.name, 'no drift on touch').not.toMatch(/^(ambient-path|hue-path|haze-|hero-drift)/);
  }
  for (const loop of loops) {
    expect(loop.name, 'no color cycle on touch').not.toBe('hue-cycle');
    for (const bad of ['translate', 'rotate', 'scale', '--hue']) {
      expect(loop.props, loop.name + ' must not animate ' + bad).not.toContain(bad);
    }
  }
  await ctx.close();
});

test('sections let the ambient glows show through', async ({ page }) => {
  await page.goto('/?fx=full');
  // Backgrounds the glows must reach: plain sections are transparent, the raised bands translucent.
  const alpha = (selector: string) =>
    page.evaluate((sel) => {
      const color = getComputedStyle(document.querySelector(sel)!).backgroundColor;
      const m = color.match(/rgba?\(([^)]+)\)/) ?? color.match(/color\(srgb ([^)]+)\)/);
      if (!m) return 0;
      const parts = m[1].split(/[ ,/]+/).filter(Boolean);
      return parts.length > 3 ? Number(parts[3]) : 1; // no alpha channel means opaque
    }, selector);
  for (const sel of ['.intro', '.listen', '.performance', '.lessons', '.sheet-music', '.dev', '.faq']) {
    expect(await alpha(sel), `${sel} should be transparent`).toBe(0);
  }
  // Contact fades into the footer from transparent, so there is no hard seam where it starts.
  const contactImage = await page.evaluate(() => getComputedStyle(document.querySelector('.contact')!).backgroundImage);
  expect(contactImage).toMatch(/^linear-gradient\(rgba\(0, 0, 0, 0\)/);
  for (const sel of ['.about', '.career-highlights', '.gallery']) {
    const a = await alpha(sel);
    expect(a, `${sel} should be translucent`).toBeGreaterThan(0.5);
    expect(a, `${sel} should be translucent`).toBeLessThan(1);
  }
});

test('the ambient glows sit still in lite mode', async ({ page }) => {
  await page.goto('/?fx=lite');
  expect((await ambientState(page)).animations.every((name) => name === 'none')).toBe(true);
});

test('the ambient glows sit still under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?fx=full');
  expect((await ambientState(page)).animations.every((name) => name === 'none')).toBe(true);
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
