# Drawer: Developer Documentation

Technical reference for using `apw-drawer` in the PWC Visual Editor ecosystem.

Source baseline: `web/modules/custom/pwc_visual_editor/docs/drawer.md`

## Component overview

`apw-drawer` is a web component panel that slides in and out.  
It is controlled primarily through the `visible` property/attribute and supports named slots for composition.

## Core API (most used)

- `visible: boolean` - open/close state
- `placement: 'left' | 'right' | 'top' | 'bottom'` - drawer position
- `apw-title: string` - title text
- `resizable: boolean` - enable resize handle
- `mask: boolean` - render page overlay
- `mask-closable: boolean` - close when overlay is clicked
- `close-on-press-escape: boolean` - ESC closes drawer
- `closable: boolean` - show/hide close button
- `auto-focus: boolean` - focus first tabbable element on open
- `initialFocusElement: HTMLElement` - custom first-focus element

## Events

- `apwOpen` - fired when drawer opens
- `apwClose` - fired when drawer closes
- `apwDidLoad` - initial component mount
- `apwDidUpdate` - fired after updates

Example event wiring:

```js
const drawer = document.getElementById('settings-drawer');

drawer.addEventListener('apwOpen', () => {
  console.log('drawer opened');
});

drawer.addEventListener('apwClose', () => {
  console.log('drawer closed');
});
```

## Recommended markup pattern

```html
<apw-button id="drawer-open" label="Open"></apw-button>

<apw-drawer
  id="settings-drawer"
  drawer-id="settings-drawer"
  placement="right"
  apw-title="Settings"
  mask="true"
  mask-closable="true"
  close-on-press-escape="true"
  resizable="true"
>
  <apw-badge slot="header" value="New"></apw-badge>

  <button slot="icons" type="button" aria-label="More actions">
    <span class="Appkit4-icon icon-horizontal-more-outline"></span>
  </button>

  <div slot="body">
    <p>Settings content</p>
  </div>

  <div slot="footer">
    <apw-button btn-type="secondary" label="Cancel" id="drawer-cancel"></apw-button>
    <apw-button label="Save" id="drawer-save"></apw-button>
  </div>
</apw-drawer>
```

## State management pattern

Use a single function for open/close transitions so UI side effects stay centralized.

```js
const drawer = document.getElementById('settings-drawer');
const open = document.getElementById('drawer-open');
const cancel = document.getElementById('drawer-cancel');
const save = document.getElementById('drawer-save');

function setDrawerVisible(nextVisible) {
  drawer.visible = nextVisible;
  document.body.classList.toggle('has-open-drawer', nextVisible);
}

open.addEventListener('click', () => setDrawerVisible(true));
cancel.addEventListener('click', () => setDrawerVisible(false));
save.addEventListener('click', () => {
  // persist changes here
  setDrawerVisible(false);
});

drawer.addEventListener('apwClose', () => setDrawerVisible(false));
```

## Accessibility notes

- Always set a meaningful `apw-title`.
- Keep `close-on-press-escape` enabled unless there is a strong reason not to.
- If content is complex, set `initialFocusElement` to the first logical interactive control.
- If you disable masking, verify keyboard navigation still has a clear flow.

## Styling and sizing

- Use `apwStyle` for component inline style object.
- Use `apwWrapperStyle` to control wrapper-level layout.
- Prefer CSS classes on slotted body/footer content for maintainable styling.

Example:

```js
drawer.apwStyle = { width: '480px' };
drawer.apwWrapperStyle = { zIndex: 1200 };
```

## Integration notes for PWC Visual Editor

- There is currently no dedicated `drawer.js` custom block class in `js/components/blocks/`.
- Current usage is component-level (`apw-drawer`) rather than a registered Visual Editor block type.
- If you add a Drawer block later, mirror existing block patterns:
  - static metadata (`blockName`, `blockSettings`, etc.)
  - `observedAttributes` mapping kebab-case attributes
  - edit-mode controls and history updates via `window.pwcEditorState`

## Common pitfalls

- Boolean attributes: use explicit values (`"true"` / `"false"`) to avoid ambiguity.
- Missing `id`: hard to wire open/close handlers without stable selectors.
- Overloaded body content: large forms should be sectioned (tabs/accordions) for usability.
- Focus traps: if opening nested overlays inside the drawer, test keyboard behavior carefully.

## Test checklist

- Open/close by button click
- Close by ESC
- Close by mask click (when enabled)
- Footer actions run and close as expected
- Focus lands correctly on open
- Resize behavior works (if `resizable=true`)
- Mobile viewport does not clip key actions
