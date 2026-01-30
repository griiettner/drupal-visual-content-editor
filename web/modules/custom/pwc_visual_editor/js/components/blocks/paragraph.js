/**
 * @file
 * Paragraph block component.
 *
 * A configurable paragraph block for extended text content with Tailwind utility classes.
 * Supports multiple paragraphs within a single block.
 */

(function (Drupal) {
  'use strict';

  /**
   * Tailwind line height options.
   */
  const LINE_HEIGHT_OPTIONS = [
    { value: '', label: 'Default' },
    { value: 'leading-none', label: 'None (1)' },
    { value: 'leading-tight', label: 'Tight (1.25)' },
    { value: 'leading-snug', label: 'Snug (1.375)' },
    { value: 'leading-normal', label: 'Normal (1.5)' },
    { value: 'leading-relaxed', label: 'Relaxed (1.625)' },
    { value: 'leading-loose', label: 'Loose (2)' },
  ];

  /**
   * Tailwind paragraph gap options (space between paragraphs).
   */
  const PARAGRAPH_GAP_OPTIONS = [
    { value: '', label: 'Default' },
    { value: 'space-y-0', label: 'None' },
    { value: 'space-y-1', label: '4px' },
    { value: 'space-y-2', label: '8px' },
    { value: 'space-y-3', label: '12px' },
    { value: 'space-y-4', label: '16px' },
    { value: 'space-y-6', label: '24px' },
    { value: 'space-y-8', label: '32px' },
  ];

  // Export for other blocks to use
  window.TAILWIND_LINE_HEIGHT_OPTIONS = LINE_HEIGHT_OPTIONS;
  window.TAILWIND_PARAGRAPH_GAP_OPTIONS = PARAGRAPH_GAP_OPTIONS;

  class ParagraphBlock extends window.PwcBaseBlock {
    static get blockName() { return 'paragraph'; }
    static get blockTitle() { return 'Paragraph'; }
    static get blockIcon() { return '¶'; }
    static get blockDescription() { return 'Add a paragraph of text with customizable styles.'; }
    static get blockCategory() { return 'text'; }

    static get blockSettings() {
      return [
        {
          name: 'fontSize',
          type: 'select',
          label: 'Font Size',
          default: '',
          tab: 'typography',
          options: window.TAILWIND_OPTIONS?.fontSize || [],
        },
        {
          name: 'fontWeight',
          type: 'select',
          label: 'Font Weight',
          default: '',
          tab: 'typography',
          options: window.TAILWIND_OPTIONS?.fontWeight || [],
        },
        {
          name: 'lineHeight',
          type: 'select',
          label: 'Line Height',
          default: '',
          tab: 'typography',
          options: LINE_HEIGHT_OPTIONS,
        },
        {
          name: 'textAlign',
          type: 'alignment',
          label: 'Alignment',
          default: '',
          tab: 'typography',
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
          tab: 'style',
          colors: window.TAILWIND_OPTIONS?.colors || [],
        },
        {
          name: 'paragraphGap',
          type: 'select',
          label: 'Paragraph Gap',
          default: 'space-y-4',
          tab: 'layout',
          options: PARAGRAPH_GAP_OPTIONS,
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
          label: 'Custom Tailwind Classes',
          default: '',
          tab: 'style',
          placeholder: 'e.g., prose max-w-none',
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
        'font-size',
        'font-weight',
        'line-height',
        'text-align',
        'text-color',
        'paragraph-gap',
        'margin',
        'padding',
        'custom-classes',
      ];
    }

    constructor() {
      super();
      this._paragraphClasses = '';
    }

    /**
     * Override attributeChangedCallback to allow style updates during editing.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue || !this.isConnected) return;

      // These attributes affect styling only, not content - safe to update during editing
      const styleOnlyAttributes = [
        'font-size', 'font-weight', 'line-height', 'text-align', 'text-color',
        'paragraph-gap', 'margin', 'padding', 'custom-classes'
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
      const fontSize = this.getAttribute('font-size') || '';
      const fontWeight = this.getAttribute('font-weight') || '';
      const lineHeight = this.getAttribute('line-height') || '';
      const textAlign = this.getAttribute('text-align') || '';
      const textColor = this.getAttribute('text-color') || '';
      const paragraphGap = this.getAttribute('paragraph-gap') || 'space-y-4';
      const margin = this.getAttribute('margin') || '';
      const padding = this.getAttribute('padding') || '';
      const customClasses = this.getAttribute('custom-classes') || '';

      // Update paragraph classes
      this._paragraphClasses = [
        'pwc-paragraph__text',
        fontSize,
        fontWeight,
        lineHeight,
        textAlign,
        textColor,
      ].filter(Boolean).join(' ');

      // Update container classes
      const containerClasses = [
        'pwc-paragraph',
        paragraphGap,
        margin,
        padding,
        customClasses,
      ].filter(Boolean).join(' ');

      // Update container div - use querySelector to find the actual container
      // (firstElementChild may return hover controls instead of the content container)
      const container = this.querySelector('.pwc-paragraph') || this.querySelector('[data-editable="content"]');
      if (container) {
        // Preserve contenteditable and data attributes
        const isEditable = container.hasAttribute('contenteditable');
        container.className = containerClasses;
        if (isEditable) {
          container.setAttribute('contenteditable', 'true');
          container.setAttribute('data-editable', 'content');
        }
      }

      // Update all <p> elements
      this.querySelectorAll('p').forEach(p => {
        p.className = this._paragraphClasses;
      });
    }

    render() {
      let content = this.getAttribute('content') || '<p>Enter your text here...</p>';
      const fontSize = this.getAttribute('font-size') || '';
      const fontWeight = this.getAttribute('font-weight') || '';
      const lineHeight = this.getAttribute('line-height') || '';
      const textAlign = this.getAttribute('text-align') || '';
      const textColor = this.getAttribute('text-color') || '';
      const paragraphGap = this.getAttribute('paragraph-gap') || 'space-y-4';
      const margin = this.getAttribute('margin') || '';
      const padding = this.getAttribute('padding') || '';
      const customClasses = this.getAttribute('custom-classes') || '';

      // Build the class list from Tailwind utilities for paragraphs
      this._paragraphClasses = [
        'pwc-paragraph__text',
        fontSize,
        fontWeight,
        lineHeight,
        textAlign,
        textColor,
      ].filter(Boolean).join(' ');

      // Container classes (margin, padding, gap, custom)
      const containerClasses = [
        'pwc-paragraph',
        paragraphGap,
        margin,
        padding,
        customClasses,
      ].filter(Boolean).join(' ');

      const isEditing = window.pwcEditorState && window.pwcEditorState.isEditing;

      // Sanitize content - fix nested <p> tags and ensure proper structure
      content = this.sanitizeContent(content);

      // Ensure content is wrapped in <p> tags
      content = this.ensureParagraphTags(content);

      // Add classes to each paragraph
      content = this.addClassesToParagraphs(content, this._paragraphClasses);

      // Remove empty <p> tags
      content = this.removeEmptyParagraphs(content);

      const hasContent = content && !content.includes('Enter your text here...');
      const placeholderAttr = isEditing && !hasContent ? 'data-placeholder="Write your paragraph..."' : '';

      const editableContainerClasses = isEditing ? `${containerClasses} pwc-editable` : containerClasses;

      this.innerHTML = `
        <div
          class="${editableContainerClasses}"
          ${isEditing ? `contenteditable="true" data-editable="content"` : ''}
          ${placeholderAttr}
        >${content}</div>
      `;

      if (isEditing) {
        this.setupParagraphEditing();
      }
    }

    /**
     * Sanitize content to ensure valid semantic HTML.
     * Fixes nested <p> tags and other structural issues.
     */
    sanitizeContent(content) {
      if (!content) return '';

      // Use DOMParser to properly handle HTML
      const temp = document.createElement('div');
      temp.innerHTML = content;

      // Fix nested <p> tags - browsers auto-close them but we need to handle the content
      // When a <p> is inside another <p>, browsers split them, which can cause duplicates
      const paragraphs = temp.querySelectorAll('p');
      paragraphs.forEach(p => {
        // Check for nested <p> tags (shouldn't exist in valid HTML but can happen)
        const nestedPs = p.querySelectorAll('p');
        nestedPs.forEach(nestedP => {
          // Move nested p's content to parent level
          while (nestedP.firstChild) {
            nestedP.parentNode.insertBefore(nestedP.firstChild, nestedP);
          }
          nestedP.remove();
        });
      });

      // Remove any empty <p> tags (except those with just <br>)
      temp.querySelectorAll('p').forEach(p => {
        if (!p.textContent.trim() && !p.querySelector('br')) {
          p.remove();
        }
      });

      // If after cleanup we have no <p> tags but have text, the structure was corrupted
      // Return just the text content to be re-wrapped
      if (!temp.querySelector('p') && temp.textContent.trim()) {
        return temp.innerHTML;
      }

      return temp.innerHTML;
    }

    /**
     * Ensure content is wrapped in <p> tags and clean up any <br><br> patterns.
     */
    ensureParagraphTags(content) {
      if (!content) return '<p></p>';

      // First, convert any <br><br> patterns to paragraph breaks
      content = this.convertDoubleBrToParagraphs(content);

      // If content doesn't start with <p>, wrap it
      if (!content.trim().startsWith('<p>') && !content.trim().startsWith('<p ')) {
        // Split by double line breaks to create paragraphs
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
        if (paragraphs.length === 0) {
          return '<p></p>';
        }
        return paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
      }

      return content;
    }

    /**
     * Convert <br><br> patterns inside <p> tags to separate paragraphs.
     */
    convertDoubleBrToParagraphs(content) {
      // Match <p> tags containing <br><br> (with optional whitespace)
      const pattern = /<p([^>]*)>([\s\S]*?)<\/p>/gi;

      return content.replace(pattern, (match, attrs, innerContent) => {
        // Check if there are double <br> tags
        if (/<br\s*\/?>\s*<br\s*\/?>/i.test(innerContent)) {
          // Split by double <br> and create separate paragraphs
          const parts = innerContent.split(/<br\s*\/?>\s*<br\s*\/?>/i);
          return parts
            .map(part => part.trim())
            .filter(part => part)
            .map(part => `<p${attrs}>${part}</p>`)
            .join('');
        }
        return match;
      });
    }

    /**
     * Add classes to all paragraph tags.
     * Replaces any existing classes to avoid duplication.
     */
    addClassesToParagraphs(content, classes) {
      if (!classes) return content;

      // Replace <p> and <p ...> with <p class="...">
      // Always replace existing classes to avoid duplication
      // Preserve non-class attributes (e.g. data-indent)
      return content.replace(/<p(\s[^>]*)?>|<p>/g, (match, existingAttrs) => {
        let otherAttrs = '';
        if (existingAttrs) {
          otherAttrs = existingAttrs.replace(/\s*class="[^"]*"/, '').trim();
          if (otherAttrs) otherAttrs = ' ' + otherAttrs;
        }
        return `<p class="${classes}"${otherAttrs}>`;
      });
    }

    /**
     * Remove empty <p> tags from content.
     */
    removeEmptyParagraphs(content) {
      if (!content) return content;

      // Use DOM to properly detect empty paragraphs
      const temp = document.createElement('div');
      temp.innerHTML = content;

      // Find and remove empty <p> tags
      temp.querySelectorAll('p').forEach(p => {
        // Check if paragraph is empty (no text content and no meaningful elements)
        const text = p.textContent.trim();
        const hasBr = p.querySelector('br');
        const hasImg = p.querySelector('img');

        // Remove if empty and no <br> (we keep <br> for editing empty lines)
        // But only in non-editing mode
        const isEditing = window.pwcEditorState && window.pwcEditorState.isEditing;
        if (!text && !hasImg && (!hasBr || !isEditing)) {
          p.remove();
        }
      });

      return temp.innerHTML;
    }

    /**
     * Set up paragraph-specific editing behavior.
     */
    setupParagraphEditing() {
      const editableDiv = this.querySelector('[data-editable="content"]');
      if (!editableDiv) return;

      // Handle keydown for Enter key behavior
      editableDiv.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault(); // Always prevent default to control behavior

          const selection = window.getSelection();
          if (!selection.rangeCount) return;

          const range = selection.getRangeAt(0);

          // Check if cursor is right after a <br> (meaning this is a second Enter)
          if (this.isCursorAfterBr(range)) {
            // Double enter - remove the <br> and create new paragraph
            this.createNewParagraphFromBr(range);
          } else {
            // Single enter - insert <br>
            const br = document.createElement('br');
            range.deleteContents();
            range.insertNode(br);

            // Move cursor after the <br>
            range.setStartAfter(br);
            range.setEndAfter(br);
            selection.removeAllRanges();
            selection.addRange(range);
          }

          // Trigger input event to save
          this.syncContent(editableDiv);
        } else if (e.key === 'Tab') {
          e.preventDefault();
          if (e.shiftKey) {
            this.handleParagraphOutdent();
          } else {
            this.handleParagraphIndent();
          }
          this.syncContent(editableDiv);
        }
      });

      // Handle paste - strip formatting but preserve structure
      editableDiv.addEventListener('paste', (e) => {
        e.preventDefault();

        const html = e.clipboardData.getData('text/html');
        const plainText = e.clipboardData.getData('text/plain');

        let cleanContent;

        if (html) {
          cleanContent = this.cleanPastedHtml(html);
        } else {
          cleanContent = this.cleanPastedText(plainText);
        }

        // Insert the clean content
        this.insertCleanContent(cleanContent);

        // Sync content
        this.syncContent(editableDiv);
      });

      // Handle input events to sync content
      editableDiv.addEventListener('input', () => {
        this.syncContent(editableDiv);
      });

      // Handle focus - select block
      editableDiv.addEventListener('focus', () => {
        this._isInlineEditing = true;
        if (window.pwcEditorState.isEditing) {
          window.pwcEditorState.selectBlock(this.blockId);
        }
      });

      // Handle blur - reset flag
      editableDiv.addEventListener('blur', () => {
        this._isInlineEditing = false;
      });
    }

    /**
     * Sync content from editable div to block state.
     */
    syncContent(editableDiv) {
      this._isInlineEditing = true;

      const value = editableDiv.innerHTML;
      this.setAttribute('content', value);
      window.pwcEditorState.updateBlock(this.blockId, {
        content: value,
      });

      Promise.resolve().then(() => {
        this._isInlineEditing = false;
      });
    }

    /**
     * Create a new paragraph when user presses Enter twice.
     * Removes the <br> before cursor and creates a new <p>.
     */
    createNewParagraphFromBr(range) {
      const selection = window.getSelection();

      // Find and remove the <br> that's right before the cursor
      const brBeforeCursor = this.findBrBeforeCursor(range);
      if (brBeforeCursor) {
        brBeforeCursor.remove();
      }

      // Find the current paragraph
      let currentP = range.startContainer;
      while (currentP && currentP.tagName !== 'P') {
        currentP = currentP.parentElement;
      }

      if (!currentP) {
        // Not in a paragraph, create one
        const newP = document.createElement('p');
        newP.className = this._paragraphClasses;
        newP.innerHTML = '<br>';
        range.insertNode(newP);
        range.setStart(newP, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }

      // Create new paragraph with same classes and indent
      const newP = document.createElement('p');
      newP.className = currentP.className || this._paragraphClasses;
      const indent = currentP.getAttribute('data-indent');
      if (indent) newP.setAttribute('data-indent', indent);
      newP.innerHTML = '<br>'; // Empty paragraph needs <br> to be visible/clickable

      // Insert after current paragraph
      currentP.after(newP);

      // Move cursor to new paragraph
      const newRange = document.createRange();
      newRange.setStart(newP, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    /**
     * Handle Tab key - increase paragraph indent level.
     */
    handleParagraphIndent() {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);

      let currentP = range.startContainer;
      while (currentP && currentP.tagName !== 'P') {
        currentP = currentP.parentElement;
      }
      if (!currentP) return;

      const maxIndent = 4;
      const currentIndent = parseInt(currentP.getAttribute('data-indent') || '0', 10);
      if (currentIndent >= maxIndent) return;

      currentP.setAttribute('data-indent', currentIndent + 1);
    }

    /**
     * Handle Shift+Tab - decrease paragraph indent level.
     */
    handleParagraphOutdent() {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);

      let currentP = range.startContainer;
      while (currentP && currentP.tagName !== 'P') {
        currentP = currentP.parentElement;
      }
      if (!currentP) return;

      const currentIndent = parseInt(currentP.getAttribute('data-indent') || '0', 10);
      if (currentIndent <= 0) return;

      const newIndent = currentIndent - 1;
      if (newIndent === 0) {
        currentP.removeAttribute('data-indent');
      } else {
        currentP.setAttribute('data-indent', newIndent);
      }
    }

    /**
     * Check if cursor is positioned right after a <br> element.
     */
    isCursorAfterBr(range) {
      const container = range.startContainer;
      const offset = range.startOffset;

      // Case 1: We're in a text node at position 0, check previous sibling
      if (container.nodeType === Node.TEXT_NODE && offset === 0) {
        const prev = container.previousSibling;
        return prev && prev.nodeName === 'BR';
      }

      // Case 2: We're in an element node, check the node before cursor
      if (container.nodeType === Node.ELEMENT_NODE && offset > 0) {
        const prevNode = container.childNodes[offset - 1];
        return prevNode && prevNode.nodeName === 'BR';
      }

      // Case 3: Check if cursor is at the end and last child is <br>
      if (container.nodeType === Node.ELEMENT_NODE) {
        const lastChild = container.lastChild;
        if (lastChild && lastChild.nodeName === 'BR') {
          // Check if we're at the end
          return offset === container.childNodes.length;
        }
      }

      return false;
    }

    /**
     * Find the <br> element right before the cursor.
     */
    findBrBeforeCursor(range) {
      const container = range.startContainer;
      const offset = range.startOffset;

      if (container.nodeType === Node.TEXT_NODE && offset === 0) {
        const prev = container.previousSibling;
        if (prev && prev.nodeName === 'BR') return prev;
      }

      if (container.nodeType === Node.ELEMENT_NODE && offset > 0) {
        const prevNode = container.childNodes[offset - 1];
        if (prevNode && prevNode.nodeName === 'BR') return prevNode;
      }

      return null;
    }

    /**
     * Insert clean content at cursor position.
     */
    insertCleanContent(content) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();

      // Create a temporary container to parse the HTML
      const temp = document.createElement('div');
      temp.innerHTML = content;

      // Insert each node
      const fragment = document.createDocumentFragment();
      while (temp.firstChild) {
        fragment.appendChild(temp.firstChild);
      }

      range.insertNode(fragment);

      // Move cursor to end
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    /**
     * Clean pasted HTML, removing formatting but preserving structure.
     */
    cleanPastedHtml(html) {
      // Create a temporary element to parse HTML
      const temp = document.createElement('div');
      temp.innerHTML = html;

      // Track paragraphs
      const paragraphs = [];
      let currentParagraph = [];

      const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          if (text.trim()) {
            currentParagraph.push(text);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName.toLowerCase();

          // Block elements create paragraph breaks
          if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'article', 'section'].includes(tagName)) {
            // Save current paragraph if not empty
            if (currentParagraph.length > 0) {
              paragraphs.push(currentParagraph.join(''));
              currentParagraph = [];
            }
            // Process children
            node.childNodes.forEach(processNode);
            // End this block element
            if (currentParagraph.length > 0) {
              paragraphs.push(currentParagraph.join(''));
              currentParagraph = [];
            }
          }
          // Line breaks
          else if (tagName === 'br') {
            currentParagraph.push('<br>');
          }
          // Other elements - just process children
          else {
            node.childNodes.forEach(processNode);
          }
        }
      };

      temp.childNodes.forEach(processNode);

      // Don't forget the last paragraph
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(''));
      }

      // Filter empty paragraphs and build result
      const validParagraphs = paragraphs.filter(p => p.trim() && p.trim() !== '<br>');

      if (validParagraphs.length === 0) {
        return '';
      }

      if (validParagraphs.length === 1) {
        // Single paragraph - just return the content (will be inserted into current <p>)
        return validParagraphs[0];
      }

      // Multiple paragraphs - create <p> tags
      return validParagraphs.map(p => `</p><p class="${this._paragraphClasses}">${p}`).join('').substring(4) + '</p>';
    }

    /**
     * Clean pasted plain text, converting to proper paragraph structure.
     */
    cleanPastedText(text) {
      if (!text) return '';

      // Normalize line endings
      text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

      // Split by double newlines (paragraph breaks)
      const paragraphs = text.split(/\n\n+/);

      if (paragraphs.length === 1) {
        // Single paragraph - just convert single newlines to <br>
        return text.replace(/\n/g, '<br>');
      }

      // Multiple paragraphs - create proper <p> structure
      // First content goes into current paragraph, rest create new <p>s
      return paragraphs.map((p, i) => {
        const content = p.replace(/\n/g, '<br>');
        if (i === 0) {
          return content;
        }
        return `</p><p class="${this._paragraphClasses}">${content}`;
      }).join('');
    }
  }

  // Register custom element
  customElements.define('pwc-paragraph', ParagraphBlock);

  // Register with block registry
  if (window.pwcBlockRegistry) {
    window.pwcBlockRegistry.register(ParagraphBlock);
  }

})(Drupal);
