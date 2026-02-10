/**
 * @file
 * Block inserter Web Component.
 *
 * "+" button that appears between blocks to add new content.
 * Opens the block library side panel when clicked.
 */

(function (Drupal) {
  'use strict';

  class BlockInserter extends HTMLElement {
    constructor() {
      super();
      this.insertIndex = -1;
      this.parentBlockId = null;
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.innerHTML = `
        <div class="pwc-inserter">
          <!-- Line with + button - always visible -->
          <div class="pwc-inserter__line">
            <div class="pwc-inserter__rule"></div>
            <button
              type="button"
              class="pwc-inserter__btn pwc-u-icon-btn pwc-u-icon-btn--primary pwc-u-icon-btn--round ap-bg-color-background-primary ap-text-color-text-secondary"
              title="Add block"
            >
              <svg class="pwc-inserter__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>
        </div>
      `;

      this.setupEventListeners();
    }

    setupEventListeners() {
      const btn = this.querySelector('.pwc-inserter__btn');

      // Open block library panel on button click
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openBlockLibrary();
      });
    }

    /**
     * Set the insertion position.
     *
     * @param {number} index - Index to insert at.
     * @param {string|null} parentId - Parent block ID for nested insertion.
     */
    setInsertPosition(index, parentId = null) {
      this.insertIndex = index;
      this.parentBlockId = parentId;
    }

    /**
     * Open the block library panel and set insert position.
     */
    openBlockLibrary() {
      const panel = document.querySelector('pwc-block-library-panel');
      if (panel) {
        // Set the insert position on the panel
        panel.setInsertPosition(this.insertIndex, this.parentBlockId);
        panel.open();
      }
    }
  }

  // Register custom element
  customElements.define('pwc-block-inserter', BlockInserter);

})(Drupal);
