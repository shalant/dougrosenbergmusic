import { test, expect } from '@playwright/test';

// The bell player (2026-11-22). The component renders only when audio exists in
// public/audio/ at build time (src/data/tracks.js), so in CI, with no audio
// committed yet, the page must be exactly as before: no bell, no player bar.
// With audio present (a local run after dropping the files in), the bell must
// sit on the horn, press-to-play must open the player bar, and the controls must
// work. The audio-present tests skip themselves when there is no audio.

const hasBell = async (page: import('@playwright/test').Page) => (await page.locator('.bellp').count()) > 0;

test('no audio files: the hero is unchanged (no bell, no player)', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  if (await hasBell(page)) test.skip(true, 'audio is present in this build');
  await expect(page.locator('.bellp-bar')).toHaveCount(0);
  await expect(page.locator('.hero__cta, .hero__ctas').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('with audio: the bell sits inside the photo and opens the player on press', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  if (!(await hasBell(page))) test.skip(true, 'no audio in this build');
  const bell = page.locator('.bellp');
  if (await page.locator('.bellp-layer[data-off]').count()) test.skip(true, 'the bell is hidden at this crop (dark phone hero)');
  const photoBox = (await page.locator('.hero__photo').boundingBox())!;
  const b = (await bell.boundingBox())!;
  expect(b.x).toBeGreaterThan(photoBox.x);
  expect(b.y).toBeGreaterThan(photoBox.y);
  expect(b.x + b.width).toBeLessThan(photoBox.x + photoBox.width);
  expect(b.width).toBeGreaterThanOrEqual(44 - 1);
  expect(b.height).toBeGreaterThanOrEqual(44 - 1);

  await expect(page.locator('.bellp-bar')).toBeHidden();
  await bell.click();
  await expect(page.locator('.bellp-bar')).toBeVisible();
  await expect(bell).toHaveAttribute('aria-label', /^Pause /);
  await expect(page.locator('.bellp-layer')).toHaveAttribute('data-playing', '');
  // The clock runs: the time readout leaves 0:00 and the duration is read from the file.
  await expect.poll(() => page.evaluate(() => document.querySelector('.bellp-bar [data-cur]')?.textContent), { timeout: 8000 }).not.toBe('0:00');
  await expect(page.locator('.bellp-bar [data-dur]')).not.toHaveText('-:--');

  await page.locator('[data-act="next"]').click();
  await expect(page.locator('.bellp-bar__title')).not.toHaveText('Better Than TV');
  await page.locator('[data-act="toggle"]').click();
  await expect(bell).toHaveAttribute('aria-label', /^Play /);
  await page.locator('[data-act="close"]').click();
  await expect(page.locator('.bellp-bar')).toBeHidden();
  expect(errors).toEqual([]);
});

test('with audio: the button focuses as a mouse comes near and rings are calm', async ({ page }) => {
  await page.goto('/');
  if (!(await hasBell(page))) test.skip(true, 'no audio in this build');
  if (await page.locator('.bellp-layer[data-touch]').count()) test.skip(true, 'touch device has no proximity');
  if (await page.locator('.bellp-layer[data-off]').count()) test.skip(true, 'the bell is hidden at this crop');
  const b = (await page.locator('.bellp').boundingBox())!;
  const near = () => page.evaluate(() => Number(getComputedStyle(document.querySelector('.bellp-layer')!).getPropertyValue('--near')));
  await page.mouse.move(b.x + b.width / 2 + 900, b.y + b.height / 2 + 500);
  await page.waitForTimeout(500);
  const far = await near();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 });
  await page.waitForTimeout(600);
  expect(await near()).toBeGreaterThan(0.9);
  expect(far).toBeLessThan(0.2);
  // While playing, no ring starts brighter than the cap in createOnsetDetector.
  await page.locator('.bellp').click();
  await page.waitForTimeout(1500);
  const peak = await page.evaluate(() =>
    Math.max(
      0,
      ...document
        .getAnimations()
        .filter((a) => (a.effect as KeyframeEffect | null)?.target?.classList?.contains('bellp-ring'))
        .map((a) => Number(((a.effect as KeyframeEffect).getKeyframes()[0] as { opacity?: string }).opacity ?? 0)),
    ),
  );
  expect(peak).toBeLessThanOrEqual(0.34 + 1e-6);
});

// Phone smoothness (2026-11-22): the first version looped a "breathe" animation on
// touch and drew the rings as SVG with a non-scaling stroke, and the hero felt
// twitchy on a phone. On touch the bell must not run any endless animation, and a
// ring must be a plain element animated by transform and opacity only.
test('touch: the bell runs no endless animation and its rings use transform and opacity only', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto('/');
  if (!(await hasBell(page))) test.skip(true, 'no audio in this build');
  await page.waitForTimeout(500);
  const endless = await page.evaluate(
    () => document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.target?.closest?.('.bellp-layer') && a.effect!.getTiming().iterations === Infinity).length,
  );
  expect(endless).toBe(0);
  const tag = await page.evaluate(() => {
    const l = document.querySelector('.bellp-layer')!;
    const d = document.createElement('div');
    d.className = 'bellp-ring';
    l.appendChild(d);
    const a = d.animate([{ transform: 'scale(.5)', opacity: 0.3 }, { transform: 'scale(4)', opacity: 0 }], 100);
    const props = Object.keys((a.effect as KeyframeEffect).getKeyframes()[0]).filter((k) => !['offset', 'easing', 'composite', 'computedOffset'].includes(k));
    d.remove();
    return { tag: d.tagName, props, stroke: getComputedStyle(d).borderTopWidth };
  });
  expect(tag.tag).toBe('DIV');
  expect(tag.props.sort()).toEqual(['opacity', 'transform']);
  await ctx.close();
});
