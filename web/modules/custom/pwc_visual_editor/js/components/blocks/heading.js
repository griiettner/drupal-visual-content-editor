/**
 * @file
 * Heading block component.
 *
 * A configurable heading block that uses Tailwind utility classes.
 */

(function (Drupal) {
  'use strict';

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
    textColor: [
      { value: '', label: 'Default' },
      { value: 'text-black', label: 'Black' },
      { value: 'text-white', label: 'White' },
      { value: 'text-gray-500', label: 'Gray 500' },
      { value: 'text-gray-600', label: 'Gray 600' },
      { value: 'text-gray-700', label: 'Gray 700' },
      { value: 'text-gray-800', label: 'Gray 800' },
      { value: 'text-gray-900', label: 'Gray 900' },
      { value: 'text-red-500', label: 'Red 500' },
      { value: 'text-red-600', label: 'Red 600' },
      { value: 'text-blue-500', label: 'Blue 500' },
      { value: 'text-blue-600', label: 'Blue 600' },
      { value: 'text-green-500', label: 'Green 500' },
      { value: 'text-green-600', label: 'Green 600' },
      { value: 'text-yellow-500', label: 'Yellow 500' },
      { value: 'text-purple-500', label: 'Purple 500' },
      { value: 'text-pink-500', label: 'Pink 500' },
    ],
    margin: [
      { value: '', label: 'Default' },
      { value: 'm-0', label: 'None (m-0)' },
      { value: 'm-1', label: '0.25rem (m-1)' },
      { value: 'm-2', label: '0.5rem (m-2)' },
      { value: 'm-4', label: '1rem (m-4)' },
      { value: 'm-6', label: '1.5rem (m-6)' },
      { value: 'm-8', label: '2rem (m-8)' },
      { value: 'my-2', label: 'Vertical 0.5rem (my-2)' },
      { value: 'my-4', label: 'Vertical 1rem (my-4)' },
      { value: 'my-6', label: 'Vertical 1.5rem (my-6)' },
      { value: 'my-8', label: 'Vertical 2rem (my-8)' },
      { value: 'mb-2', label: 'Bottom 0.5rem (mb-2)' },
      { value: 'mb-4', label: 'Bottom 1rem (mb-4)' },
      { value: 'mb-6', label: 'Bottom 1.5rem (mb-6)' },
      { value: 'mb-8', label: 'Bottom 2rem (mb-8)' },
      { value: 'mt-2', label: 'Top 0.5rem (mt-2)' },
      { value: 'mt-4', label: 'Top 1rem (mt-4)' },
      { value: 'mt-6', label: 'Top 1.5rem (mt-6)' },
      { value: 'mt-8', label: 'Top 2rem (mt-8)' },
    ],
    padding: [
      { value: '', label: 'Default' },
      { value: 'p-0', label: 'None (p-0)' },
      { value: 'p-1', label: '0.25rem (p-1)' },
      { value: 'p-2', label: '0.5rem (p-2)' },
      { value: 'p-4', label: '1rem (p-4)' },
      { value: 'p-6', label: '1.5rem (p-6)' },
      { value: 'p-8', label: '2rem (p-8)' },
      { value: 'py-2', label: 'Vertical 0.5rem (py-2)' },
      { value: 'py-4', label: 'Vertical 1rem (py-4)' },
      { value: 'px-2', label: 'Horizontal 0.5rem (px-2)' },
      { value: 'px-4', label: 'Horizontal 1rem (px-4)' },
    ],
  };

  class HeadingBlock extends window.PwcBaseBlock {
    static get blockName() { return 'heading'; }
    static get blockTitle() { return 'Heading'; }
    static get blockIcon() { return ''; }
    static get blockDescription() { return 'Add a heading with customizable styles using Tailwind classes.'; }

    static get blockSettings() {
      return [
        {
          name: 'content',
          type: 'text',
          label: 'Heading Text',
          default: 'Heading',
          placeholder: 'Enter heading text...',
        },
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
          name: 'textColor',
          type: 'select',
          label: 'Text Color',
          default: '',
          options: TAILWIND_OPTIONS.textColor,
        },
        {
          name: 'margin',
          type: 'select',
          label: 'Margin',
          default: '',
          options: TAILWIND_OPTIONS.margin,
        },
        {
          name: 'padding',
          type: 'select',
          label: 'Padding',
          default: '',
          options: TAILWIND_OPTIONS.padding,
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
        'text-color',
        'margin',
        'padding',
        'custom-classes',
      ];
    }

    render() {
      const content = this.getAttribute('content') || 'Heading';
      const level = this.getAttribute('level') || 'h2';
      const fontSize = this.getAttribute('font-size') || '';
      const fontWeight = this.getAttribute('font-weight') || '';
      const textColor = this.getAttribute('text-color') || '';
      const margin = this.getAttribute('margin') || '';
      const padding = this.getAttribute('padding') || '';
      const customClasses = this.getAttribute('custom-classes') || '';

      // Build the class list from Tailwind utilities
      const classes = [
        'pwc-heading',
        fontSize,
        fontWeight,
        textColor,
        margin,
        padding,
        customClasses,
      ].filter(Boolean).join(' ');

      const isEditing = window.pwcEditorState && window.pwcEditorState.isEditing;

      this.innerHTML = `
        <${level}
          class="${classes}"
          ${isEditing ? `contenteditable="true" data-editable="content"` : ''}
          data-placeholder="Enter heading..."
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

  console.log('PWC Heading Block: Registered');

})(Drupal);
