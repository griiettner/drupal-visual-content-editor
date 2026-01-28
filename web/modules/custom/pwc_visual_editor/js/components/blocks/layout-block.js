/**
 * @file
 * Layout Block Web Component.
 *
 * A container block that provides column-based layouts for nesting other blocks.
 * Extends BaseBlock for common functionality like selection and toolbar.
 */

(function (Drupal) {
  'use strict';

  // PWC Layout Block loaded

  // BaseBlock should be available since it's loaded first in libraries.yml
  const BaseBlock = window.PwcBaseBlock;

  if (!BaseBlock) {
    console.error('PWC Layout Block: BaseBlock not found. Make sure base-block.js loads before layout-block.js');
    return;
  }

  class LayoutBlock extends BaseBlock {
    // Static getters for block registry
    static get blockName() { return 'layout'; }
    static get blockTitle() { return 'Layout'; }
    static get blockIcon() { return '▦'; }
    static get blockDescription() { return 'Create column-based layouts to organize content'; }
    static get blockCategory() { return 'layout'; }

    // Layout variations with their column configurations
    // Using flex-grow ratios instead of fixed percentages
    static get layoutVariations() {
      return {
        '100': {
          label: '100',
          columns: [{ flex: 1 }],
        },
        '50-50': {
          label: '50 / 50',
          columns: [{ flex: 1 }, { flex: 1 }],
        },
        '30-70': {
          label: '30 / 70',
          columns: [{ flex: 3 }, { flex: 7 }],
        },
        '70-30': {
          label: '70 / 30',
          columns: [{ flex: 7 }, { flex: 3 }],
        },
        '33-33-33': {
          label: '33 / 33 / 33',
          columns: [{ flex: 1 }, { flex: 1 }, { flex: 1 }],
        },
        '25-50-25': {
          label: '25 / 50 / 25',
          columns: [{ flex: 1 }, { flex: 2 }, { flex: 1 }],
        },
      };
    }

    static get blockSettings() {
      return [
        {
          name: 'layout',
          type: 'select',
          label: 'Layout',
          options: [
            { value: '100', label: '100% (Full Width)' },
            { value: '50-50', label: '50 / 50' },
            { value: '30-70', label: '30 / 70' },
            { value: '70-30', label: '70 / 30' },
            { value: '33-33-33', label: '33 / 33 / 33' },
            { value: '25-50-25', label: '25 / 50 / 25' },
          ],
          default: '100',
        },
        {
          name: 'gap',
          type: 'select',
          label: 'Column Gap',
          options: [
            { value: 'none', label: 'None' },
            { value: 'small', label: 'Small (8px)' },
            { value: 'medium', label: 'Medium (16px)' },
            { value: 'large', label: 'Large (24px)' },
          ],
          default: 'medium',
        },
        {
          name: 'verticalAlign',
          type: 'select',
          label: 'Vertical Alignment',
          options: [
            { value: 'top', label: 'Top' },
            { value: 'center', label: 'Center' },
            { value: 'bottom', label: 'Bottom' },
            { value: 'stretch', label: 'Stretch' },
          ],
          default: 'top',
        },
      ];
    }

    constructor() {
      super();
      this._innerBlocksData = [];
    }

    /**
     * Override addHoverControls to use custom layout handle instead.
     * This prevents the base block's visual controls but still sets up drag.
     */
    addHoverControls() {
      // Don't add the default hover controls for layout blocks
      // We use the custom pwc-layout-controls instead
      // But we DO need to make the block draggable for reordering

      if (!window.pwcEditorState || !window.pwcEditorState.isEditing) return;

      // Make this block draggable (the handle will control when drag is allowed)
      this.setAttribute('draggable', 'true');

      // Set up drag events on the layout block itself
      this._setupLayoutBlockDrag();
    }

    /**
     * Set up drag events on the layout block.
     */
    _setupLayoutBlockDrag() {
      // Skip if already set up
      if (this._layoutDragSetup) return;
      this._layoutDragSetup = true;

      // Drag start - only allow if initiated from handle
      this.addEventListener('dragstart', (e) => {
        // Don't interfere with child block drags - only handle drags on this layout itself
        if (e.target !== this && !e.target.classList.contains('pwc-layout-handle')) {
          return; // Let the event continue to propagate, don't prevent it
        }

        if (!this._dragFromLayoutHandle) {
          e.preventDefault();
          return;
        }

        e.dataTransfer.setData('text/plain', this.blockId);
        e.dataTransfer.setData('application/x-pwc-block-reorder', this.blockId);
        e.dataTransfer.effectAllowed = 'move';

        // Set drag image
        try {
          const layoutBlock = this.querySelector('.pwc-layout-block');
          if (layoutBlock && e.dataTransfer.setDragImage) {
            e.dataTransfer.setDragImage(layoutBlock, 50, 20);
          }
        } catch (err) {
          // Ignore drag image errors
        }

        this.classList.add('pwc-block--dragging');
        document.body.classList.add('pwc-reordering');

        // Create drop zones
        setTimeout(() => this.createReorderDropZones(), 10);
      });

      // Drag end
      this.addEventListener('dragend', (e) => {
        this.classList.remove('pwc-block--dragging');
        document.body.classList.remove('pwc-reordering');
        this.removeReorderDropZones();
        this._dragFromLayoutHandle = false;
      });
    }

    get layout() {
      return this.getAttribute('layout') || '100';
    }

    get gap() {
      return this.getAttribute('gap') || 'medium';
    }

    get verticalAlign() {
      return this.getAttribute('vertical-align') || 'top';
    }

    static get observedAttributes() {
      return ['layout', 'gap', 'vertical-align', 'block-id', 'block-type'];
    }

    /**
     * Render the layout block content.
     */
    render() {
      const layoutConfig = LayoutBlock.layoutVariations[this.layout] || LayoutBlock.layoutVariations['100'];
      const columns = layoutConfig.columns;
      const isEditing = window.pwcEditorState && window.pwcEditorState.isEditing;

      // Get gap value in pixels
      const gapValues = {
        'none': '0',
        'small': '8px',
        'medium': '16px',
        'large': '24px',
      };
      const gapValue = gapValues[this.gap] || '16px';

      // Get vertical alignment
      const alignValues = {
        'top': 'flex-start',
        'center': 'center',
        'bottom': 'flex-end',
        'stretch': 'stretch',
      };
      const alignValue = alignValues[this.verticalAlign] || 'flex-start';

      // Build columns HTML
      let columnsHtml = columns.map((col, index) => {
        const columnBlocks = this.getColumnBlocks(index);
        const hasBlocks = columnBlocks.length > 0;

        return `
          <div class="pwc-layout-column"
               style="flex: ${col.flex} 0 0;"
               data-column-index="${index}"
               data-layout-id="${this.blockId}">
            <div class="pwc-layout-column__content">
              <!-- Blocks will be rendered here -->
              ${!hasBlocks && isEditing ? `
                <div class="pwc-layout-column__empty">
                  <span class="pwc-layout-column__empty-text">Drop blocks here</span>
                </div>
              ` : ''}
            </div>
            ${isEditing ? `
              <button type="button" class="pwc-layout-column__add-btn" data-column="${index}" title="Add block to this column">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
                </svg>
              </button>
            ` : ''}
          </div>
        `;
      }).join('');

      this.innerHTML = `
        <div class="pwc-layout-block pwc-layout-block--${this.layout}"
             style="gap: ${gapValue}; align-items: ${alignValue};">
          ${columnsHtml}
        </div>
        ${isEditing ? `
          <div class="pwc-layout-controls">
            <div class="pwc-layout-handle" title="Drag to reorder">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
            <div class="pwc-layout-delete" title="Delete layout">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </div>
          </div>
        ` : ''}
      `;

      // Render inner blocks into their columns
      this.renderInnerBlocks();

      // Set up event handlers
      if (isEditing) {
        this.setupAddButtons();
        this.setupColumnDropZones();
        this.setupLayoutDragHandle();
      }
    }

    /**
     * Set up the layout controls (drag handle and delete).
     */
    setupLayoutDragHandle() {
      const handle = this.querySelector('.pwc-layout-handle');
      const deleteBtn = this.querySelector('.pwc-layout-delete');

      if (!handle) {
        return;
      }

      // Remove draggable from handle - the BLOCK is draggable, not the handle
      handle.removeAttribute('draggable');

      // Handle mousedown sets the flag to allow drag
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this._dragFromLayoutHandle = true;

        // Reset flag on mouseup anywhere if drag didn't start
        const resetFlag = () => {
          if (!this.classList.contains('pwc-block--dragging')) {
            this._dragFromLayoutHandle = false;
          }
        };
        document.addEventListener('mouseup', resetFlag, { once: true });
      });

      // Delete button
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (confirm('Delete this layout and all its contents?')) {
            window.pwcEditorState.removeBlock(this.blockId);
          }
        });
      }
    }

    /**
     * Create drop zones for reordering this layout.
     * Uses the same class names as base block for consistency.
     */
    createReorderDropZones() {
      const contentRegion = document.querySelector('[data-pwc-content-region]');
      if (!contentRegion) {
        return;
      }

      // Add drop-active class to content region
      contentRegion.classList.add('pwc-drop-active');

      // Get all top-level blocks (direct children that are pwc-* elements)
      const blocks = Array.from(contentRegion.children).filter(el =>
        el.tagName && el.tagName.toLowerCase().startsWith('pwc-')
      );
      const currentIndex = blocks.indexOf(this);

      // Create drop zone at beginning if not already first
      if (currentIndex > 0 && blocks.length > 0) {
        const firstZone = document.createElement('div');
        firstZone.className = 'pwc-drop-zone pwc-drop-zone--reorder pwc-drop-zone--first';
        firstZone.dataset.insertIndex = '0';
        contentRegion.insertBefore(firstZone, blocks[0]);
      }

      // Create drop zones between blocks (skip adjacent to current position)
      for (let i = 0; i < blocks.length - 1; i++) {
        if (i + 1 === currentIndex || i + 1 === currentIndex + 1) {
          continue;
        }
        const zone = document.createElement('div');
        zone.className = 'pwc-drop-zone pwc-drop-zone--reorder';
        zone.dataset.insertIndex = String(i + 1);
        blocks[i].after(zone);
      }

      // Create drop zone at end if not already last
      if (currentIndex < blocks.length - 1 && blocks.length > 0) {
        const endZone = document.createElement('div');
        endZone.className = 'pwc-drop-zone pwc-drop-zone--reorder';
        endZone.dataset.insertIndex = String(blocks.length);
        blocks[blocks.length - 1].after(endZone);
      }

      // Add delegated event handler on content region
      this._contentRegionDragHandler = this._createLayoutDragHandler(contentRegion);
      contentRegion.addEventListener('dragover', this._contentRegionDragHandler, true);
      contentRegion.addEventListener('drop', this._contentRegionDragHandler, true);

      // Set up drop zone listeners
      this.setupReorderDropZoneListeners();
    }

    /**
     * Create a delegated handler for content region drag events (layout reordering).
     */
    _createLayoutDragHandler(contentRegion) {
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
          window.pwcEditorState.moveBlockToIndex(blockId, newIndex);

          // Clean up
          self.removeReorderDropZones();
          self.classList.remove('pwc-block--dragging');
          document.body.classList.remove('pwc-reordering');
        }
      };
    }

    /**
     * Set up listeners for reorder drop zones.
     */
    setupReorderDropZoneListeners() {
      const zones = document.querySelectorAll('.pwc-drop-zone--reorder');

      zones.forEach(zone => {
        // Use capture phase for reliability
        const dragoverHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          e.dataTransfer.dropEffect = 'move';
          zone.classList.add('pwc-drop-zone--active');
        };

        const dragleaveHandler = (e) => {
          if (!zone.contains(e.relatedTarget)) {
            zone.classList.remove('pwc-drop-zone--active');
          }
        };

        const dropHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          const targetIndex = parseInt(zone.dataset.insertIndex, 10);
          window.pwcEditorState.moveBlockToIndex(this.blockId, targetIndex);
          zone.classList.remove('pwc-drop-zone--active');

          // Clean up
          this.removeReorderDropZones();
          this.classList.remove('pwc-block--dragging');
          document.body.classList.remove('pwc-reordering');
        };

        zone.addEventListener('dragover', dragoverHandler, true);
        zone.addEventListener('dragleave', dragleaveHandler, true);
        zone.addEventListener('drop', dropHandler.bind(this), true);
      });
    }

    /**
     * Remove reorder drop zones.
     */
    removeReorderDropZones() {
      const contentRegion = document.querySelector('[data-pwc-content-region]');
      if (contentRegion) {
        contentRegion.classList.remove('pwc-drop-active');

        // Remove content region drag handler
        if (this._contentRegionDragHandler) {
          contentRegion.removeEventListener('dragover', this._contentRegionDragHandler, true);
          contentRegion.removeEventListener('drop', this._contentRegionDragHandler, true);
          this._contentRegionDragHandler = null;
        }
      }

      document.querySelectorAll('.pwc-drop-zone--reorder').forEach(zone => zone.remove());
    }

    getColumnBlocks(columnIndex) {
      // Get blocks assigned to this column from inner blocks data
      const blockData = window.pwcEditorState?.findBlock(this.blockId);
      if (!blockData || !blockData.innerBlocks) return [];

      return blockData.innerBlocks.filter(block => {
        return (block.attributes?.columnIndex || 0) === columnIndex;
      });
    }

    renderInnerBlocks() {
      // Try to get inner blocks from editor state first, then fall back to element data
      let innerBlocks = null;

      // Method 1: Get from editor state
      const blockData = window.pwcEditorState?.findBlock(this.blockId);
      if (blockData && blockData.innerBlocks) {
        innerBlocks = blockData.innerBlocks;
      }

      // Method 2: Fall back to element's _innerBlocksData (set during createBlock)
      if (!innerBlocks && this._innerBlocksData) {
        innerBlocks = this._innerBlocksData;
      }

      if (!innerBlocks || innerBlocks.length === 0) {
        return;
      }

      // Group blocks by column
      const blocksByColumn = {};
      innerBlocks.forEach(innerBlockData => {
        const columnIndex = innerBlockData.attributes?.columnIndex || 0;
        if (!blocksByColumn[columnIndex]) {
          blocksByColumn[columnIndex] = [];
        }
        blocksByColumn[columnIndex].push(innerBlockData);
      });

      // Render blocks into each column
      Object.entries(blocksByColumn).forEach(([columnIndex, blocks]) => {
        const column = this.querySelector(`[data-column-index="${columnIndex}"] .pwc-layout-column__content`);
        if (!column || !window.pwcBlockRegistry) return;

        // Remove empty state if present
        const emptyState = column.querySelector('.pwc-layout-column__empty');
        if (emptyState) emptyState.remove();

        // Render each block in the column
        blocks.forEach(innerBlockData => {
          const blockElement = window.pwcBlockRegistry.createBlock(innerBlockData);
          if (blockElement) {
            column.appendChild(blockElement);
          }
        });
      });
    }

    setupAddButtons() {
      this.querySelectorAll('.pwc-layout-column__add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const columnIndex = parseInt(btn.dataset.column, 10);
          this.openBlockLibraryForColumn(columnIndex);
        });
      });
    }

    /**
     * Set up drag and drop for columns.
     */
    setupColumnDropZones() {
      const columns = this.querySelectorAll('.pwc-layout-column');

      columns.forEach(column => {
        const columnIndex = parseInt(column.dataset.columnIndex, 10);
        const content = column.querySelector('.pwc-layout-column__content');

        // Dragover - show drop indicator
        column.addEventListener('dragover', (e) => {
          // Check if we're reordering blocks (not adding new ones)
          const isReordering = e.dataTransfer.types.includes('application/x-pwc-block-reorder');

          // If reordering, check if the event originated from or should go to a drop zone
          if (isReordering) {
            // Check if target or any ancestor is a drop zone
            const dropZone = e.target.closest('.pwc-drop-zone--reorder');
            if (dropZone) {
              // Let the drop zone handle it - don't interfere
              return;
            }
            // If reordering but not over a drop zone, don't show column highlight
            // Just allow the event to continue
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            return;
          }

          // Not reordering - this is a new block being added
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'copy';
          column.classList.add('pwc-layout-column--drag-over');
        });

        // Dragleave - hide drop indicator
        column.addEventListener('dragleave', (e) => {
          // Only remove if leaving the column entirely
          if (!column.contains(e.relatedTarget)) {
            column.classList.remove('pwc-layout-column--drag-over');
          }
        });

        // Drop - insert block
        column.addEventListener('drop', (e) => {
          // Check if we're reordering blocks (not adding new ones)
          const isReordering = e.dataTransfer.types.includes('application/x-pwc-block-reorder');

          // If reordering, check if a drop zone should handle this
          if (isReordering) {
            const dropZone = e.target.closest('.pwc-drop-zone--reorder');
            if (dropZone) {
              // Let the drop zone handle it
              return;
            }
            // Reordering but not on a drop zone - ignore
            e.preventDefault();
            return;
          }

          e.preventDefault();
          e.stopPropagation();
          column.classList.remove('pwc-layout-column--drag-over');

          const blockType = e.dataTransfer.getData('text/plain');
          const layoutVariation = e.dataTransfer.getData('layout-variation');

          if (blockType) {
            // Create block data
            let blockData;
            if (blockType === 'layout' && layoutVariation) {
              blockData = window.pwcBlockRegistry.createBlockData('layout');
              if (blockData) {
                blockData.attributes.layout = layoutVariation;
                blockData.innerBlocks = [];
              }
            } else {
              blockData = window.pwcBlockRegistry.createBlockData(blockType);
            }

            if (blockData) {
              this.addBlockToColumn(blockData, columnIndex);
            }
          }
        });
      });
    }

    openBlockLibraryForColumn(columnIndex) {
      // Open the block library panel with context for inserting into this column
      let blockLibraryPanel = window.pwcBlockLibraryPanel || document.querySelector('pwc-block-library-panel');

      if (blockLibraryPanel) {
        // Set the insert context to this layout's column
        blockLibraryPanel.setInsertPosition(-1, this.blockId, columnIndex);
        blockLibraryPanel.open();
      }
    }

    /**
     * Add a block to a specific column.
     */
    addBlockToColumn(blockData, columnIndex) {
      // Set the column index on the block
      blockData.attributes = blockData.attributes || {};
      blockData.attributes.columnIndex = columnIndex;

      // Add to inner blocks
      const layoutBlockData = window.pwcEditorState?.findBlock(this.blockId);
      if (layoutBlockData) {
        layoutBlockData.innerBlocks = layoutBlockData.innerBlocks || [];
        layoutBlockData.innerBlocks.push(blockData);
        window.pwcEditorState.isDirty = true;
        window.pwcEditorState.pushHistory();
        window.pwcEditorState.emit('blockAdd', { block: blockData, parentId: this.blockId });
      }

      // Re-render this layout block
      this.render();
      this.addHoverControls();

      // Select the new block
      setTimeout(() => {
        window.pwcEditorState.selectBlock(blockData.id);
      }, 50);
    }
  }

  // Register custom element
  customElements.define('pwc-layout', LayoutBlock);

  // Register with block registry
  if (window.pwcBlockRegistry) {
    window.pwcBlockRegistry.register(LayoutBlock);
  }

  // Expose class
  window.PwcLayoutBlock = LayoutBlock;

})(Drupal);
