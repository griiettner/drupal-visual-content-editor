/**
 * @file
 * Tab block component (container block).
 *
 * Renders Appkit4 <apw-tabset> / <apw-tab> components in view mode.
 * In the editor, shows tab headers row + content panels with inner blocks.
 *
 * Titles are stored as a JSON array attribute.
 * Inner blocks use columnIndex to map each block to its tab panel.
 */

(function (Drupal) {
  'use strict';

  const DEFAULT_TITLES = [
    'Tab 1',
    'Tab 2',
    'Tab 3',
  ];

  class TabBlock extends window.PwcBaseBlock {
    static get blockName() { return 'tab'; }
    static get blockTitle() { return 'Tab'; }
    static get blockIcon() { return ''; }
    static get blockDescription() { return 'Add tabbed content panels with inner blocks.'; }
    static get blockCategory() { return 'widgets'; }

    static get blockSettings() {
      return [
        {
          name: 'titles',
          type: 'tabTitles',
          label: 'Tab Items',
          default: JSON.stringify(DEFAULT_TITLES),
          tab: 'typography',
        },
        {
          name: 'tabType',
          type: 'select',
          label: 'Tab Style',
          default: 'underline',
          tab: 'typography',
          options: [
            { value: 'underline', label: 'Underline' },
            { value: 'filled', label: 'Filled' },
          ],
        },
        {
          name: 'stretched',
          type: 'toggle',
          label: 'Stretch Tabs',
          default: false,
          tab: 'typography',
          help: 'Stretch tabs to fill full width',
        },
        {
          name: 'contentBgColor',
          type: 'colorSwatch',
          label: 'Content Background',
          default: '',
          tab: 'style',
          colors: window.APPKIT_OPTIONS?.colors || [],
          colorType: 'bg',
        },
        {
          name: 'margin',
          type: 'spacing',
          label: 'Margin',
          default: '',
          tab: 'layout',
          prefix: 'm',
        },
        {
          name: 'padding',
          type: 'spacing',
          label: 'Padding',
          default: '',
          tab: 'layout',
          prefix: 'p',
        },
        {
          name: 'customClasses',
          type: 'text',
          label: 'Custom Classes',
          default: '',
          tab: 'style',
          placeholder: 'e.g., my-custom-class',
          help: 'Add any additional CSS utility classes',
        },
      ];
    }

    constructor() {
      super();
      this._innerBlocksData = [];
      this._activeTabIndex = 0;
    }

    disconnectedCallback() {
      if (this._tabsetObserver) {
        this._tabsetObserver.disconnect();
        this._tabsetObserver = null;
      }

      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }

    static get observedAttributes() {
      return [
        'block-id',
        'titles',
        'tab-type',
        'stretched',
        'content-bg-color',
        'margin',
        'padding',
        'custom-classes',
      ];
    }

    /**
     * Override addHoverControls to use custom tab controls.
     */
    addHoverControls() {
      if (!window.pwcEditorState || !window.pwcEditorState.isEditing) return;

      this.setAttribute('draggable', 'true');
      this.setAttribute('has-inner-blocks', 'true');
      this._setupTabDrag();
    }

    _setupTabDrag() {
      if (this._tabDragSetup) return;
      this._tabDragSetup = true;

      this.addEventListener('dragstart', (e) => {
        if (e.target !== this && !e.target.classList.contains('pwc-tab-handle')) {
          return;
        }
        if (!this._dragFromTabHandle) {
          e.preventDefault();
          return;
        }

        e.dataTransfer.setData('text/plain', this.blockId);
        e.dataTransfer.setData('application/x-pwc-block-reorder', this.blockId);
        e.dataTransfer.effectAllowed = 'move';

        this.classList.add('pwc-block--dragging');
        document.body.classList.add('pwc-dragging-block');
        this._dragStarted = true;

        setTimeout(() => this.createReorderDropZones(), 10);
      });

      this.addEventListener('dragend', () => {
        if (this._dragStarted) {
          this.classList.remove('pwc-block--dragging');
          document.body.classList.remove('pwc-dragging-block');
          this.removeReorderDropZones();
        }
        this._dragFromTabHandle = false;
        this._dragStarted = false;
      });
    }

    render() {
      if (this._tabsetObserver) {
        this._tabsetObserver.disconnect();
        this._tabsetObserver = null;
      }

      const titles = this.parseTitles();

      const margin = this.getAttribute('margin') || '';
      const padding = this.getAttribute('padding') || '';
      const customClasses = this.sanitizeClassList(this.getAttribute('custom-classes') || '');
      const contentBgColor = this.getAttribute('content-bg-color') || '';
      const rawTabType = this.getAttribute('tab-type') || 'underline';
      const tabType = rawTabType === 'filled' ? 'filled' : 'underline';
      const stretched = this.getBooleanAttribute('stretched');
      const isEditing = window.pwcEditorState && window.pwcEditorState.isEditing;

      // Restore active tab from editor state (survives element re-creation).
      const blockData = window.pwcEditorState?.findBlock(this.blockId);
      if (blockData && blockData._activeTabIndex !== undefined) {
        this._activeTabIndex = blockData._activeTabIndex;
      }

      // Clamp active tab index
      if (this._activeTabIndex >= titles.length) {
        this._activeTabIndex = 0;
      }

      const wrapperClasses = [
        'pwc-tab-wrapper',
        margin,
        padding,
        customClasses,
      ].filter(Boolean).join(' ');

      // Build Appkit4 tab headers
      const tabsHtml = titles.map((title, index) => {
        const tabId = `${this.blockId || 'pwc-tab'}-${index}`;
        return `<apw-tab tab-id="${this.escapeAttr(tabId)}" label="${this.escapeAttr(title)}"></apw-tab>`;
      }).join('');

      // Build tab panels
      const panelsHtml = titles.map((title, index) => {
        const sectionBlocks = this.getSectionBlocks(index);
        const hasBlocks = sectionBlocks.length > 0;
        const display = index === this._activeTabIndex ? 'block' : 'none';

        return `
          <div class="pwc-tab-panel" data-tab-index="${index}" style="display: ${display}">
            <div class="pwc-tab-section__body"
                 data-tab-index="${index}"
                 data-tab-id="${this.blockId}">
              <div class="pwc-tab-section__content">
                ${!hasBlocks && isEditing ? `
                  <div class="pwc-tab-section__empty">
                    <span class="pwc-tab-section__empty-text">Drop blocks here</span>
                  </div>
                ` : ''}
              </div>
              ${isEditing ? `
                <button type="button" class="pwc-tab-section__add-btn" data-section="${index}" title="Add block to this tab">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');

      const contentClasses = ['pwc-tab-content', contentBgColor].filter(Boolean).join(' ');

      this.innerHTML = `
        <div class="${wrapperClasses}">
          <div class="pwc-tab-headers">
            <apw-tabset
              class="pwc-tabset"
              tabset-id="${this.escapeAttr(this.blockId || '')}"
              type="${this.escapeAttr(tabType)}"
              active-index="${this._activeTabIndex}"
              ${stretched ? 'stretched' : ''}>
              ${tabsHtml}
            </apw-tabset>
          </div>
          <div class="${contentClasses}">
            ${panelsHtml}
          </div>
        </div>
        ${isEditing ? `
          <div class="pwc-tab-controls">
            <div class="pwc-tab-handle" title="Drag to reorder">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
            <div class="pwc-tab-delete" title="Delete tab block">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </div>
          </div>
        ` : ''}
      `;

      // Render inner blocks into their tab panels
      this.renderInnerBlocks();
      this.setupTabsetEvents();

      // Set up event handlers
      if (isEditing) {
        this.setupAddButtons();
        this.setupSectionDropZones();
        this.setupTabDragHandle();
      }
    }

    getSectionBlocks(tabIndex) {
      const blockData = window.pwcEditorState?.findBlock(this.blockId);
      if (!blockData || !blockData.innerBlocks) return [];

      return blockData.innerBlocks.filter(block => {
        return (block.attributes?.columnIndex || 0) === tabIndex;
      });
    }

    renderInnerBlocks() {
      let innerBlocks = null;

      const blockData = window.pwcEditorState?.findBlock(this.blockId);
      if (blockData && blockData.innerBlocks) {
        innerBlocks = blockData.innerBlocks;
      }

      if (!innerBlocks && this._innerBlocksData) {
        innerBlocks = this._innerBlocksData;
      }

      if (!innerBlocks || innerBlocks.length === 0) return;

      // Group blocks by tab index (using columnIndex)
      const blocksByTab = {};
      innerBlocks.forEach(innerBlockData => {
        const tabIndex = innerBlockData.attributes?.columnIndex || 0;
        if (!blocksByTab[tabIndex]) {
          blocksByTab[tabIndex] = [];
        }
        blocksByTab[tabIndex].push(innerBlockData);
      });

      // Render blocks into each tab panel's content area
      Object.entries(blocksByTab).forEach(([tabIndex, blocks]) => {
        const content = this.querySelector(`.pwc-tab-section__body[data-tab-index="${tabIndex}"] .pwc-tab-section__content`);
        if (!content || !window.pwcBlockRegistry) return;

        // Remove empty state
        const emptyState = content.querySelector('.pwc-tab-section__empty');
        if (emptyState) emptyState.remove();

        blocks.forEach(innerBlockData => {
          const blockElement = window.pwcBlockRegistry.createBlock(innerBlockData);
          if (blockElement) {
            content.appendChild(blockElement);
          }
        });
      });
    }

    setupTabsetEvents() {
      const tabset = this.querySelector('apw-tabset');
      if (!tabset) return;

      tabset.addEventListener('tabChange', (e) => {
        const nextIndex = this.extractTabIndexFromEvent(e);
        if (Number.isInteger(nextIndex)) {
          this.setActiveTab(nextIndex);
          return;
        }
        this.syncActiveTabFromTabset(tabset);
      });

      tabset.addEventListener('click', (e) => {
        const tab = e.composedPath().find((node) => node?.tagName?.toLowerCase?.() === 'apw-tab');
        if (tab) {
          const tabs = Array.from(tabset.querySelectorAll('apw-tab'));
          const nextIndex = tabs.indexOf(tab);
          if (nextIndex >= 0) {
            this.setActiveTab(nextIndex);
            return;
          }
        }

        // Some Appkit interactions originate in shadow DOM internals.
        // Read the final reflected state on the next frame.
        requestAnimationFrame(() => this.syncActiveTabFromTabset(tabset));
      });

      tabset.addEventListener('keydown', () => {
        requestAnimationFrame(() => this.syncActiveTabFromTabset(tabset));
      });

      // Keep panels synced when Appkit updates active-index internally.
      const observer = new MutationObserver(() => {
        this.syncActiveTabFromTabset(tabset);
      });
      observer.observe(tabset, { attributes: true, attributeFilter: ['active-index'] });

      this._tabsetObserver = observer;
      this.syncActiveTabFromTabset(tabset);
    }

    setupAddButtons() {
      this.querySelectorAll('.pwc-tab-section__add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const sectionIndex = parseInt(btn.dataset.section, 10);
          this.openBlockLibraryForSection(sectionIndex);
        });
      });
    }

    setupSectionDropZones() {
      const sections = this.querySelectorAll('.pwc-tab-section__body');

      sections.forEach(body => {
        const tabIndex = parseInt(body.dataset.tabIndex, 10);

        body.addEventListener('dragover', (e) => {
          const isReordering = e.dataTransfer.types.includes('application/x-pwc-block-reorder');
          if (isReordering) {
            const dropZone = e.target.closest('.pwc-drop-zone--reorder');
            if (dropZone) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            return;
          }

          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'copy';
          body.classList.add('pwc-tab-section__body--drag-over');
        });

        body.addEventListener('dragleave', (e) => {
          if (!body.contains(e.relatedTarget)) {
            body.classList.remove('pwc-tab-section__body--drag-over');
          }
        });

        body.addEventListener('drop', (e) => {
          const isReordering = e.dataTransfer.types.includes('application/x-pwc-block-reorder');
          if (isReordering) {
            const dropZone = e.target.closest('.pwc-drop-zone--reorder');
            if (dropZone) return;
            e.preventDefault();
            body.classList.remove('pwc-tab-section__body--drag-over');
            return;
          }

          e.preventDefault();
          e.stopPropagation();
          body.classList.remove('pwc-tab-section__body--drag-over');

          const blockType = e.dataTransfer.getData('text/plain');
          if (blockType) {
            const blockData = window.pwcBlockRegistry.createBlockData(blockType);
            if (blockData) {
              this.addBlockToSection(blockData, tabIndex);
            }
          }
        });
      });
    }

    openBlockLibraryForSection(tabIndex) {
      const blockLibraryPanel = window.pwcBlockLibraryPanel || document.querySelector('pwc-block-library-panel');
      if (blockLibraryPanel) {
        blockLibraryPanel.setInsertPosition(-1, this.blockId, tabIndex);
        blockLibraryPanel.open();
      }
    }

    addBlockToSection(blockData, tabIndex) {
      blockData.attributes = blockData.attributes || {};
      blockData.attributes.columnIndex = tabIndex;

      // Stay on the current tab after adding the block.
      this._activeTabIndex = tabIndex;

      const tabBlockData = window.pwcEditorState?.findBlock(this.blockId);
      if (tabBlockData) {
        tabBlockData._activeTabIndex = tabIndex;
        tabBlockData.innerBlocks = tabBlockData.innerBlocks || [];
        tabBlockData.innerBlocks.push(blockData);
        window.pwcEditorState.isDirty = true;
        window.pwcEditorState.pushHistory();
        window.pwcEditorState.emit('blockAdd', { block: blockData, parentId: this.blockId });
      }

      this.render();
      this.addHoverControls();

      setTimeout(() => {
        window.pwcEditorState.selectBlock(blockData.id);
      }, 50);
    }

    setupTabDragHandle() {
      const handle = this.querySelector('.pwc-tab-handle');
      const deleteBtn = this.querySelector('.pwc-tab-delete');

      if (handle) {
        handle.removeAttribute('draggable');
        handle.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          this._dragFromTabHandle = true;
          const resetFlag = () => {
            if (!this.classList.contains('pwc-block--dragging')) {
              this._dragFromTabHandle = false;
            }
          };
          document.addEventListener('mouseup', resetFlag, { once: true });
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.showDeleteConfirmation('Are you sure you want to delete this tab block and all its contents? This action cannot be undone.');
        });
      }
    }

    /**
     * Escape a string for use in HTML.
     */
    escapeAttr(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    parseTitles() {
      const titlesStr = this.getAttribute('titles') || JSON.stringify(DEFAULT_TITLES);
      try {
        const parsed = JSON.parse(titlesStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((title, index) => {
            const text = (title ?? '').toString().trim();
            return text || `Tab ${index + 1}`;
          });
        }
      } catch (e) {
        // Fallback to defaults for malformed JSON.
      }
      return [...DEFAULT_TITLES];
    }

    sanitizeClassList(classes) {
      return classes
        .split(/\s+/)
        .map(token => token.trim())
        .filter(token => /^[A-Za-z0-9_-]+$/.test(token))
        .join(' ');
    }

    getBooleanAttribute(name) {
      const value = this.getAttribute(name);
      if (value === null) return false;
      if (value === '' || value === 'true' || value === '1' || value === name) return true;
      if (value === 'false' || value === '0') return false;
      return Boolean(value);
    }

    extractTabIndexFromEvent(e) {
      const detail = e?.detail;
      if (detail && Number.isInteger(detail.activeIndex)) return detail.activeIndex;
      if (detail && Number.isInteger(detail.index)) return detail.index;
      if (detail && Number.isInteger(detail.tabIndex)) return detail.tabIndex;
      if (typeof detail === 'number' && Number.isInteger(detail)) return detail;
      return null;
    }

    syncActiveTabFromTabset(tabset) {
      if (!tabset) return;
      const reflected = parseInt(tabset.getAttribute('active-index'), 10);
      if (!Number.isNaN(reflected)) {
        this.setActiveTab(reflected, { source: 'tabset' });
      }
    }

    setActiveTab(tabIndex, options = {}) {
      const source = options.source || 'internal';
      const numericIndex = parseInt(tabIndex, 10);
      if (Number.isNaN(numericIndex)) return;

      const titles = this.parseTitles();
      if (numericIndex < 0 || numericIndex >= titles.length) return;

      const changed = this._activeTabIndex !== numericIndex;
      this._activeTabIndex = numericIndex;

      // Persist to editor state so it survives re-renders.
      const blockData = window.pwcEditorState?.findBlock(this.blockId);
      if (blockData && changed) blockData._activeTabIndex = numericIndex;

      // Keep tabset and panel visibility in sync.
      const tabset = this.querySelector('apw-tabset');
      if (tabset && source !== 'tabset') {
        const reflected = parseInt(tabset.getAttribute('active-index'), 10);
        if (Number.isNaN(reflected) || reflected !== numericIndex) {
          tabset.setAttribute('active-index', String(numericIndex));
        }
      }

      this.querySelectorAll('.pwc-tab-panel').forEach(panel => {
        panel.style.display = parseInt(panel.dataset.tabIndex, 10) === numericIndex ? 'block' : 'none';
      });
    }
  }

  // Register custom element
  customElements.define('pwc-tab', TabBlock);

  // Register with block registry
  if (window.pwcBlockRegistry) {
    window.pwcBlockRegistry.register(TabBlock);
  }

})(Drupal);
