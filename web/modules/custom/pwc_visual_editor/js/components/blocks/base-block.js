/**
 * @file
 * Base block class that all blocks extend.
 *
 * Provides common functionality for selection, toolbar integration,
 * settings panel integration, and serialization.
 */

(function (Drupal) {
  'use strict';

  /**
   * Base class for all editor blocks.
   */
  class BaseBlock extends HTMLElement {
    // Static properties - override in subclasses
    static get blockName() { return 'base'; }
    static get blockTitle() { return 'Base Block'; }
    static get blockIcon() { return '▢'; }
    static get blockDescription() { return 'A base block component'; }
    static get blockSettings() { return []; }
    static get inlineEditable() { return []; }

    constructor() {
      super();
      this._isSelected = false;
      this._isInlineEditing = false; // Flag to prevent re-render during inline editing
      this._boundClickHandler = this.handleClick.bind(this);
      this._boundKeyHandler = this.handleKeydown.bind(this);
      this._dragFromHandle = false;
      this._dragStarted = false; // Track if drag actually started
    }

    /**
     * Called when element is added to DOM.
     */
    connectedCallback() {
      // Add click listener for selection
      this.addEventListener('click', this._boundClickHandler);
      this.addEventListener('keydown', this._boundKeyHandler);

      // Make focusable
      if (!this.hasAttribute('tabindex')) {
        this.setAttribute('tabindex', '0');
      }

      // Add block class
      this.classList.add('pwc-block');

      // Subscribe to state changes
      this._unsubscribeSelection = window.pwcEditorState.on('selectionChange', (data) => {
        if (data.blockId === this.blockId) {
          this.select();
        } else if (data.previousId === this.blockId) {
          this.deselect();
        }
      });

      // Initial render
      this.render();

      // Add hover controls after render (so they don't get overwritten)
      this.addHoverControls();
    }

    /**
     * Called when element is removed from DOM.
     */
    disconnectedCallback() {
      this.removeEventListener('click', this._boundClickHandler);
      this.removeEventListener('keydown', this._boundKeyHandler);

      if (this._unsubscribeSelection) {
        this._unsubscribeSelection();
      }
    }

    /**
     * Observed attributes.
     */
    static get observedAttributes() {
      return ['block-id'];
    }

    /**
     * Called when attributes change.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      // Skip re-render during inline editing to prevent focus loss
      if (this._isInlineEditing) {
        return;
      }
      if (oldValue !== newValue && this.isConnected) {
        this.render();
        this.addHoverControls();
      }
    }

    /**
     * Get block ID.
     */
    get blockId() {
      return this.getAttribute('block-id');
    }

    /**
     * Get block type.
     */
    get blockType() {
      return this.constructor.blockName;
    }

    /**
     * Check if block is selected.
     */
    get isSelected() {
      return this._isSelected;
    }

    /**
     * Handle click on block.
     */
    handleClick(event) {
      // Don't select if clicking on an editable area or inner block
      if (event.target.closest('[contenteditable="true"]')) {
        return;
      }

      // Don't bubble selection from inner blocks
      if (event.target.closest('.pwc-block') !== this) {
        return;
      }

      event.stopPropagation();

      if (window.pwcEditorState.isEditing) {
        window.pwcEditorState.selectBlock(this.blockId);
      }
    }

    /**
     * Handle keyboard events.
     */
    handleKeydown(event) {
      if (!this._isSelected) return;

      switch (event.key) {
        case 'Delete':
        case 'Backspace':
          if (!event.target.closest('[contenteditable="true"]')) {
            event.preventDefault();
            window.pwcEditorState.removeBlock(this.blockId);
          }
          break;
        case 'Escape':
          event.preventDefault();
          window.pwcEditorState.selectBlock(null);
          break;
        case 'ArrowUp':
          if (event.altKey) {
            event.preventDefault();
            window.pwcEditorState.moveBlock(this.blockId, -1);
          }
          break;
        case 'ArrowDown':
          if (event.altKey) {
            event.preventDefault();
            window.pwcEditorState.moveBlock(this.blockId, 1);
          }
          break;
      }
    }

    /**
     * Select this block.
     */
    select() {
      this._isSelected = true;
      this.classList.add('pwc-block--selected');
    }

    /**
     * Deselect this block.
     */
    deselect() {
      this._isSelected = false;
      this.classList.remove('pwc-block--selected');
    }

    /**
     * Add hover controls to block (drag handle + delete).
     */
    addHoverControls() {
      // Only add controls in edit mode
      if (!window.pwcEditorState || !window.pwcEditorState.isEditing) return;

      // Check if controls already exist
      if (this.querySelector('.pwc-block__controls')) return;

      const controls = document.createElement('div');
      controls.className = 'pwc-block__controls';
      controls.innerHTML = `
        <div class="pwc-block__drag-handle" title="Drag to reorder">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
        <div class="pwc-block__delete" title="Delete block">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </div>
      `;

      // Insert controls at the beginning of the block
      this.insertBefore(controls, this.firstChild);

      // Set up delete handler
      const deleteBtn = controls.querySelector('.pwc-block__delete');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showDeleteConfirmation();
      });

      // Set up drag handle - make block draggable
      const dragHandle = controls.querySelector('.pwc-block__drag-handle');

      // Make this block draggable
      this.setAttribute('draggable', 'true');

      // Only allow drag from the handle
      this.addEventListener('dragstart', (e) => {
        console.log('PWC Reorder: dragstart fired, _dragFromHandle =', this._dragFromHandle);

        // Only allow drag if it started from the drag handle
        if (!this._dragFromHandle) {
          console.log('PWC Reorder: Preventing drag - not from handle');
          e.preventDefault();
          return;
        }

        console.log('PWC Reorder: Starting drag operation for block', this.blockId);

        // Mark drag as started
        this._dragStarted = true;

        e.dataTransfer.setData('text/plain', this.blockId);
        e.dataTransfer.setData('application/x-pwc-block-reorder', this.blockId);
        e.dataTransfer.effectAllowed = 'move';

        // Set drag image to provide visual feedback
        if (e.dataTransfer.setDragImage) {
          e.dataTransfer.setDragImage(this, 20, 20);
        }

        // Add dragging class
        this.classList.add('pwc-block--dragging');
        document.body.classList.add('pwc-dragging-block');

        // Create drop zones for reordering
        this.createReorderDropZones();
      });

      this.addEventListener('dragend', (e) => {
        console.log('PWC Reorder: dragend fired, dropEffect =', e.dataTransfer.dropEffect, '_dragStarted =', this._dragStarted);

        // Only clean up if drag actually started
        if (this._dragStarted) {
          this.classList.remove('pwc-block--dragging');
          document.body.classList.remove('pwc-dragging-block');
          this.removeReorderDropZones();
        }

        // Reset flags
        this._dragFromHandle = false;
        this._dragStarted = false;
      });

      // Track if drag started from handle
      dragHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this._dragFromHandle = true;
        console.log('PWC Reorder: Drag handle mousedown, _dragFromHandle = true');
      });

      // Reset flag on mouseup anywhere (if drag didn't start)
      const resetDragFlag = (e) => {
        // Only reset if we're not currently dragging
        if (!this.classList.contains('pwc-block--dragging')) {
          this._dragFromHandle = false;
          console.log('PWC Reorder: Reset _dragFromHandle on mouseup');
        }
      };

      // Add mouseup listener to document to catch mouseup anywhere
      dragHandle.addEventListener('mousedown', () => {
        document.addEventListener('mouseup', resetDragFlag, { once: true });
      });
    }

    /**
     * Create drop zones for reordering blocks.
     */
    createReorderDropZones() {
      const contentRegion = document.querySelector('[data-pwc-content-region]');
      if (!contentRegion) return;

      // Add drop zone class to content region
      contentRegion.classList.add('pwc-drop-active');

      // Get all blocks as array
      const blocks = Array.from(contentRegion.querySelectorAll(':scope > .pwc-block'));
      const currentIndex = blocks.indexOf(this);

      console.log('PWC Reorder: Creating drop zones, currentIndex:', currentIndex, 'total blocks:', blocks.length);

      // Create drop zones at all valid positions
      // Valid positions are anywhere except:
      // - Right before the dragged block (would result in no change)
      // - Right after the dragged block (would result in no change)

      // Create drop zone at beginning (position 0) if we're not already first
      if (currentIndex > 0) {
        this.createDropZone(contentRegion, 0, blocks[0], 'before');
      }

      // Create drop zones between blocks
      for (let i = 0; i < blocks.length - 1; i++) {
        // Skip if this would place the block in its current position
        // Position i+1 means "after block i" which is same as "before block i+1"
        // If dragged block is at currentIndex:
        // - Dropping at position currentIndex would put it before itself (no change)
        // - Dropping at position currentIndex+1 would put it after itself (no change)
        if (i + 1 === currentIndex || i + 1 === currentIndex + 1) {
          continue;
        }

        this.createDropZone(contentRegion, i + 1, blocks[i], 'after');
      }

      // Create drop zone at end if we're not already last
      if (currentIndex < blocks.length - 1) {
        this.createDropZone(contentRegion, blocks.length, blocks[blocks.length - 1], 'after');
      }

      // Setup drop zone event listeners
      this.setupReorderDropZoneListeners();
    }

    /**
     * Create a single drop zone.
     */
    createDropZone(container, insertIndex, referenceElement, position) {
      const dropZone = document.createElement('div');
      dropZone.className = 'pwc-drop-zone pwc-drop-zone--reorder';
      if (insertIndex === 0) {
        dropZone.classList.add('pwc-drop-zone--first');
      }
      dropZone.dataset.insertIndex = String(insertIndex);

      if (position === 'before') {
        referenceElement.before(dropZone);
      } else {
        referenceElement.after(dropZone);
      }

      console.log('PWC Reorder: Created drop zone at index', insertIndex);
    }

    /**
     * Setup event listeners for reorder drop zones.
     */
    setupReorderDropZoneListeners() {
      const dropZones = document.querySelectorAll('.pwc-drop-zone--reorder');
      const blockId = this.blockId;
      const self = this;

      console.log('PWC Reorder: Setting up listeners for', dropZones.length, 'drop zones');

      dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          zone.classList.add('pwc-drop-zone--active');
        });

        zone.addEventListener('dragleave', (e) => {
          // Only remove active class if we're actually leaving the zone
          if (!zone.contains(e.relatedTarget)) {
            zone.classList.remove('pwc-drop-zone--active');
          }
        });

        zone.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();

          const newIndex = parseInt(zone.dataset.insertIndex, 10);
          console.log('PWC Reorder: Drop detected, moving block', blockId, 'to index', newIndex);

          // Move the block
          window.pwcEditorState.moveBlockToIndex(blockId, newIndex);

          // Clean up
          self.removeReorderDropZones();
          self.classList.remove('pwc-block--dragging');
          document.body.classList.remove('pwc-dragging-block');
        });
      });
    }

    /**
     * Remove reorder drop zones.
     */
    removeReorderDropZones() {
      const contentRegion = document.querySelector('[data-pwc-content-region]');
      if (contentRegion) {
        contentRegion.classList.remove('pwc-drop-active');
      }

      document.querySelectorAll('.pwc-drop-zone--reorder').forEach(zone => zone.remove());
      console.log('PWC Reorder: Drop zones removed');
    }

    /**
     * Show delete confirmation modal.
     */
    showDeleteConfirmation() {
      const blockTitle = this.constructor.blockTitle || 'Block';

      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.className = 'pwc-delete-modal-overlay';
      overlay.innerHTML = `
        <div class="pwc-delete-modal">
          <div class="pwc-delete-modal__header">
            <div class="pwc-delete-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 class="pwc-delete-modal__title">Delete ${blockTitle}</h3>
          </div>
          <div class="pwc-delete-modal__body">
            <p class="pwc-delete-modal__message">Are you sure you want to delete this block? This action cannot be undone.</p>
          </div>
          <div class="pwc-delete-modal__footer">
            <button class="pwc-delete-modal__btn pwc-delete-modal__btn--cancel" type="button">Cancel</button>
            <button class="pwc-delete-modal__btn pwc-delete-modal__btn--delete" type="button">Delete</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      // Handle cancel
      const cancelBtn = overlay.querySelector('.pwc-delete-modal__btn--cancel');
      cancelBtn.addEventListener('click', () => {
        overlay.remove();
      });

      // Handle delete
      const deleteBtn = overlay.querySelector('.pwc-delete-modal__btn--delete');
      deleteBtn.addEventListener('click', () => {
        overlay.remove();
        window.pwcEditorState.removeBlock(this.blockId);
      });

      // Handle click outside modal
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.remove();
        }
      });

      // Handle escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          overlay.remove();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);

      // Focus the cancel button for accessibility
      cancelBtn.focus();
    }

    /**
     * Render the block content.
     * Override in subclasses.
     */
    render() {
      // Default implementation - override in subclasses
      this.innerHTML = `<div class="pwc-block__content">Block content</div>`;
    }

    /**
     * Set up inline editing for editable elements.
     */
    setupInlineEditing() {
      const editables = this.querySelectorAll('[data-editable]');

      editables.forEach(el => {
        const fieldName = el.getAttribute('data-editable');

        // Handle input events
        el.addEventListener('input', (e) => {
          // Set flag to prevent re-render during editing
          this._isInlineEditing = true;

          const value = el.innerHTML;
          this.setAttribute(this.camelToKebab(fieldName), value);
          window.pwcEditorState.updateBlock(this.blockId, {
            [fieldName]: value,
          });

          // Reset flag after a microtask to allow attribute change to complete
          Promise.resolve().then(() => {
            this._isInlineEditing = false;
          });
        });

        // Handle paste - strip formatting
        el.addEventListener('paste', (e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        });

        // Handle focus - select block
        el.addEventListener('focus', () => {
          this._isInlineEditing = true;
          if (window.pwcEditorState.isEditing) {
            window.pwcEditorState.selectBlock(this.blockId);
          }
        });

        // Handle blur - reset flag
        el.addEventListener('blur', () => {
          this._isInlineEditing = false;
        });
      });
    }

    /**
     * Convert block to JSON for serialization.
     */
    toJSON() {
      const attributes = {};

      // Get settings and extract values
      const settings = this.constructor.blockSettings || [];
      settings.forEach(setting => {
        const attrName = this.camelToKebab(setting.name);
        const value = this.getAttribute(attrName);
        if (value !== null) {
          // Try to parse as JSON for objects/arrays
          if (setting.type === 'array' || setting.type === 'object') {
            try {
              attributes[setting.name] = JSON.parse(value);
            } catch (e) {
              attributes[setting.name] = value;
            }
          } else if (setting.type === 'boolean') {
            attributes[setting.name] = value === 'true';
          } else {
            attributes[setting.name] = value;
          }
        }
      });

      const data = {
        type: this.blockType,
        id: this.blockId,
        attributes,
      };

      // Handle inner blocks for container types
      if (this.hasAttribute('has-inner-blocks')) {
        data.innerBlocks = this.getInnerBlocksData();
      }

      return data;
    }

    /**
     * Get inner blocks data (for container blocks).
     */
    getInnerBlocksData() {
      const innerBlocks = [];
      const innerContainer = this.querySelector('.pwc-inner-blocks');

      if (innerContainer) {
        const blocks = innerContainer.querySelectorAll(':scope > .pwc-block');
        blocks.forEach(block => {
          if (block.toJSON) {
            innerBlocks.push(block.toJSON());
          }
        });
      }

      return innerBlocks;
    }

    /**
     * Convert camelCase to kebab-case.
     */
    camelToKebab(str) {
      return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Convert kebab-case to camelCase.
     */
    kebabToCamel(str) {
      return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }
  }

  // Expose to global scope
  window.PwcBaseBlock = BaseBlock;

  // Expose to Drupal namespace
  Drupal.pwcVisualEditor = Drupal.pwcVisualEditor || {};
  Drupal.pwcVisualEditor.BaseBlock = BaseBlock;

})(Drupal);
