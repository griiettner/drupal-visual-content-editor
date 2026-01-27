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
      this.blocks = initialBlocks;
      this.isDirty = false;
      this.pushHistory();
    }

    /**
     * Initialize the editor with full options.
     *
     * @param {Object} options - Initialization options.
     */
    initialize(options = {}) {
      this.blocks = options.blocks || [];
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
      console.log('PWC Editor State: renderContentRegion called, content region found:', !!contentRegion);
      console.log('PWC Editor State: Current blocks:', this.blocks);
      console.log('PWC Editor State: Is editing:', this.isEditing);
      if (!contentRegion) return;

      // Clear existing content
      contentRegion.innerHTML = '';

      // Render blocks
      if (this.blocks.length === 0 && this.isEditing) {
        // Empty state with prominent Add Block button
        contentRegion.innerHTML = `
          <div class="pwc-empty-state py-12 text-center">
            <button type="button" class="pwc-add-block-btn inline-flex items-center gap-3 px-6 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 shadow-lg transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add Block
            </button>
            <p class="text-sm text-gray-500 mt-4">Click to browse available blocks</p>
          </div>
        `;

        // Add click handler for the Add Block button
        const addBlockBtn = contentRegion.querySelector('.pwc-add-block-btn');
        if (addBlockBtn) {
          addBlockBtn.addEventListener('click', () => {
            const panel = document.querySelector('pwc-block-library-panel');
            if (panel) {
              panel.setInsertPosition(0, null);
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
      console.log('PWC State: moveBlockToIndex called', { blockId, targetIndex });

      const result = this.findBlockWithParent(blockId);
      if (!result) {
        console.error('PWC State: Block not found:', blockId);
        return;
      }

      const { block, parent, index: currentIndex } = result;
      const targetArray = parent ? parent.innerBlocks : this.blocks;

      console.log('PWC State: Block found at index', currentIndex, 'of', targetArray.length, 'blocks');

      // Don't move if already at target position
      // targetIndex is where we want to insert
      // If block is at currentIndex, inserting at currentIndex or currentIndex+1 results in no change
      if (currentIndex === targetIndex || currentIndex + 1 === targetIndex) {
        console.log('PWC State: No move needed, already at position');
        return;
      }

      // Remove block from current position
      targetArray.splice(currentIndex, 1);

      // Adjust target index if we removed from before the target
      let adjustedIndex = targetIndex;
      if (currentIndex < targetIndex) {
        adjustedIndex = targetIndex - 1;
      }

      console.log('PWC State: Inserting at adjusted index', adjustedIndex);

      // Insert at new position
      targetArray.splice(adjustedIndex, 0, block);

      this.isDirty = true;
      this.pushHistory();
      this.emit('blockMove', { blockId, newIndex: adjustedIndex });

      console.log('PWC State: Block moved, new order:', targetArray.map(b => b.id));
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
