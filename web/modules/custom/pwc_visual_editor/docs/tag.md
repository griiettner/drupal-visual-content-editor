## Code Example

```html
# Tag
<apw-tag id="apw-tag-sample" text="Primary" size="small" type="outlined" apw-disabled="false" show-close="false"></apw-tag>

# Group
<style>
.tagList {
  list-style-type: none;
  padding-inline-start: 0;
  display: inline-flex;
  column-gap: 4px;
}
</style>

<ul class="tagList">
  <li>
    <apw-tag text="Miami" size="small" type="filled" apw-disabled="false" show-close="false"></apw-tag>
  </li>
  <li>
    <apw-tag text="Denver" size="small" type="filled" apw-disabled="false" show-close="false"></apw-tag>
  </li>
  <li>
    <apw-tag text="Milwaukee" size="small" type="filled" apw-disabled="false" show-close="false"></apw-tag>
  </li>
  <li>
    <apw-tag text="Dallas" size="small" type="filled" apw-disabled="false" show-close="false"></apw-tag>
  </li>
</ul>
```

---

## apw-tag Properties

| Name            | Attribute        | Type                     | Description                                                                           | Default                                          | Version |
| --------------- | ---------------- | ------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------ | ------- |
| size            | size             | `'small' \| 'large'`     | Size of the tag.                                                                      | `small`                                          | 1.0.0   |
| type            | type             | `'filled' \| 'outlined'` | Type of the tag.                                                                      | `filled`                                         | 1.1.0   |
| text            | text             | string                   | Text of the tag.                                                                      | ""                                               | 1.0.0   |
| backgroundColor | background-color | string                   | Background color of tag.                                                              | Default value is the primary color.              | 1.0.0   |
| fontColor       | font-color       | string                   | Text color and X icon color of tag.                                                   | `#FFFFFF`                                        | 1.0.0   |
| tagId           | tag-id           | string                   | Identifier of the tag to match a label defined for the component.                     | `tag` + Random string of 14 characters in length | 1.0.0   |
| showClose       | show-close       | boolean                  | When specified, shows the close button.                                               | true                                             | 1.0.0   |
| apwDisabled     | apw-disabled     | boolean                  | If true, the tag should be disabled.                                                  | false                                            | 1.0.0   |
| labelStyle      | -                | Object                   | The inline style of the tag label.                                                    | -                                                | 1.0.0   |
| apwStyle        | -                | Object                   | The inline style of the component.                                                    | -                                                | 1.0.0   |
| apwClose        | -                | CustomEvent<any>         | Event fires when the close button is clicked.                                         | -                                                | 1.0.0   |
| apwDidLoad      | -                | CustomEvent<any>         | Called once just after the component is fully loaded and the first render() occurs.   | -                                                | 1.0.0   |
| apwDidUpdate    | -                | CustomEvent<any>         | Called just after the component updates. It's never called during the first render(). | -                                                | 1.0.0   |
