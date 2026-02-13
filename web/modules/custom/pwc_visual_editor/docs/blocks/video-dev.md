# Video Block: Developer Documentation

Technical reference for `web/modules/custom/pwc_visual_editor/js/components/blocks/video.js`.

## File and Registration

- Class: `VideoBlock extends window.PwcBaseBlock`
- Custom element: `pwc-video`
- Registry key: `video`

Registration:

```js
customElements.define('pwc-video', VideoBlock);
if (window.pwcBlockRegistry) {
  window.pwcBlockRegistry.register(VideoBlock);
}
```

## Block Metadata

Static metadata used by the block library:

- `blockName`: `video`
- `blockTitle`: `Video`
- `blockDescription`: `Add a video from URL, embed, or Drupal Media.`
- `blockCategory`: `media`

## Settings Contract

`blockSettings` defines the editor controls and attribute payload.

Primary settings:

- `sourceType` (`optionButtons`): `url`, `media`, `upload`
- `videoUrl` (`text`): direct video URL or embed URL
- `mediaId` (`mediaVideoPicker`): Drupal Media reference
- `mediaUpload` (`videoUpload`): upload flow payload
- `title` (`text`): video title (accessibility/context)
- `showControls` (`toggle`)
- `disableDownload` (`toggle`)
- `autoplay` (`toggle`)
- `muted` (`toggle`)
- `loop` (`toggle`)
- `playsInline` (`toggle`)
- `preload` (`select`): `none`, `metadata`, `auto`
- `posterUrl` (`text`)
- `aspectRatio` (`optionButtons`)
- `objectFit` (`optionButtons`): `contain`, `cover`
- `maxWidth` (`text`)
- `textAlign` (`alignment`)
- `showCaption` (`toggle`)
- `caption` (`text`)
- `margin` (`spacing`)
- `padding` (`spacing`)
- `customClasses` (`text`)

Conditional settings:

- `videoUrl` shown only when source type is `url`
- `mediaId` shown only when source type is `media`
- `mediaUpload` shown only when source type is `upload`

## Observed Attributes

The element re-renders when these attributes change:

- `source-type`
- `video-url`
- `media-id`
- `media-url`
- `media-type`
- `media-name`
- `title`
- `show-controls`
- `disable-download`
- `autoplay`
- `muted`
- `loop`
- `plays-inline`
- `preload`
- `poster-url`
- `aspect-ratio`
- `object-fit`
- `max-width`
- `text-align`
- `show-caption`
- `show-caption-explicit`
- `caption`
- `margin`
- `padding`
- `custom-classes`

`attributeChangedCallback()` behavior:

1. Ignore updates when value has not changed or element is detached.
2. Call `render()`.
3. Re-attach hover controls with `addHoverControls()`.

## Render Flow

`render()` performs this sequence:

1. Resolve source values based on `source-type`.
2. Sanitize URL with `sanitizeUrl`.
3. Detect embed mode with `normalizeEmbedUrl` and `media-type`.
4. Parse booleans and validated styles/classes.
5. Build wrapper classes:
- base: `pwc-video-wrapper`
- optional: text alignment, margin tokens, padding tokens, custom classes
6. Build media styles (`aspect-ratio`, `max-width`).
7. Render one of:
- placeholder (no valid URL)
- iframe embed (YouTube/Vimeo)
- native `<video>` player with `<source>`
8. Render caption only when caption text exists and caption visibility rules pass.

## Source Resolution Rules

`rawUrl` selection:

- `source-type=url`: use `video-url`
- `source-type=media|upload`: prefer `media-url`, fallback to `video-url`

Then:

- `sanitizeUrl(rawUrl)` allows `/...`, `http://...`, `https://...`
- invalid or unsupported URLs become empty string and render placeholder

## Embed Normalization

`normalizeEmbedUrl(url)` converts supported URLs to embed endpoints:

- `youtu.be/<id>` -> `https://www.youtube.com/embed/<id>`
- `youtube.com/watch?v=<id>` -> `https://www.youtube.com/embed/<id>`
- `youtube.com/shorts/<id>` -> `https://www.youtube.com/embed/<id>`
- `youtube.com/embed/<id>` -> normalized embed URL
- `vimeo.com/<id>` -> `https://player.vimeo.com/video/<id>`
- `player.vimeo.com/video/<id>` -> normalized embed URL

If embed conversion succeeds, block renders an `<iframe>`.

## Native Video Attributes

For non-embed URLs, render path uses `<video>` and applies:

- `controls` when `show-controls=true`
- `controlslist="nodownload"` when `disable-download=true`
- `autoplay` when `autoplay=true` and editor is not in editing mode
- `muted`, `loop`, `playsinline` according to flags
- `preload` only if one of `none|metadata|auto` (fallback `metadata`)
- optional `poster`
- optional `title`
- inline style: `object-fit`, width/height based on aspect ratio

## Caption Behavior

Caption rendering uses two flags:

- `show-caption`
- `show-caption-explicit`

Rule:

- caption appears only when `caption` is non-empty AND
- `show-caption-explicit` is false OR (`show-caption-explicit` is true AND `show-caption` is true)

This preserves backward compatibility for older block data where explicit toggle state might not exist.

## Safety Helpers

Security and validation helpers:

- `escapeAttr(str)` escapes `&`, `"`, `<`, `>`
- `sanitizeUrl(url)` rejects unsupported schemes (for example `javascript:`)
- `getSafeClassTokens(str)` allows only `[A-Za-z0-9_-]+`
- `getSafeStyleValue(value)` allows:
- `none`, `auto`
- numeric units: `px`, `%`, `vw`, `vh`, `rem`, `em`
- `getRatioStyle(ratio)` validates numeric `w:h` format

## Output Examples

### 1) Native MP4 playback

Input:

```html
<pwc-video
  source-type="url"
  video-url="https://cdn.example.com/video/intro.mp4"
  title="Product intro"
  show-controls="true"
  aspect-ratio="16:9"
  object-fit="contain"
  max-width="960px"
></pwc-video>
```

Rendered shape (simplified):

```html
<div class="pwc-video-wrapper">
  <div class="pwc-video-player" style="aspect-ratio:16 / 9;max-width:960px">
    <video controls controlslist="nodownload" preload="metadata" title="Product intro" style="object-fit:contain;width:100%;height:100%;display:block;">
      <source src="https://cdn.example.com/video/intro.mp4">
    </video>
  </div>
</div>
```

### 2) YouTube embed

Input:

```html
<pwc-video
  source-type="url"
  video-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  title="Demo video"
  aspect-ratio="16:9"
></pwc-video>
```

Rendered shape (simplified):

```html
<div class="pwc-video-wrapper">
  <div class="pwc-video-embed" style="aspect-ratio:16 / 9">
    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Demo video" loading="lazy" allowfullscreen></iframe>
  </div>
</div>
```

## Programmatic Creation Example

```js
const blockData = window.pwcBlockRegistry.createBlockData('video');
blockData.attributes = {
  ...(blockData.attributes || {}),
  sourceType: 'url',
  videoUrl: 'https://cdn.example.com/video/launch.mp4',
  title: 'Launch video',
  showControls: true,
  disableDownload: true,
  autoplay: false,
  muted: false,
  loop: false,
  playsInline: true,
  preload: 'metadata',
  aspectRatio: '16:9',
  objectFit: 'contain',
  maxWidth: '960px',
  textAlign: 'pwc-text-center',
  showCaption: true,
  caption: 'Quarterly launch highlights',
};

window.pwcEditorState.blocks.push(blockData);
window.pwcEditorState.isDirty = true;
window.pwcEditorState.pushHistory();
window.pwcEditorState.emit('blockAdd', { block: blockData });
```

## Extension Example: Add `showFullscreen` Toggle

1. Add setting in `blockSettings`.
2. Add `show-fullscreen` to `observedAttributes`.
3. In `render()`, conditionally set iframe/video permission attributes or classes.

Example setting:

```js
{
  name: 'showFullscreen',
  type: 'toggle',
  label: 'Allow Fullscreen',
  default: true,
  tab: 'style',
}
```

Consume in render (pattern):

```js
const showFullscreen = this.getBooleanAttribute('show-fullscreen', true);
const iframeAllowFullscreenAttr = showFullscreen ? ' allowfullscreen' : '';
```

## Testing Checklist

1. URL source renders for valid MP4/WebM URLs.
2. Invalid URL (`javascript:...`) shows placeholder.
3. YouTube short/watch/embed URLs normalize correctly.
4. Vimeo URLs normalize correctly.
5. Media source uses `media-url` when available.
6. Upload source renders resolved media URL.
7. `autoplay` does not activate while editing mode is true.
8. `preload` falls back to `metadata` for invalid values.
9. Caption visibility follows `show-caption` + `show-caption-explicit`.
10. Unsafe custom class tokens are filtered out.

## Related Files

- `web/modules/custom/pwc_visual_editor/js/components/blocks/video.js`
- `web/modules/custom/pwc_visual_editor/js/components/blocks/base-block.js`
- `web/modules/custom/pwc_visual_editor/js/components/settings-panel.js`
- `web/modules/custom/pwc_visual_editor/js/services/block-registry.js`
- `web/modules/custom/pwc_visual_editor/js/services/editor-state.js`
