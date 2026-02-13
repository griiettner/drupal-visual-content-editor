# Tag Block: How To Use

This guide explains how to use the Tag block in the PWC Visual Editor.

## What the Tag block does

The Tag block adds one or more Appkit4 tags (`<apw-tag>`) to your page.

You can control:

- Tag text (single or multiple tags)
- Size (`Small` or `Large`)
- Style (`Filled` or `Outlined`)
- Optional close button
- Background and font colors
- Horizontal or stacked layout
- Alignment and spacing

## Add a Tag block

1. Open the block library.
2. Select `Tag`.
3. A Tag block is inserted with default values.

Default tag text is:

`Tag 1, Tag 2, Tag 3`

## Add one or more tags

Use the `Tags` field and enter text separated by commas.

Example:

`News, Product Update, Case Study`

This creates 3 separate tags.

Tips:

- Add commas between tags.
- Extra spaces are handled automatically.
- Empty values are ignored.

## Choose size and style

Use these settings:

- `Size`: `Small` or `Large`
- `Type`: `Filled` or `Outlined`

Common pattern:

- `Filled` for stronger visual emphasis
- `Outlined` for lighter metadata-style labels

## Show or hide close icon

Use `Show Close Button`:

- Off: tags display as labels only
- On: each tag displays a close icon

Use this only when the close action is meaningful in your UI context.

## Set colors

Use:

- `Background Color`
- `Font Color`

You can choose from the predefined Appkit4 color list.

If you leave a color empty:

- Background falls back to component default
- Font color falls back to component default

## Control tag layout

Use `Stacked`:

- Off: tags display in a row/wrap layout
- On: tags display vertically (one per line)

This is useful for filters, sidebars, or dense mobile sections.

## Layout and spacing

Use these settings on the block wrapper:

- `Alignment`: left, center, right
- `Margin`
- `Padding`
- `Custom Classes`

`Custom Classes` should be space-separated class names.

## Quick examples

### Example 1: Simple metadata tags

- Tags: `AI, Accessibility, Drupal`
- Size: `Small`
- Type: `Outlined`
- Stacked: `Off`

### Example 2: Category labels in sidebar

- Tags: `Finance, Risk, Tax, Audit`
- Size: `Large`
- Type: `Filled`
- Stacked: `On`
- Alignment: `Left`

## Common issues

1. Only one tag appears:
- Make sure values are separated by commas.

2. Colors are not changing:
- Confirm `Background Color` or `Font Color` is selected (not empty).

3. Layout looks crowded:
- Enable `Stacked` or add `Margin`/`Padding`.

## Best practices

- Keep tag text short (1 to 3 words).
- Use consistent tag style on the same page.
- Use stacked layout for narrow columns.
- Prefer predefined colors for design consistency.
