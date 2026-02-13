# Paragraph Block: Developer Documentation

Technical reference for `web/modules/custom/pwc_visual_editor/js/components/blocks/paragraph.js`.

## File and Registration

- Class: `ParagraphBlock extends window.PwcBaseBlock`
- Custom element: `pwc-paragraph`
- Registry key: `paragraph`

Registration at file end:

```js
customElements.define('pwc-paragraph', ParagraphBlock);
window.pwcBlockRegistry.register(ParagraphBlock);
```

## Block Metadata

Static metadata used by the block library:

- `blockName`: `paragraph`
- `blockTitle`: `Paragraph`
- `blockDescription`: `Add a paragraph of text with customizable styles.`
- `blockCategory`: `text`

## Shared Option Exports

The file defines and exports these globals:

- `window.APPKIT_LINE_HEIGHT_OPTIONS`
- `window.APPKIT_PARAGRAPH_GAP_OPTIONS`

These are used by this block and can be reused by other blocks.

## Settings Contract

`blockSettings` controls settings-panel fields and attribute mapping.

| Setting name | UI type | Attribute | Default | Tab |
| --- | --- | --- | --- | --- |
| `fontSize` | `select` | `font-size` | `''` | `typography` |
| `fontWeight` | `select` | `font-weight` | `''` | `typography` |
| `lineHeight` | `select` | `line-height` | `''` | `typography` |
| `textAlign` | `alignment` | `text-align` | `''` | `typography` |
| `textColor` | `colorSwatch` | `text-color` | `''` | `style` |
| `paragraphGap` | `select` | `paragraph-gap` | `pwc-space-y-4` | `layout` |
| `margin` | `spacing` | `margin` | `''` | `layout` |
| `padding` | `spacing` | `padding` | `''` | `layout` |
| `customClasses` | `text` | `custom-classes` | `''` | `style` |

Also used:

- `content` (inline editable HTML payload)
- `block-id`

## Inline Editable Model

The block declares:

```js
static get inlineEditable() {
  return ['content'];
}
```

In edit mode, `render()` creates:

```html
<div class="pwc-paragraph ... pwc-editable" contenteditable="true" data-editable="content">...</div>
```

If empty in edit mode, placeholder is shown via:

```html
data-placeholder="Write your paragraph..."
```

## Observed Attributes

```js
[
  'block-id',
  'content',
  'font-size',
  'font-weight',
  'line-height',
  'text-align',
  'text-color',
  'paragraph-gap',
  'margin',
  'padding',
  'custom-classes',
]
```

## Update Strategy (`attributeChangedCallback`)

The block avoids full re-renders when possible:

1. Ignore no-op changes and disconnected elements.
2. If inline editing and `content` changes: skip render to preserve cursor.
3. If style-only attributes change: call `updateStyles()` for live class updates.
4. Otherwise: full `render()` + `addHoverControls()`.

Style-only attributes:

- `font-size`
- `font-weight`
- `line-height`
- `text-align`
- `text-color`
- `paragraph-gap`
- `margin`
- `padding`
- `custom-classes`

## Render Pipeline

`render()` flow:

1. Read attributes and defaults.
2. Build paragraph text classes:

```js
[
  'pwc-paragraph__text',
  fontSize,
  fontWeight,
  lineHeight,
  textAlign,
  textColor,
].filter(Boolean).join(' ');
```

3. Build container classes:

```js
[
  'pwc-paragraph',
  paragraphGap,
  margin,
  padding,
  customClasses,
].filter(Boolean).join(' ');
```

4. Normalize content with:
- `sanitizeContent()`
- `ensureParagraphTags()`
- `addClassesToParagraphs()`
- `removeEmptyParagraphs()`
5. Render editable or read-only markup.
6. In edit mode, attach editing handlers via `setupParagraphEditing()`.

## Content Normalization Helpers

### `sanitizeContent(content)`

- Parses HTML in a temporary container.
- Removes invalid nested `<p>` structures.
- Removes empty `<p>` tags (except edit-mode use cases handled later).
- Returns cleaned HTML.

### `ensureParagraphTags(content)`

- Converts `<br><br>` patterns into paragraph boundaries.
- Wraps non-`<p>` content into `<p>...</p>`.
- Keeps paragraph structure consistent.

### `addClassesToParagraphs(content, classes)`

- Ensures every `<p>` gets paragraph classes.
- Replaces existing `class=""` on `<p>` to prevent class duplication.
- Preserves non-class attributes (for example `data-indent`).

### `removeEmptyParagraphs(content)`

- Removes truly empty paragraphs.
- Keeps `<br>` placeholders while editing so empty lines remain clickable.

## Keyboard and Paste Behavior

`setupParagraphEditing()` binds editor behavior on the contenteditable container.

### Enter behavior

- First `Enter`: insert `<br>`.
- Second `Enter` (cursor right after `<br>`): create new `<p>` below current one.

Related methods:

- `isCursorAfterBr(range)`
- `findBrBeforeCursor(range)`
- `createNewParagraphFromBr(range)`

### Tab behavior

- `Tab`: indent current paragraph (`data-indent += 1`)
- `Shift+Tab`: outdent current paragraph (`data-indent -= 1`)
- Max indent level: `4`

Methods:

- `handleParagraphIndent()`
- `handleParagraphOutdent()`

### Paste behavior

- `paste` event is intercepted.
- HTML paste path: `cleanPastedHtml(html)`
- Plain-text paste path: `cleanPastedText(text)`
- Cleaned content is inserted at cursor via `insertCleanContent(content)`.
- Formatting is stripped while retaining paragraph/line structure.

## Sync to Editor State

`syncContent(editableDiv)` updates both DOM attribute and editor state:

```js
const value = editableDiv.innerHTML;
this.setAttribute('content', value);
window.pwcEditorState.updateBlock(this.blockId, { content: value });
```

This keeps undo/redo and state-driven rendering aligned.

## Example: Programmatically Create a Paragraph Block

```js
const blockData = window.pwcBlockRegistry.createBlockData('paragraph');
blockData.attributes = {
  ...(blockData.attributes || {}),
  content: '<p>Welcome to the new section.</p><p>Start editing here.</p>',
  fontSize: 'ap-font-16',
  fontWeight: 'ap-font-weight-1',
  lineHeight: 'pwc-leading-relaxed',
  textAlign: 'pwc-text-left',
  textColor: 'ap-text-primary-blue-04',
  paragraphGap: 'pwc-space-y-4',
  margin: 'ap-m-spacing-4',
  padding: '',
  customClasses: 'ap-typography-body',
};

window.pwcEditorState.blocks.push(blockData);
window.pwcEditorState.isDirty = true;
window.pwcEditorState.pushHistory();
window.pwcEditorState.emit('blockAdd', { block: blockData });
```

## Example: Extend with New Setting (`textTransform`)

Add to `blockSettings`:

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

Add to `observedAttributes`:

```js
'text-transform'
```

Then include it in both class builders (`render()` and `updateStyles()`):

```js
const textTransform = this.getAttribute('text-transform') || '';
// include textTransform in paragraph class composition
```

## Known Gotchas

- `content` is HTML, not plain text, so keep transformations HTML-safe.
- Regex + DOM cleanup is combined; test copy/paste and Enter behavior when changing parsing logic.
- Skipping re-render during inline editing is important for cursor stability.
- `custom-classes` is appended directly; use trusted utility class tokens.

## Related Files

- `web/modules/custom/pwc_visual_editor/js/components/blocks/paragraph.js`
- `web/modules/custom/pwc_visual_editor/js/components/blocks/base-block.js`
- `web/modules/custom/pwc_visual_editor/js/components/settings-panel.js`
- `web/modules/custom/pwc_visual_editor/js/services/block-registry.js`
- `web/modules/custom/pwc_visual_editor/js/services/editor-state.js`

