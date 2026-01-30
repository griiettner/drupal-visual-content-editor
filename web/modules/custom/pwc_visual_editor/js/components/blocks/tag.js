/**
 * @file
 * Tag block component.
 *
 * Renders one or more Appkit4 <apw-tag> web components.
 * Tags are entered as comma-separated values.
 */

(function (Drupal) {
  'use strict';

  /**
   * Official Appkit4 colors for tag background and font color.
   * Uses hex values directly since <apw-tag> accepts CSS color strings.
   */
  const TAG_COLORS = [
    { value: '', hex: 'transparent', label: 'None' },
    { value: '#ffffff', hex: '#ffffff', label: 'White' },
    { value: '#191919', hex: '#191919', label: 'Black' },
    { value: '#252525', hex: '#252525', label: 'Heading' },
    { value: '#474747', hex: '#474747', label: 'Body' },
    { value: '#415385', hex: '#415385', label: 'Primary' },
    { value: '#e0301e', hex: '#e0301e', label: 'Error' },
    { value: '#299d8f', hex: '#299d8f', label: 'Success' },
    { value: '#e96e61', hex: '#e96e61', label: 'Red Light' },
    { value: '#e0301e', hex: '#e0301e', label: 'Red' },
    { value: '#a62b1e', hex: '#a62b1e', label: 'Red Dark' },
    { value: '#fb7c4d', hex: '#fb7c4d', label: 'Orange Light' },
    { value: '#d04a02', hex: '#d04a02', label: 'Orange' },
    { value: '#a7452c', hex: '#a7452c', label: 'Orange Dark' },
    { value: '#e998a6', hex: '#e998a6', label: 'Pink Light' },
    { value: '#d93954', hex: '#d93954', label: 'Pink' },
    { value: '#903f4d', hex: '#903f4d', label: 'Pink Dark' },
    { value: '#69bab0', hex: '#69bab0', label: 'Teal Light' },
    { value: '#299d8f', hex: '#299d8f', label: 'Teal' },
    { value: '#26776d', hex: '#26776d', label: 'Teal Dark' },
    { value: '#9aa4be', hex: '#9aa4be', label: 'Blue Light' },
    { value: '#415385', hex: '#415385', label: 'Blue' },
    { value: '#1a2a5a', hex: '#1a2a5a', label: 'Blue Dark' },
    { value: '#0d152d', hex: '#0d152d', label: 'Blue Deep' },
  ];

  class TagBlock extends window.PwcBaseBlock {
    static get blockName() { return 'tag'; }
    static get blockTitle() { return 'Tag'; }
    static get blockIcon() { return ''; }
    static get blockDescription() { return 'Add tags with Appkit4 styles.'; }
    static get blockCategory() { return 'basic'; }

    static get blockSettings() {
      return [
        {
          name: 'tags',
          type: 'textarea',
          label: 'Tags',
          default: 'Tag 1, Tag 2, Tag 3',
          tab: 'typography',
          placeholder: 'Enter tags separated by commas',
          help: 'Separate multiple tags with commas',
        },
        {
          name: 'size',
          type: 'tagSizePicker',
          label: 'Size',
          default: 'small',
          tab: 'typography',
          options: [
            { value: 'small', label: 'Small' },
            { value: 'large', label: 'Large' },
          ],
        },
        {
          name: 'tagType',
          type: 'tagTypePicker',
          label: 'Type',
          default: 'filled',
          tab: 'typography',
          options: [
            { value: 'filled', label: 'Filled' },
            { value: 'outlined', label: 'Outlined' },
          ],
        },
        {
          name: 'showClose',
          type: 'toggle',
          label: 'Show Close Button',
          default: false,
          tab: 'style',
        },
        {
          name: 'backgroundColor',
          type: 'colorSwatch',
          label: 'Background Color',
          default: '',
          tab: 'style',
          colors: TAG_COLORS,
          help: 'Leave empty for the default primary color',
        },
        {
          name: 'fontColor',
          type: 'colorSwatch',
          label: 'Font Color',
          default: '',
          tab: 'style',
          colors: TAG_COLORS,
          help: 'Leave empty for the default white (#FFFFFF)',
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
        'tags',
        'size',
        'tag-type',
        'show-close',
        'background-color',
        'font-color',
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
      const tagsStr = this.getAttribute('tags') || 'Tag 1, Tag 2, Tag 3';
      const size = this.getAttribute('size') || 'small';
      const tagType = this.getAttribute('tag-type') || 'filled';
      const showClose = this.getAttribute('show-close') === 'true';
      const backgroundColor = this.getAttribute('background-color') || '';
      const fontColor = this.getAttribute('font-color') || '';
      const textAlign = this.getAttribute('text-align') || '';
      const margin = this.getAttribute('margin') || '';
      const padding = this.getAttribute('padding') || '';
      const customClasses = this.getAttribute('custom-classes') || '';

      const wrapperClasses = [
        'pwc-tag-wrapper',
        textAlign,
        margin,
        padding,
        customClasses,
      ].filter(Boolean).join(' ');

      // Parse comma-separated tags
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

      // Build each <apw-tag>
      const tagsHtml = tags.map(text => {
        let attrs = `text="${this.escapeAttr(text)}" size="${size}" type="${tagType}" show-close="${showClose}" apw-disabled="false"`;
        if (backgroundColor) attrs += ` background-color="${this.escapeAttr(backgroundColor)}"`;
        if (fontColor) attrs += ` font-color="${this.escapeAttr(fontColor)}"`;
        return `<li><apw-tag ${attrs}></apw-tag></li>`;
      }).join('');

      this.innerHTML = `
        <div class="${wrapperClasses}">
          <ul class="pwc-tag-list">${tagsHtml}</ul>
        </div>
      `;
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
  customElements.define('pwc-tag', TagBlock);

  // Register with block registry
  if (window.pwcBlockRegistry) {
    window.pwcBlockRegistry.register(TagBlock);
  }

})(Drupal);
