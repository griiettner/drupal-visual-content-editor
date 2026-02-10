/**
 * @file
 * Editor state management service.
 *
 * Manages the state of the visual editor including:
 * - Edit mode (on/off)
 * - Selected block
 * - Block data
 * - Undo/redo history
 */

(function (Drupal) {
  'use strict';

  /**
   * Editor state singleton.
   */
  class EditorState {
    constructor() {
      this.isEditing = false;
      this.selectedBlockId = null;
      this.blocks = [];
      this.history = [];
      this.historyIndex = -1;
      this.isDirty = false;
      this.listeners = new Map();
    }

    /**
     * Initialize the editor state.
     *
     * @param {Array} initialBlocks - Initial block data.
     */
    init(initialBlocks = []) {
      // Filter out unknown block types
      this.blocks = this.filterValidBlocks(initialBlocks);
      this.isDirty = false;
      this.pushHistory();
    }

    /**
     * Filter out blocks with unknown types.
     *
     * @param {Array} blocks - Blocks to filter.
     * @returns {Array} Filtered blocks with only valid types.
     */
    filterValidBlocks(blocks) {
      if (!window.pwcBlockRegistry) return blocks;

      return blocks.filter(block => {
        const isValid = window.pwcBlockRegistry.get(block.type) !== null;
        if (!isValid) {
          console.warn(`PWC Editor State: Removing block with unknown type "${block.type}" from content`);
        }
        // Also filter innerBlocks recursively
        if (isValid && block.innerBlocks) {
          block.innerBlocks = this.filterValidBlocks(block.innerBlocks);
        }
        return isValid;
      });
    }

    /**
     * Initialize the editor with full options.
     *
     * @param {Object} options - Initialization options.
     */
    initialize(options = {}) {
      // Filter out unknown block types
      this.blocks = this.filterValidBlocks(options.blocks || []);
      this.isEditing = options.isEditing || false;
      this.isNewPage = options.isNewPage || false;
      this.nodeId = options.nodeId || null;
      this.isDirty = false;
      this.pushHistory();

      if (this.isEditing) {
        document.body.classList.add('pwc-editing');
        this.emit('editModeChange', { isEditing: true });
      }

      // Render the content region
      this.renderContentRegion();
    }

    /**
     * Get the current state for saving.
     *
     * @returns {Object} Current state with blocks.
     */
    getState() {
      return {
        version: '1.0',
        blocks: this.blocks,
      };
    }

    /**
     * Render blocks in the content region.
     */
    renderContentRegion() {
      const contentRegion = document.querySelector('[data-pwc-content-region]');
      if (!contentRegion) return;

      // Clear existing content
      contentRegion.innerHTML = '';

      // Render blocks
      if (this.blocks.length === 0 && this.isEditing) {
        // Empty state with Add Block button (matches editor.js design).
        contentRegion.innerHTML = `
          <div class="pwc-empty-state pwc-u-flex-col pwc-u-items-center pwc-u-justify-center" role="status" aria-live="polite">
            <div class="pwc-empty-state__icon-wrap">
              <svg class="pwc-empty-state__icon ap-text-color-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <p class="pwc-empty-state__title">No content yet</p>
            <p class="pwc-empty-state__text">Start by adding your first block.</p>
            <button type="button" class="pwc-empty-state__add-btn pwc-u-btn pwc-u-btn--primary ap-bg-color-background-primary ap-text-color-text-secondary" title="Add block">
              <svg class="pwc-empty-state__add-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add Block
            </button>
            <p class="pwc-empty-state__hint ap-text-color-text-light">Tip: You can also drag blocks from the library panel.</p>
          </div>
        `;

        // Add click handler for the Add Block button
        const addBlockBtn = contentRegion.querySelector('.pwc-empty-state__add-btn');
        if (addBlockBtn) {
          addBlockBtn.addEventListener('click', () => {
            let panel = window.pwcBlockLibraryPanel || document.querySelector('pwc-block-library-panel');
            if (!panel) {
              panel = document.createElement('pwc-block-library-panel');
              document.body.appendChild(panel);
            }
            if (panel) {
              panel.setInsertPosition(-1, null);
              panel.open();
            }
          });
        }
      } else {
        // Render each block
        this.blocks.forEach((blockData, index) => {
          const blockElement = window.pwcBlockRegistry.createBlock(blockData);
          if (blockElement) {
            contentRegion.appendChild(blockElement);
          }
        });
      }
    }

    /**
     * Enter edit mode.
     */
    enterEditMode() {
      this.isEditing = true;
      this.emit('editModeChange', { isEditing: true });
      document.body.classList.add('pwc-editing');
    }

    /**
     * Exit edit mode.
     */
    exitEditMode() {
      this.isEditing = false;
      this.selectedBlockId = null;
      this.emit('editModeChange', { isEditing: false });
      this.emit('selectionChange', { blockId: null });
      document.body.classList.remove('pwc-editing');
    }

    /**
     * Select a block.
     *
     * @param {string|null} blockId - Block ID to select, or null to deselect.
     */
    selectBlock(blockId) {
      const previousId = this.selectedBlockId;
      this.selectedBlockId = blockId;
      this.emit('selectionChange', { blockId, previousId });
    }

    /**
     * Get the currently selected block data.
     *
     * @returns {Object|null} Block data or null.
     */
    getSelectedBlock() {
      if (!this.selectedBlockId) return null;
      return this.findBlock(this.selectedBlockId);
    }

    /**
     * Find a block by ID (recursively searches nested blocks).
     *
     * @param {string} blockId - Block ID to find.
     * @param {Array} blocks - Blocks to search (defaults to root blocks).
     * @returns {Object|null} Block data or null.
     */
    findBlock(blockId, blocks = this.blocks) {
      for (const block of blocks) {
        if (block.id === blockId) {
          return block;
        }
        if (block.innerBlocks && block.innerBlocks.length > 0) {
          const found = this.findBlock(blockId, block.innerBlocks);
          if (found) return found;
        }
      }
      return null;
    }

    /**
     * Update a block's attributes.
     *
     * @param {string} blockId - Block ID to update.
     * @param {Object} attributes - New attributes to merge.
     */
    updateBlock(blockId, attributes) {
      const block = this.findBlock(blockId);
      if (block) {
        block.attributes = { ...block.attributes, ...attributes };
        this.isDirty = true;
        this.emit('blockUpdate', { blockId, attributes: block.attributes });
      }
    }

    /**
     * Add a new block.
     *
     * @param {Object} blockData - Block data to add.
     * @param {number} index - Position to insert at.
     * @param {string|null} parentId - Parent block ID for nested insertion.
     */
    addBlock(blockData, index = -1, parentId = null) {
      const targetArray = parentId
        ? this.findBlock(parentId)?.innerBlocks
        : this.blocks;

      if (!targetArray) return;

      // Generate unique ID if not provided
      if (!blockData.id) {
        blockData.id = this.generateBlockId();
      }

      // Initialize innerBlocks if this is a container type
      if (blockData.type === 'section-container' && !blockData.innerBlocks) {
        blockData.innerBlocks = [];
      }

      if (index === -1 || index >= targetArray.length) {
        targetArray.push(blockData);
      } else {
        targetArray.splice(index, 0, blockData);
      }

      this.isDirty = true;
      this.pushHistory();
      this.emit('blockAdd', { block: blockData, index, parentId });
    }

    /**
     * Remove a block.
     *
     * @param {string} blockId - Block ID to remove.
     */
    removeBlock(blockId) {
      const removed = this.removeBlockRecursive(blockId, this.blocks);
      if (removed) {
        if (this.selectedBlockId === blockId) {
          this.selectBlock(null);
        }
        this.isDirty = true;
        this.pushHistory();
        this.emit('blockRemove', { blockId });
      }
    }

    /**
     * Recursively remove a block from the tree.
     *
     * @param {string} blockId - Block ID to remove.
     * @param {Array} blocks - Blocks array to search.
     * @returns {boolean} Whether the block was found and removed.
     */
    removeBlockRecursive(blockId, blocks) {
      const index = blocks.findIndex(b => b.id === blockId);
      if (index !== -1) {
        blocks.splice(index, 1);
        return true;
      }

      for (const block of blocks) {
        if (block.innerBlocks && this.removeBlockRecursive(blockId, block.innerBlocks)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Move a block up or down.
     *
     * @param {string} blockId - Block ID to move.
     * @param {number} direction - -1 for up, 1 for down.
     */
    moveBlock(blockId, direction) {
      const result = this.findBlockWithParent(blockId);
      if (!result) return;

      const { block, parent, index } = result;
      const targetArray = parent ? parent.innerBlocks : this.blocks;
      const newIndex = index + direction;

      if (newIndex < 0 || newIndex >= targetArray.length) return;

      // Swap blocks
      [targetArray[index], targetArray[newIndex]] = [targetArray[newIndex], targetArray[index]];

      this.isDirty = true;
      this.pushHistory();
      this.emit('blockMove', { blockId, direction, newIndex });
    }

    /**
     * Move a block to a specific index.
     *
     * @param {string} blockId - Block ID to move.
     * @param {number} targetIndex - Target index to move to.
     */
    moveBlockToIndex(blockId, targetIndex) {
      const result = this.findBlockWithParent(blockId);
      if (!result) {
        return;
      }

      const { block, parent, index: currentIndex } = result;
      const targetArray = parent ? parent.innerBlocks : this.blocks;

      // Don't move if already at target position
      if (currentIndex === targetIndex || currentIndex + 1 === targetIndex) {
        return;
      }

      // Remove block from current position
      targetArray.splice(currentIndex, 1);

      // Adjust target index if we removed from before the target
      let adjustedIndex = targetIndex;
      if (currentIndex < targetIndex) {
        adjustedIndex = targetIndex - 1;
      }

      // Insert at new position
      targetArray.splice(adjustedIndex, 0, block);

      this.isDirty = true;
      this.pushHistory();
      this.emit('blockMove', { blockId, newIndex: adjustedIndex });
    }

    /**
     * Move a block within a layout column.
     *
     * @param {string} blockId - Block ID to move.
     * @param {string} layoutId - Parent layout block ID.
     * @param {number} columnIndex - Target column index.
     * @param {number} targetIndex - Target position within the column.
     */
    moveBlockInLayout(blockId, layoutId, columnIndex, targetIndex) {
      // Find the layout block
      const layoutBlock = this.findBlock(layoutId);
      if (!layoutBlock || !layoutBlock.innerBlocks) {
        return;
      }

      // Get blocks in the target column (before any modifications)
      const columnBlocks = layoutBlock.innerBlocks.filter(b =>
        (b.attributes?.columnIndex || 0) === columnIndex
      );

      // Find the block being moved
      const blockIndex = layoutBlock.innerBlocks.findIndex(b => b.id === blockId);
      if (blockIndex === -1) {
        return;
      }

      const block = layoutBlock.innerBlocks[blockIndex];
      const currentColumnIndex = block.attributes?.columnIndex || 0;

      // Find current position within the column
      const currentPositionInColumn = columnBlocks.findIndex(b => b.id === blockId);

      // Check if we're staying in the same column and position
      if (currentColumnIndex === columnIndex) {
        if (currentPositionInColumn === targetIndex || currentPositionInColumn + 1 === targetIndex) {
          return;
        }
      }

      // Adjust target index if moving forward within the same column
      // Because removing the block shifts all subsequent positions down by 1
      let adjustedTargetIndex = targetIndex;
      if (currentColumnIndex === columnIndex && currentPositionInColumn < targetIndex) {
        adjustedTargetIndex = targetIndex - 1;
      }

      // Remove block from innerBlocks
      layoutBlock.innerBlocks.splice(blockIndex, 1);

      // Update column index if moving to different column
      block.attributes = block.attributes || {};
      block.attributes.columnIndex = columnIndex;

      // Calculate where to insert in the innerBlocks array
      let insertPosition = 0;

      // Get updated column blocks after removal
      const updatedColumnBlocks = layoutBlock.innerBlocks.filter(b =>
        (b.attributes?.columnIndex || 0) === columnIndex
      );

      if (adjustedTargetIndex === 0 || updatedColumnBlocks.length === 0) {
        // Insert at beginning of column
        const firstInColumn = layoutBlock.innerBlocks.findIndex(b =>
          (b.attributes?.columnIndex || 0) === columnIndex
        );
        insertPosition = firstInColumn === -1 ? layoutBlock.innerBlocks.length : firstInColumn;
      } else if (adjustedTargetIndex >= updatedColumnBlocks.length) {
        // Insert at end of column
        const lastInColumn = [...layoutBlock.innerBlocks].reverse().findIndex(b =>
          (b.attributes?.columnIndex || 0) === columnIndex
        );
        insertPosition = lastInColumn === -1 ? layoutBlock.innerBlocks.length : layoutBlock.innerBlocks.length - lastInColumn;
      } else {
        // Insert after the block at adjustedTargetIndex - 1 in this column
        const blockBeforeTarget = updatedColumnBlocks[adjustedTargetIndex - 1];
        insertPosition = layoutBlock.innerBlocks.findIndex(b => b.id === blockBeforeTarget.id) + 1;
      }

      // Insert at calculated position
      layoutBlock.innerBlocks.splice(insertPosition, 0, block);

      this.isDirty = true;
      this.pushHistory();
      this.emit('blockMove', { blockId, layoutId, columnIndex, newIndex: adjustedTargetIndex });
    }

    /**
     * Move a block across containers (top-level, layout columns, between layouts).
     *
     * @param {string} blockId - Block ID to move.
     * @param {Object} target - Target location descriptor.
     * @param {string|null} target.layoutId - Target layout block ID, or null for top-level.
     * @param {number|null} target.columnIndex - Target column index within the layout.
     * @param {number} target.insertIndex - Position to insert at within the target.
     */
    moveBlockCrossContainer(blockId, { layoutId = null, columnIndex = null, insertIndex }) {
      const result = this.findBlockWithParent(blockId);
      if (!result) return;

      const { block, parent, index: currentIndex } = result;

      // Determine source container
      const sourceIsTopLevel = !parent;
      const sourceLayoutId = parent ? parent.id : null;
      const sourceColumnIndex = block.attributes?.columnIndex ?? null;

      // Determine if source and target are the same container
      if (layoutId === null && sourceIsTopLevel) {
        // Both top-level: delegate to existing method
        this.moveBlockToIndex(blockId, insertIndex);
        return;
      }

      if (layoutId !== null && sourceLayoutId === layoutId) {
        // Same layout: delegate to existing method
        this.moveBlockInLayout(blockId, layoutId, columnIndex, insertIndex);
        return;
      }

      // Cross-container move: remove from source, insert into target

      // Remove block from source array
      const sourceArray = parent ? parent.innerBlocks : this.blocks;
      sourceArray.splice(currentIndex, 1);

      if (layoutId === null) {
        // Moving to top-level
        block.attributes = block.attributes || {};
        delete block.attributes.columnIndex;

        // Insert into top-level blocks
        const adjustedIndex = Math.min(insertIndex, this.blocks.length);
        this.blocks.splice(adjustedIndex, 0, block);
      } else {
        // Moving into a layout column
        const targetLayout = this.findBlock(layoutId);
        if (!targetLayout) return;

        targetLayout.innerBlocks = targetLayout.innerBlocks || [];

        // Set the column index
        block.attributes = block.attributes || {};
        block.attributes.columnIndex = columnIndex;

        // Calculate insertion position in innerBlocks array
        const columnBlocks = targetLayout.innerBlocks.filter(b =>
          (b.attributes?.columnIndex || 0) === columnIndex
        );

        let insertPosition;
        if (insertIndex === 0 || columnBlocks.length === 0) {
          // Insert at beginning of column
          const firstInColumn = targetLayout.innerBlocks.findIndex(b =>
            (b.attributes?.columnIndex || 0) === columnIndex
          );
          insertPosition = firstInColumn === -1 ? targetLayout.innerBlocks.length : firstInColumn;
        } else if (insertIndex >= columnBlocks.length) {
          // Insert at end of column
          const lastInColumn = [...targetLayout.innerBlocks].reverse().findIndex(b =>
            (b.attributes?.columnIndex || 0) === columnIndex
          );
          insertPosition = lastInColumn === -1
            ? targetLayout.innerBlocks.length
            : targetLayout.innerBlocks.length - lastInColumn;
        } else {
          // Insert after the block at insertIndex - 1 in this column
          const blockBeforeTarget = columnBlocks[insertIndex - 1];
          insertPosition = targetLayout.innerBlocks.findIndex(b => b.id === blockBeforeTarget.id) + 1;
        }

        targetLayout.innerBlocks.splice(insertPosition, 0, block);
      }

      this.isDirty = true;
      this.pushHistory();
      this.emit('blockMove', { blockId, layoutId, columnIndex, newIndex: insertIndex });
    }

    /**
     * Find a block and its parent.
     *
     * @param {string} blockId - Block ID to find.
     * @param {Array} blocks - Blocks to search.
     * @param {Object|null} parent - Parent block.
     * @returns {Object|null} Object with block, parent, and index.
     */
    findBlockWithParent(blockId, blocks = this.blocks, parent = null) {
      for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].id === blockId) {
          return { block: blocks[i], parent, index: i };
        }
        if (blocks[i].innerBlocks) {
          const found = this.findBlockWithParent(blockId, blocks[i].innerBlocks, blocks[i]);
          if (found) return found;
        }
      }
      return null;
    }

    /**
     * Generate a unique block ID.
     *
     * @returns {string} Unique ID.
     */
    generateBlockId() {
      return 'block-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Push current state to history.
     */
    pushHistory() {
      // Remove any future history if we're not at the end
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }

      // Deep clone blocks for history
      this.history.push(JSON.parse(JSON.stringify(this.blocks)));
      this.historyIndex = this.history.length - 1;

      // Limit history size
      if (this.history.length > 50) {
        this.history.shift();
        this.historyIndex--;
      }
    }

    /**
     * Undo last change.
     */
    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.blocks = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
        this.emit('stateRestore', { blocks: this.blocks });
      }
    }

    /**
     * Redo last undone change.
     */
    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.blocks = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
        this.emit('stateRestore', { blocks: this.blocks });
      }
    }

    /**
     * Serialize blocks to JSON.
     *
     * @returns {Object} Serialized content.
     */
    serialize() {
      return {
        version: '1.0',
        blocks: this.blocks,
      };
    }

    /**
     * Subscribe to state changes.
     *
     * @param {string} event - Event name.
     * @param {Function} callback - Callback function.
     * @returns {Function} Unsubscribe function.
     */
    on(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event).add(callback);

      return () => {
        this.listeners.get(event).delete(callback);
      };
    }

    /**
     * Emit an event to all listeners.
     *
     * @param {string} event - Event name.
     * @param {Object} data - Event data.
     */
    emit(event, data) {
      if (this.listeners.has(event)) {
        this.listeners.get(event).forEach(callback => {
          try {
            callback(data);
          } catch (e) {
            console.error('Error in event listener:', e);
          }
        });
      }
    }
  }

  // Create global instance
  window.pwcEditorState = new EditorState();

  // Subscribe to events that require re-rendering
  window.pwcEditorState.on('blockAdd', () => {
    window.pwcEditorState.renderContentRegion();
  });

  window.pwcEditorState.on('blockRemove', () => {
    window.pwcEditorState.renderContentRegion();
  });

  window.pwcEditorState.on('blockMove', () => {
    window.pwcEditorState.renderContentRegion();
  });

  window.pwcEditorState.on('stateRestore', () => {
    window.pwcEditorState.renderContentRegion();
  });

  // Expose to Drupal namespace
  Drupal.pwcVisualEditor = Drupal.pwcVisualEditor || {};
  Drupal.pwcVisualEditor.state = window.pwcEditorState;

})(Drupal);
