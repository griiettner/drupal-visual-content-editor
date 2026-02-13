# List Block: Developer Documentation

Technical reference for `web/modules/custom/pwc_visual_editor/js/components/blocks/list.js`.

## File and Registration

- Class: `ListBlock extends window.PwcBaseBlock`
- Custom element: `pwc-list`
- Registry key: `list`

Registration at file end:

```js
customElements.define('pwc-list', ListBlock);
window.pwcBlockRegistry.register(ListBlock);
```

## Block Metadata

Static metadata used by the block library:

- `blockName`: `list`
- `blockTitle`: `List`
- `blockDescription`: `Add an ordered or unordered list.`
- `blockCategory`: `text`
- `inlineEditable`: `['content']`

## Settings Contract

`blockSettings` defines the editor-side schema. Main fields:

- `listType` (`listTypePicker`): `ul` or `ol`
- `listStyle` (`listStylePicker`): `pwc-list-*` utility class
- `listPosition` (`markerPositionPicker`): `pwc-list-outside` or `pwc-list-inside`
- `fontSize` (`select`): class from `window.APPKIT_OPTIONS.fontSize`
- `fontWeight` (`select`): class from `window.APPKIT_OPTIONS.fontWeight`
- `lineHeight` (`select`): class from `window.APPKIT_LINE_HEIGHT_OPTIONS`
- `textAlign` (`alignment`): alignment utility class
- `textColor` (`colorSwatch`): color utility class
- `itemGap` (`select`): spacing utility class (`pwc-space-y-*`)
- `margin` (`spacing`): margin classes
- `padding` (`spacing`): padding classes
- `customClasses` (`text`): additional class string

## Attribute Mapping

The editor writes settings into kebab-case element attributes. Important mappings:

- `listType` -> `list-type`
- `listStyle` -> `list-style`
- `listPosition` -> `list-position`
- `fontSize` -> `font-size`
- `fontWeight` -> `font-weight`
- `lineHeight` -> `line-height`
- `textAlign` -> `text-align`
- `textColor` -> `text-color`
- `itemGap` -> `item-gap`
- `customClasses` -> `custom-classes`

Observed attributes:

```js
[
  'block-id',
  'content',
  'list-type',
  'list-style',
  'list-position',
  'font-size',
  'font-weight',
  'line-height',
  'text-align',
  'text-color',
  'item-gap',
  'margin',
  'padding',
  'custom-classes',
]
```

## Render Flow

`render()` does the following:

1. Reads attributes and applies defaults.
2. Ensures content is valid list markup using `ensureListItems()`.
3. Adds `pwc-list__item` class to every `<li>` via `addClassesToItems()`.
4. Builds list-level classes into `_listClasses`.
5. Renders either `<ul>` or `<ol>` based on `list-type`.
6. In edit mode, enables inline editing (`contenteditable` + `data-editable="content"`).
7. In edit mode, wires custom list keyboard handlers using `setupListEditing()`.

Simplified output:

```html
<ul class="pwc-list__items pwc-list-disc pwc-list-outside pwc-space-y-2 pwc-editable" contenteditable="true" data-editable="content">
  <li class="pwc-list__item">Item one</li>
  <li class="pwc-list__item">Item two</li>
</ul>
```

## Style-Only Updates vs Full Re-render

`attributeChangedCallback()` splits updates into two paths:

- Full re-render when `list-type` changes (`ul` <-> `ol` swap)
- `updateStyles()` for style-only changes to avoid replacing content/caret state

This reduces editing disruption while still reflecting style changes immediately.

## Inline Editing Behavior

`setupListEditing()` attaches handlers to the editable list:

- `Enter`: creates new `<li>` (`handleEnterKey()`)
- `Shift + Enter`: inserts `<br>` (`insertLineBreak()`)
- `Tab`: indent into nested list (`handleIndent()`)
- `Shift + Tab`: outdent from nested list (`handleOutdent()`)
- `Backspace` at item start: remove empty item or merge with previous (`handleBackspaceKey()`)
- `paste`: strips formatting and inserts plain text (`insertPastedText()`)
- `input`: syncs live changes to block state (`syncContent()`)

## Content Normalization Helpers

### `ensureListItems(content)`

- Returns `<li></li>` when content is empty.
- If no `<li>` tags exist, splits by line breaks and wraps each line in `<li>`.

Example:

```js
ensureListItems('One\nTwo\nThree');
// => '<li>One</li><li>Two</li><li>Three</li>'
```

### `addClassesToItems(content, classes)`

Rewrites each opening `<li>` to inject the shared item class:

```js
addClassesToItems('<li>A</li><li>B</li>', 'pwc-list__item');
// => '<li class="pwc-list__item">A</li><li class="pwc-list__item">B</li>'
```

## Editor State Sync

`syncContent(editableList)` stores the current HTML in both DOM and editor state:

```js
const content = editableList.innerHTML;
this.setAttribute('content', content);
window.pwcEditorState.updateBlock(this.blockId, { content });
```

Notes:

- Uses `innerHTML` to preserve nested lists and `<br>`.
- Uses `_isInlineEditing` guard to prevent recursive render loops on content updates.

## Programmatic Usage Example

Create a list block and set attributes before insertion:

```js
const blockData = window.pwcBlockRegistry.createBlockData('list');
blockData.attributes = {
  ...(blockData.attributes || {}),
  content: '<li>First item</li><li>Second item</li>',
  listType: 'ol',
  listStyle: 'pwc-list-decimal',
  listPosition: 'pwc-list-outside',
  itemGap: 'pwc-space-y-3',
  textAlign: 'pwc-text-left',
};

window.pwcEditorState.blocks.push(blockData);
window.pwcEditorState.isDirty = true;
window.pwcEditorState.pushHistory();
window.pwcEditorState.emit('blockAdd', { block: blockData });
```

## Extending the Block

### Add a new setting

1. Add setting entry in `blockSettings`.
2. Add kebab-case attribute to `observedAttributes`.
3. Read it in `render()` and `updateStyles()`.
4. Apply value to class generation or markup.

Example (`listMarkerColor` class):

```js
// blockSettings
{
  name: 'listMarkerColor',
  type: 'select',
  label: 'Marker Color',
  default: '',
  tab: 'style',
  options: [
    { value: '', label: 'Default' },
    { value: 'pwc-marker-primary', label: 'Primary' },
  ],
}
```

```js
// observedAttributes
'list-marker-color'
```

```js
// render() + updateStyles() class list
const listMarkerColor = this.getAttribute('list-marker-color') || '';
this._listClasses = [
  'pwc-list__items',
  listMarkerColor,
  // ...existing classes
].filter(Boolean).join(' ');
```

## Related Files

- `web/modules/custom/pwc_visual_editor/js/components/blocks/list.js`
- `web/modules/custom/pwc_visual_editor/js/services/block-registry.js`
- `web/modules/custom/pwc_visual_editor/js/components/settings-panel.js`
- `web/modules/custom/pwc_visual_editor/js/services/editor-state.js`
