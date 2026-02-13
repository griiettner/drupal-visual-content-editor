# Video Block: How To Use

This guide explains how to use the Video block in the PWC Visual Editor.

## What the Video block does

The Video block lets you add video content in three ways:

1. Direct video URL (for example MP4/WebM)
2. Existing Drupal Media video
3. Upload a new video to Drupal Media

It also supports YouTube and Vimeo embed links, captions, alignment, spacing, and playback options.

## Add a Video block

1. Open the block library.
2. Select `Video`.
3. The block is inserted into the page.

If no video source is set yet, a placeholder message appears.

## Choose video source

In settings, set `Source Type`:

- `URL`: paste a video URL or YouTube/Vimeo link
- `Media`: select an existing Drupal Media video
- `Upload`: upload a new video file to Drupal Media

Tip: Some fields only appear for specific source types. Switch `Source Type` first.

## Use URL source

For `Source Type = URL`, fill:

- `Video URL`

Supported examples:

- `https://example.com/media/intro.mp4`
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://vimeo.com/123456789`
- `/sites/default/files/2026-02/intro.mp4`

If the URL is invalid or unsupported, the block shows placeholder content.

## Use Media source

For `Source Type = Media`:

1. Open `Select Drupal Video`.
2. Choose a media item.
3. The selected media URL is used in the block.

## Use Upload source

For `Source Type = Upload`:

1. Use `Upload Video to Drupal Media`.
2. Wait for upload to finish.
3. The uploaded media is linked to this block.

## Playback options

Use these style settings:

- `Show Controls`: show/hide native video controls
- `Disable Download`: adds browser hint to disable download button
- `Autoplay`: auto-start playback
- `Muted`: mute audio by default
- `Loop`: repeat playback
- `Play Inline`: avoid forced fullscreen on mobile when possible
- `Preload`: `None`, `Metadata`, or `Auto`
- `Poster URL`: preview image before play

Note: In editor mode, autoplay is intentionally disabled.

## Layout options

Use layout settings to control size and placement:

- `Aspect Ratio`: `16:9`, `4:3`, `1:1`, `21:9`, or `Auto`
- `Object Fit`: `Contain` or `Cover`
- `Max Width`: for example `960px`, `100%`, or `none`
- `Alignment`: left, center, right, or none
- `Margin` and `Padding`

## Caption options

- Enable `Show Caption` to display caption text.
- Fill `Caption` with a short description.
- Add `Video Title` for accessibility and embed title context.

## Custom classes

Use `Custom Classes` for additional styling hooks.

Example:

`hero-video rounded-lg shadow-xl`

Use space-separated class names only.

## Common issues

1. Video not visible:
- Confirm `Source Type` matches the field you used.
- Check URL starts with `http://`, `https://`, or `/`.

2. YouTube/Vimeo not embedding:
- Use a valid public video URL.
- Re-check copied URL for extra characters.

3. Caption not showing:
- Ensure `Show Caption` is enabled and `Caption` has text.

4. Max width not applying:
- Use valid units like `px`, `%`, `vw`, `vh`, `rem`, `em`, `auto`, `none`.

## Best practices

- Use `Video Title` and meaningful captions for accessibility.
- Use `Muted` when enabling `Autoplay` to improve browser compatibility.
- Use `Aspect Ratio` for consistent page layout.
- Prefer `Media` or `Upload` when videos should be managed in Drupal.
