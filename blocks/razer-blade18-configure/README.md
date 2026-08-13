# Razer Blade 18 Configure

## Overview

`razer-blade18-configure` closes the page: three build cards, an
assurance rail, and a final panel pairing the product photograph with one
last invitation. It is the only section that names a price and the only
one that uses `/images/blade-18.webp` — at the size that 355 × 640 crop
was actually cut for, rather than blown up into a hero. The section
anchors at `#configure`, which is where the hero's primary CTA points.

## Prices

The defaults carry US recommended retail. `build-01` ($3,499.99, the
published starting price) and `build-03` ($4,499.99, the published
top-configuration price) come from razer.com; **`build-02` ($3,999.99) is
interpolated between them and should be confirmed before this page is
treated as a real storefront.** The `price-note` setting states that the
figures are indicative and vary by region.

## DA.live Authoring Model

8 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–8 |
| --- | --- |
| `setting` | key, value |
| `build` | key, name, gpu, memory, storage, price, flag |
| `assure` | key, label |

Setting keys: `content-mode`, `anchor-id`, `eyebrow`, `heading`, `body`,
`price-prefix`, `currency`, `cta-label`, `cta-href`, `closing-title`,
`closing-body`, `closing-cta-label`, `closing-cta-href`,
`closing-image`, `closing-image-alt`, `price-note`.

A build carrying any `flag` text becomes the highlighted card and wears
that text as its ribbon; clear the flag to level the row. `closing-image`
accepts a pasted picture, a link, or a path.

## Behavior

- The featured card is raised with the brand green and a ribbon rather
  than by being larger, so the row keeps its rhythm.
- All three CTAs point at the same razer.com destination, so each gets an
  `aria-label` naming its build — three identically-labelled links is a
  screen-reader problem, not a styling one.
- The photograph is `loading="lazy"` with its intrinsic dimensions set,
  so it reserves its box without blocking anything above it.

## Registration

Referenced from `models/_component-definition.json`; run
`npm run build:json` after model changes.

## Files

- [razer-blade18-configure.js](./razer-blade18-configure.js)
- [razer-blade18-configure.css](./razer-blade18-configure.css)
- [_razer-blade18-configure.json](./_razer-blade18-configure.json)
