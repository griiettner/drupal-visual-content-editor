# Accordion Block: How to Use

This guide explains how to use the Accordion block in the PWC Visual Editor.

## What this block does

The Accordion block creates collapsible sections (accordion items).  
Each section can contain:

- A header area
- A body area for regular blocks

By default, new accordions start with 3 items.

## Add an Accordion block

1. Open the block library.
2. Select `Accordion`.
3. The block appears on the page with default titles:
- `Accordion Item 1`
- `Accordion Item 2`
- `Accordion Item 3`

## Add content in a section body

You can add content in two ways:

1. Click the `+` button inside a section body.
2. Drag a block from the block library and drop it into the section body.

When a section body is empty, it shows `Drop blocks here`.

## Add content in a section header

Each section header also has a `+` button.

1. Click `+` in the header.
2. Choose a block (Heading, Paragraph, Tag, etc.).
3. The block is inserted into that header area.

Helpful behavior:
- If the first header block you add is a Heading, it can auto-fill from the section title.

## Edit section titles

1. Select the Accordion block.
2. Open the settings panel.
3. Find `Accordion Items`.
4. Update title text for each section.

## Add or remove sections

In `Accordion Items` settings:

- Click `Add Section` to add a new accordion item.
- Click remove (`x`) to delete a section.

Important when removing a section:

- Blocks in that section are removed.
- Blocks in later sections are reindexed to keep the structure valid.

## Control open/close behavior

Use the `Allow Multiple Open` setting:

- Off: only one section should stay open at a time.
- On: multiple sections can stay open together.

## Styling options

Use these settings:

- `Margin`
- `Padding`
- `Zebra Stripes`
- `Custom Classes`

`Custom Classes` supports space-separated class names (for example: `my-accordion compact`).

## Move or delete the whole Accordion block

When editing:

- Use the drag handle to reorder the full accordion block.
- Use the trash icon to delete the accordion and all inner content.

## Best practices

- Keep section titles short and clear.
- Put rich content inside the body, not the header, unless you need a custom header layout.
- Use `Allow Multiple Open` for FAQ-style pages; keep it off for step-by-step content.
