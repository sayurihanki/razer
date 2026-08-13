# Razer Blade 18 Specs

## Overview

`razer-blade18-specs` is the technical specification sheet: seven groups
of definition rows with a sticky index beside them on desktop. It is the
quiet section on purpose — everything above it argues, this one only
answers — so it carries no motion beyond the entrance the rest of the
page uses. All content is baked in, and the section anchors at
`#tech-specs`.

## DA.live Authoring Model

6 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–5 |
| --- | --- |
| `setting` | key, value |
| `group` | key, label |
| `spec` | key, group, label, value |

Setting keys: `content-mode`, `anchor-id`, `eyebrow`, `heading`, `body`,
`index-label`.

A `spec` names its group by that group's key (`group-01` … `group-07`). A
spec whose group key matches nothing falls into the first group rather
than disappearing, and a group left with no specs — every one of them
cleared — is dropped from both the index and the sheet.

## Behavior

- The index is a plain anchor list: a wrapping row of pills on mobile, a
  sticky rail on desktop from 981px.
- Each group carries `scroll-margin-top` clear of the fixed site header,
  so an index jump lands on the group title.

## Registration

Referenced from `models/_component-definition.json`; run
`npm run build:json` after model changes.

## Files

- [razer-blade18-specs.js](./razer-blade18-specs.js)
- [razer-blade18-specs.css](./razer-blade18-specs.css)
- [_razer-blade18-specs.json](./_razer-blade18-specs.json)
