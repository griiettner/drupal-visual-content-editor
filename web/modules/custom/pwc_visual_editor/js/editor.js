/**
 * @file
 * Main editor entry point.
 *
 * Initializes the visual editor when the page loads.
 */

(function (Drupal, drupalSettings, once) {
  'use strict';

  /**
   * Visual Editor initialization.
   */
  Drupal.behaviors.pwcVisualEditor = {
    attach: function (context, settings) {
      once('pwc-visual-editor', 'body', context).forEach(function (body) {
        const editorSettings = drupalSettings.pwcVisualEditor;

        if (!editorSettings) {
          return;
        }

        // If startInEditMode is set, the templates handle most initialization
        // Just set up keyboard shortcuts
        if (editorSettings.startInEditMode) {
          setupGlobalKeyboardShortcuts();
          return;
        }

        // View mode - render blocks for viewing (not editing)
        if (editorSettings.viewMode) {
          renderViewModeBlocks(editorSettings);

          // If user can edit, also initialize the editor with edit button
          if (editorSettings.canEdit) {
            const editor = new PwcEditor(editorSettings);
            editor.init();
            window.pwcEditor = editor;
          }
          return;
        }

        // Normal mode - user needs to click Edit button
        if (!editorSettings.canEdit) {
          return;
        }

        // Initialize the editor
        const editor = new PwcEditor(editorSettings);
        editor.init();

        // Store reference globally for debugging
        window.pwcEditor = editor;
      });
    }
  };

  /**
   * Render blocks in view mode (non-editing).
   */
  function renderViewModeBlocks(settings) {
    const contentRegion = document.querySelector('[data-pwc-content-region]');
    if (!contentRegion) return;

    const content = settings.content || {};
    let blocks = content.blocks || [];

    // Filter out unknown block types
    if (window.pwcBlockRegistry) {
      blocks = blocks.filter(block => {
        const isValid = window.pwcBlockRegistry.get(block.type) !== null;
        if (!isValid) {
          console.warn(`PWC Visual Editor: Skipping unknown block type "${block.type}" in view mode`);
        }
        return isValid;
      });
    }

    if (blocks.length === 0) {
      // Empty state for view mode
      contentRegion.innerHTML = '<p class="text-gray-500 text-center py-8">No content yet.</p>';
      return;
    }

    // Render each block
    let renderedCount = 0;
    blocks.forEach((blockData) => {
      if (window.pwcBlockRegistry) {
        const blockElement = window.pwcBlockRegistry.createBlock(blockData);
        if (blockElement) {
          contentRegion.appendChild(blockElement);
          renderedCount++;
        }
      }
    });

  }

  /**
   * Set up global keyboard shortcuts for direct edit mode.
   */
  function setupGlobalKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Only handle shortcuts in edit mode
      if (!window.pwcEditorState || !window.pwcEditorState.isEditing) return;

      // Ctrl/Cmd + S: Save (trigger the save button)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const saveBtn = document.getElementById('pwc-save-btn');
        if (saveBtn && !saveBtn.disabled) {
          saveBtn.click();
        }
      }

      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (!e.target.closest('[contenteditable="true"]')) {
          e.preventDefault();
          window.pwcEditorState.undo();
        }
      }

      // Ctrl/Cmd + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        if (!e.target.closest('[contenteditable="true"]')) {
          e.preventDefault();
          window.pwcEditorState.redo();
        }
      }

      // Escape: Deselect block
      if (e.key === 'Escape') {
        if (window.pwcEditorState.selectedBlockId) {
          window.pwcEditorState.selectBlock(null);
        }
      }
    });
  }

  /**
   * Main Editor class.
   */
  class PwcEditor {
    constructor(settings) {
      this.settings = settings;
      this.editButton = null;
      this.contentRegion = null;
    }

    /**
     * Initialize the editor.
     */
    async init() {
      // Create edit button
      this.createEditButton();

      // Create editor components
      this.createEditorComponents();

      // Find or create content region
      this.setupContentRegion();

      // Check for auto-saved content
      this.checkAutoSave();

      // Set up keyboard shortcuts
      this.setupKeyboardShortcuts();

      // Set up auto-save
      this.setupAutoSave();

      // Listen for edit mode changes to manage edit trigger
      this.setupEditModeListener();

      // PWC Visual Editor initialized
    }

    /**
     * Set up listener for edit mode changes.
     */
    setupEditModeListener() {
      window.pwcEditorState.on('editModeChange', (data) => {
        if (data.isEditing) {
          // Entering edit mode - remove edit trigger
          this.removeEditTrigger();
        } else {
          // Exiting edit mode - re-create edit trigger after a short delay
          // to ensure content has been re-rendered
          setTimeout(() => {
            this.createEditTrigger();
          }, 100);
        }
      });
    }

    /**
     * Create the edit trigger overlay on content area.
     */
    createEditButton() {
      // We'll create the edit trigger after content region is set up
      // Store reference to be created later
      this.editTriggerCreated = false;
    }

    /**
     * Create hover edit trigger on content region.
     */
    createEditTrigger() {
      if (!this.contentRegion) return;

      // Check if trigger already exists in DOM (might have been removed by innerHTML clearing)
      if (this.editTriggerCreated && this.editTrigger && this.contentRegion.contains(this.editTrigger)) {
        return; // Trigger already exists
      }

      // Reset state if trigger was removed
      this.editTriggerCreated = false;
      this.editTrigger = null;

      // Create the edit trigger overlay
      this.editTrigger = document.createElement('div');
      this.editTrigger.className = 'pwc-edit-trigger';
      this.editTrigger.innerHTML = `
        <div class="pwc-edit-trigger__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </div>
        <span class="pwc-edit-trigger__label">Edit</span>
      `;

      this.editTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.enterEditMode();
      });

      // Add trigger to content region
      this.contentRegion.style.position = 'relative';
      this.contentRegion.appendChild(this.editTrigger);

      // Add hover class to content region for styling
      this.contentRegion.classList.add('pwc-content-editable');

      this.editTriggerCreated = true;
    }

    /**
     * Remove edit trigger.
     */
    removeEditTrigger() {
      if (this.editTrigger) {
        this.editTrigger.remove();
        this.editTrigger = null;
        this.editTriggerCreated = false;
      }
      if (this.contentRegion) {
        this.contentRegion.classList.remove('pwc-content-editable');
      }
    }

    /**
     * Create editor UI components.
     */
    createEditorComponents() {
      // Settings panel
      const settingsPanel = document.createElement('pwc-settings-panel');
      document.body.appendChild(settingsPanel);

      // Block toolbar
      const blockToolbar = document.createElement('pwc-block-toolbar');
      blockToolbar.style.position = 'fixed';
      blockToolbar.style.zIndex = '100';
      document.body.appendChild(blockToolbar);

      // Rich text toolbar
      const richTextToolbar = document.createElement('pwc-rich-text-toolbar');
      richTextToolbar.style.position = 'absolute';
      richTextToolbar.style.zIndex = '101';
      document.body.appendChild(richTextToolbar);
    }

    /**
     * Set up the content region.
     */
    setupContentRegion() {
      // Try to find existing content region
      this.contentRegion = document.querySelector('[data-pwc-content-region]');

      if (!this.contentRegion) {
        // Try common content selectors
        this.contentRegion = document.querySelector('.node__content') ||
                            document.querySelector('article .content') ||
                            document.querySelector('main .content') ||
                            document.querySelector('#content');
      }

      if (!this.contentRegion) {
        // Create a content region if none exists
        this.contentRegion = document.createElement('div');
        this.contentRegion.setAttribute('data-pwc-content-region', 'true');
        this.contentRegion.className = 'pwc-content-region';

        // Insert into main content area
        const main = document.querySelector('main') || document.querySelector('.main-content');
        if (main) {
          main.appendChild(this.contentRegion);
        } else {
          document.body.appendChild(this.contentRegion);
        }
      }

      this.contentRegion.setAttribute('data-pwc-content-region', 'true');

      // Create the edit trigger overlay
      this.createEditTrigger();
    }

    /**
     * Toggle edit mode.
     */
    async toggleEditMode() {
      if (window.pwcEditorState.isEditing) {
        this.exitEditMode();
      } else {
        await this.enterEditMode();
      }
    }

    /**
     * Enter edit mode.
     */
    async enterEditMode() {
      // Remove edit trigger (we're now in edit mode)
      this.removeEditTrigger();

      // Use content already loaded in drupalSettings (no API call needed)
      const content = this.settings.content || { blocks: [] };
      // Entering edit mode
      window.pwcEditorState.init(content.blocks || []);

      // Enter edit mode
      window.pwcEditorState.enterEditMode();

      // Render blocks in content region
      this.renderBlocks();

      // Add top-level inserter
      this.addTopLevelInserter();

      // Open the settings panel
      const settingsPanel = document.querySelector('pwc-settings-panel');
      if (settingsPanel && settingsPanel.open) {
        settingsPanel.open();
      }
    }

    /**
     * Exit edit mode.
     */
    exitEditMode() {
      // Check for unsaved changes
      if (window.pwcEditorState.isDirty) {
        if (!confirm('You have unsaved changes. Are you sure you want to exit?')) {
          return;
        }
      }

      // Exit edit mode
      window.pwcEditorState.exitEditMode();

      // Re-render blocks in view mode
      this.renderBlocks();

      // Remove inserters
      this.removeInserters();

      // Re-create edit trigger for hover
      this.createEditTrigger();

      // Close the settings panel
      const settingsPanel = document.querySelector('pwc-settings-panel');
      if (settingsPanel && settingsPanel.close) {
        settingsPanel.close();
      }
    }

    /**
     * Render blocks in the content region.
     */
    renderBlocks() {
      if (!this.contentRegion) return;

      // Clear existing content
      this.contentRegion.innerHTML = '';

      const blocks = window.pwcEditorState.blocks;
      const isEditing = window.pwcEditorState.isEditing;

      blocks.forEach((blockData, index) => {
        const blockElement = window.pwcBlockRegistry.createBlock(blockData);
        if (blockElement) {
          this.contentRegion.appendChild(blockElement);

          // Add inserter between blocks in edit mode
          if (isEditing && index < blocks.length - 1) {
            const inserter = document.createElement('pwc-block-inserter');
            inserter.setInsertPosition(index + 1);
            this.contentRegion.appendChild(inserter);
          }
        }
      });

      // Show empty state if no blocks
      if (blocks.length === 0 && isEditing) {
        this.contentRegion.innerHTML = `
          <div class="pwc-empty-state py-16 text-center text-gray-500">
            <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p class="text-lg font-medium mb-2">No content yet</p>
            <p class="text-sm">Click the + button below to start adding blocks</p>
          </div>
        `;
      }
    }

    /**
     * Add top-level block inserter.
     */
    addTopLevelInserter() {
      const inserter = document.createElement('pwc-block-inserter');
      inserter.setInsertPosition(-1);
      inserter.className = 'pwc-top-level-inserter';
      this.contentRegion.appendChild(inserter);
    }

    /**
     * Remove all inserters.
     */
    removeInserters() {
      document.querySelectorAll('pwc-block-inserter').forEach(el => el.remove());
    }

    /**
     * Check for auto-saved content.
     */
    checkAutoSave() {
      const autoSaved = window.pwcApiClient.loadFromLocalStorage();
      if (autoSaved && autoSaved.content) {
        const savedTime = new Date(autoSaved.timestamp).toLocaleString();
        if (confirm(`Found auto-saved content from ${savedTime}. Would you like to restore it?`)) {
          window.pwcEditorState.init(autoSaved.content.blocks || []);
          this.enterEditMode();
        } else {
          window.pwcApiClient.clearLocalStorage();
        }
      }
    }

    /**
     * Set up auto-save.
     */
    setupAutoSave() {
      // Auto-save every 30 seconds when editing
      setInterval(() => {
        if (window.pwcEditorState.isEditing && window.pwcEditorState.isDirty) {
          const content = window.pwcEditorState.serialize();
          window.pwcApiClient.saveToLocalStorage(content);
          // Auto-saved to localStorage
        }
      }, 30000);
    }

    /**
     * Set up keyboard shortcuts.
     */
    setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        // Only handle shortcuts in edit mode
        if (!window.pwcEditorState.isEditing) return;

        // Ctrl/Cmd + S: Save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          const panel = document.querySelector('pwc-settings-panel');
          if (panel) {
            panel.saveContent();
          }
        }

        // Ctrl/Cmd + Z: Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
          if (!e.target.closest('[contenteditable="true"]')) {
            e.preventDefault();
            window.pwcEditorState.undo();
            this.renderBlocks();
            this.addTopLevelInserter();
          }
        }

        // Ctrl/Cmd + Shift + Z: Redo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
          if (!e.target.closest('[contenteditable="true"]')) {
            e.preventDefault();
            window.pwcEditorState.redo();
            this.renderBlocks();
            this.addTopLevelInserter();
          }
        }

        // Escape: Exit edit mode or deselect
        if (e.key === 'Escape') {
          if (window.pwcEditorState.selectedBlockId) {
            window.pwcEditorState.selectBlock(null);
          } else {
            this.exitEditMode();
          }
        }
      });
    }
  }

  // Expose class
  window.PwcEditor = PwcEditor;

})(Drupal, drupalSettings, once);
