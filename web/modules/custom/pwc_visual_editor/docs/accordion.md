# Appkit4 Accordion

```html
<apw-accordion-group>
  <apw-accordion id="accordion1" accordion-title="Hong Kong">
    <span slot="body" class="ap-accordion-text">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </span>
  </apw-accordion>

  <apw-accordion id="accordion2" accordion-title="Stockholm">
    <span slot="body" class="ap-accordion-text">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </span>
  </apw-accordion>

  <apw-accordion id="accordion3" accordion-title="São Paulo">
    <span slot="body" class="ap-accordion-text">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </span>
  </apw-accordion>

  <apw-accordion id="accordion4" accordion-title="Saint Petersburg">
    <span slot="body" class="ap-accordion-text">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </span>
  </apw-accordion>
</apw-accordion-group>
```

## apw-accordion-group Properties

| Name         | Attribute    | Type                                                   | Description                                                                                                                                                                             | Default     | Version |
| ------------ | ------------ | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------- |
| accordionId  | accordion-id | string                                                 | The prefix id string of accordions, each accordion content element `<li></li>` will have an id of this prefix string with its index.                                                    | `accordion` | 1.0.0   |
| multiple     | multiple     | boolean                                                | Whether multiple accordions can be expanded at the same time.                                                                                                                           | false       | 1.0.0   |
| apwStyle     | -            | Object                                                 | The inline style of the component.                                                                                                                                                      | -           | 1.0.0   |
| apwDidLoad   | -            | CustomEvent<any>                                       | Called once just after the component is fully loaded and the first `render()` occurs.                                                                                                   | -           | 1.0.0   |
| apwDidUpdate | -            | CustomEvent<any>                                       | Called just after the component updates. It’s never called during the first `render()`.                                                                                                 | -           | 1.0.0   |
| expandAll    | -            | `(accordionIndexArr?: Array<number>) => Promise<void>` | Expand all the accordions if not passing `accordionIndexArr` or passing an empty array. Expand the accordions with corresponding index in `accordionIndexArr`, e.g. `[0, 1, 2, 3]`.     | -           | 1.0.0   |
| collapseAll  | -            | `(accordionIndexArr?: Array<number>) => Promise<void>` | Collapse all the accordions if not passing `accordionIndexArr` or passing an empty array. Collapse the accordions with corresponding index in `accordionIndexArr`, e.g. `[0, 1, 2, 3]`. | -           | 1.0.0   |

---

## apw-accordion Properties

| Name                     | Attribute                    | Type             | Description                                                                                                                                                                               | Default | Version |
| ------------------------ | ---------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| expanded                 | expanded                     | boolean          | Expand the accordion or not by default.                                                                                                                                                   | false   | 1.0.0   |
| accordionTitle           | accordion-title              | string           | The text of the accordion title.                                                                                                                                                          | ""      | 1.0.0   |
| extraAccordionTitle      | extra-accordion-title        | string           | The extra text or HTML string on the accordion title.                                                                                                                                     | ""      | 1.0.0   |
| exclElementToToggle      | excl-element-to-toggle       | string           | The CSS selector string, click on the elements with this selector string will not trigger the toggle of accordion.                                                                        | ""      | 1.0.0   |
| inclElementToToggle      | incl-element-to-toggle       | string           | The CSS selector string, click on the elements with this selector string will trigger the toggle of accordion.                                                                            | ""      | 1.1.0   |
| toggleFromHeaderIconOnly | toggle-from-header-icon-only | boolean          | Whether only click on the accordion header icon will trigger the toggle of accordion. If it is false, it will be able to trigger the toggle when clicking on the header of the accordion. | false   | 1.1.0   |
| apwStyle                 | -                            | Object           | The inline style of the component.                                                                                                                                                        | -       | 1.0.0   |
| apwClick                 | -                            | CustomEvent<any> | Callback when the accordion item is clicked.                                                                                                                                              | -       | 1.0.0   |
| apwToggle                | -                            | CustomEvent<any> | Callback when the accordion item is toggled.                                                                                                                                              | -       | 1.0.0   |
| apwDidLoad               | -                            | CustomEvent<any> | Called once just after the component is fully loaded and the first `render()` occurs.                                                                                                     | -       | 1.0.0   |
| apwDidUpdate             | -                            | CustomEvent<any> | Called just after the component updates. It’s never called during the first `render()`.                                                                                                   | -       | 1.0.0   |

---

## Inherited ARIA (apw-accordion-group & apw-accordion)

ARIA defines semantics that can be applied to elements, with these divided into roles and ARIA attributes. We provide a way to set role or ARIA attributes on particular elements inside the shadow DOM with prefixed attributes.

**Note:** attributes like `aria-labelledby` which require ID(s) to reference other elements may fail because of the shadow DOM encapsulation.

### Prefixes

* `apw-`: Set value of ARIA role/attributes on the accordion container.

  Example:

  ```html
  <apw-accordion-group apw-aria-label="Label"></apw-accordion-group>
  ```

* `apw-`: Set value of ARIA role/attributes on the accordion toggle.

  Example:

  ```html
  <apw-accordion apw-aria-label="Label"></apw-accordion>
  ```

* `apw-accordion-toggle-icon-`: Set value of ARIA role/attributes on the accordion toggle icon.

  Example:

  ```html
  <apw-accordion apw-accordion-toggle-icon-aria-label="Label"></apw-accordion>
  ```
