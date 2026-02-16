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
    static get blockTitle() { return 'Container'; }
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
          name: 'mode',
          type: 'optionButtons',
          label: 'Container Mode',
          tab: 'layout',
          options: [
            { value: 'standard', label: 'Standard' },
            { value: 'hero', label: 'Hero' },
          ],
          default: 'standard',
        },
        {
          name: 'layout',
          type: 'layoutPicker',
          label: 'Layout',
          tab: 'layout',
          options: [
            { value: '100', label: 'Full', columns: [1] },
            { value: '50-50', label: '50/50', columns: [1, 1] },
            { value: '30-70', label: '30/70', columns: [3, 7] },
            { value: '70-30', label: '70/30', columns: [7, 3] },
            { value: '33-33-33', label: '3 Col', columns: [1, 1, 1] },
            { value: '25-50-25', label: 'Sidebar', columns: [1, 2, 1] },
          ],
          default: '100',
        },
        {
          name: 'gap',
          type: 'gapPicker',
          label: 'Column Gap',
          tab: 'layout',
          options: [
            { value: 'none', label: '0', px: '0px' },
            { value: 'small', label: 'S', px: '8px' },
            { value: 'medium', label: 'M', px: '16px' },
            { value: 'large', label: 'L', px: '24px' },
          ],
          default: 'medium',
        },
        {
          name: 'verticalAlign',
          type: 'verticalAlignPicker',
          label: 'Vertical Alignment',
          tab: 'layout',
          options: [
            { value: 'top', label: 'Top', icon: 'align-top' },
            { value: 'center', label: 'Center', icon: 'align-middle' },
            { value: 'bottom', label: 'Bottom', icon: 'align-bottom' },
            { value: 'stretch', label: 'Stretch', icon: 'align-stretch' },
          ],
          default: 'top',
        },
        {
          name: 'contentPosition',
          type: 'optionButtons',
          label: 'Content Position',
          tab: 'layout',
          options: [
            { value: 'top-left', label: 'Top Left' },
            { value: 'top-center', label: 'Top Center' },
            { value: 'top-right', label: 'Top Right' },
            { value: 'middle-left', label: 'Middle Left' },
            { value: 'center', label: 'Center' },
            { value: 'middle-right', label: 'Middle Right' },
            { value: 'bottom-left', label: 'Bottom Left' },
            { value: 'bottom-center', label: 'Bottom Center' },
            { value: 'bottom-right', label: 'Bottom Right' },
          ],
          default: 'center',
          showWhenMode: ['hero'],
          modeName: 'mode',
        },
        {
          name: 'fullBleed',
          type: 'toggle',
          label: 'Full Width (Bleed)',
          default: false,
          tab: 'layout',
        },
        {
          name: 'minHeight',
          type: 'text',
          label: 'Min Height',
          default: '',
          tab: 'layout',
          placeholder: 'e.g. 320px, 60vh',
        },
        {
          name: 'maxHeight',
          type: 'text',
          label: 'Max Height',
          default: '',
          tab: 'layout',
          placeholder: 'e.g. 80vh, 900px',
        },
        {
          name: 'contentWidth',
          type: 'text',
          label: 'Content Width',
          default: '',
          tab: 'layout',
          placeholder: 'e.g. 100%, 960px',
        },
        {
          name: 'contentMaxWidth',
          type: 'text',
          label: 'Content Max Width',
          default: '',
          tab: 'layout',
          placeholder: 'e.g. 1200px',
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
          name: 'backgroundColor',
          type: 'colorSwatch',
          label: 'Background Color',
          default: '',
          tab: 'style',
          colors: window.APPKIT_OPTIONS?.colors || [],
          colorType: 'bg',
        },
        {
          name: 'bgOpacity',
          type: 'optionButtons',
          label: 'Background Opacity',
          tab: 'style',
          options: [
            { value: 'ap-opacity-7', label: '100%' },
            { value: 'ap-opacity-6', label: '48%' },
            { value: 'ap-opacity-5', label: '32%' },
            { value: 'ap-opacity-4', label: '24%' },
            { value: 'ap-opacity-3', label: '12%' },
            { value: 'ap-opacity-2', label: '8%' },
            { value: 'ap-opacity-1', label: '4%' },
          ],
          default: 'ap-opacity-7',
        },
        {
          name: 'bgSourceType',
          type: 'optionButtons',
          label: 'Background Source',
          default: 'url',
          tab: 'style',
          options: [
            { value: 'url', label: 'URL' },
            { value: 'media', label: 'Media' },
            { value: 'upload', label: 'Upload' },
          ],
        },
        {
          name: 'bgImageUrl',
          type: 'text',
          label: 'Background Image URL',
          default: '',
          tab: 'style',
          placeholder: 'https://... or /sites/default/files/...',
          showWhenSourceType: ['url'],
          sourceTypeName: 'bgSourceType',
        },
        {
          name: 'bgMediaId',
          type: 'mediaImagePicker',
          label: 'Select Background Image',
          default: '',
          tab: 'style',
          showWhenSourceType: ['media'],
          sourceTypeName: 'bgSourceType',
          attributePrefix: 'bg',
        },
        {
          name: 'bgMediaUpload',
          type: 'imageUpload',
          label: 'Upload Background Image',
          default: '',
          tab: 'style',
          showWhenSourceType: ['upload'],
          sourceTypeName: 'bgSourceType',
          attributePrefix: 'bg',
        },
        {
          name: 'bgSize',
          type: 'optionButtons',
          label: 'Background Fit',
          default: 'cover',
          tab: 'style',
          options: [
            { value: 'cover', label: 'Cover' },
            { value: 'contain', label: 'Contain' },
            { value: 'auto', label: 'Auto' },
          ],
        },
        {
          name: 'bgPosition',
          type: 'select',
          label: 'Background Position',
          default: 'center center',
          tab: 'style',
          options: [
            { value: 'left top', label: 'Top Left' },
            { value: 'center top', label: 'Top Center' },
            { value: 'right top', label: 'Top Right' },
            { value: 'left center', label: 'Middle Left' },
            { value: 'center center', label: 'Center' },
            { value: 'right center', label: 'Middle Right' },
            { value: 'left bottom', label: 'Bottom Left' },
            { value: 'center bottom', label: 'Bottom Center' },
            { value: 'right bottom', label: 'Bottom Right' },
          ],
        },
        {
          name: 'bgRepeat',
          type: 'optionButtons',
          label: 'Background Repeat',
          default: 'no-repeat',
          tab: 'style',
          options: [
            { value: 'no-repeat', label: 'No Repeat' },
            { value: 'repeat', label: 'Repeat' },
            { value: 'repeat-x', label: 'Repeat X' },
            { value: 'repeat-y', label: 'Repeat Y' },
          ],
        },
        {
          name: 'borderWidth',
          type: 'borderWidthPicker',
          label: 'Border Width',
          tab: 'style',
          options: [
            { value: '', label: '0', px: '0px' },
            { value: 'pwc-border', label: '1', px: '1px' },
            { value: 'pwc-border-2', label: '2', px: '2px' },
            { value: 'pwc-border-4', label: '4', px: '4px' },
            { value: 'pwc-border-8', label: '8', px: '8px' },
          ],
          default: '',
        },
        {
          name: 'borderColor',
          type: 'colorSwatch',
          label: 'Border Color',
          default: '',
          tab: 'style',
          colors: window.APPKIT_OPTIONS?.colors || [],
          colorType: 'border',
        },
        {
          name: 'borderRadius',
          type: 'radiusPicker',
          label: 'Border Radius',
          tab: 'style',
          options: [
            { value: '', label: 'None', preview: '0' },
            { value: 'ap-border-radius-1', label: 'S', preview: '2px' },
            { value: 'ap-border-radius-2', label: 'M', preview: '4px' },
            { value: 'ap-border-radius-3', label: 'LG', preview: '8px' },
            { value: 'pwc-rounded-xl', label: 'XL', preview: '12px' },
            { value: 'pwc-rounded-2xl', label: '2XL', preview: '16px' },
            { value: 'pwc-rounded-full', label: 'Full', preview: '9999px' },
          ],
          default: '',
        },
      ];
    }

    constructor() {
      super();
      this._innerBlocksData = [];
    }

    /**
     * Called when element is added to DOM.
     * Position controls after parent's connectedCallback completes.
     */
    connectedCallback() {
      super.connectedCallback();
      this.syncLevelAttribute();
      // Position controls now that we're connected and can find ancestors
      requestAnimationFrame(() => this.positionControls());
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
        // Check if the drag originated from THIS layout's handle (not a nested layout's handle)
        const handle = e.target.closest('.pwc-layout-handle');
        if (handle) {
          // Find which layout this handle belongs to
          const handleLayout = handle.closest('pwc-layout');
          if (handleLayout !== this) {
            // This handle belongs to a nested layout, let it handle the drag
            return;
          }
        } else if (e.target !== this) {
          // Not from a handle and not this element directly
          return;
        }

        if (!this._dragFromLayoutHandle) {
          e.preventDefault();
          return;
        }

        // Stop propagation to prevent parent layouts from also handling this drag
        e.stopPropagation();

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
        document.body.classList.add('pwc-dragging-block');

        // Mark drag as started
        this._dragStarted = true;

        // Create drop zones
        setTimeout(() => this.createReorderDropZones(), 10);
      });

      // Drag end
      this.addEventListener('dragend', (e) => {
        // Only handle if this layout started the drag
        if (this._dragStarted) {
          e.stopPropagation();
          try {
            this.classList.remove('pwc-block--dragging');
            this.removeReorderDropZones();
          } catch (err) {
            // Element may have been removed during drop
          }
          document.body.classList.remove('pwc-dragging-block');
        }
        this._dragFromLayoutHandle = false;
        this._dragStarted = false;
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
      return [
        'layout',
        'mode',
        'gap',
        'vertical-align',
        'content-position',
        'full-bleed',
        'min-height',
        'max-height',
        'content-width',
        'content-max-width',
        'margin',
        'padding',
        'background-color',
        'bg-opacity',
        'bg-source-type',
        'bg-image-url',
        'bg-media-id',
        'bg-media-url',
        'bg-size',
        'bg-position',
        'bg-repeat',
        'border-width',
        'border-color',
        'border-radius',
        'block-id',
        'block-type',
      ];
    }

    get margin() {
      return this.getAttribute('margin') || '';
    }

    get padding() {
      return this.getAttribute('padding') || '';
    }

    get backgroundColor() {
      return this.getAttribute('background-color') || '';
    }

    get borderWidth() {
      return this.getAttribute('border-width') || '';
    }

    get borderColor() {
      return this.getAttribute('border-color') || '';
    }

    get borderRadius() {
      return this.getAttribute('border-radius') || '';
    }

    get mode() {
      return this.getAttribute('mode') || 'standard';
    }

    get contentPosition() {
      return this.getAttribute('content-position') || 'center';
    }

    get minHeight() {
      return this.getSafeStyleValue(this.getAttribute('min-height') || '');
    }

    get maxHeight() {
      return this.getSafeStyleValue(this.getAttribute('max-height') || '');
    }

    get contentWidth() {
      return this.getSafeStyleValue(this.getAttribute('content-width') || '');
    }

    get contentMaxWidth() {
      return this.getSafeStyleValue(this.getAttribute('content-max-width') || '');
    }

    get fullBleed() {
      const value = this.getAttribute('full-bleed');
      return value === '' || value === 'true' || value === '1';
    }

    get bgOpacity() {
      return this.getAttribute('bg-opacity') || 'ap-opacity-7';
    }

    get bgSourceType() {
      return this.getAttribute('bg-source-type') || 'url';
    }

    get bgSize() {
      return this.getAttribute('bg-size') || 'cover';
    }

    get bgPosition() {
      return this.getAttribute('bg-position') || 'center center';
    }

    get bgRepeat() {
      return this.getAttribute('bg-repeat') || 'no-repeat';
    }

    getBackgroundImageUrl() {
      const mediaUrl = this.getAttribute('bg-media-url') || '';
      const imageUrl = this.getAttribute('bg-image-url') || '';
      const rawUrl = (this.bgSourceType === 'media' || this.bgSourceType === 'upload')
        ? (mediaUrl || imageUrl)
        : imageUrl;
      return this.sanitizeUrl(rawUrl);
    }

    /**
     * Render the layout block content.
     */
    render() {
      const layoutConfig = LayoutBlock.layoutVariations[this.layout] || LayoutBlock.layoutVariations['100'];
      const columns = layoutConfig.columns;
      const isEditing = window.pwcEditorState && window.pwcEditorState.isEditing;
      const isHero = this.mode === 'hero';
      const bgImageUrl = this.getBackgroundImageUrl();
      const hasBackgroundLayer = Boolean(bgImageUrl || this.backgroundColor);

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
      const containerStyles = [];
      if (this.minHeight) {
        containerStyles.push(`min-height:${this.minHeight}`);
      }
      if (this.maxHeight) {
        containerStyles.push(`max-height:${this.maxHeight}`);
      }

      const contentStyles = [
        `gap:${gapValue}`,
        `align-items:${alignValue}`,
      ];
      if (this.contentWidth) {
        contentStyles.push(`width:${this.contentWidth}`);
      }
      if (this.contentMaxWidth) {
        contentStyles.push(`max-width:${this.contentMaxWidth}`);
      }

      const bgStyles = [];
      if (bgImageUrl) {
        bgStyles.push(`background-image:url('${this.toSafeCssUrl(bgImageUrl)}')`);
        bgStyles.push(`background-size:${this.bgSize}`);
        bgStyles.push(`background-position:${this.bgPosition}`);
        bgStyles.push(`background-repeat:${this.bgRepeat}`);
      }

      const {
        justifyValue: contentJustifyValue,
        alignValue: contentAlignValue,
      } = this.getContentPositionClasses(this.contentPosition);

      // Check if this layout is nested inside another layout's column
      // Full-bleed doesn't work correctly when nested
      const isNested = this.closest('.pwc-layout-column') !== null;
      const canFullBleed = this.fullBleed && !isNested;

      // Store for use in applyFullBleed
      this._canFullBleed = canFullBleed;

      // Build columns HTML
      const columnsHtml = columns.map((col, index) => {
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

      // Build class list with spacing and styling
      // Note: full-bleed is handled via JS for accurate positioning in admin mode
      const layoutClasses = [
        'pwc-layout-block',
        `pwc-layout-block--${this.layout}`,
        isHero ? 'pwc-layout-block--hero' : '',
        canFullBleed ? 'pwc-layout-block--full-bleed' : '',
        this.margin,
        this.padding,
        this.borderWidth,
        this.borderColor,
        this.borderRadius,
      ].filter(Boolean).join(' ');

      // Add overflow:hidden when border-radius is present to clip background/content
      if (this.borderRadius) {
        containerStyles.push('overflow:hidden');
      }

      const backgroundLayerHtml = hasBackgroundLayer
        ? `
          <div class="pwc-layout-block__bg-layer ${this.backgroundColor} ${this.bgOpacity}"
               style="${bgStyles.join(';')}"></div>
        `
        : '';

      const standardContentHtml = `
        <div class="pwc-layout-block__content" style="${contentStyles.join(';')}">
          ${columnsHtml}
        </div>
      `;

      const heroContentHtml = `
        <div class="pwc-layout-hero-stage">
          <div class="pwc-layout-hero-positioner" style="justify-content:${contentJustifyValue};align-items:${contentAlignValue};">
            <div class="pwc-layout-hero-content" style="${contentStyles.join(';')}">
              ${columnsHtml}
            </div>
          </div>
        </div>
      `;

      this.innerHTML = `
        <div class="${layoutClasses}"
             style="${containerStyles.join(';')}">
          ${backgroundLayerHtml}
          ${isHero ? heroContentHtml : standardContentHtml}
        </div>
        ${isEditing ? `
          <div class="pwc-layout-indicator">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="4"/>
            </svg>
          </div>
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

      // Keep `level` always present and up to date after re-render.
      this.syncLevelAttribute();

      // Apply full-bleed positioning after DOM is updated
      if (this._canFullBleed) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => this.applyFullBleed());
      }
    }

    /**
     * Apply full-bleed positioning using JavaScript calculation.
     * This works correctly regardless of admin sidebars or centered containers.
     */
    applyFullBleed() {
      const layoutBlock = this.querySelector('.pwc-layout-block');
      if (!layoutBlock) return;

      // Temporarily remove the full-bleed class and reset styles to measure true position
      const hadClass = layoutBlock.classList.contains('pwc-layout-block--full-bleed');
      layoutBlock.classList.remove('pwc-layout-block--full-bleed');
      layoutBlock.style.marginLeft = '';
      layoutBlock.style.marginRight = '';
      layoutBlock.style.width = '';

      // Force reflow to ensure styles are applied before measuring
      layoutBlock.offsetHeight;

      // Now get the bounding rect of the element in its natural position
      const rect = layoutBlock.getBoundingClientRect();
      const leftOffset = rect.left;

      // Use documentElement.clientWidth to get viewport width excluding scrollbar
      const viewportWidth = document.documentElement.clientWidth;

      // Calculate right offset
      const rightOffset = viewportWidth - rect.right;

      // Re-add the class (for semantics/styling hooks)
      if (hadClass) {
        layoutBlock.classList.add('pwc-layout-block--full-bleed');
      }

      // Apply inline styles to make it span full viewport width
      // These override the CSS class rules
      layoutBlock.style.marginLeft = `-${leftOffset}px`;
      layoutBlock.style.marginRight = `-${rightOffset}px`;
      layoutBlock.style.width = `${viewportWidth}px`;
      layoutBlock.style.paddingLeft = '';
      layoutBlock.style.paddingRight = '';

      // Reposition indicator/controls to stay within visible canvas
      requestAnimationFrame(() => this.positionControls());

      // Set up resize handler if not already done
      if (!this._fullBleedResizeHandler) {
        this._fullBleedResizeHandler = () => {
          if (this._canFullBleed && this.isConnected) {
            this.applyFullBleed();
          }
        };
        window.addEventListener('resize', this._fullBleedResizeHandler);

        // Also observe body class changes (admin panels opening/closing)
        this._bodyClassObserver = new MutationObserver(() => {
          if (this._canFullBleed && this.isConnected) {
            // Recalculate multiple times during transition to stay in sync
            this.applyFullBleed();
            setTimeout(() => this.applyFullBleed(), 100);
            setTimeout(() => this.applyFullBleed(), 200);
            setTimeout(() => this.applyFullBleed(), 350);
          }
          // Also reposition controls when panels open/close
          if (this.isConnected) {
            this.positionControls();
            setTimeout(() => this.positionControls(), 350);
          }
        });
        this._bodyClassObserver.observe(document.body, {
          attributes: true,
          attributeFilter: ['class'],
        });

        // Also listen for transitionend on body for more precise timing
        this._bodyTransitionHandler = (e) => {
          if (e.target === document.body && this._canFullBleed && this.isConnected) {
            this.applyFullBleed();
          }
        };
        document.body.addEventListener('transitionend', this._bodyTransitionHandler);
      }
    }

    /**
     * Clean up handlers when disconnected.
     */
    disconnectedCallback() {
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
      if (this._fullBleedResizeHandler) {
        window.removeEventListener('resize', this._fullBleedResizeHandler);
        this._fullBleedResizeHandler = null;
      }
      if (this._bodyClassObserver) {
        this._bodyClassObserver.disconnect();
        this._bodyClassObserver = null;
      }
      if (this._bodyTransitionHandler) {
        document.body.removeEventListener('transitionend', this._bodyTransitionHandler);
        this._bodyTransitionHandler = null;
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

    getContentPositionClasses(position) {
      const map = {
        'top-left': { justifyValue: 'flex-start', alignValue: 'flex-start' },
        'top-center': { justifyValue: 'center', alignValue: 'flex-start' },
        'top-right': { justifyValue: 'flex-end', alignValue: 'flex-start' },
        'middle-left': { justifyValue: 'flex-start', alignValue: 'center' },
        'center': { justifyValue: 'center', alignValue: 'center' },
        'middle-right': { justifyValue: 'flex-end', alignValue: 'center' },
        'bottom-left': { justifyValue: 'flex-start', alignValue: 'flex-end' },
        'bottom-center': { justifyValue: 'center', alignValue: 'flex-end' },
        'bottom-right': { justifyValue: 'flex-end', alignValue: 'flex-end' },
      };
      return map[position] || map.center;
    }

    getSafeStyleValue(value) {
      const trimmed = String(value || '').trim();
      if (!trimmed) return '';
      // Allow keywords
      if (/^(none|auto|min-content|max-content|fit-content)$/i.test(trimmed)) {
        return trimmed.toLowerCase();
      }
      // Allow numeric values with units (including negative and modern viewport units)
      // Supports: px, %, vw, vh, rem, em, svh, dvh, lvh, svw, dvw, lvw, cqw, cqh
      if (/^-?\d+(\.\d+)?(px|%|vw|vh|rem|em|svh|dvh|lvh|svw|dvw|lvw|cqw|cqh)$/.test(trimmed)) {
        return trimmed;
      }
      // Allow calc(), min(), max(), clamp() functions
      // Basic validation: must start with function name and have balanced parentheses
      if (/^(calc|min|max|clamp)\s*\(/.test(trimmed)) {
        // Count parentheses to ensure they're balanced
        let depth = 0;
        for (const char of trimmed) {
          if (char === '(') depth++;
          if (char === ')') depth--;
          if (depth < 0) return ''; // More closing than opening
        }
        if (depth === 0) {
          // Balanced parentheses - do basic sanitization
          // Only allow safe characters: digits, units, operators, spaces, parentheses, commas
          if (/^[a-z0-9\s()+\-*/%,._]+$/i.test(trimmed)) {
            return trimmed;
          }
        }
      }
      return '';
    }

    sanitizeUrl(url) {
      const value = String(url || '').trim();
      if (!value) return '';
      if (value.startsWith('/')) return value;

      try {
        const parsed = new URL(value);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          return parsed.toString();
        }
      } catch (e) {
        // Ignore malformed URL.
      }

      return '';
    }

    toSafeCssUrl(url) {
      return String(url || '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29');
    }

    escapeAttr(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    /**
     * Set up the layout controls (drag handle and delete).
     */
    setupLayoutDragHandle() {
      // Only select the handle that's a DIRECT child of this layout (not nested layouts)
      // The controls are direct children of the pwc-layout element
      const controls = Array.from(this.children).find(el => el.classList.contains('pwc-layout-controls'));
      if (!controls) return;

      const handle = controls.querySelector('.pwc-layout-handle');
      const deleteBtn = controls.querySelector('.pwc-layout-delete');

      if (!handle) {
        return;
      }

      // Skip if already set up (check for marker)
      if (handle._setupDone) return;
      handle._setupDone = true;

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

      // Delete button (only set up once)
      if (deleteBtn && !deleteBtn._setupDone) {
        deleteBtn._setupDone = true;
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.showDeleteConfirmation('Are you sure you want to delete this container and all its contents? This action cannot be undone.');
        });
      }

      // Position controls based on nesting level - defer to ensure DOM is ready
      // Use requestAnimationFrame to ensure element is connected before calculating
      requestAnimationFrame(() => this.positionControls());

      // Set up listener to reposition on resize/scroll if not already done
      if (!this._controlsPositionHandler) {
        this._controlsPositionHandler = () => this.positionControls();
        window.addEventListener('resize', this._controlsPositionHandler);
        window.addEventListener('scroll', this._controlsPositionHandler, { passive: true });

        // Also observe body class changes for panel open/close
        if (!this._controlsBodyObserver) {
          this._controlsBodyObserver = new MutationObserver(() => {
            if (this.isConnected) {
              this.positionControls();
              setTimeout(() => this.positionControls(), 350);
            }
          });
          this._controlsBodyObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
          });
        }
      }
    }

    /**
     * Sync `level` attribute based on number of ancestor pwc-layout blocks.
     * Level 0 = top-level layout, 1 = nested in one layout, etc.
     */
    syncLevelAttribute() {
      let level = 0;
      let parent = this.parentElement;
      while (parent) {
        if (parent.tagName === 'PWC-LAYOUT') {
          level++;
        }
        parent = parent.parentElement;
      }
      this.setAttribute('level', String(level));
      return level;
    }

    /**
     * Position controls based on nesting level.
     * CSS handles positioning via [level] attribute selectors.
     * JS handles full-bleed offset to keep indicator/controls within visible canvas.
     */
    positionControls() {
      const controls = this.querySelector('.pwc-layout-controls');
      const indicator = this.querySelector('.pwc-layout-indicator');
      if (!controls) return;

      const layoutBlock = this.querySelector('.pwc-layout-block');
      if (!layoutBlock) return;

      // If not connected to DOM yet, defer positioning
      if (!this.isConnected) {
        setTimeout(() => this.positionControls(), 50);
        return;
      }

      // Keep level attribute synced - CSS uses this for positioning
      this.syncLevelAttribute();

      // Clear any inline styles first
      controls.style.right = '';
      controls.style.left = '';
      controls.classList.remove('pwc-layout-controls--inside');
      if (indicator) {
        indicator.style.right = '';
      }

      // Check if this layout (or its content) extends beyond the visible canvas
      // Use the inner canvas as the reference for where content should stay
      const innerCanvas = document.querySelector('.pwc-editor-canvas__inner');

      if (innerCanvas) {
        const canvasRect = innerCanvas.getBoundingClientRect();
        const thisRect = this.getBoundingClientRect();

        // Calculate how far this pwc-layout extends beyond the canvas right edge
        const rightOverflow = thisRect.right - canvasRect.right;

        console.log('positionControls:', {
          blockId: this.blockId,
          level: this.getAttribute('level'),
          thisRight: thisRect.right,
          canvasRight: canvasRect.right,
          rightOverflow,
        });

        if (rightOverflow > 0) {
          // Offset the indicator and controls to stay within the canvas
          const offset = rightOverflow + 8;
          if (indicator) {
            indicator.style.right = `${offset}px`;
          }
          controls.style.right = `${offset + 12}px`;
        }
      }
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
      // Only select add buttons within columns that belong to THIS layout (not nested layouts)
      this.querySelectorAll(`.pwc-layout-column[data-layout-id="${this.blockId}"] .pwc-layout-column__add-btn`).forEach(btn => {
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
      // Only select columns that belong to THIS layout (not nested layouts)
      const columns = this.querySelectorAll(`.pwc-layout-column[data-layout-id="${this.blockId}"]`);

      columns.forEach(column => {
        const columnIndex = parseInt(column.dataset.columnIndex, 10);

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
