/**
 * @file
 * Button block component.
 *
 * Renders an Appkit4 <apw-button> web component with configurable
 * type, label, icon, size, and optional link wrapping.
 */

(function (Drupal) {
  'use strict';

  class ButtonBlock extends window.PwcBaseBlock {
    static get blockName() { return 'button'; }
    static get blockTitle() { return 'Button'; }
    static get blockIcon() { return ''; }
    static get blockDescription() { return 'Add a button with Appkit4 styles.'; }
    static get blockCategory() { return 'basic'; }

    static get blockSettings() {
      return [
        {
          name: 'label',
          type: 'text',
          label: 'Button Label',
          default: 'Button',
          tab: 'typography',
          placeholder: 'Enter button text',
        },
        {
          name: 'btnType',
          type: 'btnTypePicker',
          label: 'Button Type',
          default: 'primary',
          tab: 'typography',
          options: [
            { value: 'primary', label: 'Primary' },
            { value: 'secondary', label: 'Secondary' },
            { value: 'tertiary', label: 'Tertiary' },
            { value: 'text', label: 'Text' },
            { value: 'negative', label: 'Negative' },
          ],
        },
        {
          name: 'icon',
          type: 'text',
          label: 'Icon',
          default: '',
          tab: 'style',
          placeholder: 'e.g., time-outline',
          help: 'Appkit icon name (leave empty for no icon)',
        },
        {
          name: 'compact',
          type: 'toggle',
          label: 'Compact Size',
          default: false,
          tab: 'style',
        },
        {
          name: 'rounded',
          type: 'toggle',
          label: 'Rounded',
          default: false,
          tab: 'style',
        },
        {
          name: 'url',
          type: 'text',
          label: 'Link URL',
          default: '',
          tab: 'style',
          placeholder: 'https://...',
          help: 'Wrap the button in a link',
        },
        {
          name: 'target',
          type: 'toggle',
          label: 'Open in New Tab',
          default: false,
          tab: 'style',
        },
        {
          name: 'textAlign',
          type: 'alignment',
          label: 'Alignment',
          default: '',
          tab: 'layout',
          options: [
            { value: '', label: 'None', icon: 'align-left' },
            { value: 'pwc-text-left', label: 'Left', icon: 'align-left' },
            { value: 'pwc-text-center', label: 'Center', icon: 'align-center' },
            { value: 'pwc-text-right', label: 'Right', icon: 'align-right' },
          ],
        },
        {
          name: 'margin',
          type: 'spacing',
          label: 'Margin',
          default: '',
          tab: 'layout',
          prefix: 'm',
        },
        {
          name: 'padding',
          type: 'spacing',
          label: 'Padding',
          default: '',
          tab: 'layout',
          prefix: 'p',
        },
        {
          name: 'customClasses',
          type: 'text',
          label: 'Custom Classes',
          default: '',
          tab: 'style',
          placeholder: 'e.g., my-custom-class',
          help: 'Add any additional CSS utility classes',
        },
      ];
    }

    static get observedAttributes() {
      return [
        'block-id',
        'label',
        'btn-type',
        'icon',
        'compact',
        'rounded',
        'url',
        'target',
        'text-align',
        'margin',
        'padding',
        'custom-classes',
      ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue || !this.isConnected) return;
      this.render();
      this.addHoverControls();
    }

    render() {
      const label = this.getAttribute('label') || 'Button';
      const btnType = this.getAttribute('btn-type') || 'primary';
      const icon = this.getAttribute('icon') || '';
      const compact = this.getAttribute('compact') === 'true';
      const rounded = this.getAttribute('rounded') === 'true';
      const url = this.getAttribute('url') || '';
      const target = this.getAttribute('target') === 'true';
      const textAlign = this.getAttribute('text-align') || '';
      const margin = this.getAttribute('margin') || '';
      const padding = this.getAttribute('padding') || '';
      const customClasses = this.getAttribute('custom-classes') || '';

      const wrapperClasses = [
        'pwc-button-wrapper',
        textAlign,
        margin,
        padding,
        customClasses,
      ].filter(Boolean).join(' ');

      // Build <apw-button> attributes
      let btnAttrs = `btn-type="${btnType}" label="${this.escapeAttr(label)}" type="button"`;
      if (icon) btnAttrs += ` icon="${this.escapeAttr(icon)}"`;
      if (compact) btnAttrs += ' compact="true"';
      if (rounded) btnAttrs += ' rounded="true"';

      const buttonHtml = `<apw-button ${btnAttrs}></apw-button>`;

      let innerHtml;
      if (url) {
        const targetAttr = target ? ' target="_blank" rel="noopener noreferrer"' : '';
        innerHtml = `<a href="${this.escapeAttr(url)}" class="pwc-button-link"${targetAttr}>${buttonHtml}</a>`;
      } else {
        innerHtml = buttonHtml;
      }

      this.innerHTML = `<div class="${wrapperClasses}">${innerHtml}</div>`;
    }

    /**
     * Escape a string for use in an HTML attribute.
     */
    escapeAttr(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }

  // Register custom element
  customElements.define('pwc-button', ButtonBlock);

  // Register with block registry
  if (window.pwcBlockRegistry) {
    window.pwcBlockRegistry.register(ButtonBlock);
  }

})(Drupal);
