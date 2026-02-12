# Accordion Block: Developer Documentation

Technical reference for `web/modules/custom/pwc_visual_editor/js/components/blocks/accordion.js`.

## File and Registration

- Class: `AccordionBlock extends window.PwcBaseBlock`
- Custom element: `pwc-accordion`
- Registry key: `accordion`

Registration happens at the bottom of the file:

```js
customElements.define('pwc-accordion', AccordionBlock);
window.pwcBlockRegistry.register(AccordionBlock);
```

## Block Metadata

Static metadata used by the block library:

- `blockName`: `accordion`
- `blockTitle`: `Accordion`
- `blockDescription`: `Add collapsible accordion sections with inner blocks.`
- `blockCategory`: `basic`

## Settings Contract

Defined in `blockSettings` and mapped to attributes by the registry/settings panel.

Settings:

- `titles` (`accordionTitles`): JSON string array of section titles
- `multiple` (`toggle`): allow multiple expanded sections
- `margin` (`spacing`): utility classes
- `padding` (`spacing`): utility classes
- `zebraStripes` (`toggle`): zebra wrapper modifier
- `customClasses` (`text`): additional safe class tokens
- `customHeaders` (`hidden`): JSON array of booleans by section index

Attribute mapping examples:

- `customHeaders` -> `custom-headers`
- `zebraStripes` -> `zebra-stripes`

## Data Model (Important)

Accordion content is stored in the parent accordion block's `innerBlocks` and partitioned by `columnIndex`.

Body block:

```json
{
  "type": "paragraph",
  "id": "block-abc123",
  "attributes": {
    "columnIndex": 1
  }
}
```

Header block:

```json
{
  "type": "heading",
  "id": "block-def456",
  "attributes": {
    "columnIndex": 1,
    "headerBlock": true
  }
}
```

Runtime-only expansion state is persisted on block data as:

```js
blockData._expandedAccordionIndices = [0, 2];
```

## Render Flow

`render()` does this in order:

1. Parse settings (`titles`, booleans, classes).
2. Sync expanded state with section count and `multiple`.
3. Build section markup (header + body).
4. Render body inner blocks via `renderInnerBlocks()`.
5. Render header inner blocks via `renderHeaderBlocks()`.
6. Bind toggle/add/drop/drag handlers (edit mode only for editing controls).

Note: Current implementation renders custom editor markup (`.pwc-accordion-*`) and not `<apw-accordion-group>`.

## Section Mapping Logic

Body selection:

```js
return (block.attributes?.columnIndex || 0) === sectionIndex &&
  !block.attributes?.headerBlock;
```

Header selection:

```js
return (block.attributes?.columnIndex || 0) === sectionIndex &&
  block.attributes?.headerBlock === true;
```

## Insert Flows

### Body insertion

- UI trigger: body `+` button or body drop.
- Call path: `openBlockLibraryForSection()` -> panel `setInsertPosition(-1, parentId, sectionIndex)`.
- Result: inserted block gets `attributes.columnIndex = sectionIndex`.

### Header insertion

- UI trigger: header `+` button or header drop.
- Call path: `openBlockLibraryForHeader()` -> panel `setInsertPosition(..., metadata)`.
- Metadata includes `headerBlock: true` and section info.
- Result: inserted block gets `columnIndex` + `headerBlock: true`.

## Heading Title Inheritance

When first heading is added to a custom header section and its content is empty/default, it inherits the section title:

```js
if (blockData.type === 'heading' && !hasHeadingAlready) {
  const current = (blockData.attributes?.content || '').trim();
  if (!current || current === 'Heading') {
    blockData.attributes.content = titles[sectionIndex] || `Accordion Item ${sectionIndex + 1}`;
  }
}
```

## Expansion Behavior

- `toggleSection(index)` toggles state.
- `multiple=false` enforces single-open behavior.
- `syncExpandedSections(total, multiple)` normalizes saved indices.
- `applyExpandedSections()` updates DOM classes and `aria-expanded`.
- `persistExpandedSections()` writes normalized indices back to state.

## Settings Panel Integration

The `accordionTitles` field in `settings-panel.js`:

- Updates titles JSON live while typing.
- Adds sections with default title text.
- Removes sections and reindexes all inner blocks above removed index.
- Rewrites `_expandedAccordionIndices` and `customHeaders` to stay aligned.

This is why section deletion does not leave orphaned `columnIndex` values.

## Drag and Reorder

Accordion block overrides base hover controls:

- Uses custom `.pwc-accordion-handle` for drag start gate.
- Sets `application/x-pwc-block-reorder` transfer type.
- Creates reorder drop zones through base block behavior.
- Prevents accidental dragging unless started from accordion handle.

## Safety/Validation Helpers

- `parseTitles()`: safe JSON parsing + fallback to defaults.
- `getBooleanAttribute(name)`: robust boolean parsing for DOM attributes.
- `getSafeClassTokens(str)`: whitelist `[A-Za-z0-9_-]+`.
- `escapeAttr(str)`: escapes user-facing title text before injection.

## Event + State Updates

When inserting blocks directly from accordion methods (`addBlockToSection` / `addBlockToHeader`):

- Parent `innerBlocks.push(blockData)`
- `window.pwcEditorState.isDirty = true`
- `window.pwcEditorState.pushHistory()`
- `window.pwcEditorState.emit('blockAdd', { ... })`
- Re-render accordion and reselect inserted block

This keeps undo/redo and selection behavior consistent with other block flows.

## Common Extension Scenarios

### 1) Add a new Accordion setting

Add definition in `blockSettings`, observe attribute if needed, then consume in `render()`.

```js
{
  name: 'compact',
  type: 'toggle',
  label: 'Compact',
  default: false,
  tab: 'style'
}
```

Then:

```js
const compact = this.getBooleanAttribute('compact');
const wrapperClasses = [
  'pwc-accordion-wrapper',
  compact ? 'pwc-accordion-wrapper--compact' : '',
].join(' ');
```

### 2) Programmatically add a body block

```js
const accordion = window.pwcEditorState.findBlock(accordionId);
const blockData = window.pwcBlockRegistry.createBlockData('paragraph');
blockData.attributes = { ...(blockData.attributes || {}), columnIndex: 2 };
accordion.innerBlocks = accordion.innerBlocks || [];
accordion.innerBlocks.push(blockData);
window.pwcEditorState.isDirty = true;
window.pwcEditorState.pushHistory();
window.pwcEditorState.emit('blockAdd', { block: blockData, parentId: accordionId });
```

### 3) Programmatically add a header block

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

## Known Gotchas

- `parseCustomHeaders()` exists in accordion block but current rendering logic relies on actual header blocks to decide custom header content.
- Reordering sections is supported in Tab settings today, not in Accordion settings UI.
- Keep `columnIndex` and section titles aligned whenever you manipulate `innerBlocks` manually.

## Related Files

- `web/modules/custom/pwc_visual_editor/js/components/blocks/accordion.js`
- `web/modules/custom/pwc_visual_editor/js/components/settings-panel.js`
- `web/modules/custom/pwc_visual_editor/js/components/block-library-panel.js`
- `web/modules/custom/pwc_visual_editor/js/components/blocks/base-block.js`
- `web/modules/custom/pwc_visual_editor/js/services/block-registry.js`
- `web/modules/custom/pwc_visual_editor/js/services/editor-state.js`
