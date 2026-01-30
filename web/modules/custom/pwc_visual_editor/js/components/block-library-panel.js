/**
 * @file
 * Block Library Panel - Gutenberg-style side panel for block selection.
 *
 * Shows available blocks organized by category with drag-and-drop support.
 */

(function (Drupal) {
  'use strict';

  /**
   * Block categories configuration.
   * Maps registered block names to categories.
   */
  const BLOCK_CATEGORIES = [
    {
      id: 'layout',
      label: 'Layout',
      blocks: ['layout']
    },
    {
      id: 'text',
      label: 'Text',
      blocks: ['paragraph', 'heading', 'list', 'quote', 'code', 'preformatted', 'pullquote', 'verse']
    },
    {
      id: 'media',
      label: 'Media',
      blocks: ['image', 'gallery', 'video', 'audio']
    },
    {
      id: 'widgets',
      label: 'Widgets',
      blocks: ['button', 'tag', 'accordion', 'table', 'classic', 'columns', 'group', 'spacer', 'separator']
    }
  ];

  class BlockLibraryPanel extends HTMLElement {
    constructor() {
      super();
      this.isOpen = false;
      this.searchQuery = '';
      this.activeTab = 'blocks';
      this.draggedBlockType = null;
      this.insertIndex = -1;  // -1 means append at end
      this.parentBlockId = null;
    }

    /**
     * Set the insertion position.
     *
     * @param {number} index - Index to insert at (-1 for end).
     * @param {string|null} parentId - Parent block ID for nested insertion.
     * @param {number|null} columnIndex - Column index for layout blocks.
     */
    setInsertPosition(index, parentId = null, columnIndex = null, metadata = null) {
      this.insertIndex = index;
      this.parentBlockId = parentId;
      this.columnIndex = columnIndex;
      this.insertMetadata = metadata;
    }

    /**
     * Reset insertion position to default (append at end).
     */
    resetInsertPosition() {
      this.insertIndex = -1;
      this.parentBlockId = null;
      this.columnIndex = null;
      this.insertMetadata = null;
    }

    connectedCallback() {

      // Store global reference for easy access
      window.pwcBlockLibraryPanel = this;

      // Move to body to ensure proper fixed positioning (avoid parent transform issues)
      if (this.parentElement !== document.body) {
        document.body.appendChild(this);
        return; // connectedCallback will be called again when appended to body
      }

      this.render();
      this.setupEventListeners();
    }

    render() {
      // Inline styles ensure panel works even if CSS doesn't load
      const panelStyle = this.isOpen
        ? 'position:fixed;top:0;left:0;bottom:0;width:280px;background:#fff;box-shadow:2px 0 8px rgba(0,0,0,0.1);z-index:9999;display:flex;flex-direction:column;overflow:hidden;'
        : 'position:fixed;top:0;left:0;bottom:0;width:280px;background:#fff;z-index:9999;display:flex;flex-direction:column;overflow:hidden;transform:translateX(-100%);';

      const toggleStyle = this.isOpen
        ? 'position:fixed;top:80px;left:0;width:40px;height:40px;background:#007cba;color:#fff;border:none;border-radius:0 8px 8px 0;cursor:pointer;z-index:9999;display:none;align-items:center;justify-content:center;'
        : 'position:fixed;top:80px;left:0;width:40px;height:40px;background:#007cba;color:#fff;border:none;border-radius:0 8px 8px 0;cursor:pointer;z-index:9999;display:flex;align-items:center;justify-content:center;';

      const headerStyle = 'display:flex;align-items:center;justify-content:space-between;padding:12px;border-bottom:1px solid #e5e7eb;background:#f9fafb;';
      const closeStyle = 'width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;color:#6b7280;cursor:pointer;border-radius:6px;';

      this.innerHTML = `
        <!-- Toggle button when panel is closed -->
        <button type="button" class="pwc-block-library__toggle ${this.isOpen ? 'pwc-block-library__toggle--hidden' : ''}" style="${toggleStyle}" title="Open Blocks Panel">
          <svg style="width:20px;height:20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>

        <div class="pwc-block-library ${this.isOpen ? 'pwc-block-library--open' : ''}" style="${panelStyle}">
          <!-- Panel Header -->
          <div class="pwc-block-library__header" style="${headerStyle}">
            <div class="pwc-block-library__title" style="font-size:14px;font-weight:600;color:#111827;">Blocks</div>
            <button type="button" class="pwc-block-library__close" style="${closeStyle}" title="Close Panel">
              <svg style="width:20px;height:20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Search -->
          <div class="pwc-block-library__search" style="padding:8px 16px 12px;">
            <div style="position:relative;">
              <input
                type="text"
                class="pwc-block-library__search-input"
                style="width:100%;padding:8px 12px 8px 36px;border:1px solid #e5e7eb;border-radius:6px;font-size:14px;background:#f9fafb;"
                placeholder="Search blocks..."
                value="${this.searchQuery}"
              >
              <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:#9ca3af;pointer-events:none;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <!-- Tabs -->
          <div class="pwc-block-library__tabs" style="display:flex;border-bottom:1px solid #e5e7eb;padding:0 16px;">
            <button type="button" class="pwc-block-library__tab ${this.activeTab === 'blocks' ? 'pwc-block-library__tab--active' : ''}" style="flex:1;padding:10px 8px;background:transparent;border:none;font-size:13px;font-weight:500;color:${this.activeTab === 'blocks' ? '#007cba' : '#6b7280'};cursor:pointer;" data-tab="blocks">
              Blocks
            </button>
            <button type="button" class="pwc-block-library__tab ${this.activeTab === 'patterns' ? 'pwc-block-library__tab--active' : ''}" style="flex:1;padding:10px 8px;background:transparent;border:none;font-size:13px;font-weight:500;color:${this.activeTab === 'patterns' ? '#007cba' : '#6b7280'};cursor:pointer;" data-tab="patterns">
              Patterns
            </button>
          </div>

          <!-- Block List -->
          <div class="pwc-block-library__content" style="flex:1;overflow-y:auto;padding:12px 16px;">
            ${this.renderBlockList()}
          </div>
        </div>
      `;
    }

    renderBlockList() {
      const registeredBlocks = window.pwcBlockRegistry ? window.pwcBlockRegistry.getAll() : [];

      let html = '';

      BLOCK_CATEGORIES.forEach(category => {
        // Filter blocks that are actually registered and match search
        const categoryBlocks = registeredBlocks.filter(block => {
          const inCategory = category.blocks.includes(block.name);
          const matchesSearch = !this.searchQuery ||
            block.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            block.name.toLowerCase().includes(this.searchQuery.toLowerCase());
          return inCategory && matchesSearch;
        });

        // Also include registered blocks not in any category (in text category)
        if (category.id === 'text') {
          registeredBlocks.forEach(block => {
            const inAnyCategory = BLOCK_CATEGORIES.some(cat => cat.blocks.includes(block.name));
            if (!inAnyCategory && block.name !== 'layout') {
              const matchesSearch = !this.searchQuery ||
                block.title.toLowerCase().includes(this.searchQuery.toLowerCase());
              if (matchesSearch && !categoryBlocks.find(b => b.name === block.name)) {
                categoryBlocks.push(block);
              }
            }
          });
        }

        if (categoryBlocks.length > 0) {
          html += `
            <div class="pwc-block-library__category" style="margin-bottom:20px;">
              <div class="pwc-block-library__category-label" style="font-size:11px;font-weight:600;color:#9ca3af;letter-spacing:0.05em;margin-bottom:8px;">${category.label.toUpperCase()}</div>
              <div class="pwc-block-library__blocks" style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
                ${categoryBlocks.map(block => this.renderBlockItem(block)).join('')}
              </div>
            </div>
          `;
        }
      });

      if (!html) {
        html = '<div class="pwc-block-library__empty" style="text-align:center;color:#9ca3af;font-size:14px;padding:40px 20px;">No blocks found</div>';
      }

      return html;
    }

    renderBlockItem(block) {
      const blockStyle = 'display:flex;flex-direction:column;align-items:center;padding:12px 8px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;cursor:grab;text-align:center;';
      const iconStyle = 'width:32px;height:32px;display:flex;align-items:center;justify-content:center;margin-bottom:6px;color:#374151;';
      const labelStyle = 'font-size:12px;font-weight:500;color:#374151;line-height:1.3;';

      return `
        <div
          class="pwc-block-library__block"
          style="${blockStyle}"
          data-block-type="${block.name}"
          draggable="true"
          title="${block.description || block.title}"
        >
          <div class="pwc-block-library__block-icon" style="${iconStyle}">
            ${this.getBlockIcon(block)}
          </div>
          <div class="pwc-block-library__block-label" style="${labelStyle}">${block.title}</div>
        </div>
      `;
    }

    getBlockIcon(block) {
      // Return SVG icons based on block type (matching Gutenberg style)
      const icons = {
        'paragraph': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 4H9.5a4.5 4.5 0 100 9h1.5v7h3V6h1.5v14h3V6h.5V4z"/></svg>`,
        'heading': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.2 5.2v13.6h2.4V12h6.8v6.8h2.4V5.2h-2.4v4.4H8.6V5.2z"/></svg>`,
        'list': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 8.8h1.6V7.2H4v1.6zm0 4.8h1.6v-1.6H4v1.6zm0 4.8h1.6v-1.6H4v1.6zm3.2-12v1.6h12.8V6.4H7.2zm0 4.8h12.8v-1.6H7.2v1.6zm0 4.8h12.8v-1.6H7.2v1.6z"/></svg>`,
        'quote': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.3 17.8c-2.5 0-3.8-2-3.8-4.3 0-3.4 2.4-6.7 6-8.5l.8 1.5c-2.4 1.4-3.8 3.3-4 5.4.4-.3.9-.4 1.4-.4 1.6 0 2.8 1.3 2.8 2.9 0 1.8-1.4 3.4-3.2 3.4zm9.5 0c-2.5 0-3.8-2-3.8-4.3 0-3.4 2.4-6.7 6-8.5l.8 1.5c-2.4 1.4-3.8 3.3-4 5.4.4-.3.9-.4 1.4-.4 1.6 0 2.8 1.3 2.8 2.9 0 1.8-1.4 3.4-3.2 3.4z"/></svg>`,
        'code': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>`,
        'preformatted': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16v2H4V5zm0 4h10v2H4V9zm0 4h16v2H4v-2zm0 4h10v2H4v-2z"/></svg>`,
        'pullquote': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 12h6V6H8v6zm1-4h4v3H9V8zm2-6l3 6h-2l-3-6h2zm3 16H6V8.3l-.2-.3H4v12h12v-1.7l-.2-.3H14z"/></svg>`,
        'verse': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5.8h10v1.6H4V5.8zm0 4h16v1.6H4v-1.6zm0 4h10v1.6H4v-1.6zm0 4h16v1.6H4v-1.6z"/></svg>`,
        'table': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5v14h16V5H4zm4 12H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z"/></svg>`,
        'classic': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H4V7h16v10z"/></svg>`,
        'image': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`,
        'gallery': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4v12H8V4h12m0-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 9.67l1.69 2.26 2.48-3.1L19 15H9zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/></svg>`,
        'video': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM10 8v8l6-4z"/></svg>`,
        'audio': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,
        'layout': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5v14h16V5H4zm6 12H6V7h4v10zm8 0h-4V7h4v10z"/></svg>`,
        'columns': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5v14h16V5H4zm6 12H6V7h4v10zm8 0h-4V7h4v10z"/></svg>`,
        'group': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>`,
        'spacer': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 11h10V9L21 12l-4 3v-2H7v2L3 12l4-3z"/></svg>`,
        'separator': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 11h16v2H4z"/></svg>`,
        'button': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"/></svg>`,
        'tag': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>`,
        'accordion': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v3H3V5zm0 5h18v3H3v-3zm0 5h18v3H3v-3z" opacity=".3"/><path d="M3 4v4h18V4H3zm16 2H5V6h14v0zM3 9v4h18V9H3zm16 2H5v0h14v0zM3 14v4h18v-4H3zm16 2H5v0h14v0z"/></svg>`,
      };

      return icons[block.name] || `<span class="text-lg">${block.icon || '▢'}</span>`;
    }

    setupEventListeners() {
      // Toggle button (when panel is closed)
      const toggleBtn = this.querySelector('.pwc-block-library__toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => this.open());
      }

      // Close button
      const closeBtn = this.querySelector('.pwc-block-library__close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }

      // Search input
      const searchInput = this.querySelector('.pwc-block-library__search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value;
          this.updateBlockList();
        });
      }

      // Tab buttons
      const tabBtns = this.querySelectorAll('.pwc-block-library__tab');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.activeTab = btn.dataset.tab;
          this.render();
          this.setupEventListeners();
        });
      });

      // Block items - drag start
      const blockItems = this.querySelectorAll('.pwc-block-library__block');
      blockItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
          this.draggedBlockType = item.dataset.blockType;
          e.dataTransfer.setData('text/plain', item.dataset.blockType);
          e.dataTransfer.effectAllowed = 'copy';
          item.classList.add('pwc-block-library__block--dragging');

          // Add body class for global drag state
          document.body.classList.add('pwc-dragging-block');

          // Create drop zones in content region
          this.createDropZones();
        });

        item.addEventListener('dragend', () => {
          item.classList.remove('pwc-block-library__block--dragging');
          document.body.classList.remove('pwc-dragging-block');
          this.removeDropZones();
          this.draggedBlockType = null;
        });

        // Click to insert at end
        item.addEventListener('click', () => {
          this.insertBlock(item.dataset.blockType);
        });
      });

      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    createDropZones() {
      const contentRegion = document.querySelector('[data-pwc-content-region]');
      if (!contentRegion) return;

      // Add drop zone class to content region
      contentRegion.classList.add('pwc-drop-active');

      // Create drop zone at beginning
      const firstDropZone = document.createElement('div');
      firstDropZone.className = 'pwc-drop-zone pwc-drop-zone--first';
      firstDropZone.dataset.insertIndex = '0';
      contentRegion.insertBefore(firstDropZone, contentRegion.firstChild);

      // Create drop zones after each block
      const blocks = contentRegion.querySelectorAll('.pwc-block');
      blocks.forEach((block, index) => {
        const dropZone = document.createElement('div');
        dropZone.className = 'pwc-drop-zone';
        dropZone.dataset.insertIndex = String(index + 1);
        block.after(dropZone);
      });

      // If no blocks, create a large drop zone
      if (blocks.length === 0) {
        const emptyDropZone = document.createElement('div');
        emptyDropZone.className = 'pwc-drop-zone pwc-drop-zone--empty';
        emptyDropZone.dataset.insertIndex = '0';
        emptyDropZone.innerHTML = '<span>Drop block here</span>';
        contentRegion.appendChild(emptyDropZone);
      }

      // Setup drop zone event listeners
      this.setupDropZoneListeners();
    }

    setupDropZoneListeners() {
      const dropZones = document.querySelectorAll('.pwc-drop-zone');

      dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          zone.classList.add('pwc-drop-zone--active');
        });

        zone.addEventListener('dragleave', () => {
          zone.classList.remove('pwc-drop-zone--active');
        });

        zone.addEventListener('drop', (e) => {
          e.preventDefault();
          const blockType = e.dataTransfer.getData('text/plain') || this.draggedBlockType;
          const insertIndex = parseInt(zone.dataset.insertIndex, 10);

          if (blockType) {
            this.insertBlock(blockType, insertIndex);
          }

          zone.classList.remove('pwc-drop-zone--active');
        });
      });
    }

    removeDropZones() {
      const contentRegion = document.querySelector('[data-pwc-content-region]');
      if (contentRegion) {
        contentRegion.classList.remove('pwc-drop-active');
      }

      document.querySelectorAll('.pwc-drop-zone').forEach(zone => zone.remove());
    }

    insertBlock(blockType, index = null) {
      const blockData = window.pwcBlockRegistry.createBlockData(blockType);

      if (blockData) {
        // Handle insertion into a layout column
        if (this.parentBlockId && this.columnIndex !== null) {
          blockData.attributes = blockData.attributes || {};
          blockData.attributes.columnIndex = this.columnIndex;
          if (this.insertMetadata) {
            Object.assign(blockData.attributes, this.insertMetadata);
          }

          const parentBlock = window.pwcEditorState.findBlock(this.parentBlockId);
          if (parentBlock) {
            parentBlock.innerBlocks = parentBlock.innerBlocks || [];
            parentBlock.innerBlocks.push(blockData);
            window.pwcEditorState.isDirty = true;
            window.pwcEditorState.pushHistory();
            window.pwcEditorState.emit('blockAdd', { block: blockData, parentId: this.parentBlockId });
          }
        } else {
          // Use provided index, or fall back to panel's insertIndex, or -1 for end
          const insertAt = index !== null ? index : this.insertIndex;
          window.pwcEditorState.addBlock(blockData, insertAt, this.parentBlockId);
        }

        // Select the new block
        setTimeout(() => {
          window.pwcEditorState.selectBlock(blockData.id);
        }, 50);

        // Close the panel after inserting
        this.close();
      }
    }

    updateBlockList() {
      const content = this.querySelector('.pwc-block-library__content');
      if (content) {
        content.innerHTML = this.renderBlockList();
        // Re-setup drag listeners
        const blockItems = this.querySelectorAll('.pwc-block-library__block');
        blockItems.forEach(item => {
          item.addEventListener('dragstart', (e) => {
            this.draggedBlockType = item.dataset.blockType;
            e.dataTransfer.setData('text/plain', item.dataset.blockType);
            e.dataTransfer.effectAllowed = 'copy';
            item.classList.add('pwc-block-library__block--dragging');
            document.body.classList.add('pwc-dragging-block');
            this.createDropZones();
          });

          item.addEventListener('dragend', () => {
            item.classList.remove('pwc-block-library__block--dragging');
            document.body.classList.remove('pwc-dragging-block');
            this.removeDropZones();
            this.draggedBlockType = null;
          });

          item.addEventListener('click', () => {
            this.insertBlock(item.dataset.blockType);
          });
        });
      }
    }

    open() {
      this.isOpen = true;
      document.body.classList.add('pwc-block-library-open');
      this.render();
      this.setupEventListeners();

      // Focus search input
      setTimeout(() => {
        const searchInput = this.querySelector('.pwc-block-library__search-input');
        if (searchInput) searchInput.focus();
      }, 100);
    }

    close() {
      this.isOpen = false;
      document.body.classList.remove('pwc-block-library-open');
      this.resetInsertPosition();
      this.render();
      this.setupEventListeners();
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
  }

  // Register custom element
  customElements.define('pwc-block-library-panel', BlockLibraryPanel);

  // Expose to window for external access
  window.PwcBlockLibraryPanel = BlockLibraryPanel;

})(Drupal);
