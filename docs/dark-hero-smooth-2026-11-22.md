# Dark hero on a phone: smoother scrolling (2026-11-22)

**Report (Doug, Galaxy S21, Firefox, cellular):** scrolling down from the dark hero is rough.
`?fx=lite` did not help in dark; the light hero is fine.

## What could and could not be measured

An emulated phone at 4x slower CPU scrolled every variant of the page smoothly, with every hero
layer on or off, and total redraw time was small. That setup counts main-thread frames; it
cannot show a phone GPU's cost for stacked full-screen layers, so the cause was **not
reproduced or proven**. The change below targets what the dark hero has and the light hero
(which is fine) does not, on a phone, in Firefox. Verify on the S21.

## Why dark differs from light

The light hero hides haze, scanlines, vignette and scrim and shows a small print. The dark hero
stacks, over a full-screen scaled photo: scanlines with `mix-blend-mode: overlay`, a vignette, a
scrim, four haze blobs, three hue blobs, two filtered smoke shapes, plus the page's fixed glow.
`?fx=lite` only stills what already moves; it did not touch the blend mode or layer promotion.

## Changes (touch only: `(hover: none), (pointer: coarse)`)

- **Scanlines off.** The overlay blend makes the browser draw everything under it into an
  off-screen surface and blend it each frame. On this near-black photo it is almost invisible.
  A plain-alpha stand-in was tried and screenshots showed stripes the live version does not
  have, so they are simply off on phones. Mouse-and-screen devices keep them.
- **`will-change: auto` on the still haze and hue blobs.** They do not move on touch but kept
  `will-change: transform`, giving seven separate graphics layers for nothing.
- Screenshot compared with the live hero at 480 wide: no visible difference.

## The `?off=` switch (to find what still costs frames)

Open `dougrosenberg.com/?off=NAME` on the phone and scroll off the hero. Names (comma-separate
to combine): `scan`, `vignette`, `scrim`, `haze`, `hues`, `smoke`, `ambient` (the fixed
page glow), `bell`, `photoscale` (the 1.08 scale on the photo), `all` (every hero layer and the
glow). Anything else in the URL is ignored. Suggested order: `?off=all` first. If that is still
rough the cost is the photo or something outside the hero; if smooth, bisect with
`?off=smoke`, `?off=haze,hues`, `?off=ambient`, `?off=bell`.

## If it is still rough

Likely next steps, in order: flatten the static layers (haze, hues, vignette, scrim) into the
baked photo, the way the grade already is (`scripts/bake-photo-grades.mjs`); bake the two smoke
shapes to an image; stop the fixed page glow while the hero is on screen.

## Round 2: Doug's layer-by-layer result (2026-11-22, Galaxy S21, Firefox)

Using `?off=`: smoke off did not help; **ambient off and bell off were the biggest single wins;
`?off=all` (every hero layer plus the glow) was better still.** Changes, touch only:

- **Page glow painted on the page background.** The fixed layer (four blobs plus a see-through
  group, under everything and recombined with the scrolling page every frame) was already known
  to be heavy in Firefox (about 60 ms against 28 ms per frame, `AmbientHues.astro`). On touch it
  is now four radial gradients on `body`'s background: no layer, scrolls with the content, repeats
  every 1.2 screens, strength baked into the color (12.3% dark, 30% light). Looks like the old
  static wash in screenshots. Mouse-and-screen devices keep the fixed, drifting glow.
- **Bell on touch is a flat little button.** No hero-sized transformed, clipped layer (the layer
  now has `transform: none; overflow: visible` and the bell is placed from the photo's on-screen
  box), no rings (hint and playing), no stacked 3D edge layers. Still: play triangle, the ring
  that closes, the pause icon, the player bar. Desktop keeps rings and the 3D edge.
- Still switchable for bisecting: `?off=ambient` and `?off=bell` now only matter on a mouse device.

If it is still rough: `?off=haze,hues,vignette,scrim,smoke` on the new build will show what the
hero layers cost; next step would be flattening the static ones into the baked photo.
