# Razer Blade 18 Dual Mode

## Overview

`razer-blade18-dualmode` is the page's one interactive argument. The
Blade 18's headline feature is a panel that runs two ways — UHD+ at 240Hz
for colour work, FHD+ at 440Hz for competition — so the block lets the
visitor switch between them and watch a simulated panel change. All
content is baked in.

## What the simulation does and does not claim

The canvas is a simulation and the caption says so. A browser cannot
paint at 440Hz, and the real difference in sample-and-hold persistence
between the two modes (speed ÷ refresh, so roughly 3.7px against 2.0px at
a realistic pan rate) is too small to see on any screen this page loads
on. So:

- **The lattice is honest.** 3px against 6px — the same 2:1 the two modes'
  linear pixel density really differs by.
- **The marker's trail is exaggerated.** It crosses at the same rate in
  both modes and only the trail length changes, scaled by 240 ÷ Hz. That
  is the shape of real persistence blur, drawn large enough to see.
- **The ribbon palette is mood, not measurement.** UHD+ gets the full
  DCI-P3 spread it is sold on; FHD+ the tighter competition scene.

Nothing in the block is presented as a benchmark.

## DA.live Authoring Model

8 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–8 |
| --- | --- |
| `setting` | key, value |
| `mode` | key, label, badge, resolution, refresh, headline, body |
| `spec` | key, label, value |

Setting keys: `content-mode`, `anchor-id`, `eyebrow`, `heading`, `body`,
`switch-label`, `caption`, `pitch-label`, `stat-resolution`,
`stat-refresh`, `stat-pixels`.

`resolution` is parsed for its two numbers, which drive the pixel count
readout, so `3840 × 2400` and `3840x2400` both work. A mode with no
drawing constants registered against its key falls back to the UHD+ ones.

## Behavior

- The switch is a real tablist: roving tabindex, arrow-key navigation,
  and one `tabpanel` holding the argument.
- The refresh readout counts between values on switch.
- The canvas only animates while it is on screen and stops when the tab
  is backgrounded.
- Under `prefers-reduced-motion: reduce` the canvas paints one static
  frame per mode and the readouts snap rather than count.

## Registration

Referenced from `models/_component-definition.json`; run
`npm run build:json` after model changes.

## Files

- [razer-blade18-dualmode.js](./razer-blade18-dualmode.js)
- [razer-blade18-dualmode.css](./razer-blade18-dualmode.css)
- [_razer-blade18-dualmode.json](./_razer-blade18-dualmode.json)
