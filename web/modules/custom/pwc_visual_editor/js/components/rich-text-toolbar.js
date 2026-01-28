/**
 * @file
 * Rich text toolbar Web Component.
 *
 * Floating toolbar that appears on text selection for formatting.
 */

(function (Drupal) {
  'use strict';

  class RichTextToolbar extends HTMLElement {
    constructor() {
      super();
      this._boundSelectionChange = this.handleSelectionChange.bind(this);
    }

    connectedCallback() {
      this.render();
      this.hide();

      document.addEventListener('selectionchange', this._boundSelectionChange);
    }

    disconnectedCallback() {
      document.removeEventListener('selectionchange', this._boundSelectionChange);
    }

    render() {
      this.innerHTML = `
        <div class="pwc-rich-toolbar flex items-center gap-0.5 bg-gray-900 text-white rounded-md px-1 py-1 shadow-lg">
          <!-- Bold -->
          <button
            type="button"
            class="pwc-rich-toolbar__btn p-1.5 hover:bg-gray-700 rounded font-bold"
            data-command="bold"
            title="Bold (Ctrl+B)"
          >B</button>

          <!-- Italic -->
          <button
            type="button"
            class="pwc-rich-toolbar__btn p-1.5 hover:bg-gray-700 rounded italic"
            data-command="italic"
            title="Italic (Ctrl+I)"
          >I</button>

          <!-- Divider -->
          <div class="w-px h-4 bg-gray-600 mx-1"></div>

          <!-- Link -->
          <button
            type="button"
            class="pwc-rich-toolbar__btn p-1.5 hover:bg-gray-700 rounded"
            data-command="link"
            title="Add link (Ctrl+K)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
            </svg>
          </button>

          <!-- Unlink -->
          <button
            type="button"
            class="pwc-rich-toolbar__btn p-1.5 hover:bg-gray-700 rounded"
            data-command="unlink"
            title="Remove link"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
            </svg>
          </button>

          <!-- Divider -->
          <div class="w-px h-4 bg-gray-600 mx-1"></div>

          <!-- Clear Formatting -->
          <button
            type="button"
            class="pwc-rich-toolbar__btn p-1.5 hover:bg-gray-700 rounded text-xs"
            data-command="removeFormat"
            title="Clear formatting"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      `;

      this.setupEventListeners();
    }

    setupEventListeners() {
      this.querySelectorAll('[data-command]').forEach(btn => {
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault(); // Prevent losing selection
          const command = btn.getAttribute('data-command');
          this.executeCommand(command);
        });
      });

      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        if (!window.pwcEditorState.isEditing) return;

        if (e.ctrlKey || e.metaKey) {
          switch (e.key.toLowerCase()) {
            case 'b':
              e.preventDefault();
              this.executeCommand('bold');
              break;
            case 'i':
              e.preventDefault();
              this.executeCommand('italic');
              break;
            case 'k':
              e.preventDefault();
              this.executeCommand('link');
              break;
          }
        }
      });
    }

    handleSelectionChange() {
      if (!window.pwcEditorState.isEditing) {
        this.hide();
        return;
      }

      const selection = window.getSelection();

      // Hide if no selection or collapsed
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        this.hide();
        return;
      }

      // Check if selection is within a contenteditable element
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const editableParent = container.nodeType === Node.ELEMENT_NODE
        ? container.closest('[contenteditable="true"]')
        : container.parentElement?.closest('[contenteditable="true"]');

      if (!editableParent) {
        this.hide();
        return;
      }

      // Position and show toolbar
      this.positionAtSelection(range);
      this.show();
      this.updateActiveStates();
    }

    /**
     * Position toolbar at the current selection.
     *
     * @param {Range} range - Selection range.
     */
    positionAtSelection(range) {
      const rect = range.getBoundingClientRect();
      const toolbarRect = this.getBoundingClientRect();

      let top = rect.top - toolbarRect.height - 8;
      let left = rect.left + (rect.width / 2) - (toolbarRect.width / 2);

      // Keep within viewport
      if (top < 8) {
        top = rect.bottom + 8;
      }

      if (left < 8) {
        left = 8;
      } else if (left + toolbarRect.width > window.innerWidth - 8) {
        left = window.innerWidth - toolbarRect.width - 8;
      }

      this.style.top = `${top + window.scrollY}px`;
      this.style.left = `${left}px`;
    }

    /**
     * Update active states of formatting buttons.
     */
    updateActiveStates() {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);

      // Check for bold (<strong> or <b>)
      const boldBtn = this.querySelector('[data-command="bold"]');
      if (boldBtn) {
        const isActive = this.getParentTag(range, 'strong') || this.getParentTag(range, 'b');
        boldBtn.classList.toggle('bg-gray-700', !!isActive);
      }

      // Check for italic (<em> or <i>)
      const italicBtn = this.querySelector('[data-command="italic"]');
      if (italicBtn) {
        const isActive = this.getParentTag(range, 'em') || this.getParentTag(range, 'i');
        italicBtn.classList.toggle('bg-gray-700', !!isActive);
      }
    }

    /**
     * Execute a formatting command.
     *
     * @param {string} command - Command to execute.
     */
    executeCommand(command) {
      switch (command) {
        case 'bold':
          this.wrapSelection('strong');
          break;
        case 'italic':
          this.wrapSelection('em');
          break;
        case 'link':
          this.insertLink();
          break;
        case 'unlink':
          document.execCommand('unlink', false, null);
          break;
        case 'removeFormat':
          this.removeFormatting();
          break;
        default:
          document.execCommand(command, false, null);
      }

      this.updateActiveStates();
    }

    /**
     * Wrap selection with a semantic tag.
     *
     * @param {string} tagName - Tag name (e.g., 'strong', 'em').
     */
    wrapSelection(tagName) {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);

      // Check if already wrapped with this tag
      const parentTag = this.getParentTag(range, tagName);

      if (parentTag) {
        // Unwrap - remove the tag
        this.unwrapTag(parentTag);
      } else {
        // Wrap selection with the tag
        const wrapper = document.createElement(tagName);
        try {
          range.surroundContents(wrapper);
        } catch (e) {
          // If surroundContents fails (partial selection), use alternative method
          const contents = range.extractContents();
          wrapper.appendChild(contents);
          range.insertNode(wrapper);
        }

        // Restore selection
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(wrapper);
        selection.addRange(newRange);
      }

      // Trigger content update
      this.notifyContentChange();
    }

    /**
     * Get parent element with specific tag name.
     *
     * @param {Range} range - Selection range.
     * @param {string} tagName - Tag name to find.
     * @returns {HTMLElement|null}
     */
    getParentTag(range, tagName) {
      let node = range.commonAncestorContainer;

      // If text node, get parent
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
      }

      // Walk up to find the tag
      while (node && node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName.toLowerCase() === tagName.toLowerCase()) {
          return node;
        }
        // Stop at contenteditable boundary
        if (node.hasAttribute('contenteditable')) {
          break;
        }
        node = node.parentElement;
      }

      return null;
    }

    /**
     * Unwrap a tag, keeping its contents.
     *
     * @param {HTMLElement} element - Element to unwrap.
     */
    unwrapTag(element) {
      const parent = element.parentNode;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    }

    /**
     * Remove all formatting from selection.
     */
    removeFormatting() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const text = range.toString();

      // Delete the selected content and insert plain text
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);

      // Restore selection
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(textNode);
      selection.addRange(newRange);

      this.notifyContentChange();
    }

    /**
     * Notify that content has changed for state tracking.
     */
    notifyContentChange() {
      // Find the contenteditable parent and trigger an input event
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let node = range.commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) {
          node = node.parentElement;
        }
        const editable = node.closest('[contenteditable="true"]');
        if (editable) {
          editable.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }

    /**
     * Insert a link.
     */
    insertLink() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      // Check if already in a link
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const existingLink = container.nodeType === Node.ELEMENT_NODE
        ? container.closest('a')
        : container.parentElement?.closest('a');

      const currentUrl = existingLink ? existingLink.href : '';
      const url = prompt('Enter URL:', currentUrl);

      if (url !== null) {
        if (url.trim() === '') {
          document.execCommand('unlink', false, null);
        } else {
          // Ensure URL has protocol
          let finalUrl = url.trim();
          if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith('/')) {
            finalUrl = 'https://' + finalUrl;
          }
          document.execCommand('createLink', false, finalUrl);
        }
      }
    }

    show() {
      this.style.display = 'block';
      this.style.opacity = '1';
    }

    hide() {
      this.style.display = 'none';
      this.style.opacity = '0';
    }
  }

  // Register custom element
  customElements.define('pwc-rich-text-toolbar', RichTextToolbar);

})(Drupal);
