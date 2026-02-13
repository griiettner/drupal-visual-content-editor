# Layout Block: Developer Documentation

Technical reference for `web/modules/custom/pwc_visual_editor/js/components/blocks/layout-block.js`.

## File and Registration

- Class: `LayoutBlock extends window.PwcBaseBlock`
- Custom element: `pwc-layout`
- Registry key: `layout`

Registration at file end:

```js
customElements.define('pwc-layout', LayoutBlock);
window.pwcBlockRegistry.register(LayoutBlock);
```

## Block Metadata

Static metadata used by the block library:

- `blockName`: `layout`
- `blockTitle`: `Container`
- `blockDescription`: `Create column-based layouts to organize content`
- `blockCategory`: `layout`

## Layout Variations

`layoutVariations` defines column ratios using flex values.

```js
{
  '50-50': { columns: [{ flex: 1 }, { flex: 1 }] },
  '30-70': { columns: [{ flex: 3 }, { flex: 7 }] },
  '25-50-25': { columns: [{ flex: 1 }, { flex: 2 }, { flex: 1 }] },
}
```

The selected `layout` attribute determines how many column containers are rendered and each column's `flex` style.

## Settings Contract

Defined in `blockSettings` and mapped by the registry/settings panel to DOM attributes.

Settings:

- `layout` (`layoutPicker`)
- `gap` (`gapPicker`)
- `verticalAlign` (`verticalAlignPicker`)
- `margin` (`spacing`)
- `padding` (`spacing`)
- `backgroundColor` (`colorSwatch`)
- `borderWidth` (`borderWidthPicker`)
- `borderColor` (`colorSwatch`)
- `borderRadius` (`radiusPicker`)

Important attribute mappings:

- `verticalAlign` -> `vertical-align`
- `backgroundColor` -> `background-color`
- `borderWidth` -> `border-width`
- `borderColor` -> `border-color`
- `borderRadius` -> `border-radius`

## Observed Attributes

The element re-renders when these change:

```js
[
  'layout',
  'gap',
  'vertical-align',
  'margin',
  'padding',
  'background-color',
  'border-width',
  'border-color',
  'border-radius',
  'block-id',
  'block-type',
]
```

## Data Model for Inner Blocks

Inner blocks are stored on the parent layout block's `innerBlocks` array and mapped to columns with `attributes.columnIndex`.

Example:

```json
{
  "type": "paragraph",
  "id": "block-abc123",
  "attributes": {
    "columnIndex": 1
  }
}
```

Column filtering uses:

```js
return (block.attributes?.columnIndex || 0) === columnIndex;
```

## Render Flow

`render()` performs:

1. Resolve layout config from `layoutVariations`.
2. Resolve gap (`none/small/medium/large`) to px.
3. Resolve vertical align to `align-items` value.
4. Build column HTML with empty-state and add button (edit mode).
5. Build wrapper classes from spacing and style attributes.
6. Inject layout controls (drag handle + delete) in edit mode.
7. Render inner blocks into each column.
8. Bind add/drop/drag handlers in edit mode.

## Output Structure (Simplified)

```html
<pwc-layout block-id="layout-1" layout="50-50" gap="medium">
  <div class="pwc-layout-block pwc-layout-block--50-50" style="gap: 16px; align-items: flex-start;">
    <div class="pwc-layout-column" data-column-index="0" data-layout-id="layout-1">
      <div class="pwc-layout-column__content"></div>
      <button class="pwc-layout-column__add-btn" data-column="0"></button>
    </div>
    <div class="pwc-layout-column" data-column-index="1" data-layout-id="layout-1">
      <div class="pwc-layout-column__content"></div>
      <button class="pwc-layout-column__add-btn" data-column="1"></button>
    </div>
  </div>
</pwc-layout>
```

## Insert Flows

### Insert with `+` button

- Handler: `setupAddButtons()`
- Action: `openBlockLibraryForColumn(columnIndex)`
- Library context: `setInsertPosition(-1, this.blockId, columnIndex)`

Result: selected block is inserted into this layout's `innerBlocks` with matching `columnIndex`.

### Insert by drag/drop

- Handler: `setupColumnDropZones()` drop event
- Drag payload `text/plain` is block type.
- Special case: dropping `layout` with `layout-variation` seeds nested layout attributes.
- Calls `addBlockToColumn(blockData, columnIndex)`.

## Reorder and Drag Behavior

Layout block intentionally overrides base hover controls:

- `addHoverControls()` enables dragging on the block but uses custom handle gating.
- Drag starts only when `_dragFromLayoutHandle` is set via handle `mousedown`.
- Reorder payload includes `application/x-pwc-block-reorder`.
- Reorder drop zones are created/removed with base block helpers.

This avoids accidental drag when interacting inside columns.

## Delete Behavior

Delete icon calls:

```js
this.showDeleteConfirmation(
  'Are you sure you want to delete this container and all its contents? This action cannot be undone.'
);
```

Deletion removes the layout and all nested `innerBlocks` through base block deletion flow.

## Programmatic Usage Examples

### 1) Create and insert a layout block

```js
const layoutData = window.pwcBlockRegistry.createBlockData('layout');
layoutData.attributes = {
  ...(layoutData.attributes || {}),
  layout: '30-70',
  gap: 'large',
  verticalAlign: 'top',
};
layoutData.innerBlocks = [];

window.pwcEditorState.blocks.push(layoutData);
window.pwcEditorState.isDirty = true;
window.pwcEditorState.pushHistory();
window.pwcEditorState.emit('blockAdd', { block: layoutData });
```

### 2) Add a block to a specific column

```js
const parent = window.pwcEditorState.findBlock(layoutId);
const paragraph = window.pwcBlockRegistry.createBlockData('paragraph');

paragraph.attributes = {
  ...(paragraph.attributes || {}),
  columnIndex: 1,
};

parent.innerBlocks = parent.innerBlocks || [];
parent.innerBlocks.push(paragraph);

window.pwcEditorState.isDirty = true;
window.pwcEditorState.pushHistory();
window.pwcEditorState.emit('blockAdd', { block: paragraph, parentId: layoutId });
```

### 3) Create nested layout

```js
const parent = window.pwcEditorState.findBlock(layoutId);
const nested = window.pwcBlockRegistry.createBlockData('layout');

nested.attributes = {
  ...(nested.attributes || {}),
  layout: '50-50',
  gap: 'small',
  columnIndex: 0,
};
nested.innerBlocks = [];

parent.innerBlocks = parent.innerBlocks || [];
parent.innerBlocks.push(nested);

window.pwcEditorState.isDirty = true;
window.pwcEditorState.pushHistory();
window.pwcEditorState.emit('blockAdd', { block: nested, parentId: layoutId });
```

## Extension Guide

### Add a new layout preset

1. Add variation in `layoutVariations`.
2. Add matching option in `blockSettings` for `layout`.
3. Ensure label and ratio are consistent in UI and runtime config.

Example:

```js
// layoutVariations
'20-80': { label: '20 / 80', columns: [{ flex: 2 }, { flex: 8 }] }
```

```js
// blockSettings layout options
{ value: '20-80', label: '20/80', columns: [2, 8] }
```

### Add a new style attribute

1. Add setting in `blockSettings`.
2. Add kebab-case attribute to `observedAttributes`.
3. Apply class/style in `render()`.

Example (`shadow`):

```js
{
  name: 'shadow',
  type: 'toggle',
  label: 'Shadow',
  default: false,
  tab: 'style',
}
```

```js
// observedAttributes
'shadow'
```

```js
const shadow = this.getAttribute('shadow') === 'true';
const layoutClasses = [
  'pwc-layout-block',
  shadow ? 'pwc-shadow-md' : '',
].filter(Boolean).join(' ');
```

## Related Files

- `web/modules/custom/pwc_visual_editor/js/components/blocks/layout-block.js`
- `web/modules/custom/pwc_visual_editor/js/components/blocks/base-block.js`
- `web/modules/custom/pwc_visual_editor/js/services/block-registry.js`
- `web/modules/custom/pwc_visual_editor/js/services/editor-state.js`
- `web/modules/custom/pwc_visual_editor/js/components/block-library-panel.js`
- `web/modules/custom/pwc_visual_editor/js/components/settings-panel.js`
