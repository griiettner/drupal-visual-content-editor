# Accordion Block: How To Use

This guide explains how to use the Accordion block inside the PWC Visual Editor.

## What the Accordion block does

The Accordion block creates collapsible sections (items).  
Each section can contain:

- A header area (optional custom block content)
- A body area (any blocks you drop inside)

By default, a new Accordion starts with 3 sections.

## Add an Accordion block

1. Open the block library.
2. Select `Accordion`.
3. The block is inserted with default section titles:
- `Accordion Item 1`
- `Accordion Item 2`
- `Accordion Item 3`

## Add content inside a section

There are two ways:

1. Click the `+` button in a section body.
2. Drag a block from the block library and drop it into a section body.

When empty, the section shows `Drop blocks here`.

## Add content inside a section header (custom header)

Each section header has its own `+` button.

1. Click `+` in the header.
2. Choose a block (for example, Heading, Paragraph, Tag, etc.).
3. The block is added to that header area.

If you add a `Heading` as the first header heading block in that section, its text is auto-filled from the section title.

## Rename, add, or remove sections

1. Select the Accordion block.
2. Open the settings panel.
3. Under `Accordion Items`:
- Edit title text directly
- Click `Add Section` to create a new section
- Click the remove (`x`) button to delete a section

Important when removing a section:

- All blocks in that section are removed.
- Blocks in later sections move up to keep indexes consistent.

## Toggle behavior (single vs multiple open)

Use `Allow Multiple Open` in settings:

- Off: behaves like classic accordion (single-open style).
- On: multiple sections can stay open together.

## Style options

Use these settings on the block:

- `Margin`
- `Padding`
- `Zebra Stripes`
- `Custom Classes`

`Custom Classes` accepts space-separated CSS class names.

## Reorder or delete the whole Accordion block

When editing:

- Use the drag handle on the Accordion controls to reorder the full Accordion block.
- Use the trash icon to delete the Accordion and all inner content.

## Tips

- Use short, clear section titles for better readability.
- Use header blocks only when you need richer header layouts.
- Keep heavy content in the body section for easier editing.
