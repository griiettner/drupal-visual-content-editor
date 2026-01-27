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
      const commands = ['bold', 'italic'];

      commands.forEach(cmd => {
        const btn = this.querySelector(`[data-command="${cmd}"]`);
        if (btn) {
          const isActive = document.queryCommandState(cmd);
          btn.classList.toggle('bg-gray-700', isActive);
        }
      });
    }

    /**
     * Execute a formatting command.
     *
     * @param {string} command - Command to execute.
     */
    executeCommand(command) {
      switch (command) {
        case 'link':
          this.insertLink();
          break;
        case 'unlink':
          document.execCommand('unlink', false, null);
          break;
        default:
          document.execCommand(command, false, null);
      }

      this.updateActiveStates();
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
