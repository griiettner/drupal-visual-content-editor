/**
 * @file
 * Rich text toolbar Web Component.
 *
 * Floating toolbar that appears on text selection for formatting.
 * Supports bold, italic, text color, highlight, font size, link, unlink, and eraser.
 */

(function (Drupal) {
  'use strict';

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  const INLINE_TEXT_COLORS = [
    { value: '', hex: '#ffffff', label: 'Default' },
    { value: 'ap-text-neutral-13', hex: '#757575', label: 'Gray' },
    { value: 'ap-text-red', hex: '#e0301e', label: 'Red' },
    { value: 'ap-text-orange', hex: '#d04a02', label: 'Orange' },
    { value: 'ap-text-tangerine', hex: '#eb8c00', label: 'Amber' },
    { value: 'ap-text-green-dark', hex: '#2c8646', label: 'Green' },
    { value: 'ap-text-primary-teal-07', hex: '#26776d', label: 'Teal' },
    { value: 'ap-text-blue-dark', hex: '#0060d7', label: 'Blue' },
    { value: 'ap-text-primary-blue-04', hex: '#415385', label: 'Indigo' },
    { value: 'ap-text-purple-dark', hex: '#6b2cda', label: 'Purple' },
    { value: 'ap-text-primary-pink-05', hex: '#d93954', label: 'Pink' },
    { value: 'ap-text-neutral-23', hex: '#000000', label: 'Black' },
  ];

  const INLINE_HIGHLIGHT_COLORS = [
    { value: '', hex: 'transparent', label: 'None' },
    { value: 'ap-bg-yellow-lighter', hex: '#ffecbd', label: 'Yellow' },
    { value: 'ap-bg-green-lighter', hex: '#c4fc9f', label: 'Lime' },
    { value: 'ap-bg-states-success-01', hex: '#d3ebd5', label: 'Green' },
    { value: 'ap-bg-primary-teal-01', hex: '#d4ebe9', label: 'Cyan' },
    { value: 'ap-bg-blue-lighter', hex: '#b3dcf9', label: 'Blue' },
    { value: 'ap-bg-purple-lighter', hex: '#dcb4fc', label: 'Violet' },
    { value: 'ap-bg-primary-pink-01', hex: '#f8dde1', label: 'Pink' },
    { value: 'ap-bg-primary-orange-01', hex: '#fedacc', label: 'Orange' },
    { value: 'ap-bg-primary-red-01', hex: '#f9d6d2', label: 'Red' },
  ];

  const INLINE_FONT_SIZES = [
    { value: '', label: 'Default' },
    { value: 'ap-font-12', label: 'XS' },
    { value: 'ap-font-14', label: 'SM' },
    { value: 'ap-font-16', label: 'Base' },
    { value: 'ap-font-18', label: 'LG' },
    { value: 'ap-font-20', label: 'XL' },
    { value: 'ap-font-24', label: '2XL' },
  ];

  // Regex patterns (no g flag — create fresh for each .replace())
  const TEXT_COLOR_PATTERN = /\bap-text-(?:neutral-\d+|primary-(?:blue|orange|teal|red|pink)-\d+|(?:orange|tangerine|yellow|red|rose|gray|purple|blue|green)(?:-(?:darker|dark|light|lighter))?)\b/;
  const HIGHLIGHT_PATTERN = /\bap-bg-(?:neutral-\d+|primary-(?:blue|orange|teal|red|pink)-\d+|states-(?:success|warning|error)-\d+|(?:orange|tangerine|yellow|red|rose|gray|purple|blue|green)(?:-(?:darker|dark|light|lighter))?)\b/;
  const FONT_SIZE_PATTERN = /\bap-font-\d+\b/;

  // ---------------------------------------------------------------------------
  // Component
  // ---------------------------------------------------------------------------

  class RichTextToolbar extends HTMLElement {
    constructor() {
      super();
      this._boundSelectionChange = this.handleSelectionChange.bind(this);
      this._boundDocumentMousedown = this._onDocumentMousedown.bind(this);
    }

    connectedCallback() {
      this.render();
      this.hide();
      document.addEventListener('selectionchange', this._boundSelectionChange);
      document.addEventListener('mousedown', this._boundDocumentMousedown);
    }

    disconnectedCallback() {
      document.removeEventListener('selectionchange', this._boundSelectionChange);
      document.removeEventListener('mousedown', this._boundDocumentMousedown);
    }

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    render() {
      this.innerHTML = `
        <div class="pwc-rich-toolbar">
          <!-- Bold -->
          <button type="button" class="pwc-rich-toolbar__btn pwc-u-icon-btn pwc-u-icon-btn--dark pwc-u-icon-btn--compact" data-command="bold" title="Bold (Ctrl+B)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 2.83 6.83A4 4 0 0 1 15 20H6V4zm2 2v5h6a2 2 0 1 0 0-4H8zm0 7v5h7a2 2 0 1 0 0-4H8z"/></svg>
          </button>

          <!-- Italic -->
          <button type="button" class="pwc-rich-toolbar__btn pwc-u-icon-btn pwc-u-icon-btn--dark pwc-u-icon-btn--compact" data-command="italic" title="Italic (Ctrl+I)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v2h2.21l-3.42 12H6v2h8v-2h-2.21l3.42-12H18V4z"/></svg>
          </button>

          <!-- Divider -->
          <div class="pwc-rich-toolbar__divider"></div>

          <!-- Text Color -->
          <div class="pwc-rich-toolbar__dropdown-wrap">
            <button type="button" class="pwc-rich-toolbar__btn pwc-u-icon-btn pwc-u-icon-btn--dark pwc-u-icon-btn--compact" data-dropdown="textColor" title="Text Color">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 2 5.5 16h2.25l1.12-3h6.25l1.12 3h2.25L13 2h-2zm-1.38 9L12 4.67 14.38 11H9.62z"/>
                <rect data-bar="textColor" x="3" y="18" width="18" height="4" rx="1" fill="#ffffff"/>
              </svg>
            </button>
            <div class="pwc-rich-toolbar__dropdown-panel" data-dropdown-panel="textColor">
              <div class="pwc-rich-toolbar__swatch-grid">
                ${INLINE_TEXT_COLORS.map(c => `
                  <button type="button"
                    class="pwc-rich-toolbar__swatch"
                    data-inline-class="${c.value}"
                    data-class-type="textColor"
                    title="${c.label}"
                    style="background:${c.value ? c.hex : '#ffffff'};${!c.value ? 'background:linear-gradient(135deg,#fff 40%,#dc2626 40%,#dc2626 60%,#fff 60%)' : ''}">
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Highlight -->
          <div class="pwc-rich-toolbar__dropdown-wrap">
            <button type="button" class="pwc-rich-toolbar__btn pwc-u-icon-btn pwc-u-icon-btn--dark pwc-u-icon-btn--compact" data-dropdown="highlight" title="Highlight Color">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.5 1.15c-.53 0-1.04.19-1.43.58l-5.81 5.82 7.19 7.19 5.81-5.82c.78-.78.78-2.05 0-2.83l-4.33-4.36c-.39-.39-.91-.58-1.43-.58zM2 17l6.16-6.16 7 7L9 24H2v-7z"/>
                <rect data-bar="highlight" x="3" y="18" width="18" height="4" rx="1" fill="transparent"/>
              </svg>
            </button>
            <div class="pwc-rich-toolbar__dropdown-panel" data-dropdown-panel="highlight">
              <div class="pwc-rich-toolbar__swatch-grid">
                ${INLINE_HIGHLIGHT_COLORS.map(c => `
                  <button type="button"
                    class="pwc-rich-toolbar__swatch"
                    data-inline-class="${c.value}"
                    data-class-type="highlight"
                    title="${c.label}"
                    style="background:${c.hex};${!c.value ? 'background:linear-gradient(135deg,#fff 45%,#ef4444 45%,#ef4444 55%,#fff 55%)' : ''}">
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Font Size -->
          <div class="pwc-rich-toolbar__dropdown-wrap">
            <button type="button" class="pwc-rich-toolbar__btn pwc-u-icon-btn pwc-u-icon-btn--dark pwc-u-icon-btn--compact" data-dropdown="fontSize" title="Font Size">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 4v2h4v14h2V6h4V4H2zm10 0v2h3v14h2V6h3V4h-8z"/>
              </svg>
            </button>
            <div class="pwc-rich-toolbar__dropdown-panel" data-dropdown-panel="fontSize">
              <div class="pwc-rich-toolbar__size-options">
                ${INLINE_FONT_SIZES.map(s => `
                  <button type="button"
                    class="pwc-rich-toolbar__size-option pwc-u-picker-btn"
                    data-inline-class="${s.value}"
                    data-class-type="fontSize"
                    title="${s.label}">
                    ${s.label}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="pwc-rich-toolbar__divider"></div>

          <!-- Link -->
          <button type="button" class="pwc-rich-toolbar__btn pwc-u-icon-btn pwc-u-icon-btn--dark pwc-u-icon-btn--compact" data-command="link" title="Add link (Ctrl+K)">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
          </button>

          <!-- Unlink -->
          <button type="button" class="pwc-rich-toolbar__btn pwc-u-icon-btn pwc-u-icon-btn--dark pwc-u-icon-btn--compact" data-command="unlink" title="Remove link">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
            </svg>
          </button>

          <!-- Divider -->
          <div class="pwc-rich-toolbar__divider"></div>

          <!-- Eraser -->
          <button type="button" class="pwc-rich-toolbar__btn pwc-u-icon-btn pwc-u-icon-btn--dark pwc-u-icon-btn--compact" data-command="eraseAll" title="Clear all formatting">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 4.5l-15 15m0 0h7.5m-7.5 0v-7.5"/>
            </svg>
          </button>
        </div>
      `;

      this.setupEventListeners();
    }

    // -----------------------------------------------------------------------
    // Event Listeners
    // -----------------------------------------------------------------------

    setupEventListeners() {
      const toolbar = this.querySelector('.pwc-rich-toolbar');

      // Prevent all mousedowns inside toolbar from stealing selection
      toolbar.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });

      // Command buttons (bold, italic, link, unlink, eraseAll)
      toolbar.addEventListener('click', (e) => {
        const cmdBtn = e.target.closest('[data-command]');
        if (cmdBtn) {
          this.executeCommand(cmdBtn.getAttribute('data-command'));
          return;
        }

        const dropdownTrigger = e.target.closest('[data-dropdown]');
        if (dropdownTrigger) {
          this.toggleDropdown(dropdownTrigger.getAttribute('data-dropdown'));
          return;
        }

        const inlineBtn = e.target.closest('[data-inline-class]');
        if (inlineBtn) {
          const classToAdd = inlineBtn.getAttribute('data-inline-class');
          const classType = inlineBtn.getAttribute('data-class-type');
          this.applyInlineClass(classToAdd, classType);
          this.closeAllDropdowns();
          return;
        }
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

    /**
     * Close dropdowns when clicking outside the toolbar.
     */
    _onDocumentMousedown(e) {
      if (!this.contains(e.target)) {
        this.closeAllDropdowns();
      }
    }

    // -----------------------------------------------------------------------
    // Selection Change
    // -----------------------------------------------------------------------

    handleSelectionChange() {
      if (!window.pwcEditorState.isEditing) {
        this.hide();
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        this.hide();
        return;
      }

      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const editableParent = container.nodeType === Node.ELEMENT_NODE
        ? container.closest('[contenteditable="true"]')
        : container.parentElement?.closest('[contenteditable="true"]');

      if (!editableParent) {
        this.hide();
        return;
      }

      this.positionAtSelection(range);
      this.show();
      this.updateActiveStates();
    }

    // -----------------------------------------------------------------------
    // Positioning — Block / Layout Anchoring
    // -----------------------------------------------------------------------

    positionAtSelection(range) {
      // Walk up from range to find the block element
      let node = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
      }

      const block = node ? node.closest('pwc-heading, pwc-paragraph, pwc-list') : null;
      let target = null;

      if (block) {
        // Check if block is inside a layout
        const layout = block.closest('pwc-layout');
        target = layout || block;
      }

      const toolbarEl = this.querySelector('.pwc-rich-toolbar');
      if (!toolbarEl) return;

      let top, left;

      if (target) {
        const targetRect = target.getBoundingClientRect();
        const toolbarWidth = toolbarEl.offsetWidth || 400;
        const toolbarHeight = toolbarEl.offsetHeight || 40;

        top = targetRect.top - toolbarHeight - 8;
        left = targetRect.left + (targetRect.width / 2) - (toolbarWidth / 2);

        // Viewport clamping
        if (top < 8) {
          top = targetRect.bottom + 8;
        }
        if (left < 8) {
          left = 8;
        } else if (left + toolbarWidth > window.innerWidth - 8) {
          left = window.innerWidth - toolbarWidth - 8;
        }
      } else {
        // Fallback: range-based positioning
        const rect = range.getBoundingClientRect();
        const toolbarWidth = toolbarEl.offsetWidth || 400;
        const toolbarHeight = toolbarEl.offsetHeight || 40;

        top = rect.top - toolbarHeight - 8;
        left = rect.left + (rect.width / 2) - (toolbarWidth / 2);

        if (top < 8) {
          top = rect.bottom + 8;
        }
        if (left < 8) {
          left = 8;
        } else if (left + toolbarWidth > window.innerWidth - 8) {
          left = window.innerWidth - toolbarWidth - 8;
        }
      }

      this.style.top = `${top + window.scrollY}px`;
      this.style.left = `${left}px`;
    }

    // -----------------------------------------------------------------------
    // Dropdown Mechanics
    // -----------------------------------------------------------------------

    toggleDropdown(name) {
      const panel = this.querySelector(`[data-dropdown-panel="${name}"]`);
      if (!panel) return;

      const isOpen = panel.classList.contains('pwc-rich-toolbar__dropdown-panel--open');

      // Close all first
      this.closeAllDropdowns();

      if (!isOpen) {
        panel.classList.add('pwc-rich-toolbar__dropdown-panel--open');
        this.updateDropdownActiveStates(name);
      }
    }

    closeAllDropdowns() {
      this.querySelectorAll('.pwc-rich-toolbar__dropdown-panel').forEach(p => {
        p.classList.remove('pwc-rich-toolbar__dropdown-panel--open');
      });
    }

    /**
     * Mark the active swatch/size option inside an open dropdown.
     */
    updateDropdownActiveStates(name) {
      const panel = this.querySelector(`[data-dropdown-panel="${name}"]`);
      if (!panel) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);

      let activeClass = '';

      if (name === 'textColor') {
        const span = this.getParentSpanWithPattern(range, TEXT_COLOR_PATTERN);
        if (span) {
          const match = span.className.match(TEXT_COLOR_PATTERN);
          if (match) activeClass = match[0];
        }
      } else if (name === 'highlight') {
        const span = this.getParentSpanWithPattern(range, HIGHLIGHT_PATTERN);
        if (span) {
          const match = span.className.match(HIGHLIGHT_PATTERN);
          if (match) activeClass = match[0];
        }
      } else if (name === 'fontSize') {
        const span = this.getParentSpanWithPattern(range, FONT_SIZE_PATTERN);
        if (span) {
          const match = span.className.match(FONT_SIZE_PATTERN);
          if (match) activeClass = match[0];
        }
      }

      // Mark active item
      panel.querySelectorAll('[data-inline-class]').forEach(btn => {
        const val = btn.getAttribute('data-inline-class');
        if (name === 'fontSize') {
          btn.classList.toggle('pwc-rich-toolbar__size-option--active', val === activeClass);
        } else {
          btn.classList.toggle('pwc-rich-toolbar__swatch--active', val === activeClass);
        }
      });
    }

    // -----------------------------------------------------------------------
    // Active States
    // -----------------------------------------------------------------------

    updateActiveStates() {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);

      // Bold
      const boldBtn = this.querySelector('[data-command="bold"]');
      if (boldBtn) {
        const isActive = this.getParentTag(range, 'strong') || this.getParentTag(range, 'b');
        boldBtn.classList.toggle('pwc-rich-toolbar__btn--active', !!isActive);
      }

      // Italic
      const italicBtn = this.querySelector('[data-command="italic"]');
      if (italicBtn) {
        const isActive = this.getParentTag(range, 'em') || this.getParentTag(range, 'i');
        italicBtn.classList.toggle('pwc-rich-toolbar__btn--active', !!isActive);
      }

      // Text color bar
      const textBar = this.querySelector('[data-bar="textColor"]');
      if (textBar) {
        const span = this.getParentSpanWithPattern(range, TEXT_COLOR_PATTERN);
        let hex = '#ffffff';
        if (span) {
          const match = span.className.match(TEXT_COLOR_PATTERN);
          if (match) {
            const entry = INLINE_TEXT_COLORS.find(c => c.value === match[0]);
            if (entry) hex = entry.hex;
          }
        }
        textBar.setAttribute('fill', hex);
      }

      // Highlight color bar
      const hlBar = this.querySelector('[data-bar="highlight"]');
      if (hlBar) {
        const span = this.getParentSpanWithPattern(range, HIGHLIGHT_PATTERN);
        let hex = 'transparent';
        if (span) {
          const match = span.className.match(HIGHLIGHT_PATTERN);
          if (match) {
            const entry = INLINE_HIGHLIGHT_COLORS.find(c => c.value === match[0]);
            if (entry) hex = entry.hex;
          }
        }
        hlBar.setAttribute('fill', hex);
      }
    }

    // -----------------------------------------------------------------------
    // Execute Command
    // -----------------------------------------------------------------------

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
        case 'eraseAll':
          this.removeFormatting();
          break;
        default:
          document.execCommand(command, false, null);
      }
      this.updateActiveStates();
    }

    // -----------------------------------------------------------------------
    // Inline Class Application
    // -----------------------------------------------------------------------

    /**
     * Apply an inline class (text color, highlight, font size) to the current selection.
     *
     * @param {string} classToAdd - The Appkit4 class to apply (empty string to remove).
     * @param {string} classType  - One of 'textColor', 'highlight', 'fontSize'.
     */
    applyInlineClass(classToAdd, classType) {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const pattern = this._getPattern(classType);
      if (!pattern) return;

      // Check if selection is already inside a span with this class type
      const existingSpan = this.getParentSpanWithPattern(range, pattern);

      if (existingSpan) {
        // Replace or remove the matching class
        let classes = existingSpan.className;
        classes = classes.replace(pattern, '').trim();

        if (classToAdd) {
          classes = classes ? classes + ' ' + classToAdd : classToAdd;
        }

        if (classes) {
          existingSpan.className = classes.replace(/\s+/g, ' ').trim();
        } else {
          // No classes left — unwrap the span
          this.unwrapTag(existingSpan);
        }
      } else if (classToAdd) {
        // Check if selection is entirely within an existing <span> that doesn't match this pattern
        const parentSpan = this._getAncestorSpan(range);

        if (parentSpan && this._selectionWithinNode(range, parentSpan)) {
          // Add the new class to the existing span
          parentSpan.classList.add(classToAdd);
        } else {
          // Wrap selection in a new span
          const span = document.createElement('span');
          span.className = classToAdd;
          try {
            range.surroundContents(span);
          } catch (e) {
            const contents = range.extractContents();
            span.appendChild(contents);
            range.insertNode(span);
          }

          // Restore selection
          selection.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          selection.addRange(newRange);
        }
      }

      this.notifyContentChange();
      this.updateActiveStates();
    }

    /**
     * Returns the regex pattern for a given class type.
     */
    _getPattern(classType) {
      switch (classType) {
        case 'textColor': return TEXT_COLOR_PATTERN;
        case 'highlight': return HIGHLIGHT_PATTERN;
        case 'fontSize': return FONT_SIZE_PATTERN;
        default: return null;
      }
    }

    /**
     * Walk up the DOM from the range to find a <span> whose className matches the pattern.
     * Stops at the contenteditable boundary.
     */
    getParentSpanWithPattern(range, pattern) {
      let node = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
      }
      while (node && node.nodeType === Node.ELEMENT_NODE) {
        if (node.hasAttribute && node.hasAttribute('contenteditable')) break;
        if (node.tagName === 'SPAN' && pattern.test(node.className)) {
          return node;
        }
        node = node.parentElement;
      }
      return null;
    }

    /**
     * Find the nearest ancestor <span> (regardless of its classes).
     */
    _getAncestorSpan(range) {
      let node = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
      }
      while (node && node.nodeType === Node.ELEMENT_NODE) {
        if (node.hasAttribute && node.hasAttribute('contenteditable')) break;
        if (node.tagName === 'SPAN') return node;
        node = node.parentElement;
      }
      return null;
    }

    /**
     * Check if the selection range is entirely within a given node.
     */
    _selectionWithinNode(range, node) {
      return node.contains(range.startContainer) && node.contains(range.endContainer);
    }

    // -----------------------------------------------------------------------
    // Wrap / Unwrap Helpers
    // -----------------------------------------------------------------------

    wrapSelection(tagName) {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const parentTag = this.getParentTag(range, tagName);

      if (parentTag) {
        this.unwrapTag(parentTag);
      } else {
        const wrapper = document.createElement(tagName);
        try {
          range.surroundContents(wrapper);
        } catch (e) {
          const contents = range.extractContents();
          wrapper.appendChild(contents);
          range.insertNode(wrapper);
        }
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(wrapper);
        selection.addRange(newRange);
      }

      this.notifyContentChange();
    }

    getParentTag(range, tagName) {
      let node = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
      }
      while (node && node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName.toLowerCase() === tagName.toLowerCase()) {
          return node;
        }
        if (node.hasAttribute('contenteditable')) break;
        node = node.parentElement;
      }
      return null;
    }

    unwrapTag(element) {
      const parent = element.parentNode;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    }

    // -----------------------------------------------------------------------
    // Remove Formatting (Eraser)
    // -----------------------------------------------------------------------

    removeFormatting() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const text = range.toString();

      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);

      // Lift textNode out of any inline formatting wrappers
      const inlineTags = new Set(['SPAN', 'STRONG', 'B', 'EM', 'I', 'A', 'U', 'S', 'MARK']);

      while (textNode.parentElement &&
             inlineTags.has(textNode.parentElement.tagName) &&
             !textNode.parentElement.hasAttribute('contenteditable')) {
        const wrapper = textNode.parentElement;
        const parent = wrapper.parentNode;

        // Collect sibling nodes that come after textNode inside the wrapper
        const afterNodes = [];
        let sibling = textNode.nextSibling;
        while (sibling) {
          afterNodes.push(sibling);
          sibling = sibling.nextSibling;
        }

        // Move textNode out, placing it right after the wrapper
        parent.insertBefore(textNode, wrapper.nextSibling);

        // If there were nodes after textNode, clone the wrapper for them
        if (afterNodes.length > 0) {
          const clone = wrapper.cloneNode(false);
          afterNodes.forEach(n => clone.appendChild(n));
          parent.insertBefore(clone, textNode.nextSibling);
        }

        // Remove wrapper if it's now empty
        if (!wrapper.textContent) {
          parent.removeChild(wrapper);
        }
      }

      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(textNode);
      selection.addRange(newRange);

      this.notifyContentChange();
    }

    // -----------------------------------------------------------------------
    // Link
    // -----------------------------------------------------------------------

    insertLink() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

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
          let finalUrl = url.trim();
          if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith('/')) {
            finalUrl = 'https://' + finalUrl;
          }
          document.execCommand('createLink', false, finalUrl);
        }
      }
    }

    // -----------------------------------------------------------------------
    // Content Change Notification
    // -----------------------------------------------------------------------

    notifyContentChange() {
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

    // -----------------------------------------------------------------------
    // Show / Hide
    // -----------------------------------------------------------------------

    show() {
      this.style.display = 'block';
      this.style.opacity = '1';
    }

    hide() {
      this.style.display = 'none';
      this.style.opacity = '0';
      this.closeAllDropdowns();
    }
  }

  customElements.define('pwc-rich-text-toolbar', RichTextToolbar);

})(Drupal);
