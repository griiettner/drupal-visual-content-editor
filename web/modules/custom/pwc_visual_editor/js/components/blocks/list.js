/**
 * @file
 * List block component.
 *
 * A configurable list block (ordered/unordered) with Tailwind utility classes.
 */

(function (Drupal) {
  'use strict';

  /**
   * List type options.
   */
  const LIST_TYPE_OPTIONS = [
    { value: 'ul', label: 'Unordered (Bullets)' },
    { value: 'ol', label: 'Ordered (Numbers)' },
  ];

  /**
   * List style options for unordered lists.
   */
  const UL_STYLE_OPTIONS = [
    { value: '', label: 'Default' },
    { value: 'list-disc', label: 'Disc' },
    { value: 'list-circle', label: 'Circle' },
    { value: 'list-square', label: 'Square' },
    { value: 'list-none', label: 'None' },
  ];

  /**
   * List style options for ordered lists.
   */
  const OL_STYLE_OPTIONS = [
    { value: '', label: 'Default' },
    { value: 'list-decimal', label: 'Decimal (1, 2, 3)' },
    { value: 'list-decimal-leading-zero', label: 'Decimal Leading Zero (01, 02)' },
    { value: 'list-lower-alpha', label: 'Lower Alpha (a, b, c)' },
    { value: 'list-upper-alpha', label: 'Upper Alpha (A, B, C)' },
    { value: 'list-lower-roman', label: 'Lower Roman (i, ii, iii)' },
    { value: 'list-upper-roman', label: 'Upper Roman (I, II, III)' },
    { value: 'list-none', label: 'None' },
  ];

  /**
   * Item gap options (space between list items).
   */
  const ITEM_GAP_OPTIONS = [
    { value: '', label: 'Default' },
    { value: 'space-y-0', label: 'None' },
    { value: 'space-y-1', label: '4px' },
    { value: 'space-y-2', label: '8px' },
    { value: 'space-y-3', label: '12px' },
    { value: 'space-y-4', label: '16px' },
    { value: 'space-y-6', label: '24px' },
  ];

  class ListBlock extends window.PwcBaseBlock {
    static get blockName() { return 'list'; }
    static get blockTitle() { return 'List'; }
    static get blockIcon() { return ''; }
    static get blockDescription() { return 'Add an ordered or unordered list.'; }
    static get blockCategory() { return 'text'; }

    static get blockSettings() {
      return [
        {
          name: 'listType',
          type: 'select',
          label: 'List Type',
          default: 'ul',
          options: LIST_TYPE_OPTIONS,
        },
        {
          name: 'listStyle',
          type: 'select',
          label: 'List Style',
          default: 'list-disc',
          options: UL_STYLE_OPTIONS, // Will be dynamically updated based on listType
        },
        {
          name: 'listPosition',
          type: 'select',
          label: 'Marker Position',
          default: 'list-inside',
          options: [
            { value: 'list-inside', label: 'Inside' },
            { value: 'list-outside', label: 'Outside' },
          ],
        },
        {
          name: 'fontSize',
          type: 'select',
          label: 'Font Size',
          default: '',
          options: window.TAILWIND_OPTIONS?.fontSize || [],
        },
        {
          name: 'fontWeight',
          type: 'select',
          label: 'Font Weight',
          default: '',
          options: window.TAILWIND_OPTIONS?.fontWeight || [],
        },
        {
          name: 'lineHeight',
          type: 'select',
          label: 'Line Height',
          default: '',
          options: window.TAILWIND_LINE_HEIGHT_OPTIONS || [],
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
          ],
        },
        {
          name: 'textColor',
          type: 'colorSwatch',
          label: 'Text Color',
          default: '',
          colors: window.TAILWIND_OPTIONS?.colors || [],
        },
        {
          name: 'itemGap',
          type: 'select',
          label: 'Item Gap',
          default: 'space-y-2',
          options: ITEM_GAP_OPTIONS,
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
          placeholder: 'e.g., marker:text-blue-500',
          help: 'Add any additional Tailwind utility classes',
        },
      ];
    }

    static get inlineEditable() {
      return ['content'];
    }

    static get observedAttributes() {
      return [
        'block-id',
        'content',
        'list-type',
        'list-style',
        'list-position',
        'font-size',
        'font-weight',
        'line-height',
        'text-align',
        'text-color',
        'item-gap',
        'margin',
        'padding',
        'custom-classes',
      ];
    }

    constructor() {
      super();
      this._listClasses = '';
      this._itemClasses = '';
    }

    /**
     * Override attributeChangedCallback to allow style updates during editing.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue || !this.isConnected) return;

      const styleOnlyAttributes = [
        'list-type', 'list-style', 'list-position',
        'font-size', 'font-weight', 'line-height', 'text-align', 'text-color',
        'item-gap', 'margin', 'padding', 'custom-classes'
      ];

      // Skip re-render for content changes during inline editing
      if (this._isInlineEditing && name === 'content') {
        return;
      }

      // For style-only changes, update classes without full re-render
      if (styleOnlyAttributes.includes(name)) {
        // List type change requires full re-render (ul vs ol)
        if (name === 'list-type') {
          this.render();
          this.addHoverControls();
          return;
        }
        this.updateStyles();
        return;
      }

      this.render();
      this.addHoverControls();
    }

    /**
     * Update styles without full re-render.
     */
    updateStyles() {
      const listType = this.getAttribute('list-type') || 'ul';
      const listStyle = this.getAttribute('list-style') || (listType === 'ul' ? 'list-disc' : 'list-decimal');
      const listPosition = this.getAttribute('list-position') || 'list-inside';
      const fontSize = this.getAttribute('font-size') || '';
      const fontWeight = this.getAttribute('font-weight') || '';
      const lineHeight = this.getAttribute('line-height') || '';
      const textAlign = this.getAttribute('text-align') || '';
      const textColor = this.getAttribute('text-color') || '';
      const itemGap = this.getAttribute('item-gap') || 'space-y-2';
      const margin = this.getAttribute('margin') || '';
      const padding = this.getAttribute('padding') || '';
      const customClasses = this.getAttribute('custom-classes') || '';

      // List element classes
      this._listClasses = [
        'pwc-list__items',
        listStyle,
        listPosition,
        fontSize,
        fontWeight,
        lineHeight,
        textAlign,
        textColor,
        itemGap,
        margin,
        padding,
        customClasses,
      ].filter(Boolean).join(' ');

      // Item classes
      this._itemClasses = 'pwc-list__item';

      // Update the list element
      const list = this.querySelector('ul, ol');
      if (list) {
        list.className = this._listClasses;
      }
    }

    render() {
      let content = this.getAttribute('content') || '<li>List item</li>';
      const listType = this.getAttribute('list-type') || 'ul';
      const listStyle = this.getAttribute('list-style') || (listType === 'ul' ? 'list-disc' : 'list-decimal');
      const listPosition = this.getAttribute('list-position') || 'list-inside';
      const fontSize = this.getAttribute('font-size') || '';
      const fontWeight = this.getAttribute('font-weight') || '';
      const lineHeight = this.getAttribute('line-height') || '';
      const textAlign = this.getAttribute('text-align') || '';
      const textColor = this.getAttribute('text-color') || '';
      const itemGap = this.getAttribute('item-gap') || 'space-y-2';
      const margin = this.getAttribute('margin') || '';
      const padding = this.getAttribute('padding') || '';
      const customClasses = this.getAttribute('custom-classes') || '';

      // Build list classes
      this._listClasses = [
        'pwc-list__items',
        listStyle,
        listPosition,
        fontSize,
        fontWeight,
        lineHeight,
        textAlign,
        textColor,
        itemGap,
        margin,
        padding,
        customClasses,
      ].filter(Boolean).join(' ');

      this._itemClasses = 'pwc-list__item';

      const isEditing = window.pwcEditorState && window.pwcEditorState.isEditing;

      // Ensure content has list items
      content = this.ensureListItems(content);

      // Add classes to list items
      content = this.addClassesToItems(content, this._itemClasses);

      const hasContent = content && !content.includes('List item');
      const placeholderAttr = isEditing && !hasContent ? 'data-placeholder="Add list items..."' : '';

      this.innerHTML = `
        <${listType}
          class="${this._listClasses}"
          ${isEditing ? `contenteditable="true" data-editable="content"` : ''}
          ${placeholderAttr}
        >${content}</${listType}>
      `;

      if (isEditing) {
        this.setupListEditing();
      }
    }

    /**
     * Ensure content has proper list item structure.
     */
    ensureListItems(content) {
      if (!content) return '<li></li>';

      // If content doesn't have <li> tags, wrap it
      if (!content.includes('<li')) {
        // Split by line breaks and wrap each in <li>
        const items = content.split(/\n|<br\s*\/?>/i).filter(item => item.trim());
        if (items.length === 0) return '<li></li>';
        return items.map(item => `<li>${item.trim()}</li>`).join('');
      }

      return content;
    }

    /**
     * Add classes to list items.
     */
    addClassesToItems(content, classes) {
      if (!classes) return content;

      return content.replace(/<li(\s+[^>]*)?>|<li>/g, () => {
        return `<li class="${classes}">`;
      });
    }

    /**
     * Set up list-specific editing behavior.
     */
    setupListEditing() {
      const editableList = this.querySelector('[data-editable="content"]');
      if (!editableList) return;

      // Handle keydown for Enter and Backspace
      editableList.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleEnterKey();
        } else if (e.key === 'Backspace') {
          this.handleBackspaceKey(e);
        }
      });

      // Handle paste - strip formatting
      editableList.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        this.insertPastedText(text);
        this.syncContent(editableList);
      });

      // Handle input events
      editableList.addEventListener('input', () => {
        this.syncContent(editableList);
      });

      // Handle focus
      editableList.addEventListener('focus', () => {
        this._isInlineEditing = true;
        if (window.pwcEditorState.isEditing) {
          window.pwcEditorState.selectBlock(this.blockId);
        }
      });

      // Handle blur
      editableList.addEventListener('blur', () => {
        this._isInlineEditing = false;
      });
    }

    /**
     * Handle Enter key - create new list item.
     */
    handleEnterKey() {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);

      // Find current list item
      let currentLi = range.startContainer;
      while (currentLi && currentLi.tagName !== 'LI') {
        currentLi = currentLi.parentElement;
      }

      if (!currentLi) return;

      // Create new list item
      const newLi = document.createElement('li');
      newLi.className = this._itemClasses;

      // If cursor is at end of item, create empty new item
      // If cursor is in middle, split the content
      const rangeToEnd = document.createRange();
      rangeToEnd.setStart(range.endContainer, range.endOffset);
      rangeToEnd.setEndAfter(currentLi.lastChild || currentLi);

      const fragment = rangeToEnd.extractContents();
      if (fragment.textContent.trim() || fragment.querySelector('*')) {
        newLi.appendChild(fragment);
      }

      // Insert new item after current
      currentLi.after(newLi);

      // Move cursor to new item
      const newRange = document.createRange();
      newRange.setStart(newLi, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    /**
     * Handle Backspace key - remove empty list items.
     */
    handleBackspaceKey(e) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);

      // Only handle if at start of list item
      if (range.startOffset !== 0) return;

      // Find current list item
      let currentLi = range.startContainer;
      while (currentLi && currentLi.tagName !== 'LI') {
        currentLi = currentLi.parentElement;
      }

      if (!currentLi) return;

      // Check if cursor is at the very beginning
      const isAtStart = this.isCursorAtStartOfElement(range, currentLi);
      if (!isAtStart) return;

      // Get previous sibling
      const prevLi = currentLi.previousElementSibling;

      // If this is empty and not the only item, remove it
      if (!currentLi.textContent.trim() && prevLi) {
        e.preventDefault();
        currentLi.remove();

        // Move cursor to end of previous item
        const newRange = document.createRange();
        if (prevLi.lastChild) {
          if (prevLi.lastChild.nodeType === Node.TEXT_NODE) {
            newRange.setStart(prevLi.lastChild, prevLi.lastChild.length);
          } else {
            newRange.setStartAfter(prevLi.lastChild);
          }
        } else {
          newRange.setStart(prevLi, 0);
        }
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
      // If at start and has content, merge with previous
      else if (prevLi && isAtStart) {
        e.preventDefault();

        // Remember cursor position (end of previous item)
        const prevLength = prevLi.textContent.length;

        // Move content to previous item
        while (currentLi.firstChild) {
          prevLi.appendChild(currentLi.firstChild);
        }
        currentLi.remove();

        // Position cursor at merge point
        const textNode = this.getTextNodeAtOffset(prevLi, prevLength);
        if (textNode) {
          const newRange = document.createRange();
          newRange.setStart(textNode.node, textNode.offset);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }

    /**
     * Check if cursor is at the start of an element.
     */
    isCursorAtStartOfElement(range, element) {
      if (range.startOffset !== 0) return false;

      let node = range.startContainer;
      while (node && node !== element) {
        if (node.previousSibling) return false;
        node = node.parentNode;
      }
      return true;
    }

    /**
     * Get text node and offset at a character position.
     */
    getTextNodeAtOffset(element, targetOffset) {
      let currentOffset = 0;

      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while ((node = walker.nextNode())) {
        const nodeLength = node.textContent.length;
        if (currentOffset + nodeLength >= targetOffset) {
          return {
            node: node,
            offset: targetOffset - currentOffset
          };
        }
        currentOffset += nodeLength;
      }

      // Return last position if offset exceeds content
      const lastChild = element.lastChild;
      if (lastChild && lastChild.nodeType === Node.TEXT_NODE) {
        return { node: lastChild, offset: lastChild.length };
      }
      return null;
    }

    /**
     * Insert pasted text as list items.
     */
    insertPastedText(text) {
      if (!text) return;

      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();

      // Split text by line breaks
      const lines = text.split(/\n/).filter(line => line.trim());

      if (lines.length === 0) return;

      // Find current list item
      let currentLi = range.startContainer;
      while (currentLi && currentLi.tagName !== 'LI') {
        currentLi = currentLi.parentElement;
      }

      if (!currentLi) return;

      // Insert first line at cursor position
      const textNode = document.createTextNode(lines[0]);
      range.insertNode(textNode);

      // Create new list items for remaining lines
      let lastLi = currentLi;
      for (let i = 1; i < lines.length; i++) {
        const newLi = document.createElement('li');
        newLi.className = this._itemClasses;
        newLi.textContent = lines[i];
        lastLi.after(newLi);
        lastLi = newLi;
      }

      // Move cursor to end
      const newRange = document.createRange();
      newRange.setStartAfter(lastLi.lastChild || lastLi);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    /**
     * Sync content from editable list to block state.
     */
    syncContent(editableList) {
      this._isInlineEditing = true;

      // Get the list items HTML
      let content = '';
      editableList.querySelectorAll('li').forEach(li => {
        content += li.outerHTML;
      });

      // If no list items, use the innerHTML directly
      if (!content) {
        content = editableList.innerHTML;
      }

      this.setAttribute('content', content);
      window.pwcEditorState.updateBlock(this.blockId, {
        content: content,
      });

      Promise.resolve().then(() => {
        this._isInlineEditing = false;
      });
    }
  }

  // Register custom element
  customElements.define('pwc-list', ListBlock);

  // Register with block registry
  if (window.pwcBlockRegistry) {
    window.pwcBlockRegistry.register(ListBlock);
  }

})(Drupal);
