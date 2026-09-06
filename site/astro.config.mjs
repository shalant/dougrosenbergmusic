// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages serves project pages from a /<repo-name>/ subpath; Cloudflare
// Workers static-assets (workers.dev subdomain or a custom domain) serves
// from the root. The GH Pages workflow sets DEPLOY_TARGET=gh-pages; the
// Cloudflare dashboard build command (`npm run build`, no env override)
// leaves it unset, so root-path is the default.
const isGhPages = process.env.DEPLOY_TARGET === 'gh-pages';

// TODO(cloudflare): replace with the real workers.dev subdomain or custom
// domain once the Cloudflare project exists — this placeholder only affects
// sitemap.xml/canonical URLs, not the actual deploy.
const cloudflareSite = 'https://dougrosenbergmusic.example-placeholder.workers.dev';

// https://astro.build/config
export default defineConfig({
  site: isGhPages ? 'https://shalant.github.io' : cloudflareSite,
  base: isGhPages ? '/dougrosenbergmusic/' : '/',
});
