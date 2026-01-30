/**
 * @file
 * Settings panel Web Component.
 *
 * Right sidebar panel that displays settings for the selected block.
 */

(function (Drupal) {
  'use strict';

  class SettingsPanel extends HTMLElement {
    constructor() {
      super();
      this.currentBlock = null;
      this._unsubscribeSelection = null;
      this._unsubscribeEditMode = null;
      this._isMinimized = false;
      this._reopenButton = null;
    }

    connectedCallback() {
      this.render();
      this.hide();

      // Subscribe to selection changes
      this._unsubscribeSelection = window.pwcEditorState.on('selectionChange', (data) => {
        if (data.blockId) {
          const block = document.querySelector(`[block-id="${data.blockId}"]`);
          if (block) {
            this.showBlockSettings(block);
            // Re-open panel if it was minimized and a block is selected
            if (this._isMinimized && window.pwcEditorState.isEditing) {
              this.show();
            }
          }
        } else {
          this.showDefaultContent();
        }
      });

      // Subscribe to edit mode changes
      this._unsubscribeEditMode = window.pwcEditorState.on('editModeChange', (data) => {
        if (data.isEditing) {
          this.show();
        } else {
          // Exiting edit mode - clean up completely
          this._isMinimized = false;
          this.hideReopenButton();
          this.hide();
        }
      });
    }

    disconnectedCallback() {
      if (this._unsubscribeSelection) this._unsubscribeSelection();
      if (this._unsubscribeEditMode) this._unsubscribeEditMode();
      this.hideReopenButton();
    }

    render() {
      this.innerHTML = `
        <aside class="pwc-settings-panel fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 z-50 overflow-hidden flex flex-col">
          <!-- Header with Add Block, Save, and Close buttons -->
          <div class="pwc-settings-panel__header flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 class="text-sm font-semibold text-gray-900">Settings</h2>
            <div class="pwc-settings-panel__actions flex items-center gap-2">
              <button
                type="button"
                class="pwc-settings-panel__add-block p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Add Block (Open Block Library)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </button>
              <button
                type="button"
                class="pwc-settings-panel__save p-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Save Changes"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              <button
                type="button"
                class="pwc-settings-panel__close p-2 hover:bg-gray-200 rounded"
                title="Close Editor"
              >
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="pwc-settings-panel__content flex-1 overflow-y-auto p-4">
            <!-- Dynamic content goes here -->
          </div>
        </aside>
      `;

      this.setupEventListeners();

      // Show default empty state content
      this.showDefaultContent();
    }

    setupEventListeners() {
      // Add Block button - opens block library panel
      this.querySelector('.pwc-settings-panel__add-block').addEventListener('click', () => {

        // Try global reference first, then query, then create if needed
        let blockLibraryPanel = window.pwcBlockLibraryPanel || document.querySelector('pwc-block-library-panel');

        if (!blockLibraryPanel) {
          blockLibraryPanel = document.createElement('pwc-block-library-panel');
          document.body.appendChild(blockLibraryPanel);
        }

        if (blockLibraryPanel) {
          blockLibraryPanel.toggle();
        }
      });

      // Save button - saves content
      this.querySelector('.pwc-settings-panel__save').addEventListener('click', async () => {
        await this.saveContent();
      });

      // Close button - exits edit mode and returns to content view
      this.querySelector('.pwc-settings-panel__close').addEventListener('click', () => {
        // Check if there are unsaved changes
        if (window.pwcEditorState.isDirty) {
          if (confirm('You have unsaved changes. Do you want to save before exiting?')) {
            this.saveContent().then(() => {
              window.pwcEditorState.exitEditMode();
              window.pwcEditorState.renderContentRegion();
            });
            return;
          }
        }
        window.pwcEditorState.exitEditMode();
        window.pwcEditorState.renderContentRegion();
      });
    }

    /**
     * Minimize the panel (hide but stay in edit mode).
     */
    minimize() {
      this._isMinimized = true;
      this.querySelector('.pwc-settings-panel').classList.add('translate-x-full');
      document.body.classList.add('pwc-settings-minimized');

      // Show the re-open button
      this.showReopenButton();
    }

    /**
     * Show the floating re-open button.
     */
    showReopenButton() {
      if (this._reopenButton) return;

      this._reopenButton = document.createElement('button');
      this._reopenButton.className = 'pwc-reopen-panel fixed right-4 top-4 z-50 p-3 bg-white border border-gray-200 rounded-lg shadow-lg hover:bg-gray-50 transition-all';
      this._reopenButton.title = 'Open Settings Panel';
      this._reopenButton.innerHTML = `
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      `;

      this._reopenButton.addEventListener('click', () => {
        this.show();
      });

      document.body.appendChild(this._reopenButton);
    }

    /**
     * Hide the re-open button.
     */
    hideReopenButton() {
      if (this._reopenButton) {
        this._reopenButton.remove();
        this._reopenButton = null;
      }
    }

    /**
     * Show settings for a specific block.
     *
     * @param {HTMLElement} block - Block element.
     */
    showBlockSettings(block) {
      this.currentBlock = block;
      const content = this.querySelector('.pwc-settings-panel__content');
      const blockInfo = window.pwcBlockRegistry.get(block.blockType);

      if (!blockInfo) {
        content.innerHTML = '<p class="text-gray-500">Unknown block type</p>';
        return;
      }

      let html = `
        <!-- Block Type Header -->
        <div class="mb-6">
          <div class="flex items-center gap-3 mb-2">
            <span class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl text-gray-600">
              ${blockInfo.icon}
            </span>
            <div>
              <h3 class="font-medium text-gray-900">${blockInfo.title}</h3>
              <p class="text-xs text-gray-500">${blockInfo.description}</p>
            </div>
          </div>
        </div>

        <!-- Settings Fields -->
        <div class="space-y-4">
      `;

      // Generate fields from block settings
      if (blockInfo.settings && blockInfo.settings.length > 0) {
        blockInfo.settings.forEach(setting => {
          const currentValue = block.getAttribute(this.camelToKebab(setting.name)) || setting.default || '';
          html += this.renderSettingField(setting, currentValue);
        });
      } else {
        html += '<p class="text-gray-500 text-sm">No settings available for this block.</p>';
      }

      html += '</div>';
      content.innerHTML = html;

      // Set up field change listeners
      this.setupFieldListeners();
    }

    /**
     * Render a setting field.
     *
     * @param {Object} setting - Setting definition.
     * @param {*} value - Current value.
     * @returns {string} HTML string.
     */
    renderSettingField(setting, value) {
      const id = `pwc-setting-${setting.name}`;

      switch (setting.type) {
        case 'text':
          return `
            <div class="pwc-setting-field">
              <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">
                ${setting.label}
              </label>
              <input
                type="text"
                id="${id}"
                name="${setting.name}"
                value="${this.escapeHtml(value)}"
                placeholder="${setting.placeholder || ''}"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              ${setting.help ? `<p class="mt-1 text-xs text-gray-500">${setting.help}</p>` : ''}
            </div>
          `;

        case 'textarea':
          return `
            <div class="pwc-setting-field">
              <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">
                ${setting.label}
              </label>
              <textarea
                id="${id}"
                name="${setting.name}"
                rows="${setting.rows || 3}"
                placeholder="${setting.placeholder || ''}"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              >${this.escapeHtml(value)}</textarea>
              ${setting.help ? `<p class="mt-1 text-xs text-gray-500">${setting.help}</p>` : ''}
            </div>
          `;

        case 'select':
          // For heading blocks, enrich the "Default" label with the resolved value
          const levelDefs = this.currentBlock?.constructor?.levelDefaults;
          const currentLevel = this.currentBlock?.getAttribute?.('level') || 'h2';
          const currentLevelDef = levelDefs?.[currentLevel];

          const options = (setting.options || []).map(opt => {
            let label = opt.label;
            // Show resolved default in the label, e.g. "Default (4XL)"
            if (opt.value === '' && currentLevelDef && opt.label === 'Default') {
              const resolvedValue = currentLevelDef[setting.name];
              if (resolvedValue) {
                const resolvedOpt = (setting.options || []).find(o => o.value === resolvedValue);
                label = resolvedOpt ? `Default (${resolvedOpt.label})` : `Default (${resolvedValue})`;
              }
            }
            const selected = opt.value === value ? 'selected' : '';
            return `<option value="${opt.value}" ${selected}>${label}</option>`;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">
                ${setting.label}
              </label>
              <select
                id="${id}"
                name="${setting.name}"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                ${options}
              </select>
              ${setting.help ? `<p class="mt-1 text-xs text-gray-500">${setting.help}</p>` : ''}
            </div>
          `;

        case 'toggle':
        case 'boolean':
          const checked = value === 'true' || value === true ? 'checked' : '';
          return `
            <div class="pwc-setting-field flex items-center justify-between py-2">
              <label for="${id}" class="text-sm font-medium text-gray-700">
                ${setting.label}
              </label>
              <button
                type="button"
                id="${id}"
                name="${setting.name}"
                role="switch"
                aria-checked="${!!checked}"
                class="pwc-toggle relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${checked ? 'bg-blue-600' : 'bg-gray-200'}"
                data-checked="${!!checked}"
              >
                <span class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}"></span>
              </button>
            </div>
          `;

        case 'color':
          return `
            <div class="pwc-setting-field">
              <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">
                ${setting.label}
              </label>
              <div class="flex gap-2">
                <input
                  type="color"
                  id="${id}"
                  name="${setting.name}"
                  value="${value || '#ffffff'}"
                  class="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                >
                <input
                  type="text"
                  id="${id}-text"
                  value="${value || ''}"
                  placeholder="#ffffff"
                  class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              ${setting.help ? `<p class="mt-1 text-xs text-gray-500">${setting.help}</p>` : ''}
            </div>
          `;

        case 'colorSwatch':
          const colors = setting.colors || window.TAILWIND_OPTIONS?.colors || [];
          const colorType = setting.colorType || 'text'; // 'text', 'bg', or 'border'
          const colorSwatches = colors.map(color => {
            // Transform color value based on colorType (e.g., text-red-500 -> bg-red-500)
            let colorValue = color.value;
            if (colorValue && colorType !== 'text') {
              colorValue = colorValue.replace(/^text-/, `${colorType}-`);
            }
            const isSelected = value === colorValue;
            const isTransparent = color.hex === 'transparent';
            const bgStyle = isTransparent ? 'background: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%); background-size: 8px 8px; background-position: 0 0, 0 4px, 4px -4px, -4px 0px;' : `background-color: ${color.hex}`;
            return `
              <button
                type="button"
                class="pwc-color-swatch w-6 h-6 rounded border-2 ${isSelected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-gray-400'}"
                style="${bgStyle}"
                data-value="${colorValue}"
                data-name="${setting.name}"
                title="${color.label}"
              ></button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${setting.label}
              </label>
              <div class="pwc-color-swatch-grid grid grid-cols-8 gap-1" data-name="${setting.name}">
                ${colorSwatches}
              </div>
              ${setting.help ? `<p class="mt-1 text-xs text-gray-500">${setting.help}</p>` : ''}
            </div>
          `;

        case 'radiusPicker':
          const radiusOptions = setting.options || [];
          const radiusButtons = radiusOptions.map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-radius-picker-btn flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50'}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.preview}"
              >
                <div class="w-6 h-6 border-2 border-current ${opt.value || 'rounded-none'}" style="border-radius: ${opt.value ? '' : '0'}"></div>
                <span class="text-[10px] font-medium mt-1">${opt.label}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${setting.label}
              </label>
              <div class="pwc-radius-picker grid grid-cols-4 gap-2" data-name="${setting.name}">
                ${radiusButtons}
              </div>
              ${setting.help ? `<p class="mt-1 text-xs text-gray-500">${setting.help}</p>` : ''}
            </div>
          `;

        case 'borderWidthPicker':
          const borderWidthOptions = setting.options || [];
          const borderWidthButtons = borderWidthOptions.map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-border-width-picker-btn flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50'}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.px}"
              >
                <span class="text-sm font-semibold">${opt.label}</span>
                <span class="text-[10px] text-gray-400">${opt.px}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${setting.label}
              </label>
              <div class="pwc-border-width-picker grid grid-cols-5 gap-2" data-name="${setting.name}">
                ${borderWidthButtons}
              </div>
              ${setting.help ? `<p class="mt-1 text-xs text-gray-500">${setting.help}</p>` : ''}
            </div>
          `;

        case 'layoutPicker':
          const layoutOptions = setting.options || [];
          const layoutButtons = layoutOptions.map(opt => {
            const isSelected = value === opt.value;
            // Generate SVG preview of column layout
            const totalFlex = opt.columns.reduce((a, b) => a + b, 0);
            const columnRects = opt.columns.map((flex, idx) => {
              const width = (flex / totalFlex) * 44;
              const x = opt.columns.slice(0, idx).reduce((a, b) => a + (b / totalFlex) * 44, 2);
              return `<rect x="${x}" y="4" width="${width - 2}" height="24" rx="2" fill="currentColor" fill-opacity="${isSelected ? '1' : '0.4'}"/>`;
            }).join('');

            return `
              <button
                type="button"
                class="pwc-layout-picker-btn flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50'}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.label}"
              >
                <svg class="w-12 h-8" viewBox="0 0 48 32">
                  ${columnRects}
                </svg>
                <span class="text-[10px] font-medium">${opt.label}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${setting.label}
              </label>
              <div class="pwc-layout-picker grid grid-cols-3 gap-2" data-name="${setting.name}">
                ${layoutButtons}
              </div>
              ${setting.help ? `<p class="mt-1 text-xs text-gray-500">${setting.help}</p>` : ''}
            </div>
          `;

        case 'gapPicker':
          const gapOptions = setting.options || [];
          const gapButtons = gapOptions.map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-gap-picker-btn flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50'}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.px}"
              >
                <span class="text-sm font-semibold">${opt.label}</span>
                <span class="text-[10px] text-gray-400">${opt.px}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${setting.label}
              </label>
              <div class="pwc-gap-picker grid grid-cols-4 gap-2" data-name="${setting.name}">
                ${gapButtons}
              </div>
              ${setting.help ? `<p class="mt-1 text-xs text-gray-500">${setting.help}</p>` : ''}
            </div>
          `;

        case 'verticalAlignPicker':
          const vAlignOptions = setting.options || [];
          const vAlignIcons = {
            'align-top': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="4" width="16" height="16" rx="1" stroke-opacity="0.3"/>
              <rect x="7" y="4" width="4" height="8" rx="1" fill="currentColor"/>
              <rect x="13" y="4" width="4" height="12" rx="1" fill="currentColor"/>
            </svg>`,
            'align-middle': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="4" width="16" height="16" rx="1" stroke-opacity="0.3"/>
              <rect x="7" y="8" width="4" height="8" rx="1" fill="currentColor"/>
              <rect x="13" y="6" width="4" height="12" rx="1" fill="currentColor"/>
            </svg>`,
            'align-bottom': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="4" width="16" height="16" rx="1" stroke-opacity="0.3"/>
              <rect x="7" y="12" width="4" height="8" rx="1" fill="currentColor"/>
              <rect x="13" y="8" width="4" height="12" rx="1" fill="currentColor"/>
            </svg>`,
            'align-stretch': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="4" width="16" height="16" rx="1" stroke-opacity="0.3"/>
              <rect x="7" y="4" width="4" height="16" rx="1" fill="currentColor"/>
              <rect x="13" y="4" width="4" height="16" rx="1" fill="currentColor"/>
            </svg>`,
          };

          const vAlignButtons = vAlignOptions.map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-valign-picker-btn flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50'}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.label}"
              >
                ${vAlignIcons[opt.icon] || ''}
                <span class="text-[10px] font-medium">${opt.label}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${setting.label}
              </label>
              <div class="pwc-valign-picker grid grid-cols-4 gap-2" data-name="${setting.name}">
                ${vAlignButtons}
              </div>
              ${setting.help ? `<p class="mt-1 text-xs text-gray-500">${setting.help}</p>` : ''}
            </div>
          `;

        case 'listTypePicker': {
          const listTypeIcons = {
            'ul': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"></circle>
              <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
              <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"></circle>
              <line x1="9" y1="6" x2="21" y2="6"></line>
              <line x1="9" y1="12" x2="21" y2="12"></line>
              <line x1="9" y1="18" x2="21" y2="18"></line>
            </svg>`,
            'ol': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <text x="2" y="8" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif">1.</text>
              <text x="2" y="14" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif">2.</text>
              <text x="2" y="20" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif">3.</text>
              <line x1="13" y1="6" x2="21" y2="6"></line>
              <line x1="13" y1="12" x2="21" y2="12"></line>
              <line x1="13" y1="18" x2="21" y2="18"></line>
            </svg>`,
          };

          const listTypeButtons = (setting.options || []).map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-list-type-btn flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50'}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.label}"
              >
                ${listTypeIcons[opt.value] || ''}
                <span class="text-xs font-medium">${opt.value === 'ul' ? 'Bullets' : 'Numbers'}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${setting.label}
              </label>
              <div class="pwc-list-type-picker flex gap-2" data-name="${setting.name}">
                ${listTypeButtons}
              </div>
            </div>
          `;
        }

        case 'listStylePicker': {
          // Filter options based on current list type
          const currentListType = this.currentBlock?.getAttribute('list-type') || 'ul';
          const filteredStyleOptions = (setting.options || []).filter(opt => {
            if (!opt.group || opt.group === 'both') return true;
            return opt.group === currentListType;
          });

          const listStyleIcons = {
            'list-disc': `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" fill="currentColor"></circle>
            </svg>`,
            'list-circle': `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
            </svg>`,
            'list-square': `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <rect x="7" y="7" width="10" height="10" fill="currentColor"></rect>
            </svg>`,
            'list-decimal': `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <text x="12" y="16" font-size="14" fill="currentColor" stroke="none" font-family="sans-serif" text-anchor="middle" font-weight="600">1</text>
            </svg>`,
            'list-decimal-leading-zero': `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <text x="12" y="16" font-size="12" fill="currentColor" stroke="none" font-family="sans-serif" text-anchor="middle" font-weight="600">01</text>
            </svg>`,
            'list-lower-alpha': `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <text x="12" y="16" font-size="14" fill="currentColor" stroke="none" font-family="sans-serif" text-anchor="middle" font-weight="600">a</text>
            </svg>`,
            'list-upper-alpha': `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <text x="12" y="16" font-size="14" fill="currentColor" stroke="none" font-family="sans-serif" text-anchor="middle" font-weight="600">A</text>
            </svg>`,
            'list-lower-roman': `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <text x="12" y="16" font-size="12" fill="currentColor" stroke="none" font-family="sans-serif" text-anchor="middle" font-weight="600">iv</text>
            </svg>`,
            'list-upper-roman': `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <text x="12" y="16" font-size="12" fill="currentColor" stroke="none" font-family="sans-serif" text-anchor="middle" font-weight="600">IV</text>
            </svg>`,
            'list-none': `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.4">
              <line x1="5" y1="5" x2="19" y2="19"></line>
              <line x1="19" y1="5" x2="5" y2="19"></line>
            </svg>`,
          };

          const listStyleButtons = filteredStyleOptions.map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-list-style-btn flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50'}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.label}"
              >
                ${listStyleIcons[opt.value] || `<span class="text-xs font-medium">${opt.label}</span>`}
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${setting.label}
              </label>
              <div class="pwc-list-style-picker grid grid-cols-4 gap-1" data-name="${setting.name}">
                ${listStyleButtons}
              </div>
            </div>
          `;
        }

        case 'markerPositionPicker': {
          const markerPosIcons = {
            'list-outside': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"></circle>
              <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="8" x2="18" y2="8"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="14" x2="16" y2="14"></line>
              <rect x="7" y="4" width="15" height="12" rx="1" stroke-dasharray="2 2" opacity="0.3"></rect>
            </svg>`,
            'list-inside': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none"></circle>
              <circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
              <line x1="10" y1="6" x2="21" y2="6"></line>
              <line x1="4" y1="8" x2="18" y2="8"></line>
              <line x1="10" y1="12" x2="21" y2="12"></line>
              <line x1="4" y1="14" x2="16" y2="14"></line>
              <rect x="3" y="4" width="19" height="12" rx="1" stroke-dasharray="2 2" opacity="0.3"></rect>
            </svg>`,
          };

          const markerPosButtons = (setting.options || []).map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-marker-pos-btn flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50'}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.label}"
              >
                ${markerPosIcons[opt.value] || ''}
                <span class="text-xs font-medium">${opt.label}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${setting.label}
              </label>
              <div class="pwc-marker-pos-picker flex gap-2" data-name="${setting.name}">
                ${markerPosButtons}
              </div>
            </div>
          `;
        }

        case 'headingLevelPicker': {
          const headingLevelIcons = {
            'h1': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm14.5 0c.28 0 .5.22.5.5v15a.5.5 0 0 1-1 0V5.7l-1.86 1.39a.5.5 0 1 1-.6-.8l2.5-1.87c.13-.1.28-.15.43-.15h.03z"/>
            </svg>`,
            'h2': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm11.5 2a2.5 2.5 0 0 1 2.45 2h.05v.5a.5.5 0 0 1-1 0V8.5a1.5 1.5 0 0 0-2.87-.6.5.5 0 1 1-.92-.4A2.5 2.5 0 0 1 15.5 6zM14 13.5c0-.42.12-.8.34-1.13l3.33-4.87H15.5a.5.5 0 0 1 0-1h3a.5.5 0 0 1 .41.79L15.3 12.7a1.5 1.5 0 0 1 .2-.02 1.5 1.5 0 1 1 0 3h-1a.5.5 0 0 1 0-1h1a.5.5 0 1 0 0-1c-.83 0-1.5-.67-1.5-1.18z"/>
            </svg>`,
            'h3': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm11 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .4.8L17.5 10l.5.01a2.5 2.5 0 0 1 0 5H16a.5.5 0 0 1 0-1h2a1.5 1.5 0 0 0 0-3h-1.5a.5.5 0 0 1-.4-.8L18.5 7h-3a.5.5 0 0 1-.5-.5z"/>
            </svg>`,
            'h4': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm11 1.5a.5.5 0 0 1 .94-.24l2.5 5A.5.5 0 0 1 18 11h-2.5v4.5a.5.5 0 0 1-1 0V11H14a.5.5 0 0 1 0-1h.5V5.5zm1 .87V10H17.6l-1.6-3.63z"/>
            </svg>`,
            'h5': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm11 1.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-3.5l-.5 3h1.5a2.5 2.5 0 0 1 0 5H15a.5.5 0 0 1 0-1h2.5a1.5 1.5 0 0 0 0-3H16a.5.5 0 0 1-.49-.6l.5-3.4a.5.5 0 0 1-.01-.5z"/>
            </svg>`,
            'h6': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm13 1.5a.5.5 0 0 1 .86-.35l2 2a.5.5 0 0 1-.7.7L17.5 6.22V9.5a3 3 0 1 1-1 0V5.5zm-.5 5a2 2 0 1 0 2 0 2 2 0 0 0-2 0z"/>
            </svg>`,
          };

          const headingLevelButtons = (setting.options || []).map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-heading-level-btn ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-400 hover:bg-blue-50'}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.label}"
              >
                ${headingLevelIcons[opt.value] || `<span class="pwc-heading-level-btn__label">${opt.label}</span>`}
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${setting.label}
              </label>
              <div class="pwc-heading-level-picker" data-name="${setting.name}">
                ${headingLevelButtons}
              </div>
              ${setting.help ? `<p class="mt-1 text-xs text-gray-500">${setting.help}</p>` : ''}
            </div>
          `;
        }

        case 'alignment':
          const alignmentOptions = setting.options || [
            { value: '', label: 'None', icon: 'align-left' },
            { value: 'text-left', label: 'Left', icon: 'align-left' },
            { value: 'text-center', label: 'Center', icon: 'align-center' },
            { value: 'text-right', label: 'Right', icon: 'align-right' },
            { value: 'text-justify', label: 'Justify', icon: 'align-justify' },
          ];

          const alignIcons = {
            'align-left': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="15" y2="12"></line>
              <line x1="3" y1="18" x2="18" y2="18"></line>
            </svg>`,
            'align-center': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="6" y1="12" x2="18" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>`,
            'align-right': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="9" y1="12" x2="21" y2="12"></line>
              <line x1="6" y1="18" x2="21" y2="18"></line>
            </svg>`,
            'align-justify': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>`,
          };

          const alignButtons = alignmentOptions.map((opt, index) => {
            // Skip the first "None" option for display, but we'll add a clear button
            if (index === 0) return '';
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-align-btn flex-1 p-2 rounded border transition-all ${isSelected ? 'bg-blue-100 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50'}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.label}"
              >
                ${alignIcons[opt.icon] || ''}
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${setting.label}
              </label>
              <div class="pwc-alignment-buttons flex gap-1" data-name="${setting.name}">
                ${alignButtons}
              </div>
              ${setting.help ? `<p class="mt-1 text-xs text-gray-500">${setting.help}</p>` : ''}
            </div>
          `;

        case 'spacing':
          const prefix = setting.prefix || 'm';
          const spacingPresets = window.TAILWIND_OPTIONS?.spacingPresets || [
            { value: '0', label: '0', px: '0px' },
            { value: '1', label: '1', px: '4px' },
            { value: '2', label: '2', px: '8px' },
            { value: '3', label: '3', px: '12px' },
            { value: '4', label: '4', px: '16px' },
            { value: '6', label: '6', px: '24px' },
            { value: '8', label: '8', px: '32px' },
            { value: '12', label: '12', px: '48px' },
            { value: '16', label: '16', px: '64px' },
            { value: 'auto', label: 'auto', px: 'auto' },
          ];

          // Parse current value to determine values for each side
          const spacingState = this.parseSpacingValue(value, prefix);

          // Side button icons - box with highlighted edge
          const sideIcons = {
            all: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="4" width="16" height="16" rx="1" fill="currentColor" fill-opacity="0.15"/>
            </svg>`,
            t: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="4" y="4" width="16" height="16" rx="1"/>
              <line x1="4" y1="4" x2="20" y2="4" stroke-width="3"/>
            </svg>`,
            r: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="4" y="4" width="16" height="16" rx="1"/>
              <line x1="20" y1="4" x2="20" y2="20" stroke-width="3"/>
            </svg>`,
            b: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="4" y="4" width="16" height="16" rx="1"/>
              <line x1="4" y1="20" x2="20" y2="20" stroke-width="3"/>
            </svg>`,
            l: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="4" y="4" width="16" height="16" rx="1"/>
              <line x1="4" y1="4" x2="4" y2="20" stroke-width="3"/>
            </svg>`,
          };

          // Get display value for each side
          const getDisplayValue = (side) => {
            const val = spacingState[side];
            if (!val) return '';
            const preset = spacingPresets.find(p => p.value === val);
            return preset ? preset.px : val;
          };

          return `
            <div class="pwc-setting-field pwc-spacing-field" data-name="${setting.name}" data-prefix="${prefix}">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${setting.label}
              </label>

              <!-- Side selector buttons -->
              <div class="pwc-spacing-sides flex gap-1 p-1 bg-gray-100 rounded-lg">
                <button type="button" class="pwc-spacing-side-btn flex-1 flex flex-col items-center gap-0.5 p-2 rounded transition-all ${spacingState.all ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'}" data-side="all" title="All sides">
                  ${sideIcons.all}
                  <span class="text-[10px] font-medium">${getDisplayValue('all') || 'All'}</span>
                </button>
                <button type="button" class="pwc-spacing-side-btn flex-1 flex flex-col items-center gap-0.5 p-2 rounded transition-all ${spacingState.t ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'}" data-side="t" title="Top">
                  ${sideIcons.t}
                  <span class="text-[10px] font-medium">${getDisplayValue('t') || 'Top'}</span>
                </button>
                <button type="button" class="pwc-spacing-side-btn flex-1 flex flex-col items-center gap-0.5 p-2 rounded transition-all ${spacingState.r ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'}" data-side="r" title="Right">
                  ${sideIcons.r}
                  <span class="text-[10px] font-medium">${getDisplayValue('r') || 'Right'}</span>
                </button>
                <button type="button" class="pwc-spacing-side-btn flex-1 flex flex-col items-center gap-0.5 p-2 rounded transition-all ${spacingState.b ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'}" data-side="b" title="Bottom">
                  ${sideIcons.b}
                  <span class="text-[10px] font-medium">${getDisplayValue('b') || 'Btm'}</span>
                </button>
                <button type="button" class="pwc-spacing-side-btn flex-1 flex flex-col items-center gap-0.5 p-2 rounded transition-all ${spacingState.l ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'}" data-side="l" title="Left">
                  ${sideIcons.l}
                  <span class="text-[10px] font-medium">${getDisplayValue('l') || 'Left'}</span>
                </button>
              </div>

              <!-- Size selector dropdown (hidden by default) -->
              <div class="pwc-spacing-sizes hidden mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div class="pwc-spacing-presets flex flex-wrap gap-1">
                  ${spacingPresets.map(preset => `
                    <button type="button" class="pwc-spacing-preset px-2 py-1.5 text-xs font-medium rounded border bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all" data-value="${preset.value}">
                      ${preset.px}
                    </button>
                  `).join('')}
                </div>
              </div>

              ${setting.help ? `<p class="mt-2 text-xs text-gray-500">${setting.help}</p>` : ''}
            </div>
          `;

        default:
          return `
            <div class="pwc-setting-field">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                ${setting.label}
              </label>
              <p class="text-gray-500 text-sm">Unknown field type: ${setting.type}</p>
            </div>
          `;
      }
    }

    /**
     * Set up event listeners for setting fields.
     */
    setupFieldListeners() {
      // Text and textarea inputs
      this.querySelectorAll('input[type="text"], textarea, select').forEach(input => {
        input.addEventListener('input', () => {
          this.updateBlockAttribute(input.name, input.value);
        });
      });

      // Color inputs
      this.querySelectorAll('input[type="color"]').forEach(input => {
        input.addEventListener('input', () => {
          const textInput = this.querySelector(`#${input.id}-text`);
          if (textInput) textInput.value = input.value;
          this.updateBlockAttribute(input.name, input.value);
        });
      });

      // Toggle buttons
      this.querySelectorAll('.pwc-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
          const isChecked = toggle.getAttribute('data-checked') === 'true';
          const newValue = !isChecked;

          toggle.setAttribute('data-checked', newValue);
          toggle.setAttribute('aria-checked', newValue);
          toggle.classList.toggle('bg-blue-600', newValue);
          toggle.classList.toggle('bg-gray-200', !newValue);
          toggle.querySelector('span').classList.toggle('translate-x-5', newValue);

          this.updateBlockAttribute(toggle.getAttribute('name'), newValue);
        });
      });

      // Color swatch buttons
      this.querySelectorAll('.pwc-color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
          const name = swatch.dataset.name;
          const value = swatch.dataset.value;
          const grid = swatch.closest('.pwc-color-swatch-grid');

          // Update visual selection
          grid.querySelectorAll('.pwc-color-swatch').forEach(s => {
            s.classList.remove('border-blue-500', 'ring-2', 'ring-blue-300');
            s.classList.add('border-gray-300');
          });
          swatch.classList.remove('border-gray-300');
          swatch.classList.add('border-blue-500', 'ring-2', 'ring-blue-300');

          this.updateBlockAttribute(name, value);
        });
      });

      // Radius picker buttons
      this.querySelectorAll('.pwc-radius-picker-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-radius-picker');

          // Update visual selection
          container.querySelectorAll('.pwc-radius-picker-btn').forEach(b => {
            b.classList.remove('bg-blue-50', 'border-blue-500', 'text-blue-600');
            b.classList.add('bg-white', 'border-gray-200', 'text-gray-500');
          });
          btn.classList.remove('bg-white', 'border-gray-200', 'text-gray-500');
          btn.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-600');

          this.updateBlockAttribute(name, value);
        });
      });

      // Border width picker buttons
      this.querySelectorAll('.pwc-border-width-picker-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-border-width-picker');

          // Update visual selection
          container.querySelectorAll('.pwc-border-width-picker-btn').forEach(b => {
            b.classList.remove('bg-blue-50', 'border-blue-500', 'text-blue-600');
            b.classList.add('bg-white', 'border-gray-200', 'text-gray-500');
          });
          btn.classList.remove('bg-white', 'border-gray-200', 'text-gray-500');
          btn.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-600');

          this.updateBlockAttribute(name, value);
        });
      });

      // Layout picker buttons
      this.querySelectorAll('.pwc-layout-picker-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-layout-picker');

          // Update visual selection
          container.querySelectorAll('.pwc-layout-picker-btn').forEach(b => {
            b.classList.remove('bg-blue-50', 'border-blue-500', 'text-blue-600');
            b.classList.add('bg-white', 'border-gray-200', 'text-gray-500');
          });
          btn.classList.remove('bg-white', 'border-gray-200', 'text-gray-500');
          btn.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-600');

          this.updateBlockAttribute(name, value);
        });
      });

      // Gap picker buttons
      this.querySelectorAll('.pwc-gap-picker-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-gap-picker');

          // Update visual selection
          container.querySelectorAll('.pwc-gap-picker-btn').forEach(b => {
            b.classList.remove('bg-blue-50', 'border-blue-500', 'text-blue-600');
            b.classList.add('bg-white', 'border-gray-200', 'text-gray-500');
          });
          btn.classList.remove('bg-white', 'border-gray-200', 'text-gray-500');
          btn.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-600');

          this.updateBlockAttribute(name, value);
        });
      });

      // Vertical align picker buttons
      this.querySelectorAll('.pwc-valign-picker-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-valign-picker');

          // Update visual selection
          container.querySelectorAll('.pwc-valign-picker-btn').forEach(b => {
            b.classList.remove('bg-blue-50', 'border-blue-500', 'text-blue-600');
            b.classList.add('bg-white', 'border-gray-200', 'text-gray-500');
          });
          btn.classList.remove('bg-white', 'border-gray-200', 'text-gray-500');
          btn.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-600');

          this.updateBlockAttribute(name, value);
        });
      });

      // List type picker buttons
      this.querySelectorAll('.pwc-list-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-list-type-picker');

          container.querySelectorAll('.pwc-list-type-btn').forEach(b => {
            b.classList.remove('bg-blue-50', 'border-blue-500', 'text-blue-600');
            b.classList.add('bg-white', 'border-gray-200', 'text-gray-500');
          });

          btn.classList.remove('bg-white', 'border-gray-200', 'text-gray-500');
          btn.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-600');

          this.updateBlockAttribute(name, value);

          // Set appropriate default style for the new list type
          this.updateBlockAttribute('listStyle', value === 'ol' ? 'list-decimal' : 'list-disc');

          // Re-render the settings to update the style picker for the new type
          if (this.currentBlock) {
            setTimeout(() => this.showBlockSettings(this.currentBlock), 50);
          }
        });
      });

      // List style picker buttons
      this.querySelectorAll('.pwc-list-style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-list-style-picker');

          const isAlreadySelected = btn.classList.contains('bg-blue-50');

          container.querySelectorAll('.pwc-list-style-btn').forEach(b => {
            b.classList.remove('bg-blue-50', 'border-blue-500', 'text-blue-600');
            b.classList.add('bg-white', 'border-gray-200', 'text-gray-500');
          });

          if (!isAlreadySelected) {
            btn.classList.remove('bg-white', 'border-gray-200', 'text-gray-500');
            btn.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-600');
            this.updateBlockAttribute(name, value);
          } else {
            this.updateBlockAttribute(name, '');
          }
        });
      });

      // Heading level picker buttons
      this.querySelectorAll('.pwc-heading-level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-heading-level-picker');

          // Update visual selection
          container.querySelectorAll('.pwc-heading-level-btn').forEach(b => {
            b.classList.remove('bg-blue-50', 'border-blue-500', 'text-blue-600');
            b.classList.add('bg-white', 'border-gray-200', 'text-gray-500');
          });
          btn.classList.remove('bg-white', 'border-gray-200', 'text-gray-500');
          btn.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-600');

          this.updateBlockAttribute(name, value);

          // Reset font size and weight to Default so the level's
          // built-in defaults take effect via the render fallback
          const levelDefaults = this.currentBlock?.constructor?.levelDefaults;
          if (levelDefaults && levelDefaults[value]) {
            this.updateBlockAttribute('fontSize', '');
            this.updateBlockAttribute('fontWeight', '');
          }

          // Re-render settings panel to reflect the updated values
          if (this.currentBlock) {
            setTimeout(() => this.showBlockSettings(this.currentBlock), 50);
          }
        });
      });

      // Marker position picker buttons
      this.querySelectorAll('.pwc-marker-pos-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-marker-pos-picker');

          container.querySelectorAll('.pwc-marker-pos-btn').forEach(b => {
            b.classList.remove('bg-blue-50', 'border-blue-500', 'text-blue-600');
            b.classList.add('bg-white', 'border-gray-200', 'text-gray-500');
          });

          btn.classList.remove('bg-white', 'border-gray-200', 'text-gray-500');
          btn.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-600');

          this.updateBlockAttribute(name, value);
        });
      });

      // Alignment buttons
      this.querySelectorAll('.pwc-align-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-alignment-buttons');

          // Check if clicking the already selected button (toggle off)
          const isAlreadySelected = btn.classList.contains('bg-blue-100');

          // Update visual selection
          container.querySelectorAll('.pwc-align-btn').forEach(b => {
            b.classList.remove('bg-blue-100', 'border-blue-500', 'text-blue-600');
            b.classList.add('bg-white', 'border-gray-200', 'text-gray-600');
          });

          if (!isAlreadySelected) {
            // Select this button
            btn.classList.remove('bg-white', 'border-gray-200', 'text-gray-600');
            btn.classList.add('bg-blue-100', 'border-blue-500', 'text-blue-600');
            this.updateBlockAttribute(name, value);
          } else {
            // Toggle off - clear the alignment
            this.updateBlockAttribute(name, '');
          }
        });
      });

      // Spacing side buttons - toggle size selector
      this.querySelectorAll('.pwc-spacing-side-btn').forEach(sideBtn => {
        sideBtn.addEventListener('click', () => {
          const field = sideBtn.closest('.pwc-spacing-field');
          const sizesPanel = field.querySelector('.pwc-spacing-sizes');
          const side = sideBtn.dataset.side;

          // Check if this side is already active
          const isActive = sideBtn.classList.contains('pwc-spacing-side-btn--active');

          // Close any open size panels and deactivate buttons
          field.querySelectorAll('.pwc-spacing-side-btn').forEach(btn => {
            btn.classList.remove('pwc-spacing-side-btn--active', 'bg-white', 'shadow-sm');
          });

          if (isActive) {
            // Hide the panel if clicking the same button
            sizesPanel.classList.add('hidden');
            sizesPanel.removeAttribute('data-active-side');
          } else {
            // Show the panel and mark this button as active
            sideBtn.classList.add('pwc-spacing-side-btn--active', 'bg-white', 'shadow-sm');
            sizesPanel.classList.remove('hidden');
            sizesPanel.setAttribute('data-active-side', side);

            // Highlight the currently selected value for this side
            const currentValue = this.getSpacingSideValue(field, side);
            sizesPanel.querySelectorAll('.pwc-spacing-preset').forEach(preset => {
              preset.classList.remove('bg-blue-100', 'border-blue-500', 'text-blue-700');
              if (preset.dataset.value === currentValue) {
                preset.classList.add('bg-blue-100', 'border-blue-500', 'text-blue-700');
              }
            });
          }
        });
      });

      // Spacing preset buttons - set value for active side
      this.querySelectorAll('.pwc-spacing-preset').forEach(preset => {
        preset.addEventListener('click', () => {
          const field = preset.closest('.pwc-spacing-field');
          const sizesPanel = field.querySelector('.pwc-spacing-sizes');
          const activeSide = sizesPanel.getAttribute('data-active-side');
          const value = preset.dataset.value;

          if (!activeSide) return;

          // Update visual selection
          sizesPanel.querySelectorAll('.pwc-spacing-preset').forEach(p => {
            p.classList.remove('bg-blue-100', 'border-blue-500', 'text-blue-700');
          });
          preset.classList.add('bg-blue-100', 'border-blue-500', 'text-blue-700');

          // Update the side button to show the new value
          const sideBtn = field.querySelector(`.pwc-spacing-side-btn[data-side="${activeSide}"]`);
          if (sideBtn) {
            const presets = window.TAILWIND_OPTIONS?.spacingPresets || [];
            const presetInfo = presets.find(p => p.value === value);
            const displayValue = presetInfo ? presetInfo.px : value;
            sideBtn.querySelector('span').textContent = displayValue;

            // Update button styling to show it has a value
            if (value) {
              sideBtn.classList.add('bg-blue-100', 'text-blue-600');
              sideBtn.classList.remove('text-gray-600');
            } else {
              sideBtn.classList.remove('bg-blue-100', 'text-blue-600');
              sideBtn.classList.add('text-gray-600');
            }
          }

          // Update the block attribute
          this.setSpacingSideValue(field, activeSide, value);
        });
      });
    }

    /**
     * Get the current spacing value for a specific side.
     *
     * @param {HTMLElement} field - The spacing field container.
     * @param {string} side - The side (all, t, r, b, l).
     * @returns {string} The current value.
     */
    getSpacingSideValue(field, side) {
      const name = field.dataset.name;
      const prefix = field.dataset.prefix;

      if (!this.currentBlock) return '';

      const attrName = this.camelToKebab(name);
      const currentValue = this.currentBlock.getAttribute(attrName) || '';
      const state = this.parseSpacingValue(currentValue, prefix);

      return state[side] || '';
    }

    /**
     * Set the spacing value for a specific side.
     *
     * @param {HTMLElement} field - The spacing field container.
     * @param {string} side - The side (all, t, r, b, l).
     * @param {string} value - The new value.
     */
    setSpacingSideValue(field, side, value) {
      const name = field.dataset.name;
      const prefix = field.dataset.prefix;

      if (!this.currentBlock) return;

      const attrName = this.camelToKebab(name);
      const currentValue = this.currentBlock.getAttribute(attrName) || '';
      const state = this.parseSpacingValue(currentValue, prefix);

      // If setting "all", clear individual sides
      if (side === 'all') {
        state.all = value;
        state.t = '';
        state.r = '';
        state.b = '';
        state.l = '';

        // Update all side button displays
        const presets = window.TAILWIND_OPTIONS?.spacingPresets || [];
        const presetInfo = presets.find(p => p.value === value);
        const displayValue = presetInfo ? presetInfo.px : value;

        field.querySelectorAll('.pwc-spacing-side-btn').forEach(btn => {
          const btnSide = btn.dataset.side;
          if (btnSide === 'all') {
            btn.querySelector('span').textContent = displayValue || 'All';
          } else {
            btn.querySelector('span').textContent = btnSide === 't' ? 'Top' : btnSide === 'r' ? 'Right' : btnSide === 'b' ? 'Btm' : 'Left';
            btn.classList.remove('bg-blue-100', 'text-blue-600');
            btn.classList.add('text-gray-600');
          }
        });
      } else {
        // Setting individual side - clear "all" value
        state.all = '';
        state[side] = value;

        // Update "all" button display
        const allBtn = field.querySelector('.pwc-spacing-side-btn[data-side="all"]');
        if (allBtn) {
          allBtn.querySelector('span').textContent = 'All';
          allBtn.classList.remove('bg-blue-100', 'text-blue-600');
          allBtn.classList.add('text-gray-600');
        }
      }

      // Build the new class string
      const classes = [];
      if (state.all) {
        classes.push(`${prefix}-${state.all}`);
      } else {
        if (state.t) classes.push(`${prefix}t-${state.t}`);
        if (state.r) classes.push(`${prefix}r-${state.r}`);
        if (state.b) classes.push(`${prefix}b-${state.b}`);
        if (state.l) classes.push(`${prefix}l-${state.l}`);
      }

      this.updateBlockAttribute(name, classes.join(' '));
    }

    /**
     * Parse a spacing value string into component parts.
     *
     * @param {string} value - Spacing value like "m-4" or "mt-2 mb-4".
     * @param {string} prefix - Prefix like 'm' or 'p'.
     * @returns {Object} Parsed state with mode and values.
     */
    parseSpacingValue(value, prefix) {
      const state = {
        mode: 'all',
        all: '',
        x: '',
        y: '',
        t: '',
        r: '',
        b: '',
        l: '',
      };

      if (!value) return state;

      const classes = value.split(' ').filter(Boolean);

      // Check for individual sides
      const hasTop = classes.some(c => c.startsWith(`${prefix}t-`));
      const hasRight = classes.some(c => c.startsWith(`${prefix}r-`));
      const hasBottom = classes.some(c => c.startsWith(`${prefix}b-`));
      const hasLeft = classes.some(c => c.startsWith(`${prefix}l-`));
      const hasX = classes.some(c => c.startsWith(`${prefix}x-`));
      const hasY = classes.some(c => c.startsWith(`${prefix}y-`));
      const hasAll = classes.some(c => c.match(new RegExp(`^${prefix}-`)));

      if (hasTop || hasRight || hasBottom || hasLeft) {
        state.mode = 'individual';
        classes.forEach(c => {
          if (c.startsWith(`${prefix}t-`)) state.t = c.replace(`${prefix}t-`, '');
          if (c.startsWith(`${prefix}r-`)) state.r = c.replace(`${prefix}r-`, '');
          if (c.startsWith(`${prefix}b-`)) state.b = c.replace(`${prefix}b-`, '');
          if (c.startsWith(`${prefix}l-`)) state.l = c.replace(`${prefix}l-`, '');
        });
      } else if (hasX || hasY) {
        state.mode = 'axis';
        classes.forEach(c => {
          if (c.startsWith(`${prefix}x-`)) state.x = c.replace(`${prefix}x-`, '');
          if (c.startsWith(`${prefix}y-`)) state.y = c.replace(`${prefix}y-`, '');
        });
      } else if (hasAll) {
        state.mode = 'all';
        classes.forEach(c => {
          const match = c.match(new RegExp(`^${prefix}-(.+)$`));
          if (match) state.all = match[1];
        });
      }

      return state;
    }

    /**
     * Update a block attribute.
     *
     * @param {string} name - Attribute name (camelCase).
     * @param {*} value - New value.
     */
    updateBlockAttribute(name, value) {
      if (!this.currentBlock) return;

      const attrName = this.camelToKebab(name);
      this.currentBlock.setAttribute(attrName, value);

      window.pwcEditorState.updateBlock(this.currentBlock.blockId, {
        [name]: value,
      });
    }

    /**
     * Show default content when no block selected.
     */
    showDefaultContent() {
      this.currentBlock = null;
      const content = this.querySelector('.pwc-settings-panel__content');

      content.innerHTML = `
        <div class="pwc-empty-settings">
          <div class="pwc-empty-settings__container">
            <div class="pwc-empty-settings__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
              </svg>
            </div>
            <p class="pwc-empty-settings__title">No Block Selected</p>
            <p class="pwc-empty-settings__message">Click on any block in the content area to edit its settings here.</p>
          </div>
        </div>
      `;
    }

    /**
     * Save all content.
     */
    async saveContent() {
      const saveBtn = this.querySelector('.pwc-settings-panel__save');
      const originalHtml = saveBtn.innerHTML;

      try {
        saveBtn.disabled = true;
        // Show spinning indicator
        saveBtn.innerHTML = `
          <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        `;

        const content = window.pwcEditorState.serialize();
        await window.pwcApiClient.saveContent(content);

        window.pwcEditorState.isDirty = false;
        window.pwcApiClient.clearLocalStorage();

        // Show success checkmark
        saveBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        `;
        saveBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        saveBtn.classList.add('bg-green-600');

        setTimeout(() => {
          saveBtn.innerHTML = originalHtml;
          saveBtn.classList.remove('bg-green-600');
          saveBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }, 2000);

      } catch (error) {
        // Show error X
        saveBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        `;
        saveBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        saveBtn.classList.add('bg-red-600');

        setTimeout(() => {
          saveBtn.innerHTML = originalHtml;
          saveBtn.classList.remove('bg-red-600');
          saveBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }, 3000);
      } finally {
        saveBtn.disabled = false;
      }
    }

    show() {
      this._isMinimized = false;
      this.style.display = 'block';
      this.querySelector('.pwc-settings-panel').classList.remove('translate-x-full');
      document.body.classList.remove('pwc-settings-minimized');
      this.hideReopenButton();
    }

    hide() {
      this._isMinimized = false;
      this.hideReopenButton();
      document.body.classList.remove('pwc-settings-minimized');
      this.querySelector('.pwc-settings-panel')?.classList.add('translate-x-full');
      setTimeout(() => {
        this.style.display = 'none';
      }, 300);
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    camelToKebab(str) {
      return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }
  }

  // Register custom element
  customElements.define('pwc-settings-panel', SettingsPanel);

})(Drupal);
