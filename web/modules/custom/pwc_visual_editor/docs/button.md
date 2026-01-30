## Code Examples

```html
## Primary
<apw-button id="apw-default-button" btn-type="primary" label="Label" compact="true"></apw-button>

## Grouped Buttons
<style>
.button-demo-wrapper-horizontal {
  display: flex;
  width: 22.5rem;
  justify-content: space-between;
}
</style>

<div class="button-demo-wrapper-horizontal">
  <apw-button class="button-example" label="Label" btn-type="primary" compact="true"></apw-button>
  <apw-button class="button-example" label="Label" btn-type="secondary" compact="true"></apw-button>
  <apw-button class="button-example" label="Label" btn-type="secondary" compact="true"></apw-button>
  <apw-button class="button-example" label="Label" btn-type="secondary" compact="true"></apw-button>
</div>

## Menu
<script>
const button = document.querySelector('#apw-default-button');
button.data = [
  { label: 'Default', value: 'Default', disabled: false },
  { label: 'Hover', value: 'Hover', disabled: false },
  { label: 'Selected', value: 'Selected', disabled: false },
  { label: 'Disabled', value: 'Disabled', disabled: true }
];
</script>

<apw-menu-button id="apw-default-button" group-type="menu" label="Label" compact="true"></apw-menu-button>
<apw-menu-button id="apw-default-button" group-type="group" label="Label" compact="true"></apw-menu-button>
```

---

## apw-button Properties

| Name         | Attribute    | Type                                                             | Description                                                                                | Default   | Version |
| ------------ | ------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------- | ------- |
| btnType      | btn-type     | `'primary' \| 'secondary' \| 'tertiary' \| 'text' \| 'negative'` | Type of the button.                                                                        | `primary` | 1.0.0   |
| label        | label        | string                                                           | Text of the button.                                                                        | ""        | 1.0.0   |
| icon         | icon         | string                                                           | Name of the icon on the button. For example, `icon="time-outline"`.                        | ""        | 1.0.0   |
| compact      | compact      | boolean                                                          | When specified, the button displays in the compact size.                                   | false     | 1.0.0   |
| apwDisabled  | apw-disabled | boolean                                                          | If true, the button is disabled.                                                           | false     | 1.0.0   |
| rounded      | rounded      | boolean                                                          | Whether the button is a rounded button.                                                    | false     | 1.0.0   |
| loading      | loading      | boolean                                                          | Whether the button can be triggered with loading state.                                    | false     | 1.0.0   |
| isLoading    | is-loading   | boolean                                                          | Whether the button will be in loading state by default. Only works when `loading` is true. | false     | 1.0.0   |
| type         | type         | `'button' \| 'reset' \| 'submit'`                                | The type aria attribute of HTML button element semantics. Applies to the main button.      | `submit`  | 1.0.0   |
| apwStyle     | -            | Object                                                           | The inline style of the component.                                                         | -         | 1.0.0   |
| apwBlur      | -            | CustomEvent<any>                                                 | Event fires when the button is blurred.                                                    | -         | 1.0.0   |
| apwClick     | -            | CustomEvent<any>                                                 | Event fires when the button is clicked.                                                    | -         | 1.0.0   |
| apwFocus     | -            | CustomEvent<any>                                                 | Event fires when the button is focused.                                                    | -         | 1.0.0   |
| apwDidLoad   | -            | CustomEvent<any>                                                 | Called once just after the component is fully loaded and the first render() occurs.        | -         | 1.0.0   |
| apwDidUpdate | -            | CustomEvent<any>                                                 | Called just after the component updates. It's never called during the first render().      | -         | 1.0.0   |

---

## apw-menu-button Properties

| Name                  | Attribute    | Type                                                             | Description                                                                                                                                                                            | Default   | Version |
| --------------------- | ------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------- |
| btnType               | btn-type     | `'primary' \| 'secondary' \| 'tertiary' \| 'text' \| 'negative'` | Type of the button.                                                                                                                                                                    | `primary` | 1.0.0   |
| groupType             | group-type   | `'group' \| 'menu'`                                              | Type of group or menu button.                                                                                                                                                          | `menu`    | 1.0.0   |
| buttonId              | button-id    | string                                                           | The id string of group button or menu button.                                                                                                                                          | ""        | 1.0.0   |
| label                 | label        | string                                                           | Text of the button.                                                                                                                                                                    | ""        | 1.0.0   |
| icon                  | icon         | string                                                           | Name of the icon on the button. For example, `icon="time-outline"`.                                                                                                                    | ""        | 1.0.0   |
| data                  | -            | Array<object>                                                    | The data of dropdown list items in menu/group button.                                                                                                                                  | []        | 1.0.0   |
| hasPanel              | has-panel    | boolean                                                          | Whether the button has custom dropdown panel. If true, add a child wrapper div to `apw-menu-button`, set slot property of wrapper as `button-panel` and put customized content inside. | false     | 1.0.0   |
| compact               | compact      | boolean                                                          | When specified, the button displays in the compact size.                                                                                                                               | false     | 1.0.0   |
| apwDisabled           | apw-disabled | boolean                                                          | If true, the button is disabled.                                                                                                                                                       | false     | 1.0.0   |
| rounded               | rounded      | boolean                                                          | Whether the button is a rounded button.                                                                                                                                                | false     | 1.0.0   |
| panelAlign            | panel-align  | `'left' \| 'right'`                                              | The way dropdown menu aligns with the button.                                                                                                                                          | `right`   | 1.0.0   |
| type                  | type         | `'button' \| 'reset' \| 'submit'`                                | The type aria attribute of HTML button element semantics, applies to the main button.                                                                                                  | `submit`  | 1.0.0   |
| apwStyle              | -            | Object                                                           | The inline style of the component.                                                                                                                                                     | -         | 1.0.0   |
| apwBlur               | -            | CustomEvent<any>                                                 | Event fires when the button is blurred.                                                                                                                                                | -         | 1.0.0   |
| apwClick              | -            | CustomEvent<any>                                                 | Event fires when the button is clicked.                                                                                                                                                | -         | 1.0.0   |
| apwFocus              | -            | CustomEvent<any>                                                 | Event fires when the button is focused.                                                                                                                                                | -         | 1.0.0   |
| apwClose              | -            | CustomEvent<any>                                                 | Event fires when the dropdown is closed.                                                                                                                                               | -         | 1.0.0   |
| apwSelectDropdownItem | -            | CustomEvent<any>                                                 | Event fires when the dropdown item is selected.                                                                                                                                        | -         | 1.0.0   |
| apwDidLoad            | -            | CustomEvent<any>                                                 | Called once just after the component is fully loaded and the first render() occurs.                                                                                                    | -         | 1.0.0   |
| apwDidUpdate          | -            | CustomEvent<any>                                                 | Called just after the component updates. It's never called during the first render().                                                                                                  | -         | 1.0.0   |
