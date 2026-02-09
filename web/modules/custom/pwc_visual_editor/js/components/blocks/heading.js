/**
 * @file
 * Heading block component.
 *
 * A configurable heading block that uses Appkit4 utility classes.
 */

(function (Drupal) {
  'use strict';

  /**
   * Appkit4 color palette for color swatch.
   * Each color has hex value for display and Appkit class for usage.
   * Uses ap-text- prefix; settings panel converts to ap-bg- or ap-border- as needed.
   */
  const APPKIT_COLORS = [
    // Row 1: Semantic colors
    { value: '', hex: 'transparent', label: 'None' },
    { value: 'ap-text-color-background-default', hex: '#ffffff', label: 'White' },
    { value: 'ap-text-color-background-default-inverse', hex: '#191919', label: 'Black' },
    { value: 'ap-text-color-text-heading', hex: '#252525', label: 'Heading' },
    { value: 'ap-text-color-text-body', hex: '#474747', label: 'Body' },
    { value: 'ap-text-color-text-primary', hex: '#415385', label: 'Primary' },
    { value: 'ap-text-color-text-error', hex: '#e0301e', label: 'Error' },
    { value: 'ap-text-color-text-success', hex: '#299d8f', label: 'Success' },
    // Row 2: Red, Orange, Pink
    { value: 'ap-text-primary-red-03', hex: '#e96e61', label: 'Red Light' },
    { value: 'ap-text-primary-red-05', hex: '#e0301e', label: 'Red' },
    { value: 'ap-text-primary-red-07', hex: '#a62b1e', label: 'Red Dark' },
    { value: 'ap-text-primary-orange-03', hex: '#fb7c4d', label: 'Orange Light' },
    { value: 'ap-text-primary-orange-05', hex: '#d04a02', label: 'Orange' },
    { value: 'ap-text-primary-orange-07', hex: '#a7452c', label: 'Orange Dark' },
    { value: 'ap-text-primary-pink-03', hex: '#e998a6', label: 'Pink Light' },
    { value: 'ap-text-primary-pink-05', hex: '#d93954', label: 'Pink' },
    // Row 3: Pink dark, Teal, Blue
    { value: 'ap-text-primary-pink-07', hex: '#903f4d', label: 'Pink Dark' },
    { value: 'ap-text-primary-teal-03', hex: '#69bab0', label: 'Teal Light' },
    { value: 'ap-text-primary-teal-05', hex: '#299d8f', label: 'Teal' },
    { value: 'ap-text-primary-teal-07', hex: '#26776d', label: 'Teal Dark' },
    { value: 'ap-text-primary-blue-02', hex: '#9aa4be', label: 'Blue Light' },
    { value: 'ap-text-primary-blue-04', hex: '#415385', label: 'Blue' },
    { value: 'ap-text-primary-blue-06', hex: '#1a2a5a', label: 'Blue Dark' },
    { value: 'ap-text-primary-blue-08', hex: '#0d152d', label: 'Blue Deep' },
  ];

  /**
   * Appkit4 spacing presets (matching Appkit spacing scale 1-8).
   * Values map to ap-m-spacing-N / ap-p-spacing-N classes.
   */
  const APPKIT_SPACING_PRESETS = [
    { value: '0', label: '0', px: '0px' },
    { value: '1', label: '1', px: '2px' },
    { value: '2', label: '2', px: '4px' },
    { value: '3', label: '3', px: '8px' },
    { value: '4', label: '4', px: '12px' },
    { value: '5', label: '5', px: '16px' },
    { value: '6', label: '6', px: '20px' },
    { value: '7', label: '7', px: '24px' },
    { value: '8', label: '8', px: '48px' },
  ];

  /**
   * Appkit4 utility class options for the settings panel.
   */
  const APPKIT_OPTIONS = {
    fontSize: [
      { value: '', label: 'Default' },
      { value: 'ap-font-12', label: 'Extra Small (12px)' },
      { value: 'ap-font-14', label: 'Small (14px)' },
      { value: 'ap-font-16', label: 'Base (16px)' },
      { value: 'ap-font-18', label: 'Large (18px)' },
      { value: 'ap-font-20', label: 'XL (20px)' },
      { value: 'ap-font-24', label: '2XL (24px)' },
      { value: 'ap-font-30', label: '3XL (30px)' },
      { value: 'ap-font-36', label: '4XL (36px)' },
      { value: 'ap-font-48', label: '5XL (48px)' },
    ],
    fontWeight: [
      { value: '', label: 'Default' },
      { value: 'ap-font-weight-1', label: 'Normal (400)' },
      { value: 'ap-font-weight-2', label: 'Medium (500)' },
      { value: 'ap-font-weight-3', label: 'Bold (700)' },
    ],
    colors: APPKIT_COLORS,
    spacingPresets: APPKIT_SPACING_PRESETS,
  };

  // Export for settings panel
  window.APPKIT_OPTIONS = APPKIT_OPTIONS;

  const HEADING_LEVEL_DEFAULTS = {
    'h1': { fontSize: 'ap-font-48', fontWeight: 'ap-font-weight-2' },
    'h2': { fontSize: 'ap-font-36', fontWeight: 'ap-font-weight-2' },
    'h3': { fontSize: 'ap-font-30', fontWeight: 'ap-font-weight-2' },
    'h4': { fontSize: 'ap-font-20', fontWeight: 'ap-font-weight-2' },
    'h5': { fontSize: 'ap-font-18', fontWeight: 'ap-font-weight-2' },
    'h6': { fontSize: 'ap-font-16', fontWeight: 'ap-font-weight-2' },
  };

  class HeadingBlock extends window.PwcBaseBlock {
    static get blockName() { return 'heading'; }
    static get blockTitle() { return 'Heading'; }
    static get blockIcon() { return ''; }
    static get blockDescription() { return 'Add a heading with customizable styles.'; }
    static get levelDefaults() { return HEADING_LEVEL_DEFAULTS; }

    static get blockSettings() {
      return [
        {
          name: 'level',
          type: 'headingLevelPicker',
          label: 'Heading Level',
          default: 'h2',
          tab: 'typography',
          options: [
            { value: 'h1', label: 'H1' },
            { value: 'h2', label: 'H2' },
            { value: 'h3', label: 'H3' },
            { value: 'h4', label: 'H4' },
            { value: 'h5', label: 'H5' },
            { value: 'h6', label: 'H6' },
          ],
        },
        {
          name: 'fontSize',
          type: 'select',
          label: 'Font Size',
          default: '',
          tab: 'typography',
          options: APPKIT_OPTIONS.fontSize,
        },
        {
          name: 'fontWeight',
          type: 'select',
          label: 'Font Weight',
          default: '',
          tab: 'typography',
          options: APPKIT_OPTIONS.fontWeight,
        },
        {
          name: 'lineHeight',
          type: 'select',
          label: 'Line Height',
          default: '',
          tab: 'typography',
          options: [
            { value: '', label: 'Default' },
            { value: 'pwc-leading-none', label: 'None (1)' },
            { value: 'pwc-leading-tight', label: 'Tight (1.25)' },
            { value: 'pwc-leading-snug', label: 'Snug (1.375)' },
            { value: 'pwc-leading-normal', label: 'Normal (1.5)' },
            { value: 'pwc-leading-relaxed', label: 'Relaxed (1.625)' },
            { value: 'pwc-leading-loose', label: 'Loose (2)' },
          ],
        },
        {
          name: 'textAlign',
          type: 'alignment',
          label: 'Alignment',
          default: '',
          tab: 'typography',
          options: [
            { value: '', label: 'None', icon: 'align-left' },
            { value: 'pwc-text-left', label: 'Left', icon: 'align-left' },
            { value: 'pwc-text-center', label: 'Center', icon: 'align-center' },
            { value: 'pwc-text-right', label: 'Right', icon: 'align-right' },
            { value: 'pwc-text-justify', label: 'Justify', icon: 'align-justify' },
          ],
        },
        {
          name: 'textColor',
          type: 'colorSwatch',
          label: 'Text Color',
          default: '',
          tab: 'style',
          colors: APPKIT_COLORS,
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
          placeholder: 'e.g., ap-typography-heading',
          help: 'Add any additional CSS utility classes',
        },
      ];
    }

    static get inlineEditable() {
      return ['content'];
    }

    /**
     * Observed attributes for live updates.
     * When any of these change, the block re-renders.
     */
    static get observedAttributes() {
      return [
        'block-id',
        'content',
        'level',
        'font-size',
        'font-weight',
        'line-height',
        'text-align',
        'text-color',
        'margin',
        'padding',
        'custom-classes',
      ];
    }

    /**
     * Override attributeChangedCallback to allow style updates during editing.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue || !this.isConnected) return;

      // These attributes affect styling only, not content - safe to update during editing
      const styleOnlyAttributes = [
        'level', 'font-size', 'font-weight', 'line-height', 'text-align',
        'text-color', 'margin', 'padding', 'custom-classes'
      ];

      // Skip re-render for content changes during inline editing (to preserve cursor)
      if (this._isInlineEditing && name === 'content') {
        return;
      }

      // For style-only changes, update classes without full re-render
      // This works whether inline editing or not, to provide immediate visual feedback
      if (styleOnlyAttributes.includes(name)) {
        this.updateStyles();
        return;
      }

      this.render();
      this.addHoverControls();
    }

    /**
     * Update styles without full re-render (preserves cursor during editing).
     */
    updateStyles() {
      const level = this.getAttribute('level') || 'h2';
      const defaults = HEADING_LEVEL_DEFAULTS[level] || HEADING_LEVEL_DEFAULTS['h2'];
      const fontSize = this.getAttribute('font-size') || defaults.fontSize;
      const fontWeight = this.getAttribute('font-weight') || defaults.fontWeight;
      const lineHeight = this.getAttribute('line-height') || '';
      const textAlign = this.getAttribute('text-align') || '';
      const textColor = this.getAttribute('text-color') || '';
      const margin = this.getAttribute('margin') || '';
      const padding = this.getAttribute('padding') || '';
      const customClasses = this.getAttribute('custom-classes') || '';

      const classes = [
        'pwc-heading',
        fontSize,
        fontWeight,
        lineHeight,
        textAlign,
        textColor,
        margin,
        padding,
        customClasses,
      ].filter(Boolean).join(' ');

      // Update the heading element
      const heading = this.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        heading.className = classes;

        // If level changed, we need a full re-render
        if (heading.tagName.toLowerCase() !== level) {
          this._isInlineEditing = false;
          this.render();
          this.addHoverControls();
        }
      }
    }

    render() {
      const content = this.getAttribute('content') || 'Heading';
      const level = this.getAttribute('level') || 'h2';
      const defaults = HEADING_LEVEL_DEFAULTS[level] || HEADING_LEVEL_DEFAULTS['h2'];
      const fontSize = this.getAttribute('font-size') || defaults.fontSize;
      const fontWeight = this.getAttribute('font-weight') || defaults.fontWeight;
      const lineHeight = this.getAttribute('line-height') || '';
      const textAlign = this.getAttribute('text-align') || '';
      const textColor = this.getAttribute('text-color') || '';
      const margin = this.getAttribute('margin') || '';
      const padding = this.getAttribute('padding') || '';
      const customClasses = this.getAttribute('custom-classes') || '';

      // Build the class list from Appkit4 utilities
      const classes = [
        'pwc-heading',
        fontSize,
        fontWeight,
        lineHeight,
        textAlign,
        textColor,
        margin,
        padding,
        customClasses,
      ].filter(Boolean).join(' ');

      const isEditing = window.pwcEditorState && window.pwcEditorState.isEditing;
      const hasContent = content && content.trim() && content !== 'Heading';

      // Only add placeholder attribute when editing and content is empty/default
      const placeholderAttr = isEditing && !hasContent ? 'data-placeholder="Enter heading..."' : '';

      const editableClass = isEditing ? `${classes} pwc-editable` : classes;

      this.innerHTML = `
        <${level}
          class="${editableClass}"
          ${isEditing ? `contenteditable="true" data-editable="content"` : ''}
          ${placeholderAttr}
        >${content}</${level}>
      `;

      if (isEditing) {
        this.setupInlineEditing();
      }
    }
  }

  // Register custom element
  customElements.define('pwc-heading', HeadingBlock);

  // Register with block registry
  if (window.pwcBlockRegistry) {
    window.pwcBlockRegistry.register(HeadingBlock);
  }

})(Drupal);
