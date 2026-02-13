# Image Block: Developer Documentation

Technical reference for `web/modules/custom/pwc_visual_editor/js/components/blocks/image.js`.

## File and Registration

- Class: `ImageBlock extends window.PwcBaseBlock`
- Custom element: `pwc-image`
- Registry key: `image`

Registration:

```js
customElements.define('pwc-image', ImageBlock);
window.pwcBlockRegistry.register(ImageBlock);
```

## Block Metadata

Static block metadata:

- `blockName`: `image`
- `blockTitle`: `Image`
- `blockDescription`: `Add an image from URL, Drupal Media, or Upload.`
- `blockCategory`: `media`

## Settings Contract

`blockSettings` defines settings-panel controls and attribute payload.

Primary settings:

- `sourceType` (`optionButtons`): `url`, `media`, `upload`
- `imageUrl` (`text`): direct URL or local path
- `mediaId` (`mediaImagePicker`): Drupal Media entity reference
- `mediaUpload` (`imageUpload`): upload flow payload
- `alt` (`text`)
- `showCaption` (`toggle`)
- `caption` (`text`)
- `aspectRatio` (`optionButtons`)
- `objectFit` (`optionButtons`)
- `maxWidth` (`text`)
- `textAlign` (`alignment`)
- `margin` (`spacing`)
- `padding` (`spacing`)
- `customClasses` (`text`)

Conditional field rendering:

- `imageUrl` appears only for source type `url`.
- `mediaId` appears only for source type `media`.
- `mediaUpload` appears only for source type `upload`.

## Observed Attributes

The element re-renders when any of these attributes change:

- `source-type`
- `image-url`
- `media-id`
- `media-url`
- `media-name`
- `alt`
- `show-caption`
- `caption`
- `aspect-ratio`
- `object-fit`
- `max-width`
- `text-align`
- `margin`
- `padding`
- `custom-classes`

`attributeChangedCallback()` calls:

1. `render()`
2. `addHoverControls()`

Only when value changed and element is connected.

## Render Flow

`render()` logic:

1. Resolve source and URL.
2. Sanitize image URL (`sanitizeUrl`).
3. Parse booleans and safe style/class values.
4. Build wrapper classes (`pwc-image-wrapper` + alignment + spacing + custom classes).
5. Compute media styles (`aspect-ratio`, `max-width`).
6. Render image markup or placeholder.
7. Render `<figcaption>` only when enabled and non-empty.

Image markup shape:

```html
<figure class="pwc-image-wrapper ...">
  <div class="pwc-image-media" style="aspect-ratio:16 / 9;max-width:960px">
    <img src="..." alt="..." style="width:100%;height:100%;object-fit:cover;display:block;">
  </div>
  <figcaption class="pwc-image-caption">...</figcaption>
</figure>
```

Placeholder is rendered when URL is empty or rejected by sanitization.

## Source Resolution Rules

`rawUrl` selection:

- `source-type=url`: uses `image-url`
- `source-type=media|upload`: prefers `media-url`, falls back to `image-url`

This allows media flows to supply resolved file URL via `media-url`.

## Sanitization and Safety

Security-related helpers:

- `sanitizeUrl(url)`:
  - allows relative URLs starting with `/`
  - allows absolute `http`/`https`
  - rejects malformed/non-http protocols
- `escapeAttr(str)`: escapes `&`, `"`, `<`, `>`
- `getSafeClassTokens(str)`: allows only `[A-Za-z0-9_-]+`
- `getSafeStyleValue(value)`:
  - allows: `none`, `auto`
  - numeric units: `px`, `%`, `vw`, `vh`, `rem`, `em`
  - rejects everything else
- `getRatioStyle(ratio)` validates `w:h` numeric ratios

## Behavior Notes

- `show-caption` is parsed by `getBooleanAttribute` and supports:
  - true: `""`, `true`, `1`, attribute name
  - false: `false`, `0`
- `object-fit` default is `cover`
- With ratio set, `<img>` uses `height:100%`; otherwise `height:auto`

## Extension Examples

### 1) Add a new setting: border radius

Add in `blockSettings`:

```js
{
  name: 'borderRadius',
  type: 'text',
  label: 'Border Radius',
  default: '',
  tab: 'style',
  placeholder: 'e.g. 12px'
}
```

Observe and consume:

```js
static get observedAttributes() {
  return [...super.observedAttributes, 'border-radius'];
}

const borderRadius = this.getSafeStyleValue(this.getAttribute('border-radius') || '');
const imgStyle = [
  'width:100%',
  hasRatio ? 'height:100%' : 'height:auto',
  `object-fit:${this.escapeAttr(objectFit)}`,
  borderRadius ? `border-radius:${borderRadius}` : '',
  'display:block'
].filter(Boolean).join(';');
```

### 2) Programmatically create an image block

```js
const blockData = window.pwcBlockRegistry.createBlockData('image');
blockData.attributes = {
  ...(blockData.attributes || {}),
  sourceType: 'url',
  imageUrl: 'https://images.example.com/hero.jpg',
  alt: 'City skyline at sunrise',
  showCaption: true,
  caption: 'Downtown skyline',
  aspectRatio: '16:9',
  objectFit: 'cover',
  textAlign: 'pwc-text-center',
  maxWidth: '960px'
};

window.pwcEditorState.blocks.push(blockData);
window.pwcEditorState.isDirty = true;
window.pwcEditorState.pushHistory();
window.pwcEditorState.emit('blockAdd', { block: blockData });
```

### 3) Switch an existing image block from URL to media

```js
const block = window.pwcEditorState.findBlock(blockId);
if (block && block.type === 'image') {
  block.attributes = {
    ...(block.attributes || {}),
    sourceType: 'media',
    mediaId: '123',
    mediaUrl: '/sites/default/files/2026-02/sample-image.jpg',
    imageUrl: '' // optional cleanup for clarity
  };
  window.pwcEditorState.isDirty = true;
  window.pwcEditorState.pushHistory();
  window.pwcEditorState.emit('blockUpdate', { block });
}
```

## Testing Checklist

1. URL source accepts `https://...` and `/sites/default/files/...`.
2. `javascript:` URL is rejected and placeholder appears.
3. Media source renders when `media-url` is present.
4. Upload source renders when resolved URL is provided.
5. Caption appears only when both `show-caption=true` and `caption` exists.
6. `max-width` ignores invalid values.
7. Custom classes ignore unsafe tokens.

## Related Files

- `web/modules/custom/pwc_visual_editor/js/components/blocks/image.js`
- `web/modules/custom/pwc_visual_editor/js/components/settings-panel.js`
- `web/modules/custom/pwc_visual_editor/js/components/blocks/base-block.js`
- `web/modules/custom/pwc_visual_editor/js/services/block-registry.js`
- `web/modules/custom/pwc_visual_editor/js/services/editor-state.js`
