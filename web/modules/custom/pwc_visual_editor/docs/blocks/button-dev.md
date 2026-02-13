# Button Block: Developer Documentation

Technical reference for `web/modules/custom/pwc_visual_editor/js/components/blocks/button.js`.

## File and Registration

- Class: `ButtonBlock extends window.PwcBaseBlock`
- Custom element: `pwc-button`
- Registry key: `button`

Registration at file end:

```js
customElements.define('pwc-button', ButtonBlock);
window.pwcBlockRegistry.register(ButtonBlock);
```

## Block Metadata

Static metadata used by the block library:

- `blockName`: `button`
- `blockTitle`: `Button`
- `blockDescription`: `Add a button with Appkit4 styles.`
- `blockCategory`: `basic`

## Settings Contract

Defined in `blockSettings` and mapped to element attributes by the editor/registry.

Settings and expected values:

- `label` (`text`): visible button text
- `btnType` (`btnTypePicker`): `primary`, `secondary`, `tertiary`, `text`, `negative`
- `icon` (`text`): Appkit icon name
- `compact` (`toggle`): `true` or `false`
- `rounded` (`toggle`): `true` or `false`
- `url` (`text`): optional link URL
- `target` (`toggle`): open link in new tab
- `textAlign` (`alignment`): utility class (`pwc-text-left`, `pwc-text-center`, `pwc-text-right`, or empty)
- `margin` (`spacing`): spacing utility classes
- `padding` (`spacing`): spacing utility classes
- `customClasses` (`text`): additional classes

Important attribute mappings:

- `btnType` -> `btn-type`
- `textAlign` -> `text-align`
- `customClasses` -> `custom-classes`

## Observed Attributes

The block re-renders when these attributes change:

```js
[
  'block-id',
  'label',
  'btn-type',
  'icon',
  'compact',
  'rounded',
  'url',
  'target',
  'text-align',
  'margin',
  'padding',
  'custom-classes',
]
```

## Render Flow

`render()` performs:

1. Read all attributes with defaults.
2. Build wrapper classes (`pwc-button-wrapper` + align/spacing/custom).
3. Build `<apw-button>` attributes:
- Always sets `btn-type`, `label`, and `type="button"`.
- Conditionally sets `icon`, `compact="true"`, `rounded="true"`.
4. If `url` exists, wrap button in `<a>` and optionally add `target="_blank" rel="noopener noreferrer"`.
5. Replace element content with a wrapper div.

## Output Examples

### 1) Simple button

Input attributes:

```html
<pwc-button label="Save" btn-type="primary"></pwc-button>
```

Rendered HTML (simplified):

```html
<div class="pwc-button-wrapper">
  <apw-button btn-type="primary" label="Save" type="button"></apw-button>
</div>
```

### 2) Linked button opening in new tab

Input attributes:

```html
<pwc-button
  label="Read Docs"
  btn-type="secondary"
  url="https://example.com/docs"
  target="true"
  icon="book-outline"
></pwc-button>
```

Rendered HTML (simplified):

```html
<div class="pwc-button-wrapper">
  <a href="https://example.com/docs" class="pwc-button-link" target="_blank" rel="noopener noreferrer">
    <apw-button btn-type="secondary" label="Read Docs" type="button" icon="book-outline"></apw-button>
  </a>
</div>
```

## Data Model in Editor State

A typical block object in editor state:

```json
{
  "type": "button",
  "id": "block-123",
  "attributes": {
    "label": "Get Started",
    "btnType": "primary",
    "icon": "arrow-forward",
    "compact": false,
    "rounded": true,
    "url": "https://example.com",
    "target": true,
    "textAlign": "pwc-text-center",
    "margin": "m-4",
    "padding": "",
    "customClasses": "my-cta"
  }
}
```

The block registry maps this data to DOM attributes (`btn-type`, `text-align`, etc.) when rendering.

## Safety and Escaping

`escapeAttr(str)` escapes:

- `&` -> `&amp;`
- `"` -> `&quot;`
- `<` -> `&lt;`
- `>` -> `&gt;`

It is used for user-provided label, icon, and URL-related attributes before HTML injection.

## Extending the Block

### Add a new setting

1. Add a field in `blockSettings`.
2. Add the kebab-case attribute name in `observedAttributes`.
3. Read attribute in `render()` and apply it to wrapper or `<apw-button>`.

Example (`disabled` toggle):

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
if (disabled) btnAttrs += ' disabled="true"';
```

### Create a button block programmatically

```js
const blockData = window.pwcBlockRegistry.createBlockData('button');
blockData.attributes = {
  ...(blockData.attributes || {}),
  label: 'Contact Sales',
  btnType: 'secondary',
  url: '/contact',
  target: false,
};

window.pwcEditorState.blocks.push(blockData);
window.pwcEditorState.isDirty = true;
window.pwcEditorState.pushHistory();
window.pwcEditorState.emit('blockAdd', { block: blockData });
```

## Related Files

- `web/modules/custom/pwc_visual_editor/js/components/blocks/button.js`
- `web/modules/custom/pwc_visual_editor/js/services/block-registry.js`
- `web/modules/custom/pwc_visual_editor/js/components/settings-panel.js`
- `web/modules/custom/pwc_visual_editor/js/services/editor-state.js`
