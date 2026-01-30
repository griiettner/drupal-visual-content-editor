/**
 * @file
 * Block toolbar Web Component.
 *
 * Floating toolbar that appears above the selected block with
 * actions like move, delete, and more options.
 */

(function (Drupal) {
  'use strict';

  class BlockToolbar extends HTMLElement {
    constructor() {
      super();
      this.currentBlock = null;
      this._boundPositionUpdate = this.updatePosition.bind(this);
    }

    connectedCallback() {
      this.render();
      this.hide();

      // Update position on scroll/resize
      window.addEventListener('scroll', this._boundPositionUpdate, { passive: true });
      window.addEventListener('resize', this._boundPositionUpdate, { passive: true });
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this._boundPositionUpdate);
      window.removeEventListener('resize', this._boundPositionUpdate);
    }

    render() {
      this.innerHTML = `
        <div class="pwc-toolbar">
          <!-- Drag Handle -->
          <button
            type="button"
            class="pwc-toolbar__btn"
            data-action="drag"
            title="Drag to reorder"
          >
            <svg class="pwc-toolbar__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
            </svg>
          </button>

          <!-- Divider -->
          <div class="pwc-toolbar__divider"></div>

          <!-- Move Up -->
          <button
            type="button"
            class="pwc-toolbar__btn"
            data-action="move-up"
            title="Move up (Alt+↑)"
          >
            <svg class="pwc-toolbar__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
            </svg>
          </button>

          <!-- Move Down -->
          <button
            type="button"
            class="pwc-toolbar__btn"
            data-action="move-down"
            title="Move down (Alt+↓)"
          >
            <svg class="pwc-toolbar__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <!-- Divider -->
          <div class="pwc-toolbar__divider"></div>

          <!-- Block Type Label -->
          <span class="pwc-toolbar__label"></span>

          <!-- Divider -->
          <div class="pwc-toolbar__divider"></div>

          <!-- Delete -->
          <button
            type="button"
            class="pwc-toolbar__btn pwc-toolbar__btn--danger"
            data-action="delete"
            title="Delete block"
          >
            <svg class="pwc-toolbar__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>

          <!-- More Options -->
          <button
            type="button"
            class="pwc-toolbar__btn"
            data-action="more"
            title="More options"
          >
            <svg class="pwc-toolbar__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
            </svg>
          </button>
        </div>
      `;

      this.setupEventListeners();
    }

    setupEventListeners() {
      this.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.getAttribute('data-action');
          this.handleAction(action);
        });
      });
    }

    handleAction(action) {
      if (!this.currentBlock) return;

      const blockId = this.currentBlock.blockId;

      switch (action) {
        case 'move-up':
          window.pwcEditorState.moveBlock(blockId, -1);
          // Re-attach after move
          requestAnimationFrame(() => {
            const block = document.querySelector(`[block-id="${blockId}"]`);
            if (block) this.attachToBlock(block);
          });
          break;

        case 'move-down':
          window.pwcEditorState.moveBlock(blockId, 1);
          requestAnimationFrame(() => {
            const block = document.querySelector(`[block-id="${blockId}"]`);
            if (block) this.attachToBlock(block);
          });
          break;

        case 'delete':
          if (confirm('Delete this block?')) {
            window.pwcEditorState.removeBlock(blockId);
            this.detach();
          }
          break;

        case 'drag':
          // TODO: Implement drag and drop
          console.log('Drag not yet implemented');
          break;

        case 'more':
          // TODO: Show more options menu
          console.log('More options not yet implemented');
          break;
      }
    }

    /**
     * Attach toolbar to a block.
     *
     * @param {HTMLElement} block - Block element to attach to.
     */
    attachToBlock(block) {
      this.currentBlock = block;

      // Update label
      const label = this.querySelector('.pwc-toolbar__label');
      const blockInfo = window.pwcBlockRegistry.get(block.blockType);
      if (label && blockInfo) {
        label.textContent = blockInfo.title;
      }

      this.show();
      this.updatePosition();
    }

    /**
     * Detach toolbar from current block.
     */
    detach() {
      this.currentBlock = null;
      this.hide();
    }

    /**
     * Update toolbar position relative to block.
     */
    updatePosition() {
      if (!this.currentBlock) return;

      const blockRect = this.currentBlock.getBoundingClientRect();
      const toolbarRect = this.getBoundingClientRect();

      // Position above the block, centered
      let top = blockRect.top - toolbarRect.height - 8;
      let left = blockRect.left + (blockRect.width / 2) - (toolbarRect.width / 2);

      // Keep within viewport
      if (top < 8) {
        // Position below the block instead
        top = blockRect.bottom + 8;
      }

      if (left < 8) {
        left = 8;
      } else if (left + toolbarRect.width > window.innerWidth - 8) {
        left = window.innerWidth - toolbarRect.width - 8;
      }

      this.style.top = `${top}px`;
      this.style.left = `${left}px`;
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
  customElements.define('pwc-block-toolbar', BlockToolbar);

})(Drupal);
