# Image Block: How To Use

This guide explains how to use the Image block in the PWC Visual Editor.

## What the Image block does

The Image block lets you add an image to your page in three ways:

1. Use a direct URL
2. Select an existing Drupal Media image
3. Upload a new image to Drupal Media

You can also add alt text, optional caption, alignment, spacing, and size controls.

## Add an Image block

1. Open the block library.
2. Select `Image`.
3. The block is inserted into the page.

If no image is set yet, you will see a placeholder message.

## Choose your image source

In settings, use `Source Type`:

- `URL`: paste a full image URL (for example `https://example.com/photo.jpg`) or a site-relative path (`/sites/default/files/...`).
- `Media`: pick an existing image from Drupal Media.
- `Upload`: upload a new file and save it to Drupal Media.

Tip: If one source type is not showing the field you expect, switch `Source Type` first.

## Add alt text (important)

Use the `Alt Text` field to describe the image for accessibility.

Examples:

- `Team working in the office`
- `Product screenshot showing dashboard KPIs`

Keep it short and meaningful.

## Show or hide caption

1. Turn on `Show Caption`.
2. Fill the `Caption` field.

If `Show Caption` is off, caption text will not appear on the page.

## Control layout

Use these settings:

- `Aspect Ratio`: `16:9`, `4:3`, `1:1`, `3:4`, or `Auto`
- `Object Fit`: `Cover` or `Contain`
- `Max Width`: for example `960px`, `100%`, or `none`
- `Alignment`: left, center, right, or none
- `Margin` and `Padding`

## Add custom CSS classes

Use `Custom Classes` for extra styling hooks.

Example:

`hero-image rounded shadow-lg`

Use space-separated class names only.

## Common issues

1. Image not showing:
- Check `Source Type` matches the field you used.
- For URL source, verify URL starts with `http://`, `https://`, or `/`.

2. Caption not visible:
- Ensure `Show Caption` is enabled and `Caption` has text.

3. Max width not applied:
- Use valid values like `px`, `%`, `vw`, `vh`, `rem`, `em`, `auto`, or `none`.

## Quick best practices

- Always set useful `Alt Text`.
- Use `Aspect Ratio` to keep layouts consistent.
- Use `Contain` for logos and screenshots.
- Use `Cover` for hero and decorative visuals.
