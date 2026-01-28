/**
 * @file
 * Heading block component.
 *
 * A configurable heading block that uses Tailwind utility classes.
 */

(function (Drupal) {
  'use strict';

  /**
   * Tailwind color palette for color swatch.
   * Each color has hex value for display and Tailwind class for usage.
   */
  const TAILWIND_COLORS = [
    // Row 1: Grays
    { value: '', hex: 'transparent', label: 'None' },
    { value: 'text-white', hex: '#ffffff', label: 'White' },
    { value: 'text-black', hex: '#000000', label: 'Black' },
    { value: 'text-slate-500', hex: '#64748b', label: 'Slate' },
    { value: 'text-gray-500', hex: '#6b7280', label: 'Gray' },
    { value: 'text-zinc-500', hex: '#71717a', label: 'Zinc' },
    { value: 'text-neutral-500', hex: '#737373', label: 'Neutral' },
    { value: 'text-stone-500', hex: '#78716c', label: 'Stone' },
    // Row 2: Warm colors
    { value: 'text-red-500', hex: '#ef4444', label: 'Red' },
    { value: 'text-orange-500', hex: '#f97316', label: 'Orange' },
    { value: 'text-amber-500', hex: '#f59e0b', label: 'Amber' },
    { value: 'text-yellow-500', hex: '#eab308', label: 'Yellow' },
    { value: 'text-lime-500', hex: '#84cc16', label: 'Lime' },
    { value: 'text-green-500', hex: '#22c55e', label: 'Green' },
    { value: 'text-emerald-500', hex: '#10b981', label: 'Emerald' },
    { value: 'text-teal-500', hex: '#14b8a6', label: 'Teal' },
    // Row 3: Cool colors
    { value: 'text-cyan-500', hex: '#06b6d4', label: 'Cyan' },
    { value: 'text-sky-500', hex: '#0ea5e9', label: 'Sky' },
    { value: 'text-blue-500', hex: '#3b82f6', label: 'Blue' },
    { value: 'text-indigo-500', hex: '#6366f1', label: 'Indigo' },
    { value: 'text-violet-500', hex: '#8b5cf6', label: 'Violet' },
    { value: 'text-purple-500', hex: '#a855f7', label: 'Purple' },
    { value: 'text-fuchsia-500', hex: '#d946ef', label: 'Fuchsia' },
    { value: 'text-pink-500', hex: '#ec4899', label: 'Pink' },
    { value: 'text-rose-500', hex: '#f43f5e', label: 'Rose' },
  ];

  /**
   * Tailwind spacing presets (matching Tailwind scale).
   */
  const TAILWIND_SPACING_PRESETS = [
    { value: '0', label: '0', px: '0px' },
    { value: '1', label: '1', px: '4px' },
    { value: '2', label: '2', px: '8px' },
    { value: '3', label: '3', px: '12px' },
    { value: '4', label: '4', px: '16px' },
    { value: '6', label: '6', px: '24px' },
    { value: '8', label: '8', px: '32px' },
    { value: '12', label: '12', px: '48px' },
    { value: '16', label: '16', px: '64px' },
    { value: 'auto', label: 'auto', px: 'auto' },
  ];

  /**
   * Tailwind utility class options for the settings panel.
   */
  const TAILWIND_OPTIONS = {
    fontSize: [
      { value: '', label: 'Default' },
      { value: 'text-xs', label: 'Extra Small (text-xs)' },
      { value: 'text-sm', label: 'Small (text-sm)' },
      { value: 'text-base', label: 'Base (text-base)' },
      { value: 'text-lg', label: 'Large (text-lg)' },
      { value: 'text-xl', label: 'XL (text-xl)' },
      { value: 'text-2xl', label: '2XL (text-2xl)' },
      { value: 'text-3xl', label: '3XL (text-3xl)' },
      { value: 'text-4xl', label: '4XL (text-4xl)' },
      { value: 'text-5xl', label: '5XL (text-5xl)' },
      { value: 'text-6xl', label: '6XL (text-6xl)' },
      { value: 'text-7xl', label: '7XL (text-7xl)' },
      { value: 'text-8xl', label: '8XL (text-8xl)' },
      { value: 'text-9xl', label: '9XL (text-9xl)' },
    ],
    fontWeight: [
      { value: '', label: 'Default' },
      { value: 'font-thin', label: 'Thin (100)' },
      { value: 'font-extralight', label: 'Extra Light (200)' },
      { value: 'font-light', label: 'Light (300)' },
      { value: 'font-normal', label: 'Normal (400)' },
      { value: 'font-medium', label: 'Medium (500)' },
      { value: 'font-semibold', label: 'Semibold (600)' },
      { value: 'font-bold', label: 'Bold (700)' },
      { value: 'font-extrabold', label: 'Extra Bold (800)' },
      { value: 'font-black', label: 'Black (900)' },
    ],
    colors: TAILWIND_COLORS,
    spacingPresets: TAILWIND_SPACING_PRESETS,
  };

  // Export for settings panel
  window.TAILWIND_OPTIONS = TAILWIND_OPTIONS;

  class HeadingBlock extends window.PwcBaseBlock {
    static get blockName() { return 'heading'; }
    static get blockTitle() { return 'Heading'; }
    static get blockIcon() { return ''; }
    static get blockDescription() { return 'Add a heading with customizable styles using Tailwind classes.'; }

    static get blockSettings() {
      return [
        {
          name: 'level',
          type: 'select',
          label: 'Heading Level',
          default: 'h2',
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
          options: TAILWIND_OPTIONS.fontSize,
        },
        {
          name: 'fontWeight',
          type: 'select',
          label: 'Font Weight',
          default: '',
          options: TAILWIND_OPTIONS.fontWeight,
        },
        {
          name: 'lineHeight',
          type: 'select',
          label: 'Line Height',
          default: '',
          options: [
            { value: '', label: 'Default' },
            { value: 'leading-none', label: 'None (1)' },
            { value: 'leading-tight', label: 'Tight (1.25)' },
            { value: 'leading-snug', label: 'Snug (1.375)' },
            { value: 'leading-normal', label: 'Normal (1.5)' },
            { value: 'leading-relaxed', label: 'Relaxed (1.625)' },
            { value: 'leading-loose', label: 'Loose (2)' },
          ],
        },
        {
          name: 'textAlign',
          type: 'alignment',
          label: 'Alignment',
          default: '',
          options: [
            { value: '', label: 'None', icon: 'align-left' },
            { value: 'text-left', label: 'Left', icon: 'align-left' },
            { value: 'text-center', label: 'Center', icon: 'align-center' },
            { value: 'text-right', label: 'Right', icon: 'align-right' },
            { value: 'text-justify', label: 'Justify', icon: 'align-justify' },
          ],
        },
        {
          name: 'textColor',
          type: 'colorSwatch',
          label: 'Text Color',
          default: '',
          colors: TAILWIND_COLORS,
        },
        {
          name: 'margin',
          type: 'spacing',
          label: 'Margin',
          default: '',
          prefix: 'm',
        },
        {
          name: 'padding',
          type: 'spacing',
          label: 'Padding',
          default: '',
          prefix: 'p',
        },
        {
          name: 'customClasses',
          type: 'text',
          label: 'Custom Tailwind Classes',
          default: '',
          placeholder: 'e.g., tracking-wide uppercase',
          help: 'Add any additional Tailwind utility classes',
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
      const fontSize = this.getAttribute('font-size') || '';
      const fontWeight = this.getAttribute('font-weight') || '';
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
      const fontSize = this.getAttribute('font-size') || '';
      const fontWeight = this.getAttribute('font-weight') || '';
      const lineHeight = this.getAttribute('line-height') || '';
      const textAlign = this.getAttribute('text-align') || '';
      const textColor = this.getAttribute('text-color') || '';
      const margin = this.getAttribute('margin') || '';
      const padding = this.getAttribute('padding') || '';
      const customClasses = this.getAttribute('custom-classes') || '';

      // Build the class list from Tailwind utilities
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

      this.innerHTML = `
        <${level}
          class="${classes}"
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
