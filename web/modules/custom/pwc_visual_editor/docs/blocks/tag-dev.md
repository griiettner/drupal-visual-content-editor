# Accordion Block: Developer Documentation

Technical reference for the Accordion block implementation in:

- `web/modules/custom/pwc_visual_editor/js/components/blocks/accordion.js`

## Overview

The Accordion block is a container block that stores child blocks in `innerBlocks`.  
Each child block is mapped to a specific accordion section using `attributes.columnIndex`.

Header content is distinguished from body content with:

- `attributes.headerBlock = true` for header blocks
- no `headerBlock` flag for body blocks

## Registration and metadata

The block class extends `window.PwcBaseBlock` and is registered as both a custom element and a block-registry entry.

```js
class AccordionBlock extends window.PwcBaseBlock {
  static get blockName() { return 'accordion'; }
  static get blockTitle() { return 'Accordion'; }
  static get blockDescription() { return 'Add collapsible accordion sections with inner blocks.'; }
  static get blockCategory() { return 'basic'; }
}

customElements.define('pwc-accordion', AccordionBlock);
window.pwcBlockRegistry.register(AccordionBlock);
```

## Settings contract

`blockSettings` defines the settings panel schema:

- `titles` (`accordionTitles`): JSON string of section titles
- `multiple` (`toggle`): allow multiple sections open
- `margin` (`spacing`)
- `padding` (`spacing`)
- `zebraStripes` (`toggle`)
- `customClasses` (`text`)
- `customHeaders` (`hidden`): internal JSON boolean array

Example attribute mapping:

- `zebraStripes` -> `zebra-stripes`
- `customHeaders` -> `custom-headers`

## Data model

Body block example:

```json
{
  "id": "block-1",
  "type": "paragraph",
  "attributes": {
    "columnIndex": 1
  }
}
```

Header block example:

```json
{
  "id": "block-2",
  "type": "heading",
  "attributes": {
    "columnIndex": 1,
    "headerBlock": true
  }
}
```

Expanded state is persisted per accordion block:

```js
blockData._expandedAccordionIndices = [0, 2];
```

## Render flow

`render()` performs these steps:

1. Read and parse attributes/settings.
2. Normalize expanded indices with `syncExpandedSections()`.
3. Build accordion HTML for all titles.
4. Render body blocks via `renderInnerBlocks()`.
5. Render header blocks via `renderHeaderBlocks()`.
6. Bind event handlers for toggling, insertion, drop zones, and drag controls.

## Section mapping logic

Body selection:

```js
(block.attributes?.columnIndex || 0) === sectionIndex &&
!block.attributes?.headerBlock
```

Header selection:

```js
(block.attributes?.columnIndex || 0) === sectionIndex &&
block.attributes?.headerBlock === true
```

## Insertion flows

### Body insertion

- Triggered from body `+` button or body drop.
- Uses `setInsertPosition(-1, this.blockId, sectionIndex)`.
- New block is tagged with `columnIndex`.

### Header insertion

- Triggered from header `+` button or header drop.
- Uses `setInsertPosition(..., { headerBlock: true, ... })`.
- New block is tagged with `columnIndex` and `headerBlock: true`.

## Direct insertion methods

`addBlockToSection(blockData, sectionIndex)`:

- sets `blockData.attributes.columnIndex`
- pushes into parent accordion `innerBlocks`
- marks editor dirty, pushes history, emits `blockAdd`
- rerenders and selects inserted block

`addBlockToHeader(blockData, sectionIndex)` adds the same state steps plus:

- sets `headerBlock: true`
- applies heading title inheritance
- updates `custom-headers` metadata

## Heading title inheritance

When the first header heading in a section is inserted and content is empty/default, it inherits the section title:

```js
if (blockData.type === 'heading' && !hasHeadingAlready) {
  const current = (blockData.attributes?.content || '').trim();
  if (!current || current === 'Heading') {
    blockData.attributes.content = titles[sectionIndex] || `Accordion Item ${sectionIndex + 1}`;
  }
}
```

## Expansion behavior

- `toggleSection(index)` controls open/close.
- `multiple=false` keeps a single-open model.
- `syncExpandedSections()` validates saved state.
- `applyExpandedSections()` syncs classes and `aria-expanded`.
- `persistExpandedSections()` writes normalized indices to block data.

## Validation and safety helpers

- `parseTitles()` safely parses JSON and falls back to defaults.
- `getBooleanAttribute(name)` handles common boolean string forms.
- `getSafeClassTokens(classes)` filters classes to `A-Z a-z 0-9 _ -`.
- `escapeAttr(str)` prevents unsafe HTML injection in title output.

## Example: add a custom setting

Add to `blockSettings`:

```js
{
  name: 'compact',
  type: 'toggle',
  label: 'Compact',
  default: false,
  tab: 'style',
}
```

Use in render:

```js
const compact = this.getBooleanAttribute('compact');
const wrapperClasses = [
  'pwc-accordion-wrapper',
  compact ? 'pwc-accordion-wrapper--compact' : '',
].join(' ');
```

## Example: programmatically add a body block

```js
const accordion = window.pwcEditorState.findBlock(accordionId);
const blockData = window.pwcBlockRegistry.createBlockData('paragraph');
blockData.attributes = { ...(blockData.attributes || {}), columnIndex: 0 };

accordion.innerBlocks = accordion.innerBlocks || [];
accordion.innerBlocks.push(blockData);

window.pwcEditorState.isDirty = true;
window.pwcEditorState.pushHistory();
window.pwcEditorState.emit('blockAdd', { block: blockData, parentId: accordionId });
```

## Example: programmatically add a header block

```js
const accordion = window.pwcEditorState.findBlock(accordionId);
const heading = window.pwcBlockRegistry.createBlockData('heading');
heading.attributes = {
  ...(heading.attributes || {}),
  columnIndex: 0,
  headerBlock: true,
  content: 'Custom Header',
};

accordion.innerBlocks = accordion.innerBlocks || [];
accordion.innerBlocks.push(heading);

window.pwcEditorState.isDirty = true;
window.pwcEditorState.pushHistory();
window.pwcEditorState.emit('blockAdd', { block: heading, parentId: accordionId });
```

## Known implementation notes

- `parseCustomHeaders()` is present, but rendering currently decides header mode based on actual header blocks.
- Section reindexing after deletion is handled in settings-panel logic.
- If you manipulate `innerBlocks` manually, keep `columnIndex` aligned with title indices.

## Related files

- `web/modules/custom/pwc_visual_editor/js/components/blocks/accordion.js`
- `web/modules/custom/pwc_visual_editor/js/components/settings-panel.js`
- `web/modules/custom/pwc_visual_editor/js/components/block-library-panel.js`
- `web/modules/custom/pwc_visual_editor/js/services/block-registry.js`
- `web/modules/custom/pwc_visual_editor/js/services/editor-state.js`
