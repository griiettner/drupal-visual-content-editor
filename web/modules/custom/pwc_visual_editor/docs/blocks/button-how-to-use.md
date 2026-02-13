# Button Block: How To Use

This guide explains how to use the Button block in the PWC Visual Editor.

## What the Button block does

The Button block adds a styled Appkit button (`<apw-button>`) to your page.

You can control:

- Button text
- Button style (Primary, Secondary, Tertiary, Text, Negative)
- Optional icon
- Optional compact and rounded variants
- Optional link URL
- Alignment and spacing

## Add a Button block

1. Open the block library.
2. Select `Button`.
3. A default button is inserted with label `Button`.

## Basic setup

After selecting the button block, open the settings panel:

1. Set `Button Label` (the text users see).
2. Set `Button Type` (visual style).
3. Optional: add `Icon` (Appkit icon name).

Example:

- Label: `Get Started`
- Type: `Primary`
- Icon: `arrow-forward`

## Make the button act like a link

Use these settings:

- `Link URL`: destination URL (for example `https://example.com`)
- `Open in New Tab`: enable if needed

When `Link URL` is filled, the editor wraps the button in an anchor (`<a>`).

## Style and layout options

Use these settings to control layout:

- `Compact Size`: smaller button
- `Rounded`: rounded shape
- `Alignment`: left, center, right
- `Margin`: outer spacing utility class
- `Padding`: inner spacing utility class
- `Custom Classes`: additional CSS classes (space-separated)

## Common usage patterns

- Primary call to action: `Primary` + clear action label
- Secondary action: `Secondary` + optional icon
- Text action inside content: `Text` style
- External links: URL + `Open in New Tab`

## Tips

- Keep labels action-focused (`Download`, `Book demo`, `Start now`).
- Use `Open in New Tab` mainly for external websites.
- Use `Custom Classes` only when standard settings are not enough.
