import { test, expect } from '@playwright/test';

// Heading rule (decided 2026-10-30, see docs/style-guide.md): a section label
// is roman; a heading that is a full sentence in Doug's voice is italic. Before
// this, "On the Road" and "Sheet Music Library" were italic labels while
// Recordings, Highlights and the rest were roman.
test('home page section headings: sentences are italic, labels are roman', async ({ page }) => {
  await page.goto('/');
  const headings = await page.locator('main section h2').evaluateAll((els) =>
    els.map((el) => ({
      text: (el.textContent || '').trim(),
      italic: getComputedStyle(el).fontStyle === 'italic',
    })),
  );
  expect(headings.length).toBeGreaterThanOrEqual(10);
  for (const heading of headings) {
    const isSentence = /[.!?]$/.test(heading.text);
    expect(heading.italic, `"${heading.text}"`).toBe(isSentence);
  }
});
