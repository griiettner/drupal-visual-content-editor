# Tooltip: Developer Documentation

Technical reference for using Appkit4 `apw-tooltip` in `pwc_visual_editor`.

## Scope

Current module status:
- There is no dedicated `tooltip` block class in `js/components/blocks/`.
- Tooltip behavior is available through the Appkit web component (`<apw-tooltip>`).
- Source reference docs exist at:
  - `web/modules/custom/pwc_visual_editor/docs/tooltip.md`
  - `web/modules/custom/pwc_visual_editor/docs/appkit4/apw-tooltip.md`

If you need tooltip support in block form, create a new block wrapper similar to `button.js`.

## Component contract

`apw-tooltip` requires a target selector and renders tooltip content from its slot/body.

Minimal contract:

```html
<apw-button id="tooltip-target" label="Info"></apw-button>
<apw-tooltip target="#tooltip-target">
  Tooltip content.
</apw-tooltip>
```

## Supported properties

Core properties used most often:
- `target` (required): CSS selector of host element (`#id` or `.class`)
- `trigger`: `hover` or `click` (default: `hover`)
- `direction`: placement (`top`, `right`, `bottom`, `left`, plus corner variants)
- `distance`: numeric offset from target (default: `8`)
- `visible`: force visible/invisible state, bypassing trigger flow
- `hide-tooltip-on-blur`: hide when host loses focus
- `auto-load`: pre-render tooltip node on init (recommended)
- `mouse-enter-delay`, `mouse-leave-delay`: show/hide delays in ms
- `tooltip-id`: explicit tooltip id (reflects to attribute)

## Integration patterns

### 1) Static Twig/HTML template usage

```twig
<apw-button id="help-trigger" label="Help"></apw-button>
<apw-tooltip
  target="#help-trigger"
  trigger="hover"
  direction="right"
  distance="10"
>
  This action saves your changes.
</apw-tooltip>
```

Use this when content is known at render time.

### 2) Runtime JS attachment

Use this when target IDs are generated dynamically.

```js
function attachTooltip(targetId, text) {
  const tooltip = document.createElement('apw-tooltip');
  tooltip.setAttribute('target', `#${targetId}`);
  tooltip.setAttribute('trigger', 'hover');
  tooltip.setAttribute('direction', 'top');
  tooltip.textContent = text;
  document.body.appendChild(tooltip);
  return tooltip;
}

// Example
attachTooltip('dynamic-action-btn', 'Runs the selected action');
```

### 3) Forced visibility for QA/debug

```html
<apw-tooltip
  target="#help-trigger"
  visible="true"
  direction="bottom"
>
  Debug tooltip position.
</apw-tooltip>
```

Useful during styling checks. Avoid forcing visible state in production UX.

## Example: build a Visual Editor Tooltip block

If you decide to add a real block, start with this structure:

```js
(function (Drupal) {
  'use strict';

  class TooltipBlock extends window.PwcBaseBlock {
    static get blockName() { return 'tooltip'; }
    static get blockTitle() { return 'Tooltip'; }
    static get blockCategory() { return 'basic'; }

    static get blockSettings() {
      return [
        { name: 'target', type: 'text', label: 'Target Selector', default: '' },
        { name: 'content', type: 'text', label: 'Tooltip Text', default: 'Tooltip text' },
        { name: 'trigger', type: 'select', label: 'Trigger', default: 'hover',
          options: [{ value: 'hover', label: 'Hover' }, { value: 'click', label: 'Click' }] },
        { name: 'direction', type: 'select', label: 'Direction', default: 'right',
          options: [{ value: 'top', label: 'Top' }, { value: 'right', label: 'Right' }, { value: 'bottom', label: 'Bottom' }, { value: 'left', label: 'Left' }] },
      ];
    }

    static get observedAttributes() {
      return ['block-id', 'target', 'content', 'trigger', 'direction'];
    }

    render() {
      const target = this.getAttribute('target') || '';
      const content = this.getAttribute('content') || 'Tooltip text';
      const trigger = this.getAttribute('trigger') || 'hover';
      const direction = this.getAttribute('direction') || 'right';

      this.innerHTML = `
        <apw-tooltip
          target="${this.escapeAttr(target)}"
          trigger="${this.escapeAttr(trigger)}"
          direction="${this.escapeAttr(direction)}"
        >
          ${this.escapeAttr(content)}
        </apw-tooltip>
      `;
    }

    escapeAttr(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }

  customElements.define('pwc-tooltip', TooltipBlock);
  if (window.pwcBlockRegistry) {
    window.pwcBlockRegistry.register(TooltipBlock);
  }
})(Drupal);
```

## Validation and safety checks

Before rendering tooltip markup:
- Ensure `target` is not empty.
- Prefer id selectors (`#my-id`) for deterministic matching.
- Escape user text before injecting into HTML.
- Keep tooltip content plain text unless rich HTML is explicitly required and sanitized.

## Common pitfalls

- Tooltip not showing because target element is not in DOM yet.
- Selector collision when using class selectors with many matched nodes.
- `visible` attribute accidentally left enabled.
- `auto-load="false"` causing delayed/inconsistent accessibility behavior.

## Related files

- `web/modules/custom/pwc_visual_editor/docs/tooltip.md`
- `web/modules/custom/pwc_visual_editor/docs/appkit4/apw-tooltip.md`
- `web/modules/custom/pwc_visual_editor/js/components/blocks/button.js`
- `web/modules/custom/pwc_visual_editor/js/services/block-registry.js`
