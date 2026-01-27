/**
 * @file
 * Block registry service.
 *
 * Manages registration and lookup of available block types.
 */

(function (Drupal) {
  'use strict';

  /**
   * Block registry singleton.
   */
  class BlockRegistry {
    constructor() {
      this.blocks = new Map();
    }

    /**
     * Register a block type.
     *
     * @param {Object} blockClass - Block class with static properties.
     */
    register(blockClass) {
      const name = blockClass.blockName;
      if (!name) {
        console.error('PWC Block Registry: Block class must have a static blockName property');
        return;
      }

      console.log('PWC Block Registry: Registering block type:', name);

      this.blocks.set(name, {
        name: name,
        title: blockClass.blockTitle || name,
        icon: blockClass.blockIcon || '▢',
        description: blockClass.blockDescription || '',
        settings: blockClass.blockSettings || [],
        class: blockClass,
        tagName: `pwc-${name}`,
      });
    }

    /**
     * Get a registered block type.
     *
     * @param {string} name - Block type name.
     * @returns {Object|null} Block type info or null.
     */
    get(name) {
      return this.blocks.get(name) || null;
    }

    /**
     * Get all registered block types.
     *
     * @returns {Array} Array of block type info objects.
     */
    getAll() {
      return Array.from(this.blocks.values());
    }

    /**
     * Create a block element from data.
     *
     * @param {Object} blockData - Block data with type and attributes.
     * @returns {HTMLElement|null} Block element or null.
     */
    createBlock(blockData) {
      console.log('PWC Block Registry: Creating block element for:', blockData);
      const blockInfo = this.get(blockData.type);
      if (!blockInfo) {
        console.warn(`PWC Block Registry: Skipping unknown block type "${blockData.type}" - this block type no longer exists`);
        return null;
      }
      console.log('PWC Block Registry: Found block info:', blockInfo.name, 'tagName:', blockInfo.tagName);

      const element = document.createElement(blockInfo.tagName);
      element.setAttribute('block-id', blockData.id);
      element.setAttribute('block-type', blockData.type);

      // Set attributes
      if (blockData.attributes) {
        for (const [key, value] of Object.entries(blockData.attributes)) {
          const attrName = this.camelToKebab(key);
          if (typeof value === 'object') {
            element.setAttribute(attrName, JSON.stringify(value));
          } else {
            element.setAttribute(attrName, value);
          }
        }
      }

      // Handle inner blocks for containers
      if (blockData.innerBlocks && blockData.innerBlocks.length > 0) {
        element.setAttribute('has-inner-blocks', 'true');
        // Inner blocks will be rendered by the container component
        element._innerBlocksData = blockData.innerBlocks;
      }

      return element;
    }

    /**
     * Create a new empty block of a given type.
     *
     * @param {string} type - Block type name.
     * @returns {Object} Block data object.
     */
    createBlockData(type) {
      const blockInfo = this.get(type);
      if (!blockInfo) {
        console.error(`Unknown block type: ${type}`);
        return null;
      }

      const id = 'block-' + Math.random().toString(36).substr(2, 9);
      const attributes = {};

      // Initialize with default values from settings
      if (blockInfo.settings) {
        for (const setting of blockInfo.settings) {
          if (setting.default !== undefined) {
            attributes[setting.name] = setting.default;
          } else {
            attributes[setting.name] = '';
          }
        }
      }

      const blockData = {
        type,
        id,
        attributes,
      };

      // Initialize innerBlocks for container types
      if (type === 'section-container') {
        blockData.innerBlocks = [];
      }

      return blockData;
    }

    /**
     * Convert camelCase to kebab-case.
     *
     * @param {string} str - String to convert.
     * @returns {string} Converted string.
     */
    camelToKebab(str) {
      return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Convert kebab-case to camelCase.
     *
     * @param {string} str - String to convert.
     * @returns {string} Converted string.
     */
    kebabToCamel(str) {
      return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }
  }

  // Create global instance
  window.pwcBlockRegistry = new BlockRegistry();

  // Expose to Drupal namespace
  Drupal.pwcVisualEditor = Drupal.pwcVisualEditor || {};
  Drupal.pwcVisualEditor.registry = window.pwcBlockRegistry;

})(Drupal);
