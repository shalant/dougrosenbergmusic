/// <reference types="astro/client" />

// gtag.js attaches these to `window` itself (see BaseLayout.astro's inline
// script) rather than via an npm package, so nothing else declares their
// types - without this, `astro check`/tsc has no idea they exist. This file
// has no import/export, so it's already an ambient global script - merging
// straight into the lib.dom.d.ts `Window` interface, no `declare global`
// wrapper needed (and wrapping it would actually error: augmentations are
// only valid inside a module).
interface Window {
	dataLayer: unknown[];
	gtag: (...args: unknown[]) => void;
}
