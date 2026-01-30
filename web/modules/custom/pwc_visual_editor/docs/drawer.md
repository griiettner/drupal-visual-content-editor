# Appkit4 Drawer

```html
<apw-button id="ap-drawer-demo-button" label="Open Drawer"></apw-button>

<apw-drawer
  id="ap-drawer-live-demo"
  placement="right"
  mask="false"
  apw-title="Drawer"
  resizable="true"
>
  <apw-badge slot="header" value="New" class="ap-drawer-header-slot"></apw-badge>

  <button slot="icons" type="button" class="ap-drawer-icon" aria-label="more">
    <span class="Appkit4-icon icon-horizontal-more-outline"></span>
  </button>

  <div slot="body">
    <apw-tabset type="underline">
      <apw-tab label="Label">
        <div class="tab-content">

          <fieldset>
            <legend class="drawer-info-title">Components default mode</legend>
            <apw-radio-group class="drawer-demo-radio-group" value="1">
              <apw-radio class="drawer-demo-radio" value="1">Transparent</apw-radio>
              <apw-radio class="drawer-demo-radio" value="2">Light mode</apw-radio>
              <apw-radio class="drawer-demo-radio" value="3">Dark mode</apw-radio>
            </apw-radio-group>
          </fieldset>

          <fieldset>
            <legend class="drawer-info-title">Interface appearance</legend>
            <apw-radio-group class="drawer-demo-radio-group" value="1">
              <apw-radio class="drawer-demo-radio" value="1">Light mode</apw-radio>
              <apw-radio class="drawer-demo-radio" value="2">Dark mode</apw-radio>
            </apw-radio-group>
          </fieldset>

          <fieldset>
            <legend class="drawer-info-title">Notifications settings</legend>
            <apw-toggle class="drawer-demo-toggle">Appkit releases</apw-toggle>
            <apw-toggle class="drawer-demo-toggle">Issue replies</apw-toggle>
            <apw-toggle class="drawer-demo-toggle">Issue closed</apw-toggle>
          </fieldset>

        </div>
      </apw-tab>

      <apw-tab label="Label"></apw-tab>
      <apw-tab label="Label"></apw-tab>
    </apw-tabset>
  </div>

  <div slot="footer" class="ap-drawer-footer-slot">
    <apw-button
      btn-type="secondary"
      id="ap-drawer-cancel-button"
      label="Cancel"
    ></apw-button>

    <apw-button
      id="ap-drawer-ok-button"
      label="OK"
    ></apw-button>
  </div>
</apw-drawer>
```

---

## apw-drawer Properties

| Name                | Attribute             | Type                                             | Description                                                                                                  | Default | Version |
| ------------------- | --------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------- | ------- |
| drawerId            | drawer-id             | string                                           | Unique id of the drawer.                                                                                     | -       | 1.6.0   |
| visible             | visible               | boolean                                          | Visibility of the drawer.                                                                                    | false   | 1.6.0   |
| placement           | placement             | `string: 'bottom' \| 'left' \| 'right' \| 'top'` | Where the drawer is placed.                                                                                  | `right` | 1.6.0   |
| apwTitle            | apw-title             | string                                           | Title of the drawer.                                                                                         | -       | 1.6.0   |
| resizable           | resizable             | boolean                                          | If true, resizable bar is available and the drawer can be resized.                                           | false   | 1.6.0   |
| closable            | closable              | boolean                                          | Whether the close button is shown.                                                                           | true    | 1.6.0   |
| closeOnPressEscape  | close-on-press-escape | boolean                                          | Whether the drawer can be closed by pressing the ESC key.                                                    | true    | 1.6.0   |
| autoFocus           | auto-focus            | boolean                                          | Set focus to the tabbable element automatically when opening the drawer.                                     | true    | 1.6.0   |
| initialFocusElement | -                     | HTMLElement | undefined | null                   | Element to be focused on when opening the drawer. Default is the close button. Valid when autoFocus is true. | -       | 1.6.0   |
| maskClosable        | mask-closable         | boolean                                          | Whether to close the drawer dialog when the mask is clicked.                                                 | true    | 1.6.0   |
| mask                | mask                  | boolean                                          | Whether to show the mask of the drawer.                                                                      | true    | 1.6.0   |
| apwStyle            | -                     | Object                                           | The inline style of the drawer.                                                                              | -       | 1.6.0   |
| apwWrapperStyle     | -                     | Object                                           | The inline style of the drawer wrapper.                                                                      | -       | 1.6.0   |
| apwOpen             | -                     | CustomEvent<any>                                 | Event fires when opening drawer.                                                                             | -       | 1.6.0   |
| apwClose            | -                     | CustomEvent<any>                                 | Event fires when closing drawer.                                                                             | -       | 1.6.0   |
| apwDidLoad          | -                     | CustomEvent<any>                                 | Called once just after the component is fully loaded and the first `render()` occurs.                        | -       | 1.6.0   |
| apwDidUpdate        | -                     | CustomEvent<any>                                 | Called just after the component updates. It’s never called during the first `render()`.                      | -       | 1.6.0   |
