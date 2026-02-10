/**
 * @file
 * Accordion block component (container block).
 *
 * Renders an Appkit4 <apw-accordion-group> with multiple
 * <apw-accordion> sections. Each section's body is a drop zone
 * that accepts other blocks (paragraphs, headings, etc.).
 *
 * Titles are stored as a JSON array attribute.
 * Inner blocks are stored via the block registry with columnIndex
 * to map each block to its accordion section.
 */

(function (Drupal) {
  'use strict';

  const DEFAULT_TITLES = [
    'Accordion Item 1',
    'Accordion Item 2',
    'Accordion Item 3',
  ];

  class AccordionBlock extends window.PwcBaseBlock {
    static get blockName() { return 'accordion'; }
    static get blockTitle() { return 'Accordion'; }
    static get blockIcon() { return ''; }
    static get blockDescription() { return 'Add collapsible accordion sections with inner blocks.'; }
    static get blockCategory() { return 'basic'; }

    static get blockSettings() {
      return [
        {
          name: 'titles',
          type: 'accordionTitles',
          label: 'Accordion Items',
          default: JSON.stringify(DEFAULT_TITLES),
          tab: 'typography',
        },
        {
          name: 'multiple',
          type: 'toggle',
          label: 'Allow Multiple Open',
          default: false,
          tab: 'typography',
          help: 'Allow multiple accordion items to be open at the same time',
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
          name: 'zebraStripes',
          type: 'toggle',
          label: 'Zebra Stripes',
          default: false,
          tab: 'style',
          help: 'Alternate background color on even sections',
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
        {
          name: 'customHeaders',
          type: 'hidden',
          label: '',
          default: '[]',
        },
      ];
    }

    constructor() {
      super();
      this._innerBlocksData = [];
      this._expandedSections = new Set([0]);
    }

    static get observedAttributes() {
      return [
        'block-id',
        'titles',
        'multiple',
        'margin',
        'padding',
        'custom-classes',
        'custom-headers',
        'zebra-stripes',
      ];
    }

    /**
     * Override addHoverControls to use custom accordion controls.
     */
    addHoverControls() {
      if (!window.pwcEditorState || !window.pwcEditorState.isEditing) return;

      this.setAttribute('draggable', 'true');
      this.setAttribute('has-inner-blocks', 'true');
      this._setupAccordionDrag();
    }

    _setupAccordionDrag() {
      if (this._accordionDragSetup) return;
      this._accordionDragSetup = true;

      this.addEventListener('dragstart', (e) => {
        if (e.target !== this && !e.target.classList.contains('pwc-accordion-handle')) {
          return;
        }
        if (!this._dragFromAccordionHandle) {
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
        this._dragFromAccordionHandle = false;
        this._dragStarted = false;
      });
    }

    render() {
      const titles = this.parseTitles();

      const margin = this.getAttribute('margin') || '';
      const padding = this.getAttribute('padding') || '';
      const customClasses = this.getAttribute('custom-classes') || '';
      const multiple = this.getBooleanAttribute('multiple');
      const zebraStripes = this.getBooleanAttribute('zebra-stripes');
      const isEditing = window.pwcEditorState && window.pwcEditorState.isEditing;

      this.syncExpandedSections(titles.length, multiple);

      const wrapperClasses = [
        'pwc-accordion-wrapper',
        zebraStripes ? 'pwc-accordion-wrapper--zebra' : '',
        ...this.getSafeClassTokens(margin),
        ...this.getSafeClassTokens(padding),
        ...this.getSafeClassTokens(customClasses),
      ].join(' ');

      // Build sections HTML
      const sectionsHtml = titles.map((title, index) => {
        const sectionBlocks = this.getSectionBlocks(index);
        const hasBlocks = sectionBlocks.length > 0;
        const headerBlocks = this.getHeaderBlocks(index);
        const hasHeaderBlocks = headerBlocks.length > 0;
        const isExpanded = this._expandedSections.has(index);
        const headerHtml = `
          <div class="pwc-accordion-section__header pwc-accordion-section__header--custom"
               data-accordion-index="${index}" data-accordion-id="${this.blockId}" aria-expanded="${isExpanded ? 'true' : 'false'}">
            <svg class="pwc-accordion-section__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <div class="pwc-accordion-section__header-content">
              ${!hasHeaderBlocks ? `<span class="pwc-accordion-section__title">${this.escapeAttr(title)}</span>` : ''}
            </div>
            ${isEditing ? `
              <button type="button" class="pwc-accordion-section__header-add-btn"
                      data-section="${index}" title="Add block to header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
                </svg>
              </button>
            ` : ''}
          </div>`;

        return `
          <div class="pwc-accordion-section ${isExpanded ? 'pwc-accordion-section--expanded' : 'pwc-accordion-section--collapsed'}" data-accordion-index="${index}">
            ${headerHtml}
            <div class="pwc-accordion-section__body"
                 data-accordion-index="${index}"
                 data-accordion-id="${this.blockId}">
              <div class="pwc-accordion-section__content">
                ${!hasBlocks && isEditing ? `
                  <div class="pwc-accordion-section__empty">
                    <span class="pwc-accordion-section__empty-text">Drop blocks here</span>
                  </div>
                ` : ''}
              </div>
              ${isEditing ? `
                <button type="button" class="pwc-accordion-section__add-btn" data-section="${index}" title="Add block to this section">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');

      this.innerHTML = `
        <div class="${wrapperClasses}">
          ${sectionsHtml}
        </div>
        ${isEditing ? `
          <div class="pwc-accordion-controls">
            <div class="pwc-accordion-handle" title="Drag to reorder">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
            <div class="pwc-accordion-delete" title="Delete accordion">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </div>
          </div>
        ` : ''}
      `;

      // Render inner blocks into their sections
      this.renderInnerBlocks();

      // Render header blocks into custom headers
      this.renderHeaderBlocks();

      // Set up event handlers
      if (isEditing) {
        this.setupSectionToggleHandlers();
        this.setupAddButtons();
        this.setupSectionDropZones();
        this.setupHeaderDropZones();
        this.setupHeaderAddButtons();
        this.setupAccordionDragHandle();
      }
    }

    getSectionBlocks(sectionIndex) {
      const blockData = window.pwcEditorState?.findBlock(this.blockId);
      if (!blockData || !blockData.innerBlocks) return [];

      return blockData.innerBlocks.filter(block => {
        return (block.attributes?.columnIndex || 0) === sectionIndex &&
          !block.attributes?.headerBlock;
      });
    }

    getHeaderBlocks(sectionIndex) {
      const blockData = window.pwcEditorState?.findBlock(this.blockId);
      if (!blockData || !blockData.innerBlocks) return [];

      return blockData.innerBlocks.filter(block =>
        (block.attributes?.columnIndex || 0) === sectionIndex &&
        block.attributes?.headerBlock === true
      );
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

      // Group body blocks by accordion section (using columnIndex), excluding header blocks
      const blocksBySection = {};
      innerBlocks.forEach(innerBlockData => {
        if (innerBlockData.attributes?.headerBlock) return;
        const sectionIndex = innerBlockData.attributes?.columnIndex || 0;
        if (!blocksBySection[sectionIndex]) {
          blocksBySection[sectionIndex] = [];
        }
        blocksBySection[sectionIndex].push(innerBlockData);
      });

      // Render blocks into each section body
      Object.entries(blocksBySection).forEach(([sectionIndex, blocks]) => {
        const body = this.querySelector(`.pwc-accordion-section__body[data-accordion-index="${sectionIndex}"] .pwc-accordion-section__content`);
        if (!body || !window.pwcBlockRegistry) return;

        // Remove empty state
        const emptyState = body.querySelector('.pwc-accordion-section__empty');
        if (emptyState) emptyState.remove();

        blocks.forEach(innerBlockData => {
          const blockElement = window.pwcBlockRegistry.createBlock(innerBlockData);
          if (blockElement) {
            body.appendChild(blockElement);
          }
        });
      });
    }

    renderHeaderBlocks() {
      const blockData = window.pwcEditorState?.findBlock(this.blockId);
      if (!blockData || !blockData.innerBlocks) return;

      // Group header blocks by section
      const headerBlocksBySection = {};
      blockData.innerBlocks.forEach(innerBlockData => {
        if (!innerBlockData.attributes?.headerBlock) return;
        const sectionIndex = innerBlockData.attributes?.columnIndex || 0;
        if (!headerBlocksBySection[sectionIndex]) {
          headerBlocksBySection[sectionIndex] = [];
        }
        headerBlocksBySection[sectionIndex].push(innerBlockData);
      });

      // Render header blocks into each custom header
      Object.entries(headerBlocksBySection).forEach(([sectionIndex, blocks]) => {
        const headerContent = this.querySelector(`.pwc-accordion-section__header--custom[data-accordion-index="${sectionIndex}"] .pwc-accordion-section__header-content`);
        if (!headerContent || !window.pwcBlockRegistry) return;

        // Remove empty state
        const emptyState = headerContent.querySelector('.pwc-accordion-section__header-empty');
        if (emptyState) emptyState.remove();

        blocks.forEach(innerBlockData => {
          const blockElement = window.pwcBlockRegistry.createBlock(innerBlockData);
          if (blockElement) {
            headerContent.appendChild(blockElement);
          }
        });
      });
    }

    setupAddButtons() {
      this.querySelectorAll('.pwc-accordion-section__add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const sectionIndex = parseInt(btn.dataset.section, 10);
          this.openBlockLibraryForSection(sectionIndex);
        });
      });
    }

    setupSectionDropZones() {
      const sections = this.querySelectorAll('.pwc-accordion-section__body');

      sections.forEach(body => {
        const sectionIndex = parseInt(body.dataset.accordionIndex, 10);

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
          body.classList.add('pwc-accordion-section__body--drag-over');
        });

        body.addEventListener('dragleave', (e) => {
          if (!body.contains(e.relatedTarget)) {
            body.classList.remove('pwc-accordion-section__body--drag-over');
          }
        });

        body.addEventListener('drop', (e) => {
          const isReordering = e.dataTransfer.types.includes('application/x-pwc-block-reorder');
          if (isReordering) {
            const dropZone = e.target.closest('.pwc-drop-zone--reorder');
            if (dropZone) return;
            e.preventDefault();
            return;
          }

          e.preventDefault();
          e.stopPropagation();
          body.classList.remove('pwc-accordion-section__body--drag-over');

          const blockType = e.dataTransfer.getData('text/plain');
          if (blockType) {
            const blockData = window.pwcBlockRegistry.createBlockData(blockType);
            if (blockData) {
              this.addBlockToSection(blockData, sectionIndex);
            }
          }
        });
      });
    }

    openBlockLibraryForSection(sectionIndex) {
      const blockLibraryPanel = window.pwcBlockLibraryPanel || document.querySelector('pwc-block-library-panel');
      if (blockLibraryPanel) {
        blockLibraryPanel.setInsertPosition(-1, this.blockId, sectionIndex);
        blockLibraryPanel.open();
      }
    }

    openBlockLibraryForHeader(sectionIndex) {
      const blockLibraryPanel = window.pwcBlockLibraryPanel || document.querySelector('pwc-block-library-panel');
      if (blockLibraryPanel) {
        const titles = this.parseTitles();
        const sectionTitle = titles[sectionIndex] || `Accordion Item ${sectionIndex + 1}`;
        blockLibraryPanel.setInsertPosition(-1, this.blockId, sectionIndex, {
          headerBlock: true,
          __accordionHeaderTitle: sectionTitle,
          __accordionHeaderSection: sectionIndex,
        });
        blockLibraryPanel.open();
      }
    }

    setupHeaderDropZones() {
      const headers = this.querySelectorAll('.pwc-accordion-section__header--custom');

      headers.forEach(header => {
        const sectionIndex = parseInt(header.dataset.accordionIndex, 10);

        header.addEventListener('dragover', (e) => {
          const isReordering = e.dataTransfer.types.includes('application/x-pwc-block-reorder');
          if (isReordering) return;

          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'copy';
          header.classList.add('pwc-accordion-section__header--drag-over');
        });

        header.addEventListener('dragleave', (e) => {
          if (!header.contains(e.relatedTarget)) {
            header.classList.remove('pwc-accordion-section__header--drag-over');
          }
        });

        header.addEventListener('drop', (e) => {
          const isReordering = e.dataTransfer.types.includes('application/x-pwc-block-reorder');
          if (isReordering) return;

          e.preventDefault();
          e.stopPropagation();
          header.classList.remove('pwc-accordion-section__header--drag-over');

          const blockType = e.dataTransfer.getData('text/plain');
          if (blockType) {
            const blockData = window.pwcBlockRegistry.createBlockData(blockType);
            if (blockData) {
              this.addBlockToHeader(blockData, sectionIndex);
            }
          }
        });
      });
    }

    setupHeaderAddButtons() {
      this.querySelectorAll('.pwc-accordion-section__header-add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const sectionIndex = parseInt(btn.dataset.section, 10);
          this.openBlockLibraryForHeader(sectionIndex);
        });
      });
    }

    setupSectionToggleHandlers() {
      this.querySelectorAll('.pwc-accordion-section__header').forEach(header => {
        header.addEventListener('click', (e) => {
          const section = header.closest('.pwc-accordion-section');
          const isCollapsed = section?.classList.contains('pwc-accordion-section--collapsed');
          const clickedChevron = !!e.target.closest('.pwc-accordion-section__chevron');

          if (
            e.target.closest('.pwc-accordion-section__header-add-btn') ||
            e.target.closest('input, textarea, select, button, a, [contenteditable="true"]')
          ) {
            return;
          }

          // Allow opening collapsed sections even when their header contains nested blocks.
          // For expanded sections, keep inner-block interactions intact unless chevron is clicked.
          if (e.target.closest('.pwc-block') && !isCollapsed && !clickedChevron) {
            return;
          }

          const sectionIndex = parseInt(header.dataset.accordionIndex, 10);
          if (!Number.isNaN(sectionIndex)) {
            this.toggleSection(sectionIndex);
          }
        });
      });
    }

    toggleSection(sectionIndex) {
      const multiple = this.getBooleanAttribute('multiple');
      const next = new Set(this._expandedSections);

      if (multiple) {
        if (next.has(sectionIndex)) {
          next.delete(sectionIndex);
        } else {
          next.add(sectionIndex);
        }
      } else if (next.has(sectionIndex)) {
        next.delete(sectionIndex);
      } else {
        next.clear();
        next.add(sectionIndex);
      }

      this._expandedSections = next;
      this.persistExpandedSections();
      this.applyExpandedSections();
    }

    applyExpandedSections() {
      this.querySelectorAll('.pwc-accordion-section').forEach(section => {
        const sectionIndex = parseInt(section.dataset.accordionIndex, 10);
        const isExpanded = this._expandedSections.has(sectionIndex);
        section.classList.toggle('pwc-accordion-section--expanded', isExpanded);
        section.classList.toggle('pwc-accordion-section--collapsed', !isExpanded);

        const header = section.querySelector('.pwc-accordion-section__header');
        if (header) {
          header.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        }
      });
    }

    syncExpandedSections(totalSections, multiple) {
      const blockData = window.pwcEditorState?.findBlock(this.blockId);
      const fromState = blockData?._expandedAccordionIndices;
      let indices = Array.isArray(fromState)
        ? fromState.filter(i => Number.isInteger(i) && i >= 0 && i < totalSections)
        : Array.from(this._expandedSections).filter(i => i >= 0 && i < totalSections);

      if (!multiple && indices.length > 1) {
        indices = [indices[0]];
      }

      if (indices.length === 0 && totalSections > 0) {
        indices = [0];
      }

      this._expandedSections = new Set(indices);
      this.persistExpandedSections();
    }

    persistExpandedSections() {
      const blockData = window.pwcEditorState?.findBlock(this.blockId);
      if (!blockData) return;
      blockData._expandedAccordionIndices = Array.from(this._expandedSections).sort((a, b) => a - b);
    }

    parseTitles() {
      const titlesStr = this.getAttribute('titles') || JSON.stringify(DEFAULT_TITLES);
      try {
        const parsed = JSON.parse(titlesStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((title, index) => {
            const text = (title ?? '').toString().trim();
            return text || `Accordion Item ${index + 1}`;
          });
        }
      } catch (e) {
        // Fallback to defaults for malformed JSON.
      }
      return [...DEFAULT_TITLES];
    }

    parseCustomHeaders(totalSections) {
      const customHeadersStr = this.getAttribute('custom-headers') || '[]';
      try {
        const parsed = JSON.parse(customHeadersStr);
        if (Array.isArray(parsed)) {
          return Array.from({ length: totalSections }, (_, index) => parsed[index] === true);
        }
      } catch (e) {
        // Ignore malformed values.
      }
      return Array.from({ length: totalSections }, () => false);
    }

    getBooleanAttribute(name) {
      const value = this.getAttribute(name);
      if (value === null) return false;
      if (value === '' || value === 'true' || value === '1' || value === name) return true;
      if (value === 'false' || value === '0') return false;
      return Boolean(value);
    }

    getSafeClassTokens(classes) {
      return String(classes || '')
        .split(/\s+/)
        .map(token => token.trim())
        .filter(token => /^[A-Za-z0-9_-]+$/.test(token));
    }

    addBlockToHeader(blockData, sectionIndex) {
      blockData.attributes = blockData.attributes || {};
      blockData.attributes.columnIndex = sectionIndex;
      blockData.attributes.headerBlock = true;
      this.applyHeadingTitleInheritance(blockData, sectionIndex);

      const accordionBlockData = window.pwcEditorState?.findBlock(this.blockId);
      if (accordionBlockData) {
        accordionBlockData.innerBlocks = accordionBlockData.innerBlocks || [];
        accordionBlockData.innerBlocks.push(blockData);
        this.markSectionAsCustomHeader(sectionIndex, accordionBlockData);
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

    applyHeadingTitleInheritance(blockData, sectionIndex) {
      if (blockData.type !== 'heading') return;

      const accordionBlockData = window.pwcEditorState?.findBlock(this.blockId);
      const hasHeadingAlready = accordionBlockData?.innerBlocks?.some(inner =>
        inner.type === 'heading' &&
        inner.attributes?.headerBlock === true &&
        (inner.attributes?.columnIndex || 0) === sectionIndex
      );
      if (hasHeadingAlready) return;

      const current = (blockData.attributes?.content || '').trim();
      if (current && current !== 'Heading') return;

      const titles = this.parseTitles();
      blockData.attributes.content = titles[sectionIndex] || `Accordion Item ${sectionIndex + 1}`;
    }

    markSectionAsCustomHeader(sectionIndex, blockData = null) {
      let headers = [];
      try {
        const parsed = JSON.parse(this.getAttribute('custom-headers') || '[]');
        if (Array.isArray(parsed)) headers = parsed;
      } catch (e) {
        // Ignore malformed values and rebuild.
      }

      const titles = this.parseTitles();
      if (headers.length < titles.length) {
        headers.length = titles.length;
      }
      headers[sectionIndex] = true;
      const serialized = JSON.stringify(headers.map(v => v === true));

      this.setAttribute('custom-headers', serialized);

      if (blockData) {
        blockData.attributes = blockData.attributes || {};
        blockData.attributes.customHeaders = serialized;
      } else {
        window.pwcEditorState?.updateBlock?.(this.blockId, { customHeaders: serialized });
      }
    }

    addBlockToSection(blockData, sectionIndex) {
      blockData.attributes = blockData.attributes || {};
      blockData.attributes.columnIndex = sectionIndex;

      const accordionBlockData = window.pwcEditorState?.findBlock(this.blockId);
      if (accordionBlockData) {
        accordionBlockData.innerBlocks = accordionBlockData.innerBlocks || [];
        accordionBlockData.innerBlocks.push(blockData);
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

    setupAccordionDragHandle() {
      const handle = this.querySelector('.pwc-accordion-handle');
      const deleteBtn = this.querySelector('.pwc-accordion-delete');

      if (handle) {
        handle.removeAttribute('draggable');
        handle.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          this._dragFromAccordionHandle = true;
          const resetFlag = () => {
            if (!this.classList.contains('pwc-block--dragging')) {
              this._dragFromAccordionHandle = false;
            }
          };
          document.addEventListener('mouseup', resetFlag, { once: true });
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.showDeleteConfirmation('Are you sure you want to delete this accordion and all its contents? This action cannot be undone.');
        });
      }
    }

    /**
     * Escape a string for use in an HTML attribute.
     */
    escapeAttr(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }

  // Register custom element
  customElements.define('pwc-accordion', AccordionBlock);

  // Register with block registry
  if (window.pwcBlockRegistry) {
    window.pwcBlockRegistry.register(AccordionBlock);
  }

})(Drupal);
