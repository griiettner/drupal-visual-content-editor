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
        <div class="pwc-inserter relative py-3">
          <!-- Line with + button - always visible -->
          <div class="pwc-inserter__line relative h-10 flex items-center justify-center">
            <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gray-200"></div>
            <button
              type="button"
              class="pwc-inserter__btn relative w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 shadow-md transition-all z-10"
              title="Add block"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
