# Tooltip: How to Use

This guide shows how to use Appkit4 tooltip content (`<apw-tooltip>`) in a simple way.

## What the tooltip does

A tooltip shows short helper text when a user interacts with another element (the target).

Common uses:
- Explain a button/action
- Show extra context without adding visible text
- Provide quick hints in forms and UI controls

## Basic example

```html
<apw-button id="save-btn" label="Save"></apw-button>
<apw-tooltip target="#save-btn">
  Saves your current changes.
</apw-tooltip>
```

How it works:
- `target="#save-btn"` connects the tooltip to the button
- Tooltip content is the text inside `<apw-tooltip>...</apw-tooltip>`

## Choose when it opens

Default trigger is hover. You can also use click.

```html
<apw-tooltip target="#save-btn" trigger="hover">
  Opens on hover.
</apw-tooltip>
```

```html
<apw-tooltip target="#save-btn" trigger="click">
  Opens on click.
</apw-tooltip>
```

## Set position

Use `direction` to control where the tooltip appears.

```html
<apw-tooltip target="#save-btn" direction="right">
  Appears on the right side.
</apw-tooltip>
```

Common values:
- `top`
- `right`
- `bottom`
- `left`

You can also use corner positions like `top-left`, `bottom-right`, etc.

## Add spacing and delay

```html
<apw-tooltip
  target="#save-btn"
  distance="12"
  mouse-enter-delay="150"
  mouse-leave-delay="100"
>
  Delayed tooltip with extra space.
</apw-tooltip>
```

- `distance`: gap between target and tooltip
- `mouse-enter-delay`: wait before showing (ms)
- `mouse-leave-delay`: wait before hiding (ms)

## Keep tooltip always visible (debug/special cases)

```html
<apw-tooltip target="#save-btn" visible="true">
  Always visible.
</apw-tooltip>
```

Note:
- When `visible` is set, normal trigger behavior is ignored.

## Best practices

- Keep tooltip text short and clear.
- Use tooltips for helper text, not critical instructions.
- Make sure the `target` selector exists on the page.
- Prefer `auto-load="true"` for accessibility.

## Common mistakes

- Missing `target` attribute
- Using a selector that does not match any element
- Adding too much text (hard to read in a small tooltip)
