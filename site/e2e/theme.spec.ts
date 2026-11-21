import { test, expect, type Page } from '@playwright/test';

// Light/dark themes (light-mode draft, 2026-11-15). See docs/style-guide.md
// "Themes" for the rules these check:
// - the theme follows the system setting until the visitor picks one;
// - a picked theme is saved and wins on the next load;
// - hero and footer follow the theme; the Dev TV is a dark "plates" in both themes;
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

  // The nav switch (2026-11-15): an icon button at the end of the desktop
  // staff, a labelled pill in the phone menu. Every switch on the page shows
  // the same state, whichever one was pressed.
  test('the nav has a theme switch that stays in step with the footer one', async ({ page, isMobile }) => {
    await page.goto('/');
    let navToggle;
    if (isMobile) {
      await page.locator('[data-menu-toggle]').click();
      navToggle = page.locator('.staff-menu [data-theme-toggle]');
    } else {
      navToggle = page.locator('.staff-nav [data-theme-toggle]');
    }
    await expect(navToggle).toBeVisible();
    await expect(navToggle).toHaveAccessibleName('Lights up (light theme)');
    await navToggle.click();
    expect(await theme(page)).toBe('light');
    await expect(navToggle).toHaveAccessibleName('Lights down (dark theme)');
    await expect(page.locator('.site-footer [data-theme-toggle]')).toHaveAccessibleName('Lights down (dark theme)');
    if (!isMobile) await expect(navToggle).toHaveAttribute('title', 'Lights down');
  });
});

// The channel knob (2026-11-15, Doug picked option 1 of five TV-themed
// switches): a rotary dial with two stops (CH 1 dark, CH 2 light), a burst of
// static that covers the theme swap, and a green on-screen label that is also
// the live region screen readers hear. docs/style-guide.md "Themes".
test.describe('channel knob', () => {
  const pointerTurn = (page: Page, selector: string) =>
    page.locator(selector).evaluate((el) => {
      // matrix(a, b, ...) of a pure rotation: b = sin(angle)
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI);
    });

  test('the dial stands at CH 1 on the dark page and turns to CH 2 on the light one', async ({ page, isMobile }) => {
    await page.goto('/');
    const sel = isMobile ? '.site-footer .theme-toggle__rot' : '.staff-nav .theme-toggle__rot';
    expect(await pointerTurn(page, sel)).toBe(-50);
    await page.locator('.site-footer [data-theme-toggle]').click();
    await expect.poll(() => pointerTurn(page, sel)).toBe(50);
    await page.locator('.site-footer [data-theme-toggle]').click();
    await expect.poll(() => pointerTurn(page, sel)).toBe(-50);
  });

  test('every switch on the page turns together, and the labels still say what pressing does', async ({ page }) => {
    await page.goto('/');
    await page.locator('.site-footer [data-theme-toggle]').click();
    await expect.poll(() => pointerTurn(page, '.site-footer .theme-toggle__rot')).toBe(50);
    await expect(page.locator('.site-footer [data-theme-toggle]')).toHaveAccessibleName('Lights down (dark theme)');
  });

  test('a press cuts to static, swaps the theme under it, and names the channel', async ({ page }) => {
    await page.goto('/');
    // The static lives only 0.64s, so watch for it in the page instead of
    // racing it from the test (a busy machine would miss it).
    await page.evaluate(() => {
      (window as unknown as { snow: number }).snow = 0;
      new MutationObserver((records) => {
        for (const r of records) for (const n of r.addedNodes) if ((n as Element).classList?.contains('channel-static')) (window as unknown as { snow: number }).snow++;
      }).observe(document.body, { childList: true });
    });
    await page.locator('.site-footer [data-theme-toggle]').click();
    // the swap is immediate; the static covers it and then clears
    expect(await theme(page)).toBe('light');
    await expect.poll(() => page.evaluate(() => (window as unknown as { snow: number }).snow)).toBe(1);
    const osd = page.locator('.channel-osd');
    await expect(osd).toHaveClass(/(^|\s)on(\s|$)/);
    await expect(osd).toContainText('CH 02');
    await expect(osd).toContainText('DAY');
    await expect(page.locator('.channel-static')).toHaveCount(0, { timeout: 8000 });
    await expect(osd).not.toHaveClass(/(^|\s)on(\s|$)/, { timeout: 8000 });
    await page.locator('.site-footer [data-theme-toggle]').click();
    await expect(osd).toContainText('CH 01');
    await expect(osd).toContainText('NIGHT');
  });

  test('the label is a live region, so a screen reader hears the change', async ({ page }) => {
    await page.goto('/');
    const osd = page.locator('.channel-osd');
    await expect(osd).toHaveAttribute('role', 'status');
    await page.locator('.site-footer [data-theme-toggle]').click();
    await expect(osd.locator('.visually-hidden')).toHaveText('Lights up, light theme');
    // the decorative copy is hidden from assistive tech, the sentence is not
    await expect(osd.locator('[aria-hidden="true"]')).toHaveCount(2);
  });

  test('a change of the system setting never plays the static or the label', async ({ page }) => {
    await page.goto('/');
    // The first emulateMedia after load does not reach the page's listener
    // (seen 2026-11-15 against the e2e server; the second and later do), so
    // arm the emulation with a no-op change first.
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.emulateMedia({ colorScheme: 'light' });
    await expect.poll(() => theme(page)).toBe('light');
    await expect(page.locator('.channel-static')).toHaveCount(0);
    await expect(page.locator('.channel-osd')).not.toHaveClass(/(^|\s)on(\s|$)/);
  });

  test('on a weak device (data-fx lite) the theme changes at once with the label and no static', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => (document.documentElement.dataset.fx = 'lite'));
    await page.locator('.site-footer [data-theme-toggle]').click();
    expect(await theme(page)).toBe('light');
    await expect(page.locator('.channel-static')).toHaveCount(0);
    await expect(page.locator('.channel-osd')).toContainText('CH 02');
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the theme changes at once, no static is ever made, the label still shows', async ({ page }) => {
      await page.goto('/');
      await page.locator('.site-footer [data-theme-toggle]').click();
      expect(await theme(page)).toBe('light');
      expect(await page.evaluate(() => document.querySelector('.channel-static'))).toBeNull();
      await expect(page.locator('.channel-osd')).toContainText('CH 02');
      // and the dial itself does not animate its turn
      const t = await page.locator('.site-footer .theme-toggle__rot').evaluate((el) => getComputedStyle(el).transitionDuration);
      expect(parseFloat(t)).toBe(0);
    });
  });
});

test.describe('light theme', () => {
  test.use({ colorScheme: 'light' });

  // The 404 page has no footer or archive bar; its switch is the nav's
  // (checked 2026-11-15, after an open item wrongly said it had none).
  test('the 404 page follows the theme and its nav switch flips it', async ({ page, isMobile }) => {
    await page.goto('/no-such-page');
    expect(await theme(page)).toBe('light');
    if (isMobile) await page.locator('[data-menu-toggle]').click();
    const toggle = page.locator(isMobile ? '.staff-menu [data-theme-toggle]' : '.staff-nav [data-theme-toggle]');
    await expect(toggle).toBeVisible();
    await toggle.click();
    expect(await theme(page)).toBe('dark');
  });

  test('the Dev screen stays a dark plate; the hero and the footer are paper in light', async ({ page }) => {
    await page.goto('/');
    const bgs = await page.evaluate(() =>
      ['#hero', '.dev__screen-wrap'].map((sel) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el).getPropertyValue('--bg').trim() : null;
      }),
    );
    expect(bgs).toEqual(['#f4efe6', '#0a0e17']);
    // The footer has its own light version: kraft, not the dark back cover.
    expect(await page.locator('.site-footer').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(229, 219, 201)');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(244, 239, 230)');
  });

  // The fixed logo was a near-white card holding a dark TV plate in light, a
  // card in a card (Doug, 2026-11-15). Light drops the backing so the TV
  // stands alone and fills the box; dark keeps its backing.
  test('the logo is a bare TV in light and keeps its backing in dark', async ({ page }) => {
    await page.goto('/');
    const read = () =>
      page.evaluate(() => {
        const logo = getComputedStyle(document.querySelector('.logo')!);
        return { bg: logo.backgroundColor, shadow: logo.boxShadow, mark: getComputedStyle(document.querySelector('.logo__mark')!).transform };
      });
    const light = await read();
    expect(light.bg).toBe('rgba(0, 0, 0, 0)');
    expect(light.shadow).toBe('none');
    expect(light.mark).not.toBe('none'); // scaled up to fill the box the card filled
    await page.evaluate(() => (document.documentElement.dataset.theme = 'dark'));
    const dark = await read();
    expect(dark.bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(dark.shadow).not.toBe('none');
    expect(dark.mark).toBe('none');
  });

  // On cream the section bands sat 1.06:1 (About) and 1.08:1 (Highlights,
  // In Frame) from the paper, and the middle of the page ran together (bad
  // cop, 2026-11-15). Light now steps them with their own tokens; each band
  // must sit at least 1.09:1 from the paper, and the raised and sunk bands
  // at least 1.2:1 from each other.
  test('the section bands step clearly away from the paper', async ({ page }) => {
    await page.goto('/');
    const ratios = await page.evaluate(() => {
      const lin = (v: number) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      // the bands are color-mix(token 78%, transparent) over the paper
      const onPaper = (hex: string) => {
        const p = [0xf4, 0xef, 0xe6];
        const t = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
        const [r, g, b] = t.map((v, i) => v * 0.78 + p[i] * 0.22).map(lin);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      const root = getComputedStyle(document.documentElement);
      const paper = onPaper(root.getPropertyValue('--bg').trim());
      const raised = onPaper(root.getPropertyValue('--band-raised').trim());
      const sunk = onPaper(root.getPropertyValue('--band-sunk').trim());
      const uses = (sel: string, token: string) =>
        getComputedStyle(document.querySelector(sel)!).backgroundColor ===
        (() => {
          const probe = document.createElement('div');
          probe.style.background = `color-mix(in srgb, var(${token}) 78%, transparent)`;
          document.body.append(probe);
          const c = getComputedStyle(probe).backgroundColor;
          probe.remove();
          return c;
        })();
      return {
        raised: ratio(raised, paper),
        sunk: ratio(sunk, paper),
        apart: ratio(raised, sunk),
        wired: uses('.about', '--band-raised') && uses('.career-highlights', '--band-sunk') && uses('.gallery', '--band-sunk'),
      };
    });
    expect(ratios.wired).toBe(true);
    expect(ratios.raised).toBeGreaterThanOrEqual(1.09);
    expect(ratios.sunk).toBeGreaterThanOrEqual(1.09);
    expect(ratios.apart).toBeGreaterThanOrEqual(1.2);
  });

  // The sheet-music panel was beige on beige (1.08:1 from the paper, its
  // empty viewer the same tone as the panel), the flattest block on the page
  // (bad cop, 2026-11-15). Light makes it a kraft folder holding a white
  // manuscript page: the folder at least 1.09:1 from the paper, the page at
  // least 1.2:1 from the folder.
  test('the sheet-music library reads as a folder holding a page', async ({ page }) => {
    await page.goto('/');
    const r = await page.evaluate(() => {
      const lum = (sel: string) => {
        const c = getComputedStyle(document.querySelector(sel)!).backgroundColor;
        const m = c.match(/[\d.]+/g)!.map(Number);
        const k = c.startsWith('color(srgb') ? 255 : 1;
        const [r, g, b] = m.slice(0, 3).map((v) => {
          const s = (v * k) / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      const paper = lum('body');
      const folder = lum('.sheet-music__panel');
      const sheet = lum('.sheet-music__viewer-empty');
      return { folder: ratio(folder, paper), sheet: ratio(sheet, folder), sheetLighter: sheet > folder };
    });
    expect(r.folder).toBeGreaterThanOrEqual(1.09);
    expect(r.sheet).toBeGreaterThanOrEqual(1.2);
    expect(r.sheetLighter).toBe(true);
  });

  // The light hero is a sleeve (2026-11-15): the photo is a framed print in
  // the flow, beside the text from 1025px and above it below that; the
  // dark-only layers are gone; nothing overlaps the photo, including the
  // fixed logo. The color blobs and the smoke stay, on the paper behind the
  // print (Doug, 2026-11-15).
  test('the hero re-composes as a sleeve: print beside or above the text, no dark layers', async ({ page, isMobile }) => {
    await page.goto('/');
    const r = await page.evaluate(() => {
      const box = (s: string) => document.querySelector(s)!.getBoundingClientRect();
      const cs = (s: string) => getComputedStyle(document.querySelector(s)!);
      const hidden = ['.hero__haze', '.hero__scrim', '.hero__scan'].every((s) => cs(s).display === 'none');
      const behind = ['.hero__hues', '.hero__smoke'].every((s) => cs(s).display !== 'none' && cs(s).zIndex === '-1');
      return { photo: box('.hero__photo'), content: box('.hero__content'), hidden, behind, pos: cs('.hero__photo').position };
    });
    expect(r.hidden).toBe(true);
    expect(r.behind).toBe(true);
    expect(r.pos).toBe('relative');
    if (isMobile) {
      expect(r.content.top).toBeGreaterThanOrEqual(r.photo.bottom);
    } else {
      expect(r.content.left).toBeGreaterThanOrEqual(r.photo.right);
    }
  });

  // The smoke took the brass name and the green subtitle under 4.5:1 when it
  // ran under the type (darkest paper luma 180, 2026-11-15); a feathered
  // patch of paper now clears it behind the text block. With the text made
  // transparent, nothing behind the colored lines may be darker than the
  // paper grain itself (luma 232). The AA sweep below can't see this: the
  // smoke is a sibling layer, not a background of the text's ancestors.
  test('the smoke never runs under the hero text', async ({ page }) => {
    await page.goto('/?fx=full');
    await page.waitForTimeout(1500); // past the fade-up
    const clips = await page.evaluate(() =>
      ['.hero__name', '.hero__sub', '.hero__records-label'].map((s) => {
        const r = document.querySelector(s)!.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      }),
    );
    await page.addStyleTag({
      content: '.hero__content *{color:transparent!important;-webkit-text-fill-color:transparent!important}',
    });
    for (let frame = 0; frame < 3; frame++) {
      for (const clip of clips) {
        const png = await page.screenshot({ clip });
        const darkest = await page.evaluate(async (b64) => {
          const img = new Image();
          img.src = `data:image/png;base64,${b64}`;
          await img.decode();
          const c = document.createElement('canvas');
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          const d = ctx.getImageData(0, 0, c.width, c.height).data;
          let min = 255;
          for (let i = 0; i < d.length; i += 4) min = Math.min(min, 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]);
          return min;
        }, png.toString('base64'));
        expect(darkest).toBeGreaterThanOrEqual(225);
      }
      await page.waitForTimeout(3000);
    }
  });

  // The fixed logo covered the print's corner at 768x1024 and 844x390 in the
  // first draft (screenshots, 2026-11-15).
  test('the fixed logo never sits on the hero print', async ({ page }) => {
    for (const size of [{ width: 1440, height: 900 }, { width: 1100, height: 700 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
      await page.setViewportSize(size);
      await page.goto('/');
      const overlap = await page.evaluate(() => {
        const a = document.querySelector('.logo')!.getBoundingClientRect();
        const b = document.querySelector('.hero__photo')!.getBoundingClientRect();
        return !(a.right <= b.left || a.bottom <= b.top || a.left >= b.right || a.top >= b.bottom);
      });
      expect(overlap, `${size.width}x${size.height}`).toBe(false);
    }
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
