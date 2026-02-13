# Tag Block: Developer Documentation

Technical reference for `web/modules/custom/pwc_visual_editor/js/components/blocks/tag.js`.

## File and Registration

- Class: `TagBlock extends window.PwcBaseBlock`
- Custom element: `pwc-tag`
- Registry key: `tag`

Registration at file end:

```js
customElements.define('pwc-tag', TagBlock);
window.pwcBlockRegistry.register(TagBlock);
```

## Block Metadata

Static metadata used by the block library:

- `blockName`: `tag`
- `blockTitle`: `Tag`
- `blockDescription`: `Add tags with Appkit4 styles.`
- `blockCategory`: `basic`

## Settings Contract

Defined in `blockSettings` and mapped to element attributes by the editor/registry.

| Setting name | UI type | Attribute | Default | Tab |
| --- | --- | --- | --- | --- |
| `tags` | `textarea` | `tags` | `Tag 1, Tag 2, Tag 3` | `typography` |
| `size` | `tagSizePicker` | `size` | `small` | `typography` |
| `tagType` | `tagTypePicker` | `tag-type` | `filled` | `typography` |
| `stacked` | `toggle` | `stacked` | `false` | `style` |
| `showClose` | `toggle` | `show-close` | `false` | `style` |
| `backgroundColor` | `colorSwatch` | `background-color` | `''` | `style` |
| `fontColor` | `colorSwatch` | `font-color` | `''` | `style` |
| `textAlign` | `alignment` | `text-align` | `''` | `layout` |
| `margin` | `spacing` | `margin` | `''` | `layout` |
| `padding` | `spacing` | `padding` | `''` | `layout` |
| `customClasses` | `text` | `custom-classes` | `''` | `style` |

Important mappings:

- `tagType` -> `tag-type`
- `showClose` -> `show-close`
- `backgroundColor` -> `background-color`
- `fontColor` -> `font-color`
- `textAlign` -> `text-align`
- `customClasses` -> `custom-classes`

## Color Source

`TAG_COLORS` contains the supported color swatches with labels and hex values.  
Both background and font color fields reuse this same list.

Example structure:

```js
{ value: '#415385', hex: '#415385', label: 'Primary' }
```

## Observed Attributes

The block re-renders when these attributes change:

```js
[
  'block-id',
  'tags',
  'size',
  'tag-type',
  'show-close',
  'background-color',
  'font-color',
  'text-align',
  'margin',
  'padding',
  'custom-classes',
  'stacked',
]
```

`attributeChangedCallback()` behavior:

- Skip if value is unchanged
- Skip if element is not connected
- Otherwise call `render()` and `addHoverControls()`

## Render Flow

`render()` does this in order:

1. Read attributes with defaults.
2. Build wrapper classes (`pwc-tag-wrapper` + layout/style classes).
3. Build list classes (`pwc-tag-list` + optional `pwc-tag-list--stacked`).
4. Parse `tags` string by comma and trim values.
5. For each tag text, render a `<li><apw-tag ...></apw-tag></li>`.
6. Inject wrapper + list markup into `innerHTML`.

## Tag Parsing Logic

Input is a comma-separated string:

```js
const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
```

Implications:

- Leading/trailing spaces are removed
- Empty entries are discarded
- Each valid token becomes one `<apw-tag>`

## Output Examples

### 1) Simple tags

Input:

```html
<pwc-tag tags="News, Updates, Case Study" size="small" tag-type="filled"></pwc-tag>
```

Rendered HTML (simplified):

```html
<div class="pwc-tag-wrapper">
  <ul class="pwc-tag-list">
    <li><apw-tag text="News" size="small" type="filled" show-close="false" apw-disabled="false"></apw-tag></li>
    <li><apw-tag text="Updates" size="small" type="filled" show-close="false" apw-disabled="false"></apw-tag></li>
    <li><apw-tag text="Case Study" size="small" type="filled" show-close="false" apw-disabled="false"></apw-tag></li>
  </ul>
</div>
```

### 2) Stacked with custom colors

Input:

```html
<pwc-tag
  tags="Finance, Tax, Risk"
  size="large"
  tag-type="outlined"
  stacked="true"
  show-close="true"
  background-color="#415385"
  font-color="#ffffff"
></pwc-tag>
```

Rendered HTML (simplified):

```html
<div class="pwc-tag-wrapper">
  <ul class="pwc-tag-list pwc-tag-list--stacked">
    <li><apw-tag text="Finance" size="large" type="outlined" show-close="true" apw-disabled="false" background-color="#415385" font-color="#ffffff"></apw-tag></li>
    <li><apw-tag text="Tax" size="large" type="outlined" show-close="true" apw-disabled="false" background-color="#415385" font-color="#ffffff"></apw-tag></li>
    <li><apw-tag text="Risk" size="large" type="outlined" show-close="true" apw-disabled="false" background-color="#415385" font-color="#ffffff"></apw-tag></li>
  </ul>
</div>
```

## Data Model in Editor State

Typical block data object:

```json
{
  "type": "tag",
  "id": "block-123",
  "attributes": {
    "tags": "News, Product, Alerts",
    "size": "small",
    "tagType": "filled",
    "stacked": false,
    "showClose": false,
    "backgroundColor": "",
    "fontColor": "",
    "textAlign": "pwc-text-left",
    "margin": "m-2",
    "padding": "",
    "customClasses": "my-tag-group"
  }
}
```

The registry maps camelCase keys to kebab-case DOM attributes during render.

## Safety and Escaping

`escapeAttr(str)` escapes:

- `&` -> `&amp;`
- `"` -> `&quot;`
- `<` -> `&lt;`
- `>` -> `&gt;`

It is applied to dynamic values inserted into `<apw-tag>` attributes (`text`, `background-color`, `font-color`).

## Extension Scenarios

### Add a new setting

1. Add a field in `blockSettings`.
2. Add the kebab-case attribute name to `observedAttributes`.
3. Read and apply the new attribute in `render()`.

Example: add disabled mode.

```js
// blockSettings
{
  name: 'disabled',
  type: 'toggle',
  label: 'Disabled',
  default: false,
  tab: 'style',
}
```

```js
// observedAttributes
'disabled'
```

```js
// render()
const disabled = this.getAttribute('disabled') === 'true';
let attrs = `text="${this.escapeAttr(text)}" size="${size}" type="${tagType}" show-close="${showClose}" apw-disabled="${disabled}"`;
```

### Create a Tag block programmatically

```js
const blockData = window.pwcBlockRegistry.createBlockData('tag');
blockData.attributes = {
  ...(blockData.attributes || {}),
  tags: 'Design, Accessibility, QA',
  size: 'small',
  tagType: 'outlined',
  stacked: false,
  showClose: false,
};

window.pwcEditorState.blocks.push(blockData);
window.pwcEditorState.isDirty = true;
window.pwcEditorState.pushHistory();
window.pwcEditorState.emit('blockAdd', { block: blockData });
```

## Known Gotchas

- `show-close` and `stacked` are string attributes in DOM, so check with `=== 'true'`.
- If `tags` has no valid values after parsing, the block renders an empty `<ul>`.
- `customClasses` is appended directly to wrapper classes, so only trusted class names should be used.

## Related Files

- `web/modules/custom/pwc_visual_editor/js/components/blocks/tag.js`
- `web/modules/custom/pwc_visual_editor/js/services/block-registry.js`
- `web/modules/custom/pwc_visual_editor/js/components/settings-panel.js`
- `web/modules/custom/pwc_visual_editor/js/services/editor-state.js`
