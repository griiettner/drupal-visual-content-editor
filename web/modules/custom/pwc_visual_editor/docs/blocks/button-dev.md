# Accordion Block: Developer Documentation

This document explains how the Accordion block works internally in `pwc_visual_editor`, including data shape, settings, and extension points.

## File location

- `web/modules/custom/pwc_visual_editor/js/components/blocks/accordion.js`

## Block registration

The block is a custom element class extending `window.PwcBaseBlock`:

```js
class AccordionBlock extends window.PwcBaseBlock {
  static get blockName() { return 'accordion'; }
  static get blockTitle() { return 'Accordion'; }
}

customElements.define('pwc-accordion', AccordionBlock);
window.pwcBlockRegistry.register(AccordionBlock);
```

## Key settings (blockSettings)

Main settings exposed in the editor:

- `titles` (`accordionTitles`) -> JSON array of section titles
- `multiple` (`toggle`) -> allow multiple expanded sections
- `margin` / `padding` (`spacing`) -> utility spacing classes
- `zebraStripes` (`toggle`) -> alternate section background
- `customClasses` (`text`) -> extra CSS classes
- `customHeaders` (`hidden`) -> JSON boolean array tracking sections that use custom header content

Example of stored attributes:

```json
{
  "titles": "[\"Overview\", \"FAQ\", \"Support\"]",
  "multiple": false,
  "margin": "mt-16 mb-16",
  "padding": "p-16",
  "zebraStripes": true,
  "customClasses": "my-accordion",
  "customHeaders": "[true,false,false]"
}
```

## Data model for inner blocks

Accordion children are stored in `innerBlocks` of the parent accordion block.

Each child uses `columnIndex` to map to a section:

- `columnIndex: 0` -> first section
- `columnIndex: 1` -> second section

Header blocks are identified by:
- `headerBlock: true`

Body blocks are:
- `headerBlock` missing or `false`

Example:

```json
{
  "id": "accordion-1",
  "type": "accordion",
  "attributes": {
    "titles": "[\"Overview\", \"FAQ\"]"
  },
  "innerBlocks": [
    {
      "id": "heading-a",
      "type": "heading",
      "attributes": {
        "columnIndex": 0,
        "headerBlock": true,
        "content": "Overview"
      }
    },
    {
      "id": "paragraph-a",
      "type": "paragraph",
      "attributes": {
        "columnIndex": 0
      }
    }
  ]
}
```

## Render flow

High-level `render()` flow:

1. Parse attributes (`titles`, toggles, classes)
2. Sync expanded state with editor data
3. Build section markup
4. Render body inner blocks into `.pwc-accordion-section__content`
5. Render header inner blocks into `.pwc-accordion-section__header-content`
6. Attach handlers (toggle, add, drag/drop)

The section HTML is generated per title and includes:
- Header wrapper (`.pwc-accordion-section__header`)
- Body drop zone (`.pwc-accordion-section__body`)
- Optional add buttons in edit mode

## Section expansion logic

Expanded sections are tracked by `this._expandedSections` (`Set<number>`).

Methods:
- `syncExpandedSections(totalSections, multiple)` -> normalizes valid indices and default open section
- `toggleSection(sectionIndex)` -> single-open or multi-open behavior
- `applyExpandedSections()` -> updates expanded/collapsed classes and `aria-expanded`
- `persistExpandedSections()` -> writes temporary UI state to `blockData._expandedAccordionIndices`

## Add block behavior

Body insertion:

```js
addBlockToSection(blockData, sectionIndex) {
  blockData.attributes = blockData.attributes || {};
  blockData.attributes.columnIndex = sectionIndex;
  // push into accordion.innerBlocks, set dirty, history, emit event
}
```

Header insertion:

```js
addBlockToHeader(blockData, sectionIndex) {
  blockData.attributes = blockData.attributes || {};
  blockData.attributes.columnIndex = sectionIndex;
  blockData.attributes.headerBlock = true;
  this.applyHeadingTitleInheritance(blockData, sectionIndex);
}
```

Special rule:
- `applyHeadingTitleInheritance()` auto-fills the first header `heading` block with the section title if content is empty/default.

## Drag and drop integration

The block supports:

- Inserting blocks by drop into section body/header zones
- Reordering the whole Accordion block via a dedicated handle

Reorder drag uses MIME type:
- `application/x-pwc-block-reorder`

Insert drag uses:
- `text/plain` with block type

Drop zone setup methods:
- `setupSectionDropZones()`
- `setupHeaderDropZones()`
- `setupAccordionDragHandle()`

## Safety helpers

- `parseTitles()` safely parses title JSON and falls back to defaults
- `getBooleanAttribute(name)` normalizes boolean-like string values
- `getSafeClassTokens(classes)` prevents unsafe class tokens
- `escapeAttr(str)` escapes HTML-sensitive characters for output

## Extending the Accordion block

Common extension points:

1. Add new settings in `blockSettings`.
2. Add new observed attributes in `observedAttributes`.
3. Read those attributes in `render()`.
4. Apply classes/markup/logic based on the new setting.

Example: add an `outlined` style toggle:

```js
// In blockSettings
{
  name: 'outlined',
  type: 'toggle',
  label: 'Outlined',
  default: false,
  tab: 'style',
}
```

```js
// In observedAttributes
'outlined'
```

```js
// In render
const outlined = this.getBooleanAttribute('outlined');
const wrapperClasses = [
  'pwc-accordion-wrapper',
  outlined ? 'pwc-accordion-wrapper--outlined' : '',
].join(' ');
```

## Cache/deployment notes

Because this is JavaScript in a custom module:

- JS changes usually appear immediately in this development setup.
- Clear Drupal cache when needed for routing/service/schema-level changes:

```bash
docker compose exec drupal bash -c "cd /opt/drupal && ./vendor/bin/drush cr"
```

