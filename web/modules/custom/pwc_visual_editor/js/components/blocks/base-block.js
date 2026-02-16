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

      if (this._controlsPositionHandler) {
        window.removeEventListener('resize', this._controlsPositionHandler);
        window.removeEventListener('scroll', this._controlsPositionHandler);
        this._controlsPositionHandler = null;
      }

      if (this._controlsBodyObserver) {
        this._controlsBodyObserver.disconnect();
        this._controlsBodyObserver = null;
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
     * Add hover controls to block (indicator + drag handle + delete).
     * Non-container blocks: indicator on RIGHT (top: 0, right: 0)
     */
    addHoverControls() {
      // Only add controls in edit mode
      if (!window.pwcEditorState || !window.pwcEditorState.isEditing) {
        return;
      }

      // Check if controls already exist
      if (this.querySelector('.pwc-block__controls')) {
        return;
      }

      // Create small indicator (10x10) - shown on block hover, triggers controls on indicator hover
      const indicator = document.createElement('div');
      indicator.className = 'pwc-block__indicator';
      indicator.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="4"/>
        </svg>
      `;

      // Create full controls (hidden by default, shown on indicator hover)
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

      // Insert indicator first, then controls (indicator + controls must be adjacent for CSS sibling selector)
      this.insertBefore(controls, this.firstChild);
      this.insertBefore(indicator, this.firstChild);

      // Set up delete handler
      const deleteBtn = controls.querySelector('.pwc-block__delete');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showDeleteConfirmation();
      });

      // Set up drag handle - make block draggable
      const dragHandle = controls.querySelector('.pwc-block__drag-handle');

      // Make this block draggable (only once)
      this.setAttribute('draggable', 'true');

      // Set up drag events only once (check flag to prevent duplicates)
      if (!this._dragEventsSetup) {
        this._dragEventsSetup = true;

        // Only allow drag from the handle
        this.addEventListener('dragstart', (e) => {
          // Only allow drag if it started from the drag handle
          if (!this._dragFromHandle) {
            e.preventDefault();
            return;
          }

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
          setTimeout(() => {
            this.createReorderDropZones();
          }, 0);
        });

        this.addEventListener('dragend', () => {
          // Only clean up if drag actually started
          if (this._dragStarted) {
            try {
              this.classList.remove('pwc-block--dragging');
              this.removeReorderDropZones();
            } catch (err) {
              // Element may have been removed during drop
            }
            document.body.classList.remove('pwc-dragging-block');
          }

          // Reset flags
          this._dragFromHandle = false;
          this._dragStarted = false;
        });
      }

      // Track if drag started from handle (new listener for new handle element)
      dragHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this._dragFromHandle = true;
      });

      // Reset flag on mouseup anywhere (if drag didn't start)
      const resetDragFlag = () => {
        // Only reset if we're not currently dragging
        if (!this.classList.contains('pwc-block--dragging')) {
          this._dragFromHandle = false;
        }
      };

      // Add mouseup listener to document to catch mouseup anywhere
      dragHandle.addEventListener('mousedown', () => {
        document.addEventListener('mouseup', resetDragFlag, { once: true });
      });

      // Position controls based on viewport edge detection
      this.positionBlockControls();

      // Set up listener to reposition on resize/scroll if not already done
      if (!this._controlsPositionHandler) {
        this._controlsPositionHandler = () => this.positionBlockControls();
        window.addEventListener('resize', this._controlsPositionHandler);
        window.addEventListener('scroll', this._controlsPositionHandler, { passive: true });

        // Also observe body class changes for panel open/close
        this._controlsBodyObserver = new MutationObserver(() => {
          if (this.isConnected) {
            this.positionBlockControls();
            setTimeout(() => this.positionBlockControls(), 350);
          }
        });
        this._controlsBodyObserver.observe(document.body, {
          attributes: true,
          attributeFilter: ['class'],
        });
      }
    }

    /**
     * Position block controls inside if at viewport edge.
     * Regular blocks have controls on the left, so check left edge.
     */
    positionBlockControls() {
      const controls = this.querySelector('.pwc-block__controls');
      if (!controls) return;

      const rect = this.getBoundingClientRect();
      const controlsWidth = 50; // Width of controls + buffer

      // Reset class
      controls.classList.remove('pwc-block__controls--inside');

      // Check if left edge is at or beyond viewport edge
      if (rect.left < controlsWidth) {
        controls.classList.add('pwc-block__controls--inside');
      }
    }

    /**
     * Check if this block is inside a layout column.
     */
    getParentLayoutInfo() {
      const column = this.closest('.pwc-layout-column');
      if (!column) return null;

      const layout = column.closest('pwc-layout');
      if (!layout) return null;

      return {
        layoutId: layout.getAttribute('block-id'),
        columnIndex: parseInt(column.dataset.columnIndex, 10),
        columnElement: column.querySelector('.pwc-layout-column__content')
      };
    }

    /**
     * Create drop zones for reordering blocks.
     * Creates drop zones at ALL valid positions: top-level and all layout columns.
     */
    createReorderDropZones() {
      // Defensive cleanup: remove any existing drop zones first
      document.querySelectorAll('.pwc-drop-zone--reorder').forEach(zone => zone.remove());
      document.querySelectorAll('.pwc-drop-active').forEach(el => el.classList.remove('pwc-drop-active'));

      const parentInfo = this.getParentLayoutInfo();

      // Always create top-level drop zones
      this.createTopLevelReorderDropZones();

      // Create drop zones in all layout columns
      // (circular reference check in moveBlockCrossContainer prevents dropping into self/descendants)
      this.createAllColumnDropZones(parentInfo);

      // Create drop zones in all accordion sections (unless dragging an accordion block)
      if (this.tagName.toLowerCase() !== 'pwc-accordion') {
        this.createAllAccordionSectionDropZones();
      }

      // Create drop zones in all tab sections (unless dragging a tab block)
      if (this.tagName.toLowerCase() !== 'pwc-tab') {
        this.createAllTabSectionDropZones();
      }

      // Setup event listeners for all drop zones
      this.setupReorderDropZoneListeners();
    }

    /**
     * Create drop zones in ALL layout columns across the document.
     *
     * @param {Object|null} currentParentInfo - Parent layout info of the dragged block, if any.
     */
    createAllColumnDropZones(currentParentInfo) {
      const allLayouts = document.querySelectorAll('pwc-layout');
      this._allColumnDragHandlers = [];

      allLayouts.forEach(layoutEl => {
        const layoutId = layoutEl.getAttribute('block-id');
        // Only select this layout's own columns using data-layout-id attribute
        // This works for both standard and hero mode layouts
        const columns = layoutEl.querySelectorAll(`.pwc-layout-column[data-layout-id="${layoutId}"]`);

        columns.forEach(column => {
          const columnIndex = parseInt(column.dataset.columnIndex, 10);
          const columnContent = column.querySelector('.pwc-layout-column__content');
          if (!columnContent) return;

          // Mark the column as an active drop target
          columnContent.classList.add('pwc-drop-active');

          // Get all blocks in this column
          const blocks = Array.from(columnContent.querySelectorAll(':scope > .pwc-block'));

          // Determine the current index of the dragged block within this column
          const currentIndex = blocks.indexOf(this);

          // Create drop zone at beginning
          if (currentIndex !== 0) {
            if (blocks.length > 0) {
              this.createDropZone(columnContent, 0, blocks[0], 'before', layoutId, columnIndex);
            } else {
              // Empty column - create a single drop zone
              const dropZone = document.createElement('div');
              dropZone.className = 'pwc-drop-zone pwc-drop-zone--reorder pwc-drop-zone--first';
              dropZone.dataset.insertIndex = '0';
              dropZone.dataset.layoutId = layoutId;
              dropZone.dataset.columnIndex = String(columnIndex);
              columnContent.appendChild(dropZone);
            }
          }

          // Create drop zones between blocks
          for (let i = 0; i < blocks.length - 1; i++) {
            if (currentIndex >= 0 && (i + 1 === currentIndex || i + 1 === currentIndex + 1)) {
              continue;
            }
            this.createDropZone(columnContent, i + 1, blocks[i], 'after', layoutId, columnIndex);
          }

          // Create drop zone at end
          if (blocks.length > 0 && currentIndex < blocks.length - 1) {
            this.createDropZone(columnContent, blocks.length, blocks[blocks.length - 1], 'after', layoutId, columnIndex);
          }

          // Add delegated drag handler on column content
          const handler = this._createContentRegionDragHandler(columnContent);
          columnContent.addEventListener('dragover', handler, true);
          columnContent.addEventListener('drop', handler, true);
          this._allColumnDragHandlers.push({ element: columnContent, handler });
        });
      });
    }

    /**
     * Create drop zones in ALL accordion sections across the document.
     */
    createAllAccordionSectionDropZones() {
      const allAccordions = document.querySelectorAll('pwc-accordion');
      if (!this._allColumnDragHandlers) {
        this._allColumnDragHandlers = [];
      }

      allAccordions.forEach(accordionEl => {
        const accordionId = accordionEl.getAttribute('block-id');
        const sections = accordionEl.querySelectorAll(':scope .pwc-accordion-section__body');

        sections.forEach(sectionBody => {
          const sectionIndex = parseInt(sectionBody.dataset.accordionIndex, 10);
          const sectionContent = sectionBody.querySelector('.pwc-accordion-section__content');
          if (!sectionContent) return;

          // Mark the section as an active drop target
          sectionContent.classList.add('pwc-drop-active');

          // Get all blocks in this section
          const blocks = Array.from(sectionContent.querySelectorAll(':scope > .pwc-block'));

          // Determine the current index of the dragged block within this section
          const currentIndex = blocks.indexOf(this);

          // Create drop zone at beginning
          if (currentIndex !== 0) {
            if (blocks.length > 0) {
              this.createDropZone(sectionContent, 0, blocks[0], 'before', accordionId, sectionIndex);
            } else {
              // Empty section - create a single drop zone
              const dropZone = document.createElement('div');
              dropZone.className = 'pwc-drop-zone pwc-drop-zone--reorder pwc-drop-zone--first';
              dropZone.dataset.insertIndex = '0';
              dropZone.dataset.layoutId = accordionId;
              dropZone.dataset.columnIndex = String(sectionIndex);
              sectionContent.appendChild(dropZone);
            }
          }

          // Create drop zones between blocks
          for (let i = 0; i < blocks.length - 1; i++) {
            if (currentIndex >= 0 && (i + 1 === currentIndex || i + 1 === currentIndex + 1)) {
              continue;
            }
            this.createDropZone(sectionContent, i + 1, blocks[i], 'after', accordionId, sectionIndex);
          }

          // Create drop zone at end
          if (blocks.length > 0 && currentIndex < blocks.length - 1) {
            this.createDropZone(sectionContent, blocks.length, blocks[blocks.length - 1], 'after', accordionId, sectionIndex);
          }

          // Add delegated drag handler on section content
          const handler = this._createContentRegionDragHandler(sectionContent);
          sectionContent.addEventListener('dragover', handler, true);
          sectionContent.addEventListener('drop', handler, true);
          this._allColumnDragHandlers.push({ element: sectionContent, handler });
        });
      });
    }

    /**
     * Create drop zones in ALL tab sections across the document.
     */
    createAllTabSectionDropZones() {
      const allTabs = document.querySelectorAll('pwc-tab');
      if (!this._allColumnDragHandlers) {
        this._allColumnDragHandlers = [];
      }

      allTabs.forEach(tabEl => {
        const tabId = tabEl.getAttribute('block-id');
        const sections = tabEl.querySelectorAll(':scope .pwc-tab-section__body');

        sections.forEach(sectionBody => {
          const sectionIndex = parseInt(sectionBody.dataset.tabIndex, 10);
          const sectionContent = sectionBody.querySelector('.pwc-tab-section__content');
          if (!sectionContent) return;

          // Mark the section as an active drop target
          sectionContent.classList.add('pwc-drop-active');

          // Get all blocks in this section
          const blocks = Array.from(sectionContent.querySelectorAll(':scope > .pwc-block'));

          // Determine the current index of the dragged block within this section
          const currentIndex = blocks.indexOf(this);

          // Create drop zone at beginning
          if (currentIndex !== 0) {
            if (blocks.length > 0) {
              this.createDropZone(sectionContent, 0, blocks[0], 'before', tabId, sectionIndex);
            } else {
              // Empty section - create a single drop zone
              const dropZone = document.createElement('div');
              dropZone.className = 'pwc-drop-zone pwc-drop-zone--reorder pwc-drop-zone--first';
              dropZone.dataset.insertIndex = '0';
              dropZone.dataset.layoutId = tabId;
              dropZone.dataset.columnIndex = String(sectionIndex);
              sectionContent.appendChild(dropZone);
            }
          }

          // Create drop zones between blocks
          for (let i = 0; i < blocks.length - 1; i++) {
            if (currentIndex >= 0 && (i + 1 === currentIndex || i + 1 === currentIndex + 1)) {
              continue;
            }
            this.createDropZone(sectionContent, i + 1, blocks[i], 'after', tabId, sectionIndex);
          }

          // Create drop zone at end
          if (blocks.length > 0 && currentIndex < blocks.length - 1) {
            this.createDropZone(sectionContent, blocks.length, blocks[blocks.length - 1], 'after', tabId, sectionIndex);
          }

          // Add delegated drag handler on section content
          const handler = this._createContentRegionDragHandler(sectionContent);
          sectionContent.addEventListener('dragover', handler, true);
          sectionContent.addEventListener('drop', handler, true);
          this._allColumnDragHandlers.push({ element: sectionContent, handler });
        });
      });
    }

    /**
     * Create drop zones for top-level block reordering.
     */
    createTopLevelReorderDropZones() {
      const contentRegion = document.querySelector('[data-pwc-content-region]');
      if (!contentRegion) return;

      // Add drop zone class to content region
      contentRegion.classList.add('pwc-drop-active');

      // Get all blocks as array
      const blocks = Array.from(contentRegion.querySelectorAll(':scope > .pwc-block'));
      const currentIndex = blocks.indexOf(this);

      // Create drop zone at beginning (position 0) if we're not already first
      if (currentIndex !== 0) {
        this.createDropZone(contentRegion, 0, blocks[0], 'before');
      }

      // Create drop zones between blocks
      for (let i = 0; i < blocks.length - 1; i++) {
        if (currentIndex >= 0 && (i + 1 === currentIndex || i + 1 === currentIndex + 1)) {
          continue;
        }
        this.createDropZone(contentRegion, i + 1, blocks[i], 'after');
      }

      // Create drop zone at end if we're not already last
      if (currentIndex < blocks.length - 1) {
        this.createDropZone(contentRegion, blocks.length, blocks[blocks.length - 1], 'after');
      }

      // Add delegated event handler on content region for drag events
      this._contentRegionDragHandler = this._createContentRegionDragHandler(contentRegion);
      contentRegion.addEventListener('dragover', this._contentRegionDragHandler, true);
      contentRegion.addEventListener('drop', this._contentRegionDragHandler, true);
    }

    /**
     * Create a delegated handler for content region drag events.
     */
    _createContentRegionDragHandler(contentRegion) {
      const self = this;
      const blockId = this.blockId;

      return function(e) {
        // Check if we're over a drop zone
        const dropZone = e.target.closest('.pwc-drop-zone--reorder');
        if (!dropZone) return; // Not over a drop zone

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (e.type === 'dragover') {
          e.dataTransfer.dropEffect = 'move';
          // Add active class to this zone, remove from others
          document.querySelectorAll('.pwc-drop-zone--reorder').forEach(z => {
            z.classList.toggle('pwc-drop-zone--active', z === dropZone);
          });
        } else if (e.type === 'drop') {
          const newIndex = parseInt(dropZone.dataset.insertIndex, 10);
          const targetLayoutId = dropZone.dataset.layoutId || null;
          const targetColumnIndex = dropZone.dataset.columnIndex !== undefined
            ? parseInt(dropZone.dataset.columnIndex, 10) : null;

          // Clean up BEFORE moving (moveBlockCrossContainer triggers re-render which destroys elements)
          try {
            self.removeReorderDropZones();
            self.classList.remove('pwc-block--dragging');
          } catch (err) {
            // Element may already be gone
          }
          document.body.classList.remove('pwc-dragging-block');

          // Now move the block (this triggers re-render)
          window.pwcEditorState.moveBlockCrossContainer(blockId, {
            layoutId: targetLayoutId,
            columnIndex: targetColumnIndex,
            insertIndex: newIndex,
          });
        }
      };
    }

    /**
     * Create a single drop zone.
     */
    createDropZone(container, insertIndex, referenceElement, position, layoutId = null, columnIndex = null) {
      const dropZone = document.createElement('div');
      dropZone.className = 'pwc-drop-zone pwc-drop-zone--reorder';
      if (insertIndex === 0) {
        dropZone.classList.add('pwc-drop-zone--first');
      }
      dropZone.dataset.insertIndex = String(insertIndex);

      // Add layout info if this is a nested block
      if (layoutId !== null) {
        dropZone.dataset.layoutId = layoutId;
        dropZone.dataset.columnIndex = String(columnIndex);
      }

      // Use insertBefore for more reliable DOM insertion
      const parent = referenceElement.parentNode;
      if (position === 'before') {
        parent.insertBefore(dropZone, referenceElement);
      } else {
        // Insert after = insert before the next sibling
        parent.insertBefore(dropZone, referenceElement.nextSibling);
      }
    }

    /**
     * Setup event listeners for reorder drop zones.
     * Uses event capturing to ensure drop zones receive events before parent elements.
     */
    setupReorderDropZoneListeners() {
      const dropZones = document.querySelectorAll('.pwc-drop-zone--reorder');
      const blockId = this.blockId;
      const self = this;

      dropZones.forEach((zone) => {
        // Use capture phase (true) to ensure we receive events before parents
        const dragoverHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          e.dataTransfer.dropEffect = 'move';
          zone.classList.add('pwc-drop-zone--active');
        };

        const dragleaveHandler = (e) => {
          // Only remove active class if we're actually leaving the zone
          if (!zone.contains(e.relatedTarget)) {
            zone.classList.remove('pwc-drop-zone--active');
          }
        };

        const dropHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          const newIndex = parseInt(zone.dataset.insertIndex, 10);
          const targetLayoutId = zone.dataset.layoutId || null;
          const targetColumnIndex = zone.dataset.columnIndex !== undefined
            ? parseInt(zone.dataset.columnIndex, 10) : null;

          // Clean up BEFORE moving (moveBlockCrossContainer triggers re-render which destroys elements)
          try {
            self.removeReorderDropZones();
            self.classList.remove('pwc-block--dragging');
          } catch (err) {
            // Element may already be gone
          }
          document.body.classList.remove('pwc-dragging-block');

          // Now move the block (this triggers re-render)
          window.pwcEditorState.moveBlockCrossContainer(blockId, {
            layoutId: targetLayoutId,
            columnIndex: targetColumnIndex,
            insertIndex: newIndex,
          });
        };

        // Add listeners with capture = true to intercept events first
        zone.addEventListener('dragover', dragoverHandler, true);
        zone.addEventListener('dragleave', dragleaveHandler, true);
        zone.addEventListener('drop', dropHandler, true);

        // Also add in bubbling phase as backup
        zone.addEventListener('dragover', dragoverHandler, false);
        zone.addEventListener('dragleave', dragleaveHandler, false);
        zone.addEventListener('drop', dropHandler, false);
      });
    }

    /**
     * Remove reorder drop zones.
     */
    removeReorderDropZones() {
      try {
        const contentRegion = document.querySelector('[data-pwc-content-region]');
        if (contentRegion) {
          contentRegion.classList.remove('pwc-drop-active');

          // Remove content region drag handler if set
          if (this._contentRegionDragHandler) {
            contentRegion.removeEventListener('dragover', this._contentRegionDragHandler, true);
            contentRegion.removeEventListener('drop', this._contentRegionDragHandler, true);
            this._contentRegionDragHandler = null;
          }
        }

        // Remove all cross-container column drag handlers
        if (this._allColumnDragHandlers) {
          this._allColumnDragHandlers.forEach(({ element, handler }) => {
            try {
              element.removeEventListener('dragover', handler, true);
              element.removeEventListener('drop', handler, true);
            } catch (err) {
              // Element may have been removed
            }
          });
          this._allColumnDragHandlers = null;
        }

        // Remove pwc-drop-active from all column content and accordion section elements
        document.querySelectorAll('.pwc-layout-column__content.pwc-drop-active').forEach(col => {
          col.classList.remove('pwc-drop-active');
        });
        document.querySelectorAll('.pwc-accordion-section__content.pwc-drop-active').forEach(col => {
          col.classList.remove('pwc-drop-active');
        });
        document.querySelectorAll('.pwc-tab-section__content.pwc-drop-active').forEach(col => {
          col.classList.remove('pwc-drop-active');
        });

        document.querySelectorAll('.pwc-drop-zone--reorder').forEach(zone => zone.remove());
      } catch (err) {
        // Cleanup errors should not break the UI
        console.warn('Error during drop zone cleanup:', err);
      }
    }

    /**
     * Show delete confirmation modal.
     *
     * @param {string} customMessage - Optional custom message for the modal body.
     */
    showDeleteConfirmation(customMessage = null) {
      const blockTitle = this.constructor.blockTitle || 'Block';
      const message = customMessage || 'Are you sure you want to delete this block? This action cannot be undone.';

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
            <p class="pwc-delete-modal__message">${message}</p>
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
