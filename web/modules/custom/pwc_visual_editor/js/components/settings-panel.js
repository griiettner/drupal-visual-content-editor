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
      this._activeTab = null;
      this._videoUploadInFlight = new WeakSet();
      this._imageUploadInFlight = new WeakSet();
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
        <aside class="pwc-settings-panel ap-bg-color-background-container">
          <!-- Header with Add Block, Save, and Close buttons -->
          <div class="pwc-settings-panel__header ap-bg-color-background-container-alt pwc-u-flex pwc-u-items-center pwc-u-justify-between">
            <h2 class="ap-text-color-text-heading">Settings</h2>
            <div class="pwc-settings-panel__actions pwc-u-flex pwc-u-items-center pwc-u-gap-2">
              <button
                type="button"
                class="pwc-settings-panel__add-block pwc-u-icon-btn pwc-u-icon-btn--soft ap-bg-color-background-container ap-text-color-text-body"
                title="Add Block (Open Block Library)"
              >
                <svg class="pwc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </button>
              <button
                type="button"
                class="pwc-settings-panel__save pwc-u-icon-btn pwc-u-icon-btn--primary ap-bg-color-background-primary ap-text-color-text-secondary"
                title="Save Changes"
              >
                <svg class="pwc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              <button
                type="button"
                class="pwc-settings-panel__close pwc-u-icon-btn pwc-u-icon-btn--ghost ap-bg-color-background-container ap-text-color-text-body"
                title="Close Editor"
              >
                <svg class="pwc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="pwc-settings-panel__content pwc-u-flex-col">
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
      this.querySelector('.pwc-settings-panel').classList.add('pwc-settings-panel--hidden');
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
      this._reopenButton.className = 'pwc-reopen-panel';
      this._reopenButton.title = 'Open Settings Panel';
      this._reopenButton.innerHTML = `
        <svg class="pwc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        content.innerHTML = '<p class="pwc-text-muted">Unknown block type</p>';
        return;
      }

      // Tab definitions with labels and SVG icons
      const tabDefs = {
        typography: {
          label: 'Typography',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>`,
        },
        layout: {
          label: 'Layout',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
        },
        style: {
          label: 'Style',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>`,
        },
      };

      // Collect unique tabs that have settings
      const tabOrder = ['typography', 'layout', 'style'];
      const settingsByTab = {};
      if (blockInfo.settings && blockInfo.settings.length > 0) {
        blockInfo.settings.forEach(setting => {
          const tab = setting.tab || 'style';
          if (!settingsByTab[tab]) settingsByTab[tab] = [];
          settingsByTab[tab].push(setting);
        });
      }
      const availableTabs = tabOrder.filter(t => settingsByTab[t] && settingsByTab[t].length > 0);

      // If active tab is not valid for this block, reset to first available
      if (!this._activeTab || !availableTabs.includes(this._activeTab)) {
        this._activeTab = availableTabs[0] || null;
      }

      let html = `
        <!-- Block Type Header -->
        <div class="pwc-block-header">
          <div class="pwc-block-header__row">
            <span class="pwc-block-header__icon">
              ${blockInfo.icon}
            </span>
            <div class="pwc-block-header__info">
              <h3 class="pwc-block-header__title">${blockInfo.title}</h3>
              <p class="pwc-block-header__desc">${blockInfo.description}</p>
            </div>
          </div>
        </div>
      `;

      if (availableTabs.length === 0) {
        html += '<p class="pwc-text-muted">No settings available for this block.</p>';
        content.innerHTML = html;
        return;
      }

      // Render tab buttons
      html += `<div class="pwc-settings-tabs">`;
      availableTabs.forEach(tabKey => {
        const def = tabDefs[tabKey];
        const isActive = tabKey === this._activeTab;
        html += `
          <button type="button"
            class="pwc-settings-tab-btn ${isActive ? 'pwc-settings-tab-btn--active' : ''}"
            data-tab="${tabKey}">
            ${def.icon}
            <span>${def.label}</span>
          </button>
        `;
      });
      html += `</div>`;

      // Render tab content sections
      availableTabs.forEach(tabKey => {
        const isActive = tabKey === this._activeTab;
        html += `<div class="pwc-settings-tab-content ${isActive ? 'pwc-settings-tab-content--active' : ''}" data-tab-content="${tabKey}">`;
        html += `<div class="pwc-settings-fields">`;
        settingsByTab[tabKey].forEach(setting => {
          const currentValue = block.getAttribute(this.camelToKebab(setting.name)) || setting.default || '';
          html += this.renderSettingField(setting, currentValue);
        });
        html += `</div></div>`;
      });

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
      const sourceTypeName = setting.sourceTypeName || 'sourceType';
      const currentSourceType = this.currentBlock?.getAttribute(this.camelToKebab(sourceTypeName)) || 'url';
      if (Array.isArray(setting.showWhenSourceType) && setting.showWhenSourceType.length > 0) {
        if (!setting.showWhenSourceType.includes(currentSourceType)) {
          return '';
        }
      }

      // Support showWhenMode for conditionally showing settings based on mode
      if (Array.isArray(setting.showWhenMode) && setting.showWhenMode.length > 0) {
        const modeName = setting.modeName || 'mode';
        const currentMode = this.currentBlock?.getAttribute(this.camelToKebab(modeName)) || 'standard';
        if (!setting.showWhenMode.includes(currentMode)) {
          return '';
        }
      }

      const id = `pwc-setting-${setting.name}`;

      switch (setting.type) {
        case 'text':
          return `
            <div class="pwc-setting-field">
              <label for="${id}" class="pwc-setting-label">
                ${setting.label}
              </label>
              <input
                type="text"
                id="${id}"
                name="${setting.name}"
                value="${this.escapeHtml(value)}"
                placeholder="${setting.placeholder || ''}"
                class="pwc-setting-input"
              >
              ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
            </div>
          `;

        case 'accordionTitles': {
          let accTitles;
          try { accTitles = JSON.parse(value || '[]'); } catch { accTitles = []; }

          const accTitlesHtml = accTitles.map((title, index) => {
            return `
              <div class="pwc-accordion-item-editor" data-index="${index}">
                <div class="pwc-accordion-item-editor__header">
                  <span class="pwc-accordion-item-editor__number">${index + 1}</span>
                  <button type="button" class="pwc-accordion-item-editor__remove pwc-u-icon-btn pwc-u-icon-btn--ghost pwc-u-icon-btn--sm" data-index="${index}" data-name="${setting.name}" title="Remove section">
                    <svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <input
                  type="text"
                  class="pwc-accordion-item-editor__title pwc-setting-input"
                  value="${this.escapeHtml(title || '')}"
                  data-index="${index}"
                  data-name="${setting.name}"
                  placeholder="Accordion title"
                >
              </div>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-accordion-items-editor" data-name="${setting.name}">
                ${accTitlesHtml}
                <button type="button" class="pwc-accordion-item-editor__add pwc-u-btn pwc-u-btn--outline" data-name="${setting.name}">
                  <svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Section
                </button>
              </div>
            </div>
          `;
        }

        case 'tabTitles': {
          let tabTitles;
          try { tabTitles = JSON.parse(value || '[]'); } catch { tabTitles = []; }
          const lastTabIdx = tabTitles.length - 1;

          const tabTitlesHtml = tabTitles.map((title, index) => {
            return `
              <div class="pwc-tab-item-editor" data-index="${index}">
                <div class="pwc-tab-item-editor__header">
                  <span class="pwc-tab-item-editor__number">${index + 1}</span>
                  <div class="pwc-tab-item-editor__arrows">
                    <button type="button" class="pwc-tab-item-editor__move-up pwc-u-icon-btn pwc-u-icon-btn--ghost pwc-u-icon-btn--xs" data-index="${index}" data-name="${setting.name}" ${index === 0 ? 'disabled' : ''} title="Move up">&#9650;</button>
                    <button type="button" class="pwc-tab-item-editor__move-down pwc-u-icon-btn pwc-u-icon-btn--ghost pwc-u-icon-btn--xs" data-index="${index}" data-name="${setting.name}" ${index === lastTabIdx ? 'disabled' : ''} title="Move down">&#9660;</button>
                  </div>
                  <button type="button" class="pwc-tab-item-editor__remove pwc-u-icon-btn pwc-u-icon-btn--ghost pwc-u-icon-btn--sm" data-index="${index}" data-name="${setting.name}" title="Remove tab">
                    <svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <input
                  type="text"
                  class="pwc-tab-item-editor__title pwc-setting-input"
                  value="${this.escapeHtml(title || '')}"
                  data-index="${index}"
                  data-name="${setting.name}"
                  placeholder="Tab title"
                >
              </div>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-tab-items-editor" data-name="${setting.name}">
                ${tabTitlesHtml}
                <button type="button" class="pwc-tab-item-editor__add pwc-u-btn pwc-u-btn--outline" data-name="${setting.name}">
                  <svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Tab
                </button>
              </div>
            </div>
          `;
        }

        case 'textarea':
          return `
            <div class="pwc-setting-field">
              <label for="${id}" class="pwc-setting-label">
                ${setting.label}
              </label>
              <textarea
                id="${id}"
                name="${setting.name}"
                rows="${setting.rows || 3}"
                placeholder="${setting.placeholder || ''}"
                class="pwc-setting-textarea"
              >${this.escapeHtml(value)}</textarea>
              ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
            </div>
          `;

        case 'mediaVideoPicker': {
          const fieldNames = this.getMediaFieldNames(setting);
          const sourceType = this.currentBlock?.getAttribute(this.camelToKebab(fieldNames.sourceType)) || 'url';
          const mediaId = this.currentBlock?.getAttribute(this.camelToKebab(fieldNames.mediaId)) || '';
          const mediaName = this.currentBlock?.getAttribute(this.camelToKebab(fieldNames.mediaName)) || '';
          const mediaType = this.currentBlock?.getAttribute(this.camelToKebab(fieldNames.mediaType)) || '';
          const inactiveClass = sourceType === 'media' ? '' : ' pwc-media-picker--inactive';
          const currentText = mediaName
            ? `${mediaName}${mediaId ? ` (#${mediaId})` : ''}`
            : 'No media selected';

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-media-picker${inactiveClass}"
                   data-name="${setting.name}"
                   data-media-kind="video"
                   data-source-type-name="${fieldNames.sourceType}"
                   data-media-id-name="${fieldNames.mediaId}"
                   data-media-name-name="${fieldNames.mediaName}"
                   data-media-url-name="${fieldNames.mediaUrl}"
                   data-media-type-name="${fieldNames.mediaType}">
                <p class="pwc-media-picker__current ap-text-color-text-body">${this.escapeHtml(currentText)}</p>
                <p class="pwc-media-picker__meta ap-text-color-text-light">${this.escapeHtml(mediaType || 'Not set')}</p>
                <div class="pwc-media-picker__search-row">
                  <input
                    type="text"
                    class="pwc-setting-input pwc-media-picker__search"
                    placeholder="Search videos..."
                  >
                  <button type="button" class="pwc-u-btn pwc-u-btn--ghost pwc-media-picker__reload">Search</button>
                </div>
                <select class="pwc-setting-select pwc-media-picker__select" size="6"></select>
                <div class="pwc-media-picker__actions">
                  <button type="button" class="pwc-u-btn pwc-u-btn--primary pwc-media-picker__choose">Use Selected Video</button>
                </div>
                <p class="pwc-media-picker__status ap-text-color-text-light"></p>
                ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
              </div>
            </div>
          `;
        }

        case 'videoUpload': {
          const videoFieldNames = this.getMediaFieldNames(setting);
          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-video-upload"
                   data-upload-kind="video"
                   data-source-type-name="${videoFieldNames.sourceType}"
                   data-media-id-name="${videoFieldNames.mediaId}"
                   data-media-name-name="${videoFieldNames.mediaName}"
                   data-media-url-name="${videoFieldNames.mediaUrl}"
                   data-media-type-name="${videoFieldNames.mediaType}">
                <apw-upload
                  class="pwc-video-upload__component"
                  type="button"
                  name="video"
                  accept="video/*"
                  upload-title="Upload video"
                  upload-instruction="Select one video file"
                  upload-button-name="Choose Video"
                  auto-upload="true"
                  intercept-form-upload="true"
                  multiple="false"
                ></apw-upload>
                <p class="pwc-video-upload__status ap-text-color-text-light"></p>
                ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
              </div>
            </div>
          `;
        }

        case 'mediaImagePicker': {
          const fieldNames = this.getMediaFieldNames(setting);
          const sourceType = this.currentBlock?.getAttribute(this.camelToKebab(fieldNames.sourceType)) || 'url';
          const mediaId = this.currentBlock?.getAttribute(this.camelToKebab(fieldNames.mediaId)) || '';
          const mediaName = this.currentBlock?.getAttribute(this.camelToKebab(fieldNames.mediaName)) || '';
          const inactiveClass = sourceType === 'media' ? '' : ' pwc-media-picker--inactive';
          const currentText = mediaName
            ? `${mediaName}${mediaId ? ` (#${mediaId})` : ''}`
            : 'No media selected';

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-media-picker${inactiveClass}"
                   data-name="${setting.name}"
                   data-media-kind="image"
                   data-source-type-name="${fieldNames.sourceType}"
                   data-media-id-name="${fieldNames.mediaId}"
                   data-media-name-name="${fieldNames.mediaName}"
                   data-media-url-name="${fieldNames.mediaUrl}"
                   data-media-type-name="${fieldNames.mediaType}">
                <p class="pwc-media-picker__current ap-text-color-text-body">${this.escapeHtml(currentText)}</p>
                <div class="pwc-media-picker__search-row">
                  <input
                    type="text"
                    class="pwc-setting-input pwc-media-picker__search"
                    placeholder="Search images..."
                  >
                  <button type="button" class="pwc-u-btn pwc-u-btn--ghost pwc-media-picker__reload">Search</button>
                </div>
                <select class="pwc-setting-select pwc-media-picker__select" size="6"></select>
                <div class="pwc-media-picker__actions">
                  <button type="button" class="pwc-u-btn pwc-u-btn--primary pwc-media-picker__choose">Use Selected Image</button>
                </div>
                <p class="pwc-media-picker__status ap-text-color-text-light"></p>
                ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
              </div>
            </div>
          `;
        }

        case 'imageUpload': {
          const imageFieldNames = this.getMediaFieldNames(setting);
          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-video-upload"
                   data-upload-kind="image"
                   data-source-type-name="${imageFieldNames.sourceType}"
                   data-media-id-name="${imageFieldNames.mediaId}"
                   data-media-name-name="${imageFieldNames.mediaName}"
                   data-media-url-name="${imageFieldNames.mediaUrl}"
                   data-media-type-name="${imageFieldNames.mediaType}">
                <apw-upload
                  class="pwc-video-upload__component"
                  type="button"
                  name="image"
                  accept="image/*"
                  upload-title="Upload image"
                  upload-instruction="Select one image file"
                  upload-button-name="Choose Image"
                  auto-upload="true"
                  intercept-form-upload="true"
                  multiple="false"
                ></apw-upload>
                <p class="pwc-video-upload__status ap-text-color-text-light"></p>
                ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
              </div>
            </div>
          `;
        }

        case 'optionButtons':
          return this.renderOptionButtonsField(setting, value);

        case 'select':
          if (Array.isArray(setting.options) && setting.options.length > 0 && setting.options.length <= 3) {
            return this.renderOptionButtonsField(setting, value);
          }

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
              <label for="${id}" class="pwc-setting-label">
                ${setting.label}
              </label>
              <select
                id="${id}"
                name="${setting.name}"
                class="pwc-setting-select"
              >
                ${options}
              </select>
              ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
            </div>
          `;

        case 'toggle':
        case 'boolean':
          const checked = value === 'true' || value === true ? 'checked' : '';
          return `
            <div class="pwc-setting-field pwc-setting-field--toggle">
              <label for="${id}" class="pwc-setting-label">
                ${setting.label}
              </label>
              <button
                type="button"
                id="${id}"
                name="${setting.name}"
                role="switch"
                aria-checked="${!!checked}"
                class="pwc-toggle ${checked ? 'pwc-toggle--checked' : ''}"
                data-checked="${!!checked}"
              >
                <span></span>
              </button>
            </div>
          `;

        case 'color':
          return `
            <div class="pwc-setting-field">
              <label for="${id}" class="pwc-setting-label">
                ${setting.label}
              </label>
              <div class="pwc-setting-color-group">
                <input
                  type="color"
                  id="${id}"
                  name="${setting.name}"
                  value="${value || '#ffffff'}"
                  class="pwc-setting-color-input"
                >
                <input
                  type="text"
                  id="${id}-text"
                  value="${value || ''}"
                  placeholder="#ffffff"
                  class="pwc-setting-color-text"
                >
              </div>
              ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
            </div>
          `;

        case 'colorSwatch':
          const colors = setting.colors || window.APPKIT_OPTIONS?.colors || [];
          const colorType = setting.colorType || 'text'; // 'text', 'bg', or 'border'
          const colorSwatches = colors.map(color => {
            // Transform color value based on colorType (e.g., ap-text-primary-red-05 -> ap-bg-primary-red-05)
            let colorValue = color.value;
            if (colorValue && colorType !== 'text') {
              colorValue = colorValue.replace(/^ap-text-/, `ap-${colorType}-`);
            }
            const isSelected = value === colorValue;
            const isTransparent = color.hex === 'transparent';
            const bgStyle = isTransparent ? 'background: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%); background-size: 8px 8px; background-position: 0 0, 0 4px, 4px -4px, -4px 0px;' : `background-color: ${color.hex}`;
            return `
              <button
                type="button"
                class="pwc-color-swatch ${isSelected ? 'pwc-color-swatch--selected' : ''}"
                style="${bgStyle}"
                data-value="${colorValue}"
                data-name="${setting.name}"
                title="${color.label}"
              ></button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-color-swatch-grid" data-name="${setting.name}">
                ${colorSwatches}
              </div>
              ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
            </div>
          `;

        case 'radiusPicker':
          const radiusOptions = setting.options || [];
          const radiusButtons = radiusOptions.map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-radius-picker-btn pwc-u-picker-btn pwc-u-picker-btn--stack ${isSelected ? 'pwc-picker-btn--selected' : ''}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.preview}"
              >
                <div class="pwc-radius-picker-btn__preview ${opt.value || ''}" style="border-radius: ${opt.value ? '' : '0'}"></div>
                <span class="pwc-radius-picker-btn__label">${opt.label}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-radius-picker" data-name="${setting.name}">
                ${radiusButtons}
              </div>
              ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
            </div>
          `;

        case 'borderWidthPicker':
          const borderWidthOptions = setting.options || [];
          const borderWidthButtons = borderWidthOptions.map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-border-width-picker-btn pwc-u-picker-btn pwc-u-picker-btn--stack ${isSelected ? 'pwc-picker-btn--selected' : ''}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.px}"
              >
                <span class="pwc-border-width-picker-btn__value">${opt.label}</span>
                <span class="pwc-border-width-picker-btn__px">${opt.px}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-border-width-picker" data-name="${setting.name}">
                ${borderWidthButtons}
              </div>
              ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
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
                class="pwc-layout-picker-btn pwc-u-picker-btn pwc-u-picker-btn--stack ${isSelected ? 'pwc-picker-btn--selected' : ''}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.label}"
              >
                <svg viewBox="0 0 48 32">
                  ${columnRects}
                </svg>
                <span class="pwc-layout-picker-btn__label">${opt.label}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-layout-picker" data-name="${setting.name}">
                ${layoutButtons}
              </div>
              ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
            </div>
          `;

        case 'gapPicker':
          const gapOptions = setting.options || [];
          const gapButtons = gapOptions.map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-gap-picker-btn pwc-u-picker-btn pwc-u-picker-btn--stack ${isSelected ? 'pwc-picker-btn--selected' : ''}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.px}"
              >
                <span class="pwc-gap-picker-btn__value">${opt.label}</span>
                <span class="pwc-gap-picker-btn__px">${opt.px}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-gap-picker" data-name="${setting.name}">
                ${gapButtons}
              </div>
              ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
            </div>
          `;

        case 'verticalAlignPicker':
          const vAlignOptions = setting.options || [];
          const vAlignIcons = {
            'align-top': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="4" width="16" height="16" rx="1" stroke-opacity="0.3"/>
              <rect x="7" y="4" width="4" height="8" rx="1" fill="currentColor"/>
              <rect x="13" y="4" width="4" height="12" rx="1" fill="currentColor"/>
            </svg>`,
            'align-middle': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="4" width="16" height="16" rx="1" stroke-opacity="0.3"/>
              <rect x="7" y="8" width="4" height="8" rx="1" fill="currentColor"/>
              <rect x="13" y="6" width="4" height="12" rx="1" fill="currentColor"/>
            </svg>`,
            'align-bottom': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="4" width="16" height="16" rx="1" stroke-opacity="0.3"/>
              <rect x="7" y="12" width="4" height="8" rx="1" fill="currentColor"/>
              <rect x="13" y="8" width="4" height="12" rx="1" fill="currentColor"/>
            </svg>`,
            'align-stretch': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                class="pwc-valign-picker-btn pwc-u-picker-btn pwc-u-picker-btn--stack ${isSelected ? 'pwc-picker-btn--selected' : ''}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.label}"
              >
                ${vAlignIcons[opt.icon] || ''}
                <span class="pwc-valign-picker-btn__label">${opt.label}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-valign-picker" data-name="${setting.name}">
                ${vAlignButtons}
              </div>
              ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
            </div>
          `;

        case 'listTypePicker': {
          const listTypeIcons = {
            'ul': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"></circle>
              <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
              <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"></circle>
              <line x1="9" y1="6" x2="21" y2="6"></line>
              <line x1="9" y1="12" x2="21" y2="12"></line>
              <line x1="9" y1="18" x2="21" y2="18"></line>
            </svg>`,
            'ol': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                class="pwc-list-type-btn pwc-u-picker-btn pwc-u-picker-btn--row ${isSelected ? 'pwc-picker-btn--selected' : ''}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.label}"
              >
                ${listTypeIcons[opt.value] || ''}
                <span class="pwc-list-type-btn__label">${opt.value === 'ul' ? 'Bullets' : 'Numbers'}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-list-type-picker" data-name="${setting.name}">
                ${listTypeButtons}
              </div>
            </div>
          `;
        }

        case 'btnTypePicker': {
          const btnTypeButtons = (setting.options || []).map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-btn-type-btn pwc-u-picker-btn pwc-btn-type-btn--${opt.value} ${isSelected ? 'pwc-btn-type-btn--selected' : ''}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.label}"
              >
                <span class="pwc-btn-type-btn__preview">${opt.label}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-btn-type-picker" data-name="${setting.name}">
                ${btnTypeButtons}
              </div>
            </div>
          `;
        }

        case 'tagSizePicker': {
          const tagSizeIcons = {
            'small': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="8" rx="4" width="12" height="8" stroke="currentColor" stroke-width="1.5" fill="none"></rect>
              <text x="12" y="14" font-size="5" fill="currentColor" stroke="none" font-family="sans-serif" text-anchor="middle" font-weight="600">Sm</text>
            </svg>`,
            'large': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" rx="5" width="18" height="12" stroke="currentColor" stroke-width="1.5" fill="none"></rect>
              <text x="12" y="14.5" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif" text-anchor="middle" font-weight="600">Lg</text>
            </svg>`,
          };

          const tagSizeButtons = (setting.options || []).map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-tag-size-btn pwc-u-picker-btn pwc-u-picker-btn--row ${isSelected ? 'pwc-picker-btn--selected' : ''}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.label}"
              >
                ${tagSizeIcons[opt.value] || ''}
                <span class="pwc-tag-picker-btn__label">${opt.label}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-tag-size-picker" data-name="${setting.name}">
                ${tagSizeButtons}
              </div>
            </div>
          `;
        }

        case 'tagTypePicker': {
          const tagTypeIcons = {
            'filled': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="7" rx="5" width="16" height="10" fill="currentColor"></rect>
            </svg>`,
            'outlined': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="7" rx="5" width="16" height="10" stroke="currentColor" stroke-width="1.5" fill="none"></rect>
            </svg>`,
          };

          const tagTypeButtons = (setting.options || []).map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-tag-type-btn pwc-u-picker-btn pwc-u-picker-btn--row ${isSelected ? 'pwc-picker-btn--selected' : ''}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.label}"
              >
                ${tagTypeIcons[opt.value] || ''}
                <span class="pwc-tag-picker-btn__label">${opt.label}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-tag-type-picker" data-name="${setting.name}">
                ${tagTypeButtons}
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
            'pwc-list-disc': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" fill="currentColor"></circle>
            </svg>`,
            'pwc-list-circle': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
            </svg>`,
            'pwc-list-square': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none">
              <rect x="7" y="7" width="10" height="10" fill="currentColor"></rect>
            </svg>`,
            'pwc-list-decimal': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none">
              <text x="12" y="16" font-size="14" fill="currentColor" stroke="none" font-family="sans-serif" text-anchor="middle" font-weight="600">1</text>
            </svg>`,
            'pwc-list-decimal-leading-zero': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none">
              <text x="12" y="16" font-size="12" fill="currentColor" stroke="none" font-family="sans-serif" text-anchor="middle" font-weight="600">01</text>
            </svg>`,
            'pwc-list-lower-alpha': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none">
              <text x="12" y="16" font-size="14" fill="currentColor" stroke="none" font-family="sans-serif" text-anchor="middle" font-weight="600">a</text>
            </svg>`,
            'pwc-list-upper-alpha': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none">
              <text x="12" y="16" font-size="14" fill="currentColor" stroke="none" font-family="sans-serif" text-anchor="middle" font-weight="600">A</text>
            </svg>`,
            'pwc-list-lower-roman': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none">
              <text x="12" y="16" font-size="12" fill="currentColor" stroke="none" font-family="sans-serif" text-anchor="middle" font-weight="600">iv</text>
            </svg>`,
            'pwc-list-upper-roman': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none">
              <text x="12" y="16" font-size="12" fill="currentColor" stroke="none" font-family="sans-serif" text-anchor="middle" font-weight="600">IV</text>
            </svg>`,
            'pwc-list-none': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.4">
              <line x1="5" y1="5" x2="19" y2="19"></line>
              <line x1="19" y1="5" x2="5" y2="19"></line>
            </svg>`,
          };

          const listStyleButtons = filteredStyleOptions.map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-list-style-btn pwc-u-picker-btn ${isSelected ? 'pwc-picker-btn--selected' : ''}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.label}"
              >
                ${listStyleIcons[opt.value] || `<span class="pwc-list-style-btn__label">${opt.label}</span>`}
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-list-style-picker" data-name="${setting.name}">
                ${listStyleButtons}
              </div>
            </div>
          `;
        }

        case 'markerPositionPicker': {
          const markerPosIcons = {
            'pwc-list-outside': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"></circle>
              <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="8" x2="18" y2="8"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="14" x2="16" y2="14"></line>
              <rect x="7" y="4" width="15" height="12" rx="1" stroke-dasharray="2 2" opacity="0.3"></rect>
            </svg>`,
            'pwc-list-inside': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
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
                class="pwc-marker-pos-btn pwc-u-picker-btn pwc-u-picker-btn--row ${isSelected ? 'pwc-picker-btn--selected' : ''}"
                data-value="${opt.value}"
                data-name="${setting.name}"
                title="${opt.label}"
              >
                ${markerPosIcons[opt.value] || ''}
                <span class="pwc-marker-pos-btn__label">${opt.label}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-marker-pos-picker" data-name="${setting.name}">
                ${markerPosButtons}
              </div>
            </div>
          `;
        }

        case 'headingLevelPicker': {
          const headingLevelIcons = {
            'h1': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm14.5 0c.28 0 .5.22.5.5v15a.5.5 0 0 1-1 0V5.7l-1.86 1.39a.5.5 0 1 1-.6-.8l2.5-1.87c.13-.1.28-.15.43-.15h.03z"/>
            </svg>`,
            'h2': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm11.5 2a2.5 2.5 0 0 1 2.45 2h.05v.5a.5.5 0 0 1-1 0V8.5a1.5 1.5 0 0 0-2.87-.6.5.5 0 1 1-.92-.4A2.5 2.5 0 0 1 15.5 6zM14 13.5c0-.42.12-.8.34-1.13l3.33-4.87H15.5a.5.5 0 0 1 0-1h3a.5.5 0 0 1 .41.79L15.3 12.7a1.5 1.5 0 0 1 .2-.02 1.5 1.5 0 1 1 0 3h-1a.5.5 0 0 1 0-1h1a.5.5 0 1 0 0-1c-.83 0-1.5-.67-1.5-1.18z"/>
            </svg>`,
            'h3': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm11 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .4.8L17.5 10l.5.01a2.5 2.5 0 0 1 0 5H16a.5.5 0 0 1 0-1h2a1.5 1.5 0 0 0 0-3h-1.5a.5.5 0 0 1-.4-.8L18.5 7h-3a.5.5 0 0 1-.5-.5z"/>
            </svg>`,
            'h4': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm11 1.5a.5.5 0 0 1 .94-.24l2.5 5A.5.5 0 0 1 18 11h-2.5v4.5a.5.5 0 0 1-1 0V11H14a.5.5 0 0 1 0-1h.5V5.5zm1 .87V10H17.6l-1.6-3.63z"/>
            </svg>`,
            'h5': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm11 1.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-3.5l-.5 3h1.5a2.5 2.5 0 0 1 0 5H15a.5.5 0 0 1 0-1h2.5a1.5 1.5 0 0 0 0-3H16a.5.5 0 0 1-.49-.6l.5-3.4a.5.5 0 0 1-.01-.5z"/>
            </svg>`,
            'h6': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm13 1.5a.5.5 0 0 1 .86-.35l2 2a.5.5 0 0 1-.7.7L17.5 6.22V9.5a3 3 0 1 1-1 0V5.5zm-.5 5a2 2 0 1 0 2 0 2 2 0 0 0-2 0z"/>
            </svg>`,
          };

          const headingLevelButtons = (setting.options || []).map(opt => {
            const isSelected = value === opt.value;
            return `
              <button
                type="button"
                class="pwc-heading-level-btn pwc-u-picker-btn ${isSelected ? 'pwc-picker-btn--selected' : ''}"
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
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-heading-level-picker" data-name="${setting.name}">
                ${headingLevelButtons}
              </div>
              ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
            </div>
          `;
        }

        case 'alignment':
          const alignmentOptions = setting.options || [
            { value: '', label: 'None', icon: 'align-left' },
            { value: 'pwc-text-left', label: 'Left', icon: 'align-left' },
            { value: 'pwc-text-center', label: 'Center', icon: 'align-center' },
            { value: 'pwc-text-right', label: 'Right', icon: 'align-right' },
            { value: 'pwc-text-justify', label: 'Justify', icon: 'align-justify' },
          ];

          const alignIcons = {
            'align-left': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="15" y2="12"></line>
              <line x1="3" y1="18" x2="18" y2="18"></line>
            </svg>`,
            'align-center': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="6" y1="12" x2="18" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>`,
            'align-right': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="9" y1="12" x2="21" y2="12"></line>
              <line x1="6" y1="18" x2="21" y2="18"></line>
            </svg>`,
            'align-justify': `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                class="pwc-align-btn ${isSelected ? 'pwc-align-btn--selected' : ''}"
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
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>
              <div class="pwc-alignment-buttons" data-name="${setting.name}">
                ${alignButtons}
              </div>
              ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
            </div>
          `;

        case 'spacing':
          const prefix = setting.prefix || 'm';
          const spacingPresets = window.APPKIT_OPTIONS?.spacingPresets || [
            { value: '0', label: '0', px: '0px' },
            { value: '1', label: '1', px: '2px' },
            { value: '2', label: '2', px: '4px' },
            { value: '3', label: '3', px: '8px' },
            { value: '4', label: '4', px: '12px' },
            { value: '5', label: '5', px: '16px' },
            { value: '6', label: '6', px: '20px' },
            { value: '7', label: '7', px: '24px' },
            { value: '8', label: '8', px: '48px' },
          ];

          // Parse current value to determine values for each side
          const spacingState = this.parseSpacingValue(value, prefix);

          // Side button icons - box with highlighted edge
          const sideIcons = {
            all: `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="4" width="16" height="16" rx="1" fill="currentColor" fill-opacity="0.15"/>
            </svg>`,
            t: `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="4" y="4" width="16" height="16" rx="1"/>
              <line x1="4" y1="4" x2="20" y2="4" stroke-width="3"/>
            </svg>`,
            r: `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="4" y="4" width="16" height="16" rx="1"/>
              <line x1="20" y1="4" x2="20" y2="20" stroke-width="3"/>
            </svg>`,
            b: `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="4" y="4" width="16" height="16" rx="1"/>
              <line x1="4" y1="20" x2="20" y2="20" stroke-width="3"/>
            </svg>`,
            l: `<svg class="pwc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
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
              <label class="pwc-setting-label pwc-setting-label--mb2">
                ${setting.label}
              </label>

              <!-- Side selector buttons -->
              <div class="pwc-spacing-sides">
                <button type="button" class="pwc-spacing-side-btn ${spacingState.all ? 'pwc-spacing-side-btn--has-value' : ''}" data-side="all" title="All sides">
                  ${sideIcons.all}
                  <span>${getDisplayValue('all') || 'All'}</span>
                </button>
                <button type="button" class="pwc-spacing-side-btn ${spacingState.t ? 'pwc-spacing-side-btn--has-value' : ''}" data-side="t" title="Top">
                  ${sideIcons.t}
                  <span>${getDisplayValue('t') || 'Top'}</span>
                </button>
                <button type="button" class="pwc-spacing-side-btn ${spacingState.r ? 'pwc-spacing-side-btn--has-value' : ''}" data-side="r" title="Right">
                  ${sideIcons.r}
                  <span>${getDisplayValue('r') || 'Right'}</span>
                </button>
                <button type="button" class="pwc-spacing-side-btn ${spacingState.b ? 'pwc-spacing-side-btn--has-value' : ''}" data-side="b" title="Bottom">
                  ${sideIcons.b}
                  <span>${getDisplayValue('b') || 'Btm'}</span>
                </button>
                <button type="button" class="pwc-spacing-side-btn ${spacingState.l ? 'pwc-spacing-side-btn--has-value' : ''}" data-side="l" title="Left">
                  ${sideIcons.l}
                  <span>${getDisplayValue('l') || 'Left'}</span>
                </button>
              </div>

              <!-- Size selector dropdown (hidden by default) -->
              <div class="pwc-spacing-sizes hidden">
                <div class="pwc-spacing-presets">
                  <button type="button" class="pwc-spacing-preset pwc-spacing-preset--reset" data-value="" title="Reset to default">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="9"/>
                      <line x1="7" y1="7" x2="17" y2="17"/>
                    </svg>
                  </button>
                  ${spacingPresets.map(preset => `
                    <button type="button" class="pwc-spacing-preset" data-value="${preset.value}">
                      ${preset.px}
                    </button>
                  `).join('')}
                </div>
              </div>

              ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
            </div>
          `;

        default:
          return `
            <div class="pwc-setting-field">
              <label class="pwc-setting-label">
                ${setting.label}
              </label>
              <p class="pwc-text-muted">Unknown field type: ${setting.type}</p>
            </div>
          `;
      }
    }

    renderOptionButtonsField(setting, value) {
      const options = Array.isArray(setting.options) ? setting.options : [];
      const buttons = options.map(opt => {
        const isSelected = String(opt.value) === String(value);
        return `
          <button
            type="button"
            class="pwc-option-btn pwc-u-picker-btn pwc-u-picker-btn--row ${isSelected ? 'pwc-picker-btn--selected' : ''}"
            data-name="${setting.name}"
            data-value="${this.escapeHtml(String(opt.value))}"
            title="${this.escapeHtml(opt.label || String(opt.value))}"
          >
            <span class="pwc-option-btn__label">${this.escapeHtml(opt.label || String(opt.value))}</span>
          </button>
        `;
      }).join('');

      return `
        <div class="pwc-setting-field">
          <label class="pwc-setting-label pwc-setting-label--mb2">
            ${setting.label}
          </label>
          <div class="pwc-option-buttons" data-name="${setting.name}">
            ${buttons}
          </div>
          ${setting.help ? `<p class="pwc-setting-help">${setting.help}</p>` : ''}
        </div>
      `;
    }

    /**
     * Set up event listeners for setting fields.
     */
    setupFieldListeners() {
      // Tab switching
      this.querySelectorAll('.pwc-settings-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tab = btn.dataset.tab;
          this._activeTab = tab;

          // Update active button
          this.querySelectorAll('.pwc-settings-tab-btn').forEach(b => {
            b.classList.toggle('pwc-settings-tab-btn--active', b.dataset.tab === tab);
          });

          // Show/hide content
          this.querySelectorAll('.pwc-settings-tab-content').forEach(c => {
            c.classList.toggle('pwc-settings-tab-content--active', c.dataset.tabContent === tab);
          });
        });
      });

      // Text and textarea inputs
      this.querySelectorAll('input[type="text"], textarea, select').forEach(input => {
        input.addEventListener('input', () => {
          if (!input.name) return;
          this.updateBlockAttribute(input.name, input.value);
          if (input.name === 'caption' && input.value.trim() !== '') {
            this.updateBlockAttribute('showCaption', true);
          }
          if (this.shouldRefreshOnSourceTypeChange(input.name) && this.currentBlock) {
            setTimeout(() => this.showBlockSettings(this.currentBlock), 50);
          }
        });
      });

      // Option button groups (used for compact selects / explicit option buttons)
      this.querySelectorAll('.pwc-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value ?? '';
          const container = btn.closest('.pwc-option-buttons');
          if (!name || !container) return;

          container.querySelectorAll('.pwc-option-btn').forEach(b => {
            b.classList.remove('pwc-picker-btn--selected');
          });
          btn.classList.add('pwc-picker-btn--selected');

          this.updateBlockAttribute(name, value);

          if (this.shouldRefreshOnSourceTypeChange(name) && this.currentBlock) {
            setTimeout(() => this.showBlockSettings(this.currentBlock), 50);
          }
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
          const name = toggle.getAttribute('name');

          toggle.setAttribute('data-checked', newValue);
          toggle.setAttribute('aria-checked', newValue);
          toggle.classList.toggle('pwc-toggle--checked', newValue);

          this.updateBlockAttribute(name, newValue);
          if (name === 'showCaption') {
            this.updateBlockAttribute('showCaptionExplicit', true);
          }
        });
      });

      // Media picker
      this.querySelectorAll('.pwc-media-picker').forEach(picker => {
        const mediaKind = picker.dataset.mediaKind || 'video';
        const searchInput = picker.querySelector('.pwc-media-picker__search');
        const reloadBtn = picker.querySelector('.pwc-media-picker__reload');
        const chooseBtn = picker.querySelector('.pwc-media-picker__choose');

        const loadOptions = () => {
          const query = (searchInput?.value || '').trim();
          if (mediaKind === 'image') {
            return this.loadImageMediaOptions(picker, query);
          }
          return this.loadVideoMediaOptions(picker, query);
        };

        if (reloadBtn) {
          reloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadOptions();
          });
        }

        if (searchInput) {
          searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              loadOptions();
            }
          });
        }

        if (chooseBtn) {
          chooseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (mediaKind === 'image') {
              this.applySelectedImageOption(picker);
            } else {
              this.applySelectedMediaOption(picker);
            }
          });
        }

        loadOptions();
      });

      // Video upload
      this.querySelectorAll('.pwc-video-upload').forEach(uploadWidget => {
        const uploadKind = uploadWidget.dataset.uploadKind || 'video';
        if (uploadKind === 'image') {
          this.setupAppkitImageUpload(uploadWidget);
        } else {
          this.setupAppkitVideoUpload(uploadWidget);
        }
      });

      // Color swatch buttons
      this.querySelectorAll('.pwc-color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
          const name = swatch.dataset.name;
          const value = swatch.dataset.value;
          const grid = swatch.closest('.pwc-color-swatch-grid');

          // Update visual selection
          grid.querySelectorAll('.pwc-color-swatch').forEach(s => {
            s.classList.remove('pwc-color-swatch--selected');
          });
          swatch.classList.add('pwc-color-swatch--selected');

          this.updateBlockAttribute(name, value);
        });
      });

      // Radius picker buttons
      this.querySelectorAll('.pwc-radius-picker-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-radius-picker');

          container.querySelectorAll('.pwc-radius-picker-btn').forEach(b => {
            b.classList.remove('pwc-picker-btn--selected');
          });
          btn.classList.add('pwc-picker-btn--selected');

          this.updateBlockAttribute(name, value);
        });
      });

      // Border width picker buttons
      this.querySelectorAll('.pwc-border-width-picker-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-border-width-picker');

          container.querySelectorAll('.pwc-border-width-picker-btn').forEach(b => {
            b.classList.remove('pwc-picker-btn--selected');
          });
          btn.classList.add('pwc-picker-btn--selected');

          this.updateBlockAttribute(name, value);
        });
      });

      // Layout picker buttons
      this.querySelectorAll('.pwc-layout-picker-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-layout-picker');

          container.querySelectorAll('.pwc-layout-picker-btn').forEach(b => {
            b.classList.remove('pwc-picker-btn--selected');
          });
          btn.classList.add('pwc-picker-btn--selected');

          this.updateBlockAttribute(name, value);
        });
      });

      // Gap picker buttons
      this.querySelectorAll('.pwc-gap-picker-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-gap-picker');

          container.querySelectorAll('.pwc-gap-picker-btn').forEach(b => {
            b.classList.remove('pwc-picker-btn--selected');
          });
          btn.classList.add('pwc-picker-btn--selected');

          this.updateBlockAttribute(name, value);
        });
      });

      // Vertical align picker buttons
      this.querySelectorAll('.pwc-valign-picker-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-valign-picker');

          container.querySelectorAll('.pwc-valign-picker-btn').forEach(b => {
            b.classList.remove('pwc-picker-btn--selected');
          });
          btn.classList.add('pwc-picker-btn--selected');

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
            b.classList.remove('pwc-picker-btn--selected');
          });

          btn.classList.add('pwc-picker-btn--selected');

          this.updateBlockAttribute(name, value);

          // Set appropriate default style for the new list type
          this.updateBlockAttribute('listStyle', value === 'ol' ? 'pwc-list-decimal' : 'pwc-list-disc');

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

          const isAlreadySelected = btn.classList.contains('pwc-picker-btn--selected');

          container.querySelectorAll('.pwc-list-style-btn').forEach(b => {
            b.classList.remove('pwc-picker-btn--selected');
          });

          if (!isAlreadySelected) {
            btn.classList.add('pwc-picker-btn--selected');
            this.updateBlockAttribute(name, value);
          } else {
            this.updateBlockAttribute(name, '');
          }
        });
      });

      // Accordion titles editor
      this.querySelectorAll('.pwc-accordion-item-editor__title').forEach(input => {
        input.addEventListener('input', () => {
          const name = input.dataset.name;
          const container = input.closest('.pwc-accordion-items-editor');
          this._updateAccordionTitlesFromDOM(name, container);
        });
      });

      this.querySelectorAll('.pwc-accordion-item-editor__remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const index = parseInt(btn.dataset.index, 10);
          const editor = btn.closest('.pwc-accordion-item-editor');
          const container = btn.closest('.pwc-accordion-items-editor');
          editor.remove();
          this._updateAccordionTitlesFromDOM(name, container);

          this._removeAccordionSection(index, this._getAccordionTitlesFromDOM(container).length);

          if (this.currentBlock) {
            setTimeout(() => this.showBlockSettings(this.currentBlock), 50);
          }
        });
      });

      this.querySelectorAll('.pwc-accordion-item-editor__add').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const container = btn.closest('.pwc-accordion-items-editor');
          const titles = this._getAccordionTitlesFromDOM(container);
          titles.push(`Accordion Item ${titles.length + 1}`);
          this.updateBlockAttribute(name, JSON.stringify(titles));
          if (this.currentBlock) {
            setTimeout(() => this.showBlockSettings(this.currentBlock), 50);
          }
        });
      });

      // Tab titles editor
      this.querySelectorAll('.pwc-tab-item-editor__title').forEach(input => {
        input.addEventListener('input', () => {
          const name = input.dataset.name;
          const container = input.closest('.pwc-tab-items-editor');
          this._updateTabTitlesFromDOM(name, container);
        });
      });

      this.querySelectorAll('.pwc-tab-item-editor__remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const index = parseInt(btn.dataset.index, 10);
          const container = btn.closest('.pwc-tab-items-editor');
          const editor = btn.closest('.pwc-tab-item-editor');

          // Shift columnIndex for inner blocks in higher indices
          const blockData = window.pwcEditorState?.findBlock(this.currentBlock.blockId);
          if (blockData?.innerBlocks) {
            // Remove blocks belonging to deleted tab, shift higher ones down
            blockData.innerBlocks = blockData.innerBlocks.filter(block => {
              return (block.attributes?.columnIndex ?? 0) !== index;
            });
            blockData.innerBlocks.forEach(block => {
              const ci = block.attributes?.columnIndex ?? 0;
              if (ci > index) {
                block.attributes.columnIndex = ci - 1;
              }
            });
            window.pwcEditorState.isDirty = true;
            window.pwcEditorState.pushHistory();
          }

          editor.remove();
          this._updateTabTitlesFromDOM(name, container);

          if (this.currentBlock) {
            setTimeout(() => this.showBlockSettings(this.currentBlock), 50);
          }
        });
      });

      this.querySelectorAll('.pwc-tab-item-editor__add').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const container = btn.closest('.pwc-tab-items-editor');
          const titles = this._getTabTitlesFromDOM(container);
          titles.push(`Tab ${titles.length + 1}`);
          this.updateBlockAttribute(name, JSON.stringify(titles));
          if (this.currentBlock) {
            setTimeout(() => this.showBlockSettings(this.currentBlock), 50);
          }
        });
      });

      this.querySelectorAll('.pwc-tab-item-editor__move-up').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index, 10);
          if (index > 0) {
            this._reorderTab(index, index - 1);
          }
        });
      });

      this.querySelectorAll('.pwc-tab-item-editor__move-down').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index, 10);
          const container = btn.closest('.pwc-tab-items-editor');
          const titles = this._getTabTitlesFromDOM(container);
          if (index < titles.length - 1) {
            this._reorderTab(index, index + 1);
          }
        });
      });

      // Button type picker buttons
      this.querySelectorAll('.pwc-btn-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-btn-type-picker');

          container.querySelectorAll('.pwc-btn-type-btn').forEach(b => {
            b.classList.remove('pwc-btn-type-btn--selected');
          });
          btn.classList.add('pwc-btn-type-btn--selected');

          this.updateBlockAttribute(name, value);
        });
      });

      // Tag size picker buttons
      this.querySelectorAll('.pwc-tag-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-tag-size-picker');

          container.querySelectorAll('.pwc-tag-size-btn').forEach(b => {
            b.classList.remove('pwc-picker-btn--selected');
          });
          btn.classList.add('pwc-picker-btn--selected');

          this.updateBlockAttribute(name, value);
        });
      });

      // Tag type picker buttons
      this.querySelectorAll('.pwc-tag-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-tag-type-picker');

          container.querySelectorAll('.pwc-tag-type-btn').forEach(b => {
            b.classList.remove('pwc-picker-btn--selected');
          });
          btn.classList.add('pwc-picker-btn--selected');

          this.updateBlockAttribute(name, value);
        });
      });

      // Heading level picker buttons
      this.querySelectorAll('.pwc-heading-level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const value = btn.dataset.value;
          const container = btn.closest('.pwc-heading-level-picker');

          container.querySelectorAll('.pwc-heading-level-btn').forEach(b => {
            b.classList.remove('pwc-picker-btn--selected');
          });
          btn.classList.add('pwc-picker-btn--selected');

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
            b.classList.remove('pwc-picker-btn--selected');
          });
          btn.classList.add('pwc-picker-btn--selected');

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
          const isAlreadySelected = btn.classList.contains('pwc-align-btn--selected');

          // Update visual selection
          container.querySelectorAll('.pwc-align-btn').forEach(b => {
            b.classList.remove('pwc-align-btn--selected');
          });

          if (!isAlreadySelected) {
            btn.classList.add('pwc-align-btn--selected');
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
            btn.classList.remove('pwc-spacing-side-btn--active');
          });

          if (isActive) {
            // Hide the panel if clicking the same button
            sizesPanel.classList.add('hidden');
            sizesPanel.removeAttribute('data-active-side');
          } else {
            // Show the panel and mark this button as active
            sideBtn.classList.add('pwc-spacing-side-btn--active');
            sizesPanel.classList.remove('hidden');
            sizesPanel.setAttribute('data-active-side', side);

            // Highlight the currently selected value for this side
            const currentValue = this.getSpacingSideValue(field, side);
            sizesPanel.querySelectorAll('.pwc-spacing-preset').forEach(preset => {
              preset.classList.remove('pwc-spacing-preset--selected');
              if (preset.dataset.value === currentValue) {
                preset.classList.add('pwc-spacing-preset--selected');
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
            p.classList.remove('pwc-spacing-preset--selected');
          });
          preset.classList.add('pwc-spacing-preset--selected');

          // Update the side button to show the new value
          const sideBtn = field.querySelector(`.pwc-spacing-side-btn[data-side="${activeSide}"]`);
          if (sideBtn) {
            const presets = window.APPKIT_OPTIONS?.spacingPresets || [];
            const presetInfo = presets.find(p => p.value === value);
            const displayValue = presetInfo ? presetInfo.px : value;
            const sideLabels = { all: 'All', t: 'Top', r: 'Right', b: 'Btm', l: 'Left' };
            sideBtn.querySelector('span').textContent = value !== '' ? displayValue : (sideLabels[activeSide] || activeSide);

            // Update button styling to show it has a value ('' = reset/default)
            if (value !== '') {
              sideBtn.classList.add('pwc-spacing-side-btn--has-value');
            } else {
              sideBtn.classList.remove('pwc-spacing-side-btn--has-value');
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
        const presets = window.APPKIT_OPTIONS?.spacingPresets || [];
        const presetInfo = presets.find(p => p.value === value);
        const displayValue = presetInfo ? presetInfo.px : value;

        field.querySelectorAll('.pwc-spacing-side-btn').forEach(btn => {
          const btnSide = btn.dataset.side;
          if (btnSide === 'all') {
            btn.querySelector('span').textContent = value !== '' ? displayValue : 'All';
            if (value !== '') {
              btn.classList.add('pwc-spacing-side-btn--has-value');
            } else {
              btn.classList.remove('pwc-spacing-side-btn--has-value');
            }
          } else {
            btn.querySelector('span').textContent = btnSide === 't' ? 'Top' : btnSide === 'r' ? 'Right' : btnSide === 'b' ? 'Btm' : 'Left';
            btn.classList.remove('pwc-spacing-side-btn--has-value');
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
          allBtn.classList.remove('pwc-spacing-side-btn--has-value');
        }
      }

      // Build the new class string (Appkit4 format: ap-m-spacing-N, ap-mt-spacing-N)
      const classes = [];
      if (state.all !== '') {
        classes.push(`ap-${prefix}-spacing-${state.all}`);
      } else {
        if (state.t !== '') classes.push(`ap-${prefix}t-spacing-${state.t}`);
        if (state.r !== '') classes.push(`ap-${prefix}r-spacing-${state.r}`);
        if (state.b !== '') classes.push(`ap-${prefix}b-spacing-${state.b}`);
        if (state.l !== '') classes.push(`ap-${prefix}l-spacing-${state.l}`);
      }

      this.updateBlockAttribute(name, classes.join(' '));
    }

    getMediaFieldNames(setting = {}) {
      const prefix = String(setting.attributePrefix || '').trim();
      if (!prefix) {
        return {
          sourceType: 'sourceType',
          mediaId: 'mediaId',
          mediaName: 'mediaName',
          mediaUrl: 'mediaUrl',
          mediaType: 'mediaType',
        };
      }

      return {
        sourceType: `${prefix}SourceType`,
        mediaId: `${prefix}MediaId`,
        mediaName: `${prefix}MediaName`,
        mediaUrl: `${prefix}MediaUrl`,
        mediaType: `${prefix}MediaType`,
      };
    }

    getMediaFieldNamesFromElement(element) {
      const data = element?.dataset || {};
      return {
        sourceType: data.sourceTypeName || 'sourceType',
        mediaId: data.mediaIdName || 'mediaId',
        mediaName: data.mediaNameName || 'mediaName',
        mediaUrl: data.mediaUrlName || 'mediaUrl',
        mediaType: data.mediaTypeName || 'mediaType',
      };
    }

    shouldRefreshOnSourceTypeChange(changedName) {
      if (!changedName || !this.currentBlock || !window.pwcBlockRegistry) {
        return changedName === 'sourceType' || changedName === 'mode';
      }

      const blockInfo = window.pwcBlockRegistry.get(this.currentBlock.blockType);
      const settings = Array.isArray(blockInfo?.settings) ? blockInfo.settings : [];
      return settings.some(setting => {
        // Check showWhenSourceType
        if (Array.isArray(setting.showWhenSourceType) && setting.showWhenSourceType.length > 0) {
          if ((setting.sourceTypeName || 'sourceType') === changedName) {
            return true;
          }
        }
        // Check showWhenMode
        if (Array.isArray(setting.showWhenMode) && setting.showWhenMode.length > 0) {
          if ((setting.modeName || 'mode') === changedName) {
            return true;
          }
        }
        return false;
      });
    }

    async loadVideoMediaOptions(picker, query = '') {
      const statusEl = picker.querySelector('.pwc-media-picker__status');
      const selectEl = picker.querySelector('.pwc-media-picker__select');
      const fieldNames = this.getMediaFieldNamesFromElement(picker);
      if (!selectEl) return;

      if (!window.pwcApiClient || typeof window.pwcApiClient.listVideoMedia !== 'function') {
        if (statusEl) statusEl.textContent = 'Video media API is not available.';
        return;
      }

      if (statusEl) statusEl.textContent = 'Loading videos...';
      selectEl.innerHTML = '';

      try {
        const response = await window.pwcApiClient.listVideoMedia(query);
        const items = Array.isArray(response?.items) ? response.items : [];
        const currentMediaId = this.currentBlock?.getAttribute(this.camelToKebab(fieldNames.mediaId)) || '';

        if (items.length === 0) {
          const option = document.createElement('option');
          option.value = '';
          option.textContent = 'No videos found';
          option.disabled = true;
          selectEl.appendChild(option);
          if (statusEl) statusEl.textContent = 'No matching videos.';
          return;
        }

        items.forEach(item => {
          const option = document.createElement('option');
          option.value = String(item.id || '');
          option.textContent = `${item.title || 'Untitled'} (${item.type === 'embed' ? 'Embed' : 'File'})`;
          option.dataset.mediaId = String(item.id || '');
          option.dataset.mediaName = item.title || '';
          option.dataset.mediaUrl = item.url || '';
          option.dataset.mediaType = item.type || 'file';
          if (currentMediaId && String(item.id) === String(currentMediaId)) {
            option.selected = true;
          }
          selectEl.appendChild(option);
        });

        if (statusEl) statusEl.textContent = `${items.length} video${items.length === 1 ? '' : 's'} loaded.`;
      } catch (error) {
        if (statusEl) statusEl.textContent = `Failed to load videos: ${error?.message || 'Unknown error'}`;
      }
    }

    applySelectedMediaOption(picker) {
      const selectEl = picker.querySelector('.pwc-media-picker__select');
      const statusEl = picker.querySelector('.pwc-media-picker__status');
      const fieldNames = this.getMediaFieldNamesFromElement(picker);
      const option = selectEl?.selectedOptions?.[0];
      if (!option || !option.dataset.mediaUrl) {
        if (statusEl) statusEl.textContent = 'Select a video first.';
        return;
      }

      this.updateBlockAttributes({
        [fieldNames.sourceType]: 'media',
        [fieldNames.mediaId]: option.dataset.mediaId || '',
        [fieldNames.mediaName]: option.dataset.mediaName || '',
        [fieldNames.mediaUrl]: option.dataset.mediaUrl || '',
        [fieldNames.mediaType]: option.dataset.mediaType || 'file',
      });

      if (statusEl) {
        statusEl.textContent = `Selected: ${option.dataset.mediaName || 'video'}`;
      }

      if (this.currentBlock) {
        setTimeout(() => this.showBlockSettings(this.currentBlock), 50);
      }
    }

    async loadImageMediaOptions(picker, query = '') {
      const statusEl = picker.querySelector('.pwc-media-picker__status');
      const selectEl = picker.querySelector('.pwc-media-picker__select');
      const fieldNames = this.getMediaFieldNamesFromElement(picker);
      if (!selectEl) return;

      if (!window.pwcApiClient || typeof window.pwcApiClient.listImageMedia !== 'function') {
        if (statusEl) statusEl.textContent = 'Image media API is not available.';
        return;
      }

      if (statusEl) statusEl.textContent = 'Loading images...';
      selectEl.innerHTML = '';

      try {
        const response = await window.pwcApiClient.listImageMedia(query);
        const items = Array.isArray(response?.items) ? response.items : [];
        const currentMediaId = this.currentBlock?.getAttribute(this.camelToKebab(fieldNames.mediaId)) || '';

        if (items.length === 0) {
          const option = document.createElement('option');
          option.value = '';
          option.textContent = 'No images found';
          option.disabled = true;
          selectEl.appendChild(option);
          if (statusEl) statusEl.textContent = 'No matching images.';
          return;
        }

        items.forEach(item => {
          const option = document.createElement('option');
          option.value = String(item.id || '');
          option.textContent = item.title || 'Untitled';
          option.dataset.mediaId = String(item.id || '');
          option.dataset.mediaName = item.title || '';
          option.dataset.mediaUrl = item.url || '';
          option.dataset.mediaType = item.type || 'file';
          if (currentMediaId && String(item.id) === String(currentMediaId)) {
            option.selected = true;
          }
          selectEl.appendChild(option);
        });

        if (statusEl) statusEl.textContent = `${items.length} image${items.length === 1 ? '' : 's'} loaded.`;
      } catch (error) {
        if (statusEl) statusEl.textContent = `Failed to load images: ${error?.message || 'Unknown error'}`;
      }
    }

    applySelectedImageOption(picker) {
      const selectEl = picker.querySelector('.pwc-media-picker__select');
      const statusEl = picker.querySelector('.pwc-media-picker__status');
      const fieldNames = this.getMediaFieldNamesFromElement(picker);
      const option = selectEl?.selectedOptions?.[0];
      if (!option || !option.dataset.mediaUrl) {
        if (statusEl) statusEl.textContent = 'Select an image first.';
        return;
      }

      this.updateBlockAttributes({
        [fieldNames.sourceType]: 'media',
        [fieldNames.mediaId]: option.dataset.mediaId || '',
        [fieldNames.mediaName]: option.dataset.mediaName || '',
        [fieldNames.mediaUrl]: option.dataset.mediaUrl || '',
        [fieldNames.mediaType]: option.dataset.mediaType || 'file',
      });

      if (statusEl) {
        statusEl.textContent = `Selected: ${option.dataset.mediaName || 'image'}`;
      }

      if (this.currentBlock) {
        setTimeout(() => this.showBlockSettings(this.currentBlock), 50);
      }
    }

    setupAppkitVideoUpload(uploadWidget) {
      const setup = async () => {
        await customElements.whenDefined('apw-upload');

        const uploader = uploadWidget.querySelector('apw-upload');
        const statusEl = uploadWidget.querySelector('.pwc-video-upload__status');
        if (!uploader) return;

        const uploadUrl = window.pwcApiClient?.settings?.mediaUploadUrl || '';
        uploader.interceptFormUpload = true;
        uploader.autoUpload = true;
        uploader.multiple = false;
        uploader.accept = 'video/*';
        if (uploadUrl) {
          uploader.action = uploadUrl;
        }
        uploader.method = 'post';
        uploader.withCredentials = true;

        // Primary integration path: Appkit delegates selected file(s) to this callback.
        uploader.customUploader = async (...args) => {
          const file = this.extractUploadFile(args);
          if (!file) {
            if (statusEl) statusEl.textContent = 'Choose a video file first.';
            throw new Error('No file selected.');
          }

          const result = await this.uploadVideoFile(uploadWidget, file);
          const callbacks = this.extractUploadCallbacks(args);
          if (callbacks.onSuccess) callbacks.onSuccess(result);
          return result;
        };

        // Fallback: if this Appkit build emits events instead of invoking customUploader.
        const fallbackHandler = async (event) => {
          if (this._videoUploadInFlight.has(uploadWidget)) return;
          const file = this.extractUploadFile(event);
          if (!file) return;

          try {
            await this.uploadVideoFile(uploadWidget, file);
          } catch (error) {
            // Keep status text as error indicator; no further action required.
          }
        };

        uploader.addEventListener('change', fallbackHandler);
        uploader.addEventListener('apwChange', fallbackHandler);
        uploader.addEventListener('apwUpload', fallbackHandler);

        // Deep fallback: hook the native input inside shadow DOM for builds
        // where customUploader/events do not surface selection events.
        this.bindAppkitUploadShadowInput(uploader, uploadWidget);
      };

      setup();
    }

    setupAppkitImageUpload(uploadWidget) {
      const setup = async () => {
        await customElements.whenDefined('apw-upload');

        const uploader = uploadWidget.querySelector('apw-upload');
        const statusEl = uploadWidget.querySelector('.pwc-video-upload__status');
        if (!uploader) return;

        const uploadUrl = window.pwcApiClient?.settings?.mediaImageUploadUrl || '';
        uploader.interceptFormUpload = true;
        uploader.autoUpload = true;
        uploader.multiple = false;
        uploader.accept = 'image/*';
        if (uploadUrl) {
          uploader.action = uploadUrl;
        }
        uploader.method = 'post';
        uploader.withCredentials = true;

        uploader.customUploader = async (...args) => {
          const file = this.extractUploadFile(args);
          if (!file) {
            if (statusEl) statusEl.textContent = 'Choose an image file first.';
            throw new Error('No file selected.');
          }

          const result = await this.uploadImageFile(uploadWidget, file);
          const callbacks = this.extractUploadCallbacks(args);
          if (callbacks.onSuccess) callbacks.onSuccess(result);
          return result;
        };

        const fallbackHandler = async (event) => {
          if (this._imageUploadInFlight.has(uploadWidget)) return;
          const file = this.extractUploadFile(event);
          if (!file) return;

          try {
            await this.uploadImageFile(uploadWidget, file);
          } catch (error) {
            // Keep status text as error indicator; no further action required.
          }
        };

        uploader.addEventListener('change', fallbackHandler);
        uploader.addEventListener('apwChange', fallbackHandler);
        uploader.addEventListener('apwUpload', fallbackHandler);

        this.bindAppkitUploadShadowInput(uploader, uploadWidget, (file) => this.uploadImageFile(uploadWidget, file));
      };

      setup();
    }

    bindAppkitUploadShadowInput(uploader, uploadWidget, uploadFn = null) {
      const attach = () => {
        const input = uploader?.shadowRoot?.querySelector('input[type="file"]');
        if (!input || input.__pwcBound) {
          return false;
        }

        input.__pwcBound = true;
        input.addEventListener('change', async (event) => {
          const files = event?.target?.files;
          if (!files || files.length === 0) return;

          // Upload first file only (block is configured for single upload).
          try {
            if (uploadFn) {
              await uploadFn(files[0]);
            } else {
              await this.uploadVideoFile(uploadWidget, files[0]);
            }
          } catch (error) {
            // Status is handled in uploadVideoFile.
          }
        });
        return true;
      };

      if (attach()) {
        return;
      }

      const observer = new MutationObserver(() => {
        if (attach()) {
          observer.disconnect();
        }
      });

      if (uploader && uploader.shadowRoot) {
        observer.observe(uploader.shadowRoot, { childList: true, subtree: true });
        setTimeout(() => observer.disconnect(), 5000);
      }
    }

    extractUploadFile(payload) {
      if (!payload) return null;

      if (payload instanceof File) {
        return payload;
      }

      if (payload instanceof FileList) {
        return payload[0] || null;
      }

      if (Array.isArray(payload)) {
        for (const item of payload) {
          const found = this.extractUploadFile(item);
          if (found) return found;
        }
        return null;
      }

      if (payload.file instanceof File) {
        return payload.file;
      }

      if (payload.rawFile instanceof File) {
        return payload.rawFile;
      }

      if (payload.originFileObj instanceof File) {
        return payload.originFileObj;
      }

      if (payload.target && payload.target.files instanceof FileList) {
        return payload.target.files[0] || null;
      }

      if (payload.files instanceof FileList) {
        return payload.files[0] || null;
      }

      if (Array.isArray(payload.files)) {
        return payload.files.find((f) => f instanceof File) || null;
      }

      if (payload.detail) {
        return this.extractUploadFile(payload.detail);
      }

      return null;
    }

    extractUploadCallbacks(payload) {
      const callbacks = {
        onSuccess: null,
      };

      const scan = (value) => {
        if (!value) return;

        if (Array.isArray(value)) {
          value.forEach(scan);
          return;
        }

        if (typeof value !== 'object') return;

        if (typeof value.onSuccess === 'function') callbacks.onSuccess = value.onSuccess;
        if (typeof value.success === 'function') callbacks.onSuccess = value.success;
        if (typeof value.resolve === 'function') callbacks.onSuccess = value.resolve;

        if (value.detail) scan(value.detail);
      };

      scan(payload);
      return callbacks;
    }

    async uploadVideoFile(uploadWidget, file) {
      const uploader = uploadWidget.querySelector('apw-upload');
      const statusEl = uploadWidget.querySelector('.pwc-video-upload__status');
      const fieldNames = this.getMediaFieldNamesFromElement(uploadWidget);
      const maxBytes = Number(window.pwcApiClient?.settings?.mediaUploadMaxBytes || 0);

      if (this._videoUploadInFlight.has(uploadWidget)) {
        return null;
      }
      this._videoUploadInFlight.add(uploadWidget);

      if (!window.pwcApiClient || typeof window.pwcApiClient.uploadVideoMedia !== 'function') {
        if (statusEl) statusEl.textContent = 'Video upload API is not available.';
        throw new Error('Video upload API is not available.');
      }

      if (maxBytes > 0 && Number(file?.size || 0) > maxBytes) {
        const maxMb = (maxBytes / (1024 * 1024)).toFixed(1);
        const fileMb = (Number(file.size) / (1024 * 1024)).toFixed(1);
        const message = `File is too large (${fileMb} MB). Max allowed is ${maxMb} MB.`;
        if (statusEl) statusEl.textContent = message;
        this._videoUploadInFlight.delete(uploadWidget);
        throw new Error(message);
      }

      if (uploader) uploader.apwDisabled = true;
      if (statusEl) statusEl.textContent = 'Uploading...';

      try {
        const response = await window.pwcApiClient.uploadVideoMedia(file, file.name);
        const item = response?.item || null;
        if (!item || !item.url) {
          throw new Error('Invalid upload response');
        }

        this.updateBlockAttributes({
          [fieldNames.sourceType]: 'upload',
          [fieldNames.mediaId]: String(item.id || ''),
          [fieldNames.mediaName]: item.title || file.name,
          [fieldNames.mediaUrl]: item.url,
          [fieldNames.mediaType]: item.type || 'file',
        });

        if (statusEl) statusEl.textContent = 'Upload complete and selected.';

        const mediaPicker = Array.from(this.querySelectorAll('.pwc-media-picker[data-media-kind="video"]'))
          .find((picker) => (picker.dataset.sourceTypeName || 'sourceType') === fieldNames.sourceType);
        if (mediaPicker) {
          await this.loadVideoMediaOptions(mediaPicker, '');
        }

        if (this.currentBlock) {
          setTimeout(() => this.showBlockSettings(this.currentBlock), 50);
        }
        return response;
      } catch (error) {
        if (statusEl) statusEl.textContent = `Upload failed: ${error?.message || 'Unknown error'}`;
        throw error;
      } finally {
        this._videoUploadInFlight.delete(uploadWidget);
        if (uploader) uploader.apwDisabled = false;
      }
    }

    async uploadImageFile(uploadWidget, file) {
      const uploader = uploadWidget.querySelector('apw-upload');
      const statusEl = uploadWidget.querySelector('.pwc-video-upload__status');
      const fieldNames = this.getMediaFieldNamesFromElement(uploadWidget);
      const maxBytes = Number(window.pwcApiClient?.settings?.mediaUploadMaxBytes || 0);

      if (this._imageUploadInFlight.has(uploadWidget)) {
        return null;
      }
      this._imageUploadInFlight.add(uploadWidget);

      if (!window.pwcApiClient || typeof window.pwcApiClient.uploadImageMedia !== 'function') {
        if (statusEl) statusEl.textContent = 'Image upload API is not available.';
        throw new Error('Image upload API is not available.');
      }

      if (maxBytes > 0 && Number(file?.size || 0) > maxBytes) {
        const maxMb = (maxBytes / (1024 * 1024)).toFixed(1);
        const fileMb = (Number(file.size) / (1024 * 1024)).toFixed(1);
        const message = `File is too large (${fileMb} MB). Max allowed is ${maxMb} MB.`;
        if (statusEl) statusEl.textContent = message;
        this._imageUploadInFlight.delete(uploadWidget);
        throw new Error(message);
      }

      if (uploader) uploader.apwDisabled = true;
      if (statusEl) statusEl.textContent = 'Uploading...';

      try {
        const response = await window.pwcApiClient.uploadImageMedia(file, file.name);
        const item = response?.item || null;
        if (!item || !item.url) {
          throw new Error('Invalid upload response');
        }

        this.updateBlockAttributes({
          [fieldNames.sourceType]: 'upload',
          [fieldNames.mediaId]: String(item.id || ''),
          [fieldNames.mediaName]: item.title || file.name,
          [fieldNames.mediaUrl]: item.url,
          [fieldNames.mediaType]: item.type || 'file',
        });

        if (statusEl) statusEl.textContent = 'Upload complete and selected.';

        const mediaPicker = Array.from(this.querySelectorAll('.pwc-media-picker[data-media-kind="image"]'))
          .find((picker) => (picker.dataset.sourceTypeName || 'sourceType') === fieldNames.sourceType);
        if (mediaPicker) {
          await this.loadImageMediaOptions(mediaPicker, '');
        }

        if (this.currentBlock) {
          setTimeout(() => this.showBlockSettings(this.currentBlock), 50);
        }
        return response;
      } catch (error) {
        if (statusEl) statusEl.textContent = `Upload failed: ${error?.message || 'Unknown error'}`;
        throw error;
      } finally {
        this._imageUploadInFlight.delete(uploadWidget);
        if (uploader) uploader.apwDisabled = false;
      }
    }

    /**
     * Parse a spacing value string into component parts.
     * Appkit4 format: "ap-m-spacing-5" or "ap-mt-spacing-3 ap-mb-spacing-5".
     *
     * @param {string} value - Spacing value like "ap-m-spacing-5" or "ap-mt-spacing-3 ap-mb-spacing-5".
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

      // Appkit4 spacing class patterns: ap-{prefix}{side}-spacing-{value}
      const hasTop = classes.some(c => c.startsWith(`ap-${prefix}t-spacing-`));
      const hasRight = classes.some(c => c.startsWith(`ap-${prefix}r-spacing-`));
      const hasBottom = classes.some(c => c.startsWith(`ap-${prefix}b-spacing-`));
      const hasLeft = classes.some(c => c.startsWith(`ap-${prefix}l-spacing-`));
      const hasX = classes.some(c => c.startsWith(`ap-${prefix}x-spacing-`));
      const hasY = classes.some(c => c.startsWith(`ap-${prefix}y-spacing-`));
      const hasAll = classes.some(c => c.startsWith(`ap-${prefix}-spacing-`));

      if (hasTop || hasRight || hasBottom || hasLeft) {
        state.mode = 'individual';
        classes.forEach(c => {
          if (c.startsWith(`ap-${prefix}t-spacing-`)) state.t = c.replace(`ap-${prefix}t-spacing-`, '');
          if (c.startsWith(`ap-${prefix}r-spacing-`)) state.r = c.replace(`ap-${prefix}r-spacing-`, '');
          if (c.startsWith(`ap-${prefix}b-spacing-`)) state.b = c.replace(`ap-${prefix}b-spacing-`, '');
          if (c.startsWith(`ap-${prefix}l-spacing-`)) state.l = c.replace(`ap-${prefix}l-spacing-`, '');
        });
      } else if (hasX || hasY) {
        state.mode = 'axis';
        classes.forEach(c => {
          if (c.startsWith(`ap-${prefix}x-spacing-`)) state.x = c.replace(`ap-${prefix}x-spacing-`, '');
          if (c.startsWith(`ap-${prefix}y-spacing-`)) state.y = c.replace(`ap-${prefix}y-spacing-`, '');
        });
      } else if (hasAll) {
        state.mode = 'all';
        classes.forEach(c => {
          const match = c.match(new RegExp(`^ap-${prefix}-spacing-(.+)$`));
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

    updateBlockAttributes(attributes) {
      if (!this.currentBlock || !attributes || typeof attributes !== 'object') return;

      const safeUpdates = {};
      Object.entries(attributes).forEach(([name, value]) => {
        const attrName = this.camelToKebab(name);
        this.currentBlock.setAttribute(attrName, value);
        safeUpdates[name] = value;
      });

      window.pwcEditorState.updateBlock(this.currentBlock.blockId, safeUpdates);
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
            <p class="pwc-empty-settings__title ap-text-color-text-body">No Block Selected</p>
            <p class="pwc-empty-settings__message ap-text-color-text-light">Click on any block in the content area to edit its settings here.</p>
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
          <svg class="pwc-icon pwc-spin" fill="none" viewBox="0 0 24 24">
            <circle class="pwc-spin__track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="pwc-spin__arc" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        `;

        const content = window.pwcEditorState.serialize();
        await window.pwcApiClient.saveContent(content);

        window.pwcEditorState.isDirty = false;
        window.pwcApiClient.clearLocalStorage();

        // Show success checkmark
        saveBtn.innerHTML = `
          <svg class="pwc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        `;
        saveBtn.classList.add('pwc-settings-panel__save--success');

        setTimeout(() => {
          saveBtn.innerHTML = originalHtml;
          saveBtn.classList.remove('pwc-settings-panel__save--success');
        }, 2000);

      } catch (error) {
        // Show error X
        saveBtn.innerHTML = `
          <svg class="pwc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        `;
        saveBtn.classList.add('pwc-settings-panel__save--error');

        setTimeout(() => {
          saveBtn.innerHTML = originalHtml;
          saveBtn.classList.remove('pwc-settings-panel__save--error');
        }, 3000);
      } finally {
        saveBtn.disabled = false;
      }
    }

    show() {
      this._isMinimized = false;
      this.style.display = 'block';
      this.querySelector('.pwc-settings-panel').classList.remove('pwc-settings-panel--hidden');
      document.body.classList.remove('pwc-settings-minimized');
      this.hideReopenButton();
    }

    hide() {
      this._isMinimized = false;
      this.hideReopenButton();
      document.body.classList.remove('pwc-settings-minimized');
      this.querySelector('.pwc-settings-panel')?.classList.add('pwc-settings-panel--hidden');
      setTimeout(() => {
        this.style.display = 'none';
      }, 300);
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    _getAccordionTitlesFromDOM(container) {
      const titles = [];
      container.querySelectorAll('.pwc-accordion-item-editor').forEach(editor => {
        const title = editor.querySelector('.pwc-accordion-item-editor__title')?.value || '';
        titles.push(title);
      });
      return titles;
    }

    _updateAccordionTitlesFromDOM(name, container) {
      const titles = this._getAccordionTitlesFromDOM(container);
      this.updateBlockAttribute(name, JSON.stringify(titles));
    }

    _getTabTitlesFromDOM(container) {
      const titles = [];
      container.querySelectorAll('.pwc-tab-item-editor').forEach(editor => {
        const title = editor.querySelector('.pwc-tab-item-editor__title')?.value || '';
        titles.push(title);
      });
      return titles;
    }

    _updateTabTitlesFromDOM(name, container) {
      const titles = this._getTabTitlesFromDOM(container);
      this.updateBlockAttribute(name, JSON.stringify(titles));
    }

    _reorderTab(fromIndex, toIndex) {
      if (!this.currentBlock) return;

      // 1. Swap titles
      const container = this.querySelector('.pwc-tab-items-editor');
      if (!container) return;
      const titles = this._getTabTitlesFromDOM(container);
      [titles[fromIndex], titles[toIndex]] = [titles[toIndex], titles[fromIndex]];
      this.updateBlockAttribute('titles', JSON.stringify(titles));

      // 2. Remap columnIndex on inner blocks
      const blockData = window.pwcEditorState?.findBlock(this.currentBlock.blockId);
      if (blockData?.innerBlocks) {
        blockData.innerBlocks.forEach(block => {
          const ci = block.attributes?.columnIndex ?? 0;
          if (ci === fromIndex) block.attributes.columnIndex = toIndex;
          else if (ci === toIndex) block.attributes.columnIndex = fromIndex;
        });
        window.pwcEditorState.isDirty = true;
        window.pwcEditorState.pushHistory();
      }

      // 3. Re-render settings panel and the tab block
      if (this.currentBlock) {
        setTimeout(() => this.showBlockSettings(this.currentBlock), 50);
      }
    }

    _removeAccordionSection(index, remainingSectionsCount) {
      if (!this.currentBlock || Number.isNaN(index)) return;

      const blockData = window.pwcEditorState?.findBlock(this.currentBlock.blockId);
      if (!blockData) return;

      if (Array.isArray(blockData.innerBlocks)) {
        // Remove blocks from deleted section and shift subsequent sections.
        blockData.innerBlocks = blockData.innerBlocks.filter(block => {
          return (block.attributes?.columnIndex ?? 0) !== index;
        });
        blockData.innerBlocks.forEach(block => {
          const ci = block.attributes?.columnIndex ?? 0;
          if (ci > index) {
            block.attributes.columnIndex = ci - 1;
          }
        });
      }

      const expandedIndices = Array.isArray(blockData._expandedAccordionIndices)
        ? blockData._expandedAccordionIndices
        : [];
      const nextExpanded = expandedIndices
        .filter(i => Number.isInteger(i) && i !== index)
        .map(i => (i > index ? i - 1 : i));
      blockData._expandedAccordionIndices = nextExpanded.length === 0 && remainingSectionsCount > 0
        ? [0]
        : nextExpanded;

      const currentCustomHeaders = this.currentBlock.getAttribute('custom-headers') || '[]';
      let customHeaders = [];
      try {
        const parsed = JSON.parse(currentCustomHeaders);
        if (Array.isArray(parsed)) customHeaders = parsed;
      } catch (e) {
        // Ignore malformed value.
      }
      customHeaders.splice(index, 1);
      this.updateBlockAttribute('customHeaders', JSON.stringify(customHeaders));

      window.pwcEditorState.isDirty = true;
      window.pwcEditorState.pushHistory();
    }

    camelToKebab(str) {
      return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }
  }

  // Register custom element
  customElements.define('pwc-settings-panel', SettingsPanel);

})(Drupal);
