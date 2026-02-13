# Layout Block: How To Use

This guide explains how to use the Layout block in the PWC Visual Editor.

## What the Layout block does

The Layout block is a container that lets you build column-based sections.

You can:

- Choose a column structure (1, 2, or 3 columns)
- Drop blocks inside each column
- Control column gap and vertical alignment
- Apply spacing and style options (background, border, radius)

## Add a Layout block

1. Open the block library.
2. Select `Container`.
3. A layout block is inserted with the default `100` layout (single column).

## Choose a layout structure

Select the Layout block, then open settings and choose `Layout`.

Available options:

- `Full` (`100`)
- `50/50`
- `30/70`
- `70/30`
- `3 Col` (`33-33-33`)
- `Sidebar` (`25-50-25`)

When you change the layout, columns are rebuilt using that ratio.

## Add blocks to a column

There are two ways:

1. Click the `+` button inside the column.
2. Drag a block from the block library and drop it into the column.

If a column is empty in edit mode, it shows `Drop blocks here`.

## Nested layouts

You can place a Layout block inside another Layout block.

1. Drag `Container` into a column.
2. Choose a different layout for the nested container.
3. Add blocks inside the nested columns.

This is useful for complex sections (for example, a sidebar with its own sub-grid).

## Layout controls

Use these settings on the block:

- `Column Gap`: none, small, medium, large
- `Vertical Alignment`: top, center, bottom, stretch
- `Margin`
- `Padding`
- `Background Color`
- `Border Width`
- `Border Color`
- `Border Radius`

## Reorder or delete the layout block

When editing:

- Use the drag handle (six-dot icon) to reorder the whole Layout block.
- Use the trash icon to delete the container and all nested content.

## Tips

- Start with `50/50` or `30/70` for common content + sidebar layouts.
- Use `stretch` vertical alignment when columns should match height.
- Keep spacing consistent by using the same gap and margin scale across sections.
- Use nested layouts carefully to avoid over-complicated structures.
