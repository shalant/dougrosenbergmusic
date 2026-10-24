// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Draft pages (placeholder text, noindex via ArchiveLayout's `draft` prop) stay
// out of the sitemap until Doug's own text is in. Add a path here while a page
// is a draft and remove it when the page drops `draft`. None right now:
// /press left draft 2026-10-23.
/** @type {string[]} */
const DRAFT_PAGES = [];

// https://astro.build/config
export default defineConfig({
  site: 'https://dougrosenberg.com',
  base: '/',
  // 'file' builds src/pages/easternblok.astro to dist/easternblok.html, which
  // Cloudflare's static assets serve at /easternblok (no trailing slash), the
  // URL Doug chose. index.html and 404.html are unchanged by this.
  build: { format: 'file' },
  integrations: [
    sitemap({
      filter: (page) => !DRAFT_PAGES.includes(new URL(page).pathname.replace(/\/$/, '')),
    }),
  ],
});
