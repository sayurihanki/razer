# Razer Blade 18 Power

## Overview

`razer-blade18-power` is the performance and thermal section: a rail of
figures that count up on first view, a technical drawing of the cooling
stack with the heat path animated along it, and four cards for the parts
that do not need a diagram. All content is baked in.

The schematic is drawn rather than photographed because nobody has a
photograph of the inside of this machine, and the thing worth showing —
where the heat goes — is a diagram either way. It is set in the register
Razer uses for engineering material: one hairline weight throughout, one
accent, no shading.

## DA.live Authoring Model

7 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–7 |
| --- | --- |
| `setting` | key, value |
| `stat` | key, value, unit, label |
| `flow` | key, label |
| `card` | key, index, title, body, meta |

Setting keys: `content-mode`, `anchor-id`, `eyebrow`, `heading`, `body`,
`thermal-eyebrow`, `thermal-title`, `thermal-body`, `flow-label`,
`schematic-alt`.

A stat's `value` is parsed as a number for the count-up and its decimal
places are preserved, so `5.4` counts to one decimal and `175` to none. A
value that does not parse is rendered as written.

## Behavior

- The stat rail counts up once, the first time it is 40% on screen.
- The heat path is the same four bezier paths as the pipes, drawn again
  on top as a travelling dash, so the light cannot disagree with the
  pipework about where heat goes.
- Fan rotors need `transform-box: fill-box` — a CSS rotation would
  otherwise resolve against the SVG's origin rather than the rotor's and
  fling the blades into the corner of the drawing.
- Under `prefers-reduced-motion: reduce` the numbers are set rather than
  counted, the fans stop, and the heat path holds a static dash so it
  still reads as a path.

## Registration

Referenced from `models/_component-definition.json`; run
`npm run build:json` after model changes.

## Files

- [razer-blade18-power.js](./razer-blade18-power.js)
- [razer-blade18-power.css](./razer-blade18-power.css)
- [_razer-blade18-power.json](./_razer-blade18-power.json)
