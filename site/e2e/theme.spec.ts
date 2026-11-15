import { test, expect, type Page } from '@playwright/test';

// Light/dark themes (light-mode draft, 2026-11-15). See docs/style-guide.md
// "Themes" for the rules these check:
// - the theme follows the system setting until the visitor picks one;
// - a picked theme is saved and wins on the next load;
// - hero, footer and the Dev TV are dark "plates" in both themes;
// - every visible text element on the light page clears WCAG AA.

const PAGES = ['/', '/press', '/easternblok', '/easternblok/press'];

async function theme(page: Page) {
  return page.evaluate(() => document.documentElement.dataset.theme);
}

test.describe('theme selection', () => {
  test('follows the system setting when nothing is saved', async ({ browser }) => {
    for (const colorScheme of ['light', 'dark'] as const) {
      const ctx = await browser.newContext({ colorScheme });
      const page = await ctx.newPage();
      await page.goto('/');
      expect(await theme(page)).toBe(colorScheme);
      await ctx.close();
    }
  });

  test('the toggle flips the theme, saves it, and the saved choice beats the system', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto('/');
    const toggle = page.locator('.site-footer [data-theme-toggle]');
    await expect(toggle).toHaveAccessibleName('Lights up (light theme)');
    await toggle.click();
    expect(await theme(page)).toBe('light');
    await expect(toggle).toHaveAccessibleName('Lights down (dark theme)');
    await page.reload();
    expect(await theme(page)).toBe('light');
    // The archive pages share the saved choice and have their own toggle.
    await page.goto('/press');
    expect(await theme(page)).toBe('light');
    await expect(page.locator('.archive [data-theme-toggle]')).toBeVisible();
    await ctx.close();
  });
});

test.describe('light theme', () => {
  test.use({ colorScheme: 'light' });

  test('hero, footer and the Dev screen stay dark plates', async ({ page }) => {
    await page.goto('/');
    const bgs = await page.evaluate(() =>
      ['#hero', '.site-footer', '.dev__screen-wrap'].map((sel) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el).getPropertyValue('--bg').trim() : null;
      }),
    );
    expect(bgs).toEqual(['#0a0e17', '#0a0e17', '#0a0e17']);
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(244, 239, 230)');
  });

  for (const path of PAGES) {
    test(`every visible text on ${path} clears AA contrast`, async ({ page }) => {
      await page.goto(path);
      const failures = await page.evaluate(() => {
        type RGBA = [number, number, number, number];
        // Chrome serializes color-mix() results as color(srgb r g b / a)
        // with 0-1 channels, everything else as rgb()/rgba() with 0-255.
        const parse = (c: string): RGBA => {
          const m = c.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0];
          const k = c.startsWith('color(srgb') ? 255 : 1;
          return [m[0] * k, m[1] * k, m[2] * k, m[3] ?? 1];
        };
        const over = (fg: RGBA, bg: RGBA): RGBA => {
          const a = fg[3];
          return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
        };
        const lum = ([r, g, b]: RGBA) =>
          [r, g, b]
            .map((v) => v / 255)
            .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
            .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
        const ratio = (a: RGBA, b: RGBA) => {
          const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
          return (x + 0.05) / (y + 0.05);
        };
        const page = parse(getComputedStyle(document.body).backgroundColor);

        // The background a text actually sits on: translucent fills
        // composited from the page up. Skips anything over a photo or a
        // gradient (no single background to measure against) and anything
        // inside a dark plate (checked by the dark theme's own passes).
        const backdrop = (el: Element): RGBA | null => {
          const chain: RGBA[] = [];
          for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (n.classList.contains('theme-plate')) return null;
            if (cs.backgroundImage !== 'none' && !n.classList.contains('staff-lines') && !n.classList.contains('staff-lines--strong')) return null;
            const bg = parse(cs.backgroundColor);
            if (bg[3] > 0) chain.push(bg);
            if (bg[3] === 1) break;
          }
          return chain.reverse().reduce((acc, bg) => over(bg, acc), page);
        };

        const out: string[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const seen = new Set<Element>();
        for (let t = walker.nextNode(); t; t = walker.nextNode()) {
          const el = t.parentElement;
          if (!el || seen.has(el) || !t.textContent?.trim()) continue;
          seen.add(el);
          const cs = getComputedStyle(el);
          const box = el.getBoundingClientRect();
          if (box.width === 0 || box.height === 0 || cs.visibility === 'hidden' || el.closest('[hidden], [aria-hidden="true"], .visually-hidden, option')) continue;
          if (parseFloat(cs.opacity) < 1) continue; // mid-reveal or deliberately dimmed
          const bg = backdrop(el);
          if (!bg) continue;
          const fg = over(parse(cs.color), bg);
          const size = parseFloat(cs.fontSize);
          const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
          const r = ratio(fg, bg);
          if (r < (large ? 3 : 4.5)) out.push(`${r.toFixed(2)}:1 "${t.textContent.trim().slice(0, 40)}" (${el.tagName.toLowerCase()}.${el.className})`);
        }
        return out;
      });
      expect(failures).toEqual([]);
    });
  }
});
