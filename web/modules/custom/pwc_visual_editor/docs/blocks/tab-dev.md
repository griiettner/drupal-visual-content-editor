# Tab Block: Developer Documentation

Technical reference for `web/modules/custom/pwc_visual_editor/js/components/blocks/tab.js`.

## File and Registration

- Class: `TabBlock extends window.PwcBaseBlock`
- Custom element: `pwc-tab`
- Registry key: `tab`

Registration at the bottom of the file:

```js
customElements.define('pwc-tab', TabBlock);
window.pwcBlockRegistry.register(TabBlock);
```

## Block Metadata

Static metadata used by the block library:

- `blockName`: `tab`
- `blockTitle`: `Tab`
- `blockDescription`: `Add tabbed content panels with inner blocks.`
- `blockCategory`: `widgets`

## Settings Contract

Defined in `blockSettings` and mapped to DOM attributes.

Settings:

- `titles` (`tabTitles`): JSON array string of tab labels
- `tabType` (`select`): `underline` or `filled`
- `stretched` (`toggle`): stretch tabs to full width
- `contentBgColor` (`colorSwatch`): utility/background class
- `margin` (`spacing`): spacing utility classes
- `padding` (`spacing`): spacing utility classes
- `customClasses` (`text`): additional class tokens

Important attribute mappings:

- `tabType` -> `tab-type`
- `contentBgColor` -> `content-bg-color`
- `customClasses` -> `custom-classes`

## Data Model for Inner Blocks

Tab panels are mapped using `attributes.columnIndex` on each inner block.

Example (`columnIndex: 1` means tab #2):

```json
{
  "type": "paragraph",
  "id": "block-abc123",
  "attributes": {
    "columnIndex": 1
  }
}
```

Runtime-only active tab state is persisted on parent block data:

```js
blockData._activeTabIndex = 2;
```

This allows the selected tab to survive re-renders.

## Render Flow

`render()` does this in order:

1. Parse settings and sanitize class values.
2. Restore `_activeTabIndex` from editor state.
3. Clamp active tab index to current title count.
4. Build `<apw-tabset>` and `<apw-tab>` headers.
5. Build tab panel wrappers and empty-state placeholders.
6. Render stored inner blocks into the matching panel via `renderInnerBlocks()`.
7. Attach tabset event syncing and edit-mode controls.

Important: panel visibility is controlled by inline `display` and synchronized by `setActiveTab()`.

## Tab Indexing and Section Selection

Inner blocks per tab are selected by:

```js
(block.attributes?.columnIndex || 0) === tabIndex
```

If `columnIndex` is missing, block falls back to tab index `0`.

## Event Handling

`setupTabsetEvents()` listens to:

- `tabChange` (custom Appkit event)
- `click` (including shadow DOM interactions)
- `keydown`
- `MutationObserver` on `active-index`

All paths eventually call `setActiveTab(index)` or `syncActiveTabFromTabset(tabset)` to keep:

- Appkit tabset state
- Internal `_activeTabIndex`
- Visible panel display

in sync.

## Insertion Flows

### Add block with panel `+` button

- Trigger: `.pwc-tab-section__add-btn`
- Call path: `openBlockLibraryForSection(tabIndex)`
- Panel API: `setInsertPosition(-1, this.blockId, tabIndex)`

### Add block via drag/drop into panel

- Trigger: drop on `.pwc-tab-section__body`
- Flow: `createBlockData(blockType)` -> `addBlockToSection(blockData, tabIndex)`

`addBlockToSection()` sets:

```js
blockData.attributes.columnIndex = tabIndex;
```

Then updates editor state, marks dirty, pushes history, emits `blockAdd`, re-renders, and selects the inserted block.

## Drag and Reorder Behavior

Tab block overrides base hover controls and uses a dedicated handle:

- Handle selector: `.pwc-tab-handle`
- Reorder MIME type: `application/x-pwc-block-reorder`
- Drag start is blocked unless initiated from the tab handle (`_dragFromTabHandle`)

This prevents accidental drags while editing inner content.

## Helper Methods

### `parseTitles()`

- Parses JSON in `titles`
- Falls back to default tab titles if invalid
- Ensures non-empty label per index

### `sanitizeClassList(classes)`

- Accepts only `[A-Za-z0-9_-]+` tokens
- Removes invalid class names

### `getBooleanAttribute(name)`

Normalizes attribute values such as:

- true: `""`, `"true"`, `"1"`, attribute name
- false: `"false"`, `"0"`, missing attribute

### `escapeAttr(str)`

Escapes `&`, `"`, `<`, `>` before injecting text into HTML attributes.

## Simplified Output Example

Input element:

```html
<pwc-tab
  block-id="block-tabs-1"
  titles='["Overview","Specs","FAQ"]'
  tab-type="filled"
  stretched="true"
></pwc-tab>
```

Rendered structure (simplified):

```html
<div class="pwc-tab-wrapper">
  <div class="pwc-tab-headers">
    <apw-tabset tabset-id="block-tabs-1" type="filled" active-index="0" stretched>
      <apw-tab tab-id="block-tabs-1-0" label="Overview"></apw-tab>
      <apw-tab tab-id="block-tabs-1-1" label="Specs"></apw-tab>
      <apw-tab tab-id="block-tabs-1-2" label="FAQ"></apw-tab>
    </apw-tabset>
  </div>
  <div class="pwc-tab-content">
    <div class="pwc-tab-panel" data-tab-index="0" style="display: block">...</div>
    <div class="pwc-tab-panel" data-tab-index="1" style="display: none">...</div>
    <div class="pwc-tab-panel" data-tab-index="2" style="display: none">...</div>
  </div>
</div>
```

## Common Extension Scenarios

### 1) Add a new setting

Add to `blockSettings`, then read and apply in `render()`.

Example:

```js
{
  name: 'compactHeaders',
  type: 'toggle',
  label: 'Compact Headers',
  default: false,
  tab: 'style'
}
```

### 2) Programmatically add a block to a specific tab

```js
const tabBlock = window.pwcEditorState.findBlock(tabBlockId);
const blockData = window.pwcBlockRegistry.createBlockData('heading');

blockData.attributes = {
  ...(blockData.attributes || {}),
  columnIndex: 1,
  content: 'Tab-specific content'
};

tabBlock.innerBlocks = tabBlock.innerBlocks || [];
tabBlock.innerBlocks.push(blockData);
window.pwcEditorState.isDirty = true;
window.pwcEditorState.pushHistory();
window.pwcEditorState.emit('blockAdd', { block: blockData, parentId: tabBlockId });
```

### 3) Force active tab in code

```js
const tabElement = document.querySelector(`pwc-tab[block-id="${tabBlockId}"]`);
tabElement?.setActiveTab(2);
```

## Known Gotchas

- `titles` must be valid JSON array text; malformed JSON falls back to defaults.
- If tab count shrinks, `_activeTabIndex` is reset to `0` when out of range.
- Manual manipulation of `innerBlocks` must keep `columnIndex` aligned with current tab indices.
- Drag reorder of the parent tab block only works from the custom tab handle.

## Related Files

- `web/modules/custom/pwc_visual_editor/js/components/blocks/tab.js`
- `web/modules/custom/pwc_visual_editor/js/components/settings-panel.js`
- `web/modules/custom/pwc_visual_editor/js/components/block-library-panel.js`
- `web/modules/custom/pwc_visual_editor/js/components/blocks/base-block.js`
- `web/modules/custom/pwc_visual_editor/js/services/block-registry.js`
- `web/modules/custom/pwc_visual_editor/js/services/editor-state.js`
