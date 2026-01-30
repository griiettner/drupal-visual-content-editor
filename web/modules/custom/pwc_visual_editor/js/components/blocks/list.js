/**
 * @file
 * List block component.
 *
 * A configurable list block (ordered/unordered) with Appkit4 utility classes.
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
   * List style options for all list types (custom pwc- classes).
   */
  const LIST_STYLE_OPTIONS = [
    // Unordered styles
    { value: 'pwc-list-disc', label: 'Disc (●)', group: 'ul' },
    { value: 'pwc-list-circle', label: 'Circle (○)', group: 'ul' },
    { value: 'pwc-list-square', label: 'Square (■)', group: 'ul' },
    // Ordered styles
    { value: 'pwc-list-decimal', label: 'Decimal (1, 2, 3)', group: 'ol' },
    { value: 'pwc-list-decimal-leading-zero', label: 'Decimal Leading Zero (01, 02)', group: 'ol' },
    { value: 'pwc-list-lower-alpha', label: 'Lower Alpha (a, b, c)', group: 'ol' },
    { value: 'pwc-list-upper-alpha', label: 'Upper Alpha (A, B, C)', group: 'ol' },
    { value: 'pwc-list-lower-roman', label: 'Lower Roman (i, ii, iii)', group: 'ol' },
    { value: 'pwc-list-upper-roman', label: 'Upper Roman (I, II, III)', group: 'ol' },
    // None
    { value: 'pwc-list-none', label: 'None', group: 'both' },
  ];

  /**
   * Item gap options (custom pwc- classes since Appkit4 has no space-y).
   */
  const ITEM_GAP_OPTIONS = [
    { value: '', label: 'Default' },
    { value: 'pwc-space-y-0', label: 'None' },
    { value: 'pwc-space-y-1', label: '4px' },
    { value: 'pwc-space-y-2', label: '8px' },
    { value: 'pwc-space-y-3', label: '12px' },
    { value: 'pwc-space-y-4', label: '16px' },
    { value: 'pwc-space-y-6', label: '24px' },
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
          type: 'listTypePicker',
          label: 'List Type',
          default: 'ul',
          tab: 'typography',
          options: LIST_TYPE_OPTIONS,
        },
        {
          name: 'listStyle',
          type: 'listStylePicker',
          label: 'List Style',
          default: 'pwc-list-disc',
          tab: 'typography',
          options: LIST_STYLE_OPTIONS,
        },
        {
          name: 'listPosition',
          type: 'markerPositionPicker',
          label: 'Marker Position',
          default: 'pwc-list-outside',
          tab: 'typography',
          options: [
            { value: 'pwc-list-outside', label: 'Outside' },
            { value: 'pwc-list-inside', label: 'Inside' },
          ],
        },
        {
          name: 'fontSize',
          type: 'select',
          label: 'Font Size',
          default: '',
          tab: 'typography',
          options: window.APPKIT_OPTIONS?.fontSize || [],
        },
        {
          name: 'fontWeight',
          type: 'select',
          label: 'Font Weight',
          default: '',
          tab: 'typography',
          options: window.APPKIT_OPTIONS?.fontWeight || [],
        },
        {
          name: 'lineHeight',
          type: 'select',
          label: 'Line Height',
          default: '',
          tab: 'typography',
          options: window.APPKIT_LINE_HEIGHT_OPTIONS || [],
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
          ],
        },
        {
          name: 'textColor',
          type: 'colorSwatch',
          label: 'Text Color',
          default: '',
          tab: 'style',
          colors: window.APPKIT_OPTIONS?.colors || [],
        },
        {
          name: 'itemGap',
          type: 'select',
          label: 'Item Gap',
          default: 'pwc-space-y-2',
          tab: 'layout',
          options: ITEM_GAP_OPTIONS,
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
          placeholder: 'e.g., ap-text-primary-blue-05',
          help: 'Add any additional CSS utility classes',
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
      const listStyle = this.getAttribute('list-style') || '';
      const listPosition = this.getAttribute('list-position') || 'pwc-list-outside';
      const fontSize = this.getAttribute('font-size') || '';
      const fontWeight = this.getAttribute('font-weight') || '';
      const lineHeight = this.getAttribute('line-height') || '';
      const textAlign = this.getAttribute('text-align') || '';
      const textColor = this.getAttribute('text-color') || '';
      const itemGap = this.getAttribute('item-gap') || 'pwc-space-y-2';
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
      const listStyle = this.getAttribute('list-style') || '';
      const listPosition = this.getAttribute('list-position') || 'pwc-list-outside';
      const fontSize = this.getAttribute('font-size') || '';
      const fontWeight = this.getAttribute('font-weight') || '';
      const lineHeight = this.getAttribute('line-height') || '';
      const textAlign = this.getAttribute('text-align') || '';
      const textColor = this.getAttribute('text-color') || '';
      const itemGap = this.getAttribute('item-gap') || 'pwc-space-y-2';
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

      const editableListClasses = isEditing ? `${this._listClasses} pwc-editable` : this._listClasses;

      this.innerHTML = `
        <${listType}
          class="${editableListClasses}"
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
          if (e.shiftKey) {
            // Shift+Enter: Insert <br> for multiline list item
            this.insertLineBreak();
          } else {
            // Enter: Create new list item
            this.handleEnterKey();
          }
          this.syncContent(editableList);
        } else if (e.key === 'Tab') {
          e.preventDefault();
          if (e.shiftKey) {
            this.handleOutdent();
          } else {
            this.handleIndent();
          }
          this.syncContent(editableList);
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
     * Insert a line break (<br>) at cursor position.
     * Used for Shift+Enter to create multiline list items.
     */
    insertLineBreak() {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();

      // Create and insert <br>
      const br = document.createElement('br');
      range.insertNode(br);

      // Move cursor after the <br>
      range.setStartAfter(br);
      range.setEndAfter(br);
      selection.removeAllRanges();
      selection.addRange(range);
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
     * Handle Tab key - indent current list item into a nested list.
     */
    handleIndent() {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);

      // Find current list item
      let currentLi = range.startContainer;
      while (currentLi && currentLi.tagName !== 'LI') {
        currentLi = currentLi.parentElement;
      }
      if (!currentLi) return;

      // Must have a previous sibling to indent under
      const prevLi = currentLi.previousElementSibling;
      if (!prevLi) return;

      // Save cursor position
      const cursorOffset = range.startOffset;
      const cursorNode = range.startContainer;

      // Determine list type from parent
      const parentList = currentLi.parentElement;
      const listTag = parentList.tagName.toLowerCase();

      // Find existing nested list at end of previous li
      let nestedList = null;
      for (let i = prevLi.children.length - 1; i >= 0; i--) {
        const child = prevLi.children[i];
        if (child.tagName === 'UL' || child.tagName === 'OL') {
          nestedList = child;
          break;
        }
      }

      if (!nestedList) {
        nestedList = document.createElement(listTag);
        prevLi.appendChild(nestedList);
      }

      // Move current li into nested list
      nestedList.appendChild(currentLi);

      // Restore cursor
      try {
        const newRange = document.createRange();
        newRange.setStart(cursorNode, cursorOffset);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } catch (_) {
        const newRange = document.createRange();
        newRange.setStart(currentLi, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    /**
     * Handle Shift+Tab - outdent current list item from nested list.
     */
    handleOutdent() {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);

      // Find current list item
      let currentLi = range.startContainer;
      while (currentLi && currentLi.tagName !== 'LI') {
        currentLi = currentLi.parentElement;
      }
      if (!currentLi) return;

      // The parent list (ul/ol containing this li)
      const parentList = currentLi.parentElement;
      if (!parentList) return;

      // The grandparent should be a li (meaning we're in a nested list)
      const grandparentLi = parentList.parentElement;
      if (!grandparentLi || grandparentLi.tagName !== 'LI') return;

      // The outer list
      const outerList = grandparentLi.parentElement;
      if (!outerList) return;

      // Save cursor position
      const cursorOffset = range.startOffset;
      const cursorNode = range.startContainer;

      // Collect siblings after current li in the nested list
      const siblingsAfter = [];
      let nextSibling = currentLi.nextElementSibling;
      while (nextSibling) {
        siblingsAfter.push(nextSibling);
        nextSibling = nextSibling.nextElementSibling;
      }

      // Move current li after the grandparent li in the outer list
      outerList.insertBefore(currentLi, grandparentLi.nextSibling);

      // If there were siblings after, create a new nested list under currentLi
      if (siblingsAfter.length > 0) {
        const newNestedList = document.createElement(parentList.tagName.toLowerCase());
        siblingsAfter.forEach(sib => newNestedList.appendChild(sib));
        currentLi.appendChild(newNestedList);
      }

      // Clean up empty nested list
      if (parentList.children.length === 0) {
        parentList.remove();
      }

      // Restore cursor
      try {
        const newRange = document.createRange();
        newRange.setStart(cursorNode, cursorOffset);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } catch (_) {
        const newRange = document.createRange();
        newRange.setStart(currentLi, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
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

      // Use innerHTML to preserve nested list structure
      const content = editableList.innerHTML;

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
