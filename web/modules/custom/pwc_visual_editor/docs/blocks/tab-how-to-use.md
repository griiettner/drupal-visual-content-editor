# Accordion Block: How To Use

This guide explains how to use the Accordion block in the PWC Visual Editor.

## What this block does

The Accordion block creates collapsible sections.
Each section has:

- A header area (the clickable row)
- A body area (where content blocks go)

By default, a new Accordion starts with 3 sections.

## Add an Accordion block

1. Open the block library.
2. Select `Accordion`.
3. The block is inserted with default section names:
   - `Accordion Item 1`
   - `Accordion Item 2`
   - `Accordion Item 3`

## Add content to a section body

You can add content in two ways:

1. Click the `+` button inside a section body.
2. Drag a block from the block library into a section body.

If a section is empty, you will see `Drop blocks here`.

## Add content to a section header

Each header has its own `+` button for custom header content.

1. Click `+` in the header row.
2. Pick a block (for example: Heading, Paragraph, Tag).
3. The block is inserted inside that header.

If you add a Heading as the first header block, its text is auto-filled from the section title.

## Rename sections, add sections, remove sections

1. Select the Accordion block.
2. Open the settings panel.
3. In `Accordion Items`:
   - Edit a section title directly.
   - Click `Add Section` to create a new one.
   - Click `x` to remove a section.

Important when deleting a section:

- Blocks in that section are deleted.
- Blocks in later sections move up automatically to keep section order valid.

## Open behavior: single-open vs multi-open

Use `Allow Multiple Open`:

- Off: one section open at a time (classic accordion behavior).
- On: multiple sections can stay open.

## Style options

Use these settings:

- `Margin`
- `Padding`
- `Zebra Stripes`
- `Custom Classes`

`Custom Classes` accepts space-separated class names.

## Reorder or delete the whole block

While editing:

- Use the drag handle to move the Accordion block.
- Use the trash icon to delete the Accordion block and all its inner content.

## Practical tips

- Keep section titles short and clear.
- Put heavy content in section bodies, not headers.
- Use header blocks only when you need rich header layout.
