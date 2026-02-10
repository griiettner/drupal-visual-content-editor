# apw-dropdown

Auto-generated from `appkit4.esm.js` component metadata.

## Overview

- Chunk file: `p-a1d8d3ad.js`
- Component flags: `1`
- Properties: 30
- Internal state fields: 12
- Public methods: 0
- Event listeners: 1

## Properties

| Name | Attribute | Type (inferred) | Reflects | Mutable | Watchers | Raw Flags |
| --- | --- | --- | --- | --- | --- | --- |
| `adaptivePosition` | `adaptive-position` | `boolean` | yes | yes | `handlePositionChange` | `1540` |
| `apwDisabled` | `apw-disabled` | `boolean` | yes | no | _none_ | `516` |
| `apwReadonly` | `apw-readonly` | `boolean` | yes | no | _none_ | `516` |
| `apwRequired` | `apw-required` | `boolean` | yes | no | _none_ | `516` |
| `apwStyle` | _none_ | `unknown` | no | no | _none_ | `16` |
| `apwTitle` | `apw-title` | `string` | yes | no | _none_ | `513` |
| `attachedDom` | `attached-dom` | `string` | yes | yes | `handlePositionChange` | `1537` |
| `comboboxTitle` | `combobox-title` | `string` | yes | no | _none_ | `513` |
| `dropdownId` | `dropdown-id` | `string` | yes | yes | _none_ | `1537` |
| `dropdownType` | `dropdown-type` | `string` | yes | no | `handleTypeChange` | `513` |
| `error` | _none_ | `boolean` | yes | no | _none_ | `516` |
| `fieldId` | `field-id` | `string` | yes | yes | _none_ | `1537` |
| `groupKey` | `group-key` | `string` | yes | no | _none_ | `513` |
| `hideTitleOnInput` | `hide-title-on-input` | `boolean` | yes | no | _none_ | `516` |
| `isLoading` | `is-loading` | `boolean` | yes | no | _none_ | `516` |
| `labelKey` | `label-key` | `string` | yes | no | _none_ | `513` |
| `list` | _none_ | `unknown` | no | yes | `handleListChange` | `1040` |
| `listId` | `list-id` | `string` | yes | yes | _none_ | `1537` |
| `maxHeight` | `max-height` | `number` | yes | no | _none_ | `514` |
| `multipleItemsText` | `multiple-items-text` | `string` | yes | no | _none_ | `513` |
| `noDefaultFilter` | `no-default-filter` | `boolean` | yes | no | _none_ | `516` |
| `noResultMsg` | `no-result-msg` | `string` | yes | no | _none_ | `513` |
| `placeholder` | _none_ | `string` | yes | no | _none_ | `513` |
| `selectType` | `select-type` | `string` | yes | yes | `handleListChange`, `handleListDataChange` | `1537` |
| `showAllSelectedTag` | `show-all-selected-tag` | `boolean` | yes | no | _none_ | `516` |
| `showMultipleTags` | `show-multiple-tags` | `boolean` | yes | no | _none_ | `516` |
| `showSelectAll` | `show-select-all` | `boolean` | yes | no | `handleListDataChange` | `516` |
| `showTag` | `show-tag` | `boolean` | yes | no | _none_ | `516` |
| `value` | _none_ | `unknown` | no | yes | `handleValueChange` | `1040` |
| `valueKey` | `value-key` | `string` | yes | no | _none_ | `513` |

## Public Methods

_None found in metadata._

## Internal State

| Name | Type (inferred) | Raw Flags |
| --- | --- | --- |
| `displayData` | `unknown` | `32` |
| `filteredList` | `unknown` | `32` |
| `focusable` | `unknown` | `32` |
| `focused` | `unknown` | `32` |
| `inputFocus` | `unknown` | `32` |
| `inputOverflow` | `unknown` | `32` |
| `inputRefValue` | `unknown` | `32` |
| `inputValue` | `unknown` | `32` |
| `inputWidth` | `unknown` | `32` |
| `keyboardFocus` | `unknown` | `32` |
| `showDelete` | `unknown` | `32` |
| `showList` | `unknown` | `32` |

## Listeners

| Event | Handler | Listener Flags |
| --- | --- | --- |
| `apwClose` | `tagClose` | `0` |

## Watchers

| Field | Watch Handlers |
| --- | --- |
| `adaptivePosition` | `handlePositionChange` |
| `attachedDom` | `handlePositionChange` |
| `dropdownType` | `handleTypeChange` |
| `filteredList` | `handleListDataChange` |
| `list` | `handleListChange` |
| `selectType` | `handleListChange`, `handleListDataChange` |
| `showList` | `handleShowListChange` |
| `showSelectAll` | `handleListDataChange` |
| `value` | `handleValueChange` |

## Notes

- Types are inferred from compiled flags and may be broader than source TypeScript definitions.
- This metadata does not include slot names, emitted custom events, or full method signatures.
- Review the original source package for behavioral details and usage examples.
