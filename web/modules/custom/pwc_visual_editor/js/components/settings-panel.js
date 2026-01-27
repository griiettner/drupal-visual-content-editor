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
          this.hide();
        }
      });
    }

    disconnectedCallback() {
      if (this._unsubscribeSelection) this._unsubscribeSelection();
      if (this._unsubscribeEditMode) this._unsubscribeEditMode();
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
        console.log('Clicked Add Block');

        // Try global reference first, then query, then create if needed
        let blockLibraryPanel = window.pwcBlockLibraryPanel || document.querySelector('pwc-block-library-panel');

        if (!blockLibraryPanel) {
          console.log('Block library panel not found, creating one...');
          blockLibraryPanel = document.createElement('pwc-block-library-panel');
          document.body.appendChild(blockLibraryPanel);
        }

        console.log('blockLibraryPanel: ', blockLibraryPanel);
        if (blockLibraryPanel) {
          blockLibraryPanel.toggle();
        }
      });

      // Save button - saves content
      this.querySelector('.pwc-settings-panel__save').addEventListener('click', async () => {
        await this.saveContent();
      });

      // Close button - exits edit mode
      this.querySelector('.pwc-settings-panel__close').addEventListener('click', () => {
        window.pwcEditorState.exitEditMode();
      });
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
          const options = (setting.options || []).map(opt => {
            const selected = opt.value === value ? 'selected' : '';
            return `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
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
        input.addEventListener('input', (e) => {
          this.updateBlockAttribute(input.name, input.value);
        });
      });

      // Color inputs
      this.querySelectorAll('input[type="color"]').forEach(input => {
        input.addEventListener('input', (e) => {
          const textInput = this.querySelector(`#${input.id}-text`);
          if (textInput) textInput.value = input.value;
          this.updateBlockAttribute(input.name, input.value);
        });
      });

      // Toggle buttons
      this.querySelectorAll('.pwc-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
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
        console.error('Save failed:', error);
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
      this.style.display = 'block';
      this.querySelector('.pwc-settings-panel').classList.remove('translate-x-full');
    }

    hide() {
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
