# Appkit4 Tab

## Code Example

```html
<apw-tabset type="underline">
  <apw-tab label="Mail"></apw-tab>
  <apw-tab label="Archive"></apw-tab>
  <apw-tab label="Trash"></apw-tab>
  <apw-tab label="Junk"></apw-tab>
</apw-tabset>
```

---

## apw-tabset Properties

| Name                 | Attribute            | Type                      | Description                                                                                                                                                                                                        | Default                                   | Version |
| -------------------- | -------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ------- |
| type                 | type                 | `'underline' \| 'filled'` | Type of the tabset.                                                                                                                                                                                                | `underline`                               | 1.0.0   |
| activeIndex          | active-index         | number                    | Index of the current active tab.                                                                                                                                                                                   | 0                                         | 1.0.0   |
| tabsetId             | tabset-id            | string                    | The id string of tabset.                                                                                                                                                                                           | Random string of 14 characters in length. | 1.0.0   |
| stretched            | stretched            | boolean                   | Stretch each tab and set the width of tabset to 100%.                                                                                                                                                              | false                                     | 1.0.0   |
| responsive           | responsive           | boolean                   | Enable the responsive tabset.                                                                                                                                                                                      | false                                     | 1.0.0   |
| pinActiveTab         | pin-active-tab       | boolean                   | Pin the selected tab to the left. Only works when property `responsive` is true. If true, please note that the property `activeIndex` still represents the index of the active tab in the original tablist.        | false                                     | 1.0.0   |
| showBothIndicators   | show-both-indicators | boolean                   | Display both left and right arrow indicators of the underline responsive tabset. Only works when property `responsive` is true and `type` is `underline`. By default, only the right arrow indicator is displayed. | false                                     | 1.0.0   |
| overflow             | overflow             | boolean                   | Enable the overflow filled tabset. Only supported when there is a label.                                                                                                                                           | false                                     | 1.0.0   |
| overflowNumber       | overflow-number      | number                    | More than how many tabs start pouring out. Used with the overflow property.                                                                                                                                        | 8                                         | 1.0.0   |
| apwActiveIndexChange | -                    | CustomEvent<any>          | Event to fire when the tab is selected.                                                                                                                                                                            | -                                         | 1.0.0   |
| collapseOverflowTabs | -                    | CustomEvent<any>          | Event to fire when the overflow tabs collapsed.                                                                                                                                                                    | -                                         | 1.0.0   |
| apwStyle             | -                    | Object                    | The inline style of the component.                                                                                                                                                                                 | -                                         | 1.0.0   |
| apwDidLoad           | -                    | CustomEvent<any>          | Called once just after the component is fully loaded and the first render() occurs.                                                                                                                                | -                                         | 1.0.0   |
| apwDidUpdate         | -                    | CustomEvent<any>          | Called just after the component updates. It's never called during the first render().                                                                                                                              | -                                         | 1.0.0   |

---

## apw-tab Properties

| Name         | Attribute    | Type             | Description                                                                              | Default                                  | Version |
| ------------ | ------------ | ---------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------- | ------- |
| label        | label        | string           | Label of each tab. (htmlSnippet supported).                                              | ""                                       | 1.0.0   |
| icon         | icon         | string           | Name of the icon displayed on the left of the label. Only applicable when type = filled. | ""                                       | 1.0.0   |
| apwDisabled  | apw-disabled | boolean          | Disable the current tab.                                                                 | false                                    | 1.0.0   |
| tabId        | tab-id       | string           | The id string of tab.                                                                    | Random string of 15 characters in length | 1.0.0   |
| tooltipProps | -            | Object           | The configuration of tooltip properties and its content.                                 | {}                                       | 1.0.0   |
| apwStyle     | -            | Object           | The inline style of the component.                                                       | -                                        | 1.0.0   |
| apwDidLoad   | -            | CustomEvent<any> | Called once just after the component is fully loaded and the first render() occurs.      | -                                        | 1.0.0   |
| apwDidUpdate | -            | CustomEvent<any> | Called just after the component updates. It's never called during the first render().    | -                                        | 1.0.0   |
