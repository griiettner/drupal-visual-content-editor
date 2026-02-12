# Drawer: How To Use

This guide explains how to use a Drawer in a simple way.

A Drawer is a panel that slides in from the side (or top/bottom) to show extra content without leaving the current page.

## What a Drawer is good for

Use a Drawer when you want to:

- Show settings
- Show filters
- Show extra details
- Keep the user on the same page

## Basic structure

A Drawer usually has:

- Header: title and optional extra content
- Body: main content
- Footer: action buttons like Cancel/Save

## Minimal example

```html
<apw-button id="open-drawer-btn" label="Open Drawer"></apw-button>

<apw-drawer
  id="settings-drawer"
  placement="right"
  apw-title="Settings"
  mask="true"
  closable="true"
>
  <div slot="body">
    <p>Drawer content goes here.</p>
  </div>

  <div slot="footer">
    <apw-button btn-type="secondary" label="Cancel"></apw-button>
    <apw-button label="Save"></apw-button>
  </div>
</apw-drawer>
```

## Open and close the Drawer

```js
const drawer = document.getElementById('settings-drawer');
const openBtn = document.getElementById('open-drawer-btn');

openBtn.addEventListener('click', () => {
  drawer.visible = true;
});

drawer.addEventListener('apwClose', () => {
  drawer.visible = false;
});
```

## Most common options

- `placement`: where Drawer opens from (`right`, `left`, `top`, `bottom`)
- `apw-title`: title shown in header
- `mask`: dark overlay behind Drawer
- `mask-closable`: click overlay to close
- `close-on-press-escape`: close on ESC key
- `resizable`: allow user to resize the Drawer

## Slots you can use

- `slot="header"`: add custom content near the title
- `slot="icons"`: add icon buttons in header
- `slot="body"`: main content area
- `slot="footer"`: actions at the bottom

## Best practices

- Keep Drawer content focused on one task.
- Use clear button labels (`Cancel`, `Save`, `Apply`).
- Keep primary action in the footer.
- Use `mask` for modal-like behavior.
- Use `mask="false"` for non-blocking side panels.

## Quick troubleshooting

- Drawer does not open: check that `visible` is set to `true`.
- ESC does not close: ensure `close-on-press-escape="true"`.
- Click outside does not close: ensure `mask="true"` and `mask-closable="true"`.
- Layout feels cramped: enable `resizable="true"` or simplify body content.
