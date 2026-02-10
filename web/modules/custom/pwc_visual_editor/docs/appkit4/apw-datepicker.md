# apw-datepicker

Auto-generated from `appkit4.esm.js` component metadata.

## Overview

- Chunk file: `p-ea6e446a.js`
- Component flags: `65`
- Properties: 34
- Internal state fields: 10
- Public methods: 3
- Event listeners: 0

## Properties

| Name | Attribute | Type (inferred) | Reflects | Mutable | Watchers | Raw Flags |
| --- | --- | --- | --- | --- | --- | --- |
| `adaptivePosition` | `adaptive-position` | `boolean` | yes | no | `resetDialogPosition` | `516` |
| `apwCalendarStyle` | _none_ | `unknown` | no | no | _none_ | `16` |
| `apwDisabled` | `apw-disabled` | `boolean` | yes | no | `disabeldChanged` | `516` |
| `apwReadonly` | `apw-readonly` | `boolean` | yes | no | _none_ | `516` |
| `apwRequired` | `apw-required` | `boolean` | yes | no | _none_ | `516` |
| `apwStyle` | _none_ | `unknown` | no | no | _none_ | `16` |
| `apwTitle` | `apw-title` | `string` | yes | no | _none_ | `513` |
| `attachedDom` | `attached-dom` | `string` | yes | no | `attachedDomChanged` | `513` |
| `autoClose` | `auto-close` | `boolean` | yes | no | _none_ | `516` |
| `calendarPosition` | `calendar-position` | `string` | yes | no | `resetDialogPosition` | `513` |
| `custom` | _none_ | `boolean` | yes | no | `customChanged` | `516` |
| `customOptions` | _none_ | `unknown` | no | no | `customOptionsChanged` | `16` |
| `dateformat` | _none_ | `string` | yes | no | `resetDateformat` | `513` |
| `dateSeparator` | `date-separator` | `string` | yes | no | _none_ | `513` |
| `disabledDates` | _none_ | `unknown` | no | no | `disabledDatesChanged` | `16` |
| `disabledDays` | `disabled-days` | `any` | yes | no | `disabledDatesChanged` | `520` |
| `disabledRanges` | _none_ | `unknown` | no | no | `disabledDatesChanged` | `16` |
| `disableOutsideClose` | `disable-outside-close` | `boolean` | yes | no | _none_ | `516` |
| `editable` | _none_ | `boolean` | yes | no | `resetDateformat` | `516` |
| `error` | _none_ | `boolean` | yes | no | _none_ | `516` |
| `fieldId` | `field-id` | `string` | yes | no | _none_ | `513` |
| `firstDayOfWeek` | `first-day-of-week` | `number` | yes | yes | `firstDayOfWeekChanged` | `1538` |
| `hideTitleOnInput` | `hide-title-on-input` | `boolean` | yes | no | _none_ | `516` |
| `language` | _none_ | `string` | yes | yes | `languageChanged` | `1537` |
| `maxDate` | _none_ | `unknown` | no | no | `disabledDatesChanged` | `16` |
| `minDate` | _none_ | `unknown` | no | yes | `disabledDatesChanged` | `1040` |
| `placeholder` | _none_ | `string` | yes | no | _none_ | `513` |
| `range` | _none_ | `boolean` | yes | no | _none_ | `516` |
| `rangeConnectorFormat` | `range-connector-format` | `string` | yes | no | _none_ | `513` |
| `selectedDates` | _none_ | `unknown` | no | yes | `selectedDatesChanged` | `1040` |
| `showOtherMonths` | `show-other-months` | `boolean` | yes | no | _none_ | `516` |
| `type` | _none_ | `string` | yes | no | `resetDialogPosition` | `513` |
| `useCustomValidation` | `use-custom-validation` | `boolean` | yes | no | _none_ | `516` |
| `view` | _none_ | `string` | yes | no | `viewChanged` | `513` |

## Public Methods

| Name | Raw Flags |
| --- | --- |
| `closeCalendar` | `64` |
| `openCalendar` | `64` |
| `toggleCalendar` | `64` |

## Internal State

| Name | Type (inferred) | Raw Flags |
| --- | --- | --- |
| `_editable` | `unknown` | `32` |
| `_error` | `unknown` | `32` |
| `_selectedDates` | `unknown` | `32` |
| `dateCells` | `unknown` | `32` |
| `dateCellsRight` | `unknown` | `32` |
| `dateTextInput` | `unknown` | `32` |
| `hoverDates` | `unknown` | `32` |
| `locale` | `unknown` | `32` |
| `show` | `unknown` | `32` |
| `value` | `unknown` | `32` |

## Listeners

_None found in metadata._

## Watchers

| Field | Watch Handlers |
| --- | --- |
| `adaptivePosition` | `resetDialogPosition` |
| `apwDisabled` | `disabeldChanged` |
| `attachedDom` | `attachedDomChanged` |
| `calendarPosition` | `resetDialogPosition` |
| `custom` | `customChanged` |
| `customOptions` | `customOptionsChanged` |
| `dateformat` | `resetDateformat` |
| `dateTextInput` | `dateTextInputChanged` |
| `disabledDates` | `disabledDatesChanged` |
| `disabledDays` | `disabledDatesChanged` |
| `disabledRanges` | `disabledDatesChanged` |
| `editable` | `resetDateformat` |
| `firstDayOfWeek` | `firstDayOfWeekChanged` |
| `language` | `languageChanged` |
| `maxDate` | `disabledDatesChanged` |
| `minDate` | `disabledDatesChanged` |
| `selectedDates` | `selectedDatesChanged` |
| `show` | `showChanged` |
| `type` | `resetDialogPosition` |
| `view` | `viewChanged` |

## Notes

- Types are inferred from compiled flags and may be broader than source TypeScript definitions.
- This metadata does not include slot names, emitted custom events, or full method signatures.
- Review the original source package for behavioral details and usage examples.
