# Heading Block: Developer Documentation

Technical reference for `web/modules/custom/pwc_visual_editor/js/components/blocks/heading.js`.

## File and Registration

- Class: `HeadingBlock extends window.PwcBaseBlock`
- Custom element: `pwc-heading`
- Registry key: `heading`

Registration:

```js
customElements.define('pwc-heading', HeadingBlock);
window.pwcBlockRegistry.register(HeadingBlock);
```

## Block Metadata

Static metadata used by the block library:

- `blockName`: `heading`
- `blockTitle`: `Heading`
- `blockDescription`: `Add a heading with customizable styles.`

## Settings Contract

`blockSettings` defines how the settings panel maps fields to block attributes.

| Setting name | UI type | Attribute | Default | Tab |
| --- | --- | --- | --- | --- |
| `level` | `headingLevelPicker` | `level` | `h2` | `typography` |
| `fontSize` | `select` | `font-size` | `''` | `typography` |
| `fontWeight` | `select` | `font-weight` | `''` | `typography` |
| `lineHeight` | `select` | `line-height` | `''` | `typography` |
| `textAlign` | `alignment` | `text-align` | `''` | `typography` |
| `textColor` | `colorSwatch` | `text-color` | `''` | `style` |
| `margin` | `spacing` | `margin` | `''` | `layout` |
| `padding` | `spacing` | `padding` | `''` | `layout` |
| `customClasses` | `text` | `custom-classes` | `''` | `style` |

The block also uses:

- `content` for text value
- `block-id` for block identity

## Typography Defaults by Heading Level

If `font-size` and `font-weight` are not set, the block uses `HEADING_LEVEL_DEFAULTS`.

```js
const HEADING_LEVEL_DEFAULTS = {
  h1: { fontSize: 'ap-font-48', fontWeight: 'ap-font-weight-2' },
  h2: { fontSize: 'ap-font-36', fontWeight: 'ap-font-weight-2' },
  h3: { fontSize: 'ap-font-30', fontWeight: 'ap-font-weight-2' },
  h4: { fontSize: 'ap-font-20', fontWeight: 'ap-font-weight-2' },
  h5: { fontSize: 'ap-font-18', fontWeight: 'ap-font-weight-2' },
  h6: { fontSize: 'ap-font-16', fontWeight: 'ap-font-weight-2' },
};
```

This keeps heading hierarchy visually consistent by default.

## Inline Editing Model

The block declares:

```js
static get inlineEditable() {
  return ['content'];
}
```

During editor mode, `render()` outputs a contenteditable heading:

```html
<h2 class="..." contenteditable="true" data-editable="content">Heading</h2>
```

The placeholder (`data-placeholder="Enter heading..."`) is only added in edit mode when content is empty/default.

## Observed Attributes and Update Strategy

`observedAttributes` includes content, style fields, and identity fields.

The block overrides `attributeChangedCallback()` to avoid unnecessary full re-renders:

- If `content` changes while inline editing, skip re-render (prevents cursor jump).
- If a style attribute changes, call `updateStyles()` for in-place class updates.
- For all other changes, call full `render()`.

This gives immediate style feedback while preserving typing UX.

## Class Composition

Both `render()` and `updateStyles()` compose classes from attributes:

```js
const classes = [
  'pwc-heading',
  fontSize,
  fontWeight,
  lineHeight,
  textAlign,
  textColor,
  margin,
  padding,
  customClasses,
].filter(Boolean).join(' ');
```

Applied utilities are expected to come from Appkit and project utility classes.

## Level Change Behavior

`updateStyles()` updates class names directly on the current heading element.

If level changes (for example `h2` -> `h3`), tag replacement is required, so it falls back to full re-render:

```js
if (heading.tagName.toLowerCase() !== level) {
  this._isInlineEditing = false;
  this.render();
  this.addHoverControls();
}
```

## Appkit Options Export

The file defines `APPKIT_OPTIONS` (font sizes, weights, colors, spacing presets) and exports it globally:

```js
window.APPKIT_OPTIONS = APPKIT_OPTIONS;
```

This allows shared usage in settings UI components.

## Example: Create and Insert a Heading Programmatically

```js
const blockData = window.pwcBlockRegistry.createBlockData('heading');
blockData.attributes = {
  ...(blockData.attributes || {}),
  content: 'Quarterly Results',
  level: 'h2',
  fontSize: '',
  fontWeight: '',
  textColor: 'ap-text-primary-blue-04',
  margin: 'ap-m-spacing-5',
  customClasses: 'ap-typography-heading',
};

window.pwcEditorState.blocks.push(blockData);
window.pwcEditorState.isDirty = true;
window.pwcEditorState.pushHistory();
window.pwcEditorState.emit('blockAdd', { block: blockData });
```

## Example: Update Existing Heading Attributes

```js
const heading = window.pwcEditorState.findBlock(blockId);
if (heading && heading.type === 'heading') {
  heading.attributes = {
    ...(heading.attributes || {}),
    level: 'h3',
    lineHeight: 'pwc-leading-tight',
    textAlign: 'pwc-text-center',
  };

  window.pwcEditorState.isDirty = true;
  window.pwcEditorState.pushHistory();
  window.pwcEditorState.emit('blockUpdate', { block: heading });
}
```

## Extension Scenarios

### Add a new setting

1. Add a field to `blockSettings`.
2. Add the new kebab-case attribute to `observedAttributes` if it affects rendering.
3. Read the value in `render()` and `updateStyles()` as needed.
4. Include it in class composition or markup output.

Example setting:

```js
{
  name: 'textTransform',
  type: 'select',
  label: 'Text Transform',
  default: '',
  tab: 'typography',
  options: [
    { value: '', label: 'Default' },
    { value: 'pwc-uppercase', label: 'Uppercase' },
    { value: 'pwc-lowercase', label: 'Lowercase' },
  ],
}
```

### Change default styles per level

Edit `HEADING_LEVEL_DEFAULTS` and keep values aligned with available utility classes.

## Known Gotchas

- `customClasses` is inserted directly into class composition; only trusted utility classes should be used.
- If you only update DOM classes manually outside block methods, editor history/undo state will not track those changes.
- Tag changes (`h1`...`h6`) require full re-render; avoid trying to mutate tag name in place.

## Related Files

- `web/modules/custom/pwc_visual_editor/js/components/blocks/heading.js`
- `web/modules/custom/pwc_visual_editor/js/components/blocks/base-block.js`
- `web/modules/custom/pwc_visual_editor/js/components/settings-panel.js`
- `web/modules/custom/pwc_visual_editor/js/services/block-registry.js`
- `web/modules/custom/pwc_visual_editor/js/services/editor-state.js`
