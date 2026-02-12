# Accordion Block: Developer Documentation

Technical reference for the Accordion block implementation:
`web/modules/custom/pwc_visual_editor/js/components/blocks/accordion.js`.

## Overview

`AccordionBlock` is a container block that stores child blocks in `innerBlocks`.
Each child block is mapped to a section using `attributes.columnIndex`.

- Body block: has `columnIndex`
- Header block: has `columnIndex` + `headerBlock: true`

The block supports:

- Collapsible sections
- Optional multi-open behavior
- Body and header drop zones
- Inline add buttons for both body and header
- Drag handle for reordering the entire Accordion block

## Registration and metadata

Class metadata:

```js
static get blockName() { return 'accordion'; }
static get blockTitle() { return 'Accordion'; }
static get blockCategory() { return 'basic'; }
```

Registration:

```js
customElements.define('pwc-accordion', AccordionBlock);
window.pwcBlockRegistry.register(AccordionBlock);
```

## Settings contract

Defined in `blockSettings`:

- `titles` (`accordionTitles`): JSON array string
- `multiple` (`toggle`): allow more than one section open
- `margin` (`spacing`)
- `padding` (`spacing`)
- `zebraStripes` (`toggle`)
- `customClasses` (`text`)
- `customHeaders` (`hidden`, JSON array)

Observed attributes:

```js
[
  'block-id',
  'titles',
  'multiple',
  'margin',
  'padding',
  'custom-classes',
  'custom-headers',
  'zebra-stripes',
]
```

## Data model

Body block example:

```json
{
  "type": "paragraph",
  "id": "block-123",
  "attributes": {
    "columnIndex": 1
  }
}
```

Header block example:

```json
{
  "type": "heading",
  "id": "block-456",
  "attributes": {
    "columnIndex": 1,
    "headerBlock": true
  }
}
```

Runtime expansion state is stored on parent block data:

```js
blockData._expandedAccordionIndices = [0, 2];
```

## Render lifecycle

`render()` flow:

1. Parse titles/settings.
2. Normalize expanded sections via `syncExpandedSections(...)`.
3. Build section HTML.
4. Render body inner blocks (`renderInnerBlocks()`).
5. Render header inner blocks (`renderHeaderBlocks()`).
6. Bind toggle/add/drop handlers.
7. In edit mode, bind drag handle and drop zones.

## Section mapping logic

Body filter:

```js
(block.attributes?.columnIndex || 0) === sectionIndex &&
!block.attributes?.headerBlock
```

Header filter:

```js
(block.attributes?.columnIndex || 0) === sectionIndex &&
block.attributes?.headerBlock === true
```

## Insert flows

Body insertion path:

- UI trigger: body `+` button or body drop
- `openBlockLibraryForSection(sectionIndex)`
- `setInsertPosition(-1, this.blockId, sectionIndex)`

Header insertion path:

- UI trigger: header `+` button or header drop
- `openBlockLibraryForHeader(sectionIndex)`
- `setInsertPosition(-1, this.blockId, sectionIndex, { headerBlock: true, ... })`

## Expansion behavior

`toggleSection(sectionIndex)`:

- `multiple = true`: toggles section on/off independently
- `multiple = false`: keeps only one section open

State helpers:

- `syncExpandedSections(totalSections, multiple)`
- `persistExpandedSections()`
- `applyExpandedSections()`

The DOM state uses:

- `.pwc-accordion-section--expanded`
- `.pwc-accordion-section--collapsed`
- `aria-expanded="true|false"` on header

## Sample code: add a body block programmatically

```js
const accordionId = 'your-accordion-id';
const accordion = window.pwcEditorState.findBlock(accordionId);

const blockData = window.pwcBlockRegistry.createBlockData('paragraph');
blockData.attributes = {
  ...(blockData.attributes || {}),
  columnIndex: 2,
};

accordion.innerBlocks = accordion.innerBlocks || [];
accordion.innerBlocks.push(blockData);

window.pwcEditorState.isDirty = true;
window.pwcEditorState.pushHistory();
window.pwcEditorState.emit('blockAdd', { block: blockData, parentId: accordionId });
```

## Sample code: add a header block programmatically

```js
const accordionId = 'your-accordion-id';
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

## Sample code: safely parse titles

```js
const titlesStr = element.getAttribute('titles') || '["Accordion Item 1"]';
let titles = ['Accordion Item 1'];

try {
  const parsed = JSON.parse(titlesStr);
  if (Array.isArray(parsed) && parsed.length > 0) {
    titles = parsed.map((t, i) => (String(t || '').trim() || `Accordion Item ${i + 1}`));
  }
} catch (e) {
  // Keep fallback defaults on malformed JSON.
}
```

## Implementation notes and gotchas

- `columnIndex` must stay aligned with section order.
- If you delete a section, reindex following blocks.
- `customHeaders` exists as a hidden setting but rendered header content is determined by `headerBlock` inner blocks.
- Keep all block additions/deletions synced with history (`pushHistory`) and `blockAdd`/state events.

## Related files

- `web/modules/custom/pwc_visual_editor/js/components/blocks/accordion.js`
- `web/modules/custom/pwc_visual_editor/js/components/settings-panel.js`
- `web/modules/custom/pwc_visual_editor/js/components/block-library-panel.js`
- `web/modules/custom/pwc_visual_editor/js/services/editor-state.js`
- `web/modules/custom/pwc_visual_editor/js/services/block-registry.js`
