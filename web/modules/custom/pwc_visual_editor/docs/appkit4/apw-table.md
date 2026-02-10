# apw-table

Auto-generated from `appkit4.esm.js` component metadata.

## Overview

- Chunk file: `p-d2a2c0b6.js`
- Component flags: `1`
- Properties: 16
- Internal state fields: 6
- Public methods: 0
- Event listeners: 0

## Properties

| Name | Attribute | Type (inferred) | Reflects | Mutable | Watchers | Raw Flags |
| --- | --- | --- | --- | --- | --- | --- |
| `animatedSorting` | `animated-sorting` | `boolean` | yes | yes | `handleDataChange`, `handleAnimationChange` | `1540` |
| `apwStyle` | _none_ | `unknown` | no | no | _none_ | `16` |
| `columns` | _none_ | `unknown` | no | no | _none_ | `16` |
| `condensed` | _none_ | `boolean` | no | no | _none_ | `4` |
| `currentPage` | `current-page` | `number` | no | no | `handleDataChange`, `handleAnimationChange`, `handleCurrentPageChange` | `2` |
| `disableDefaultSort` | `disable-default-sort` | `boolean` | no | no | _none_ | `4` |
| `hasCheckbox` | `has-checkbox` | `boolean` | no | no | _none_ | `4` |
| `hasTitle` | `has-title` | `boolean` | no | no | _none_ | `4` |
| `lazyLoad` | `lazy-load` | `boolean` | no | no | `handleAnimationChange` | `4` |
| `originalData` | _none_ | `unknown` | no | yes | `handleOriginalDataChange` | `1040` |
| `pageSize` | `page-size` | `number` | no | no | `handleDataChange` | `2` |
| `singlePageSorting` | `single-page-sorting` | `boolean` | no | no | `handleDataChange`, `handleAnimationChange` | `4` |
| `sortActive` | `sort-active` | `string` | yes | yes | `handleSortConditionChange` | `1537` |
| `sortPhase` | `sort-phase` | `number` | yes | yes | `handleSortConditionChange` | `1538` |
| `striped` | _none_ | `boolean` | no | no | _none_ | `4` |
| `tableId` | `table-id` | `string` | yes | yes | _none_ | `1537` |

## Public Methods

_None found in metadata._

## Internal State

| Name | Type (inferred) | Raw Flags |
| --- | --- | --- |
| `ceilingIndex` | `unknown` | `32` |
| `checkAll` | `unknown` | `32` |
| `checkboxList` | `unknown` | `32` |
| `data` | `unknown` | `32` |
| `displayData` | `unknown` | `32` |
| `floorIndex` | `unknown` | `32` |

## Listeners

_None found in metadata._

## Watchers

| Field | Watch Handlers |
| --- | --- |
| `animatedSorting` | `handleDataChange`, `handleAnimationChange` |
| `ceilingIndex` | `handleLazyLoadIndexChange` |
| `currentPage` | `handleDataChange`, `handleAnimationChange`, `handleCurrentPageChange` |
| `displayData` | `handleDisplayDataChange` |
| `floorIndex` | `handleLazyLoadIndexChange` |
| `lazyLoad` | `handleAnimationChange` |
| `originalData` | `handleOriginalDataChange` |
| `pageSize` | `handleDataChange` |
| `singlePageSorting` | `handleDataChange`, `handleAnimationChange` |
| `sortActive` | `handleSortConditionChange` |
| `sortPhase` | `handleSortConditionChange` |

## Notes

- Types are inferred from compiled flags and may be broader than source TypeScript definitions.
- This metadata does not include slot names, emitted custom events, or full method signatures.
- Review the original source package for behavioral details and usage examples.
