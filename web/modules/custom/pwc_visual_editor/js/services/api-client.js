/**
 * @file
 * API client service for communicating with Drupal backend.
 */

(function (Drupal, drupalSettings) {
  'use strict';

  /**
   * API client for the visual editor.
   */
  class ApiClient {
    constructor() {
      this.settings = drupalSettings.pwcVisualEditor || {};
      this.csrfToken = this.settings.csrfToken || '';
    }

    async parseJsonSafe(response) {
      try {
        return await response.json();
      } catch (e) {
        return {};
      }
    }

    /**
     * Load page content.
     *
     * @returns {Promise<Object>} Page content data.
     */
    async loadContent() {
      try {
        const response = await fetch(this.settings.endpoints?.load, {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.api+json',
          },
          credentials: 'same-origin',
        });

        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.status}`);
        }

        const data = await response.json();

        // Extract page content from JSON:API response
        const fieldContent = data.data?.attributes?.field_page_content;

        if (fieldContent) {
          try {
            return JSON.parse(fieldContent);
          } catch (e) {
            console.warn('Failed to parse field_page_content, returning empty blocks');
            return { version: '1.0', blocks: [] };
          }
        }

        return { version: '1.0', blocks: [] };
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }

    /**
     * Save page content.
     *
     * @param {Object} content - Content to save.
     * @returns {Promise<Object>} Save response.
     */
    async saveContent(content) {
      try {
        // Use the custom save endpoint for better control
        const nodeId = this.settings.nodeId;
        const response = await fetch(`/api/pwc-visual-editor/save/${nodeId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': this.csrfToken,
          },
          credentials: 'same-origin',
          body: JSON.stringify(content),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to save content: ${response.status}`);
        }

        return data;
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }

    /**
     * List available Drupal Media video items.
     *
     * @param {string} query - Optional search query.
     * @returns {Promise<Object>} API response containing media items.
     */
    async listVideoMedia(query = '') {
      const baseUrl = this.settings.mediaListUrl;
      if (!baseUrl) {
        throw new Error('mediaListUrl is not configured');
      }

      const url = new URL(baseUrl, window.location.origin);
      if (query) {
        url.searchParams.set('q', query);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
      });

      const data = await this.parseJsonSafe(response);
      if (!response.ok || data.success === false) {
        throw new Error(data.error || `Failed to list media videos: ${response.status}`);
      }

      return data;
    }

    /**
     * Upload a video file to Drupal Media.
     *
     * @param {File} file - Video file to upload.
     * @param {string} title - Optional media title.
     * @returns {Promise<Object>} API response with created media item.
     */
    async uploadVideoMedia(file, title = '') {
      const uploadUrl = this.settings.mediaUploadUrl;
      if (!uploadUrl) {
        throw new Error('mediaUploadUrl is not configured');
      }

      const formData = new FormData();
      formData.append('video', file);
      if (title) {
        formData.append('title', title);
      }

      const response = await fetch(uploadUrl, {
        method: 'POST',
        credentials: 'same-origin',
        body: formData,
      });

      const data = await this.parseJsonSafe(response);
      if (!response.ok || data.success === false) {
        throw new Error(data.error || `Failed to upload video: ${response.status}`);
      }

      return data;
    }

    /**
     * List available Drupal Media image items.
     *
     * @param {string} query - Optional search query.
     * @returns {Promise<Object>} API response containing media items.
     */
    async listImageMedia(query = '') {
      const baseUrl = this.settings.mediaImageListUrl;
      if (!baseUrl) {
        throw new Error('mediaImageListUrl is not configured');
      }

      const url = new URL(baseUrl, window.location.origin);
      if (query) {
        url.searchParams.set('q', query);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
      });

      const data = await this.parseJsonSafe(response);
      if (!response.ok || data.success === false) {
        throw new Error(data.error || `Failed to list media images: ${response.status}`);
      }

      return data;
    }

    /**
     * Upload an image file to Drupal Media.
     *
     * @param {File} file - Image file to upload.
     * @param {string} title - Optional media title.
     * @returns {Promise<Object>} API response with created media item.
     */
    async uploadImageMedia(file, title = '') {
      const uploadUrl = this.settings.mediaImageUploadUrl;
      if (!uploadUrl) {
        throw new Error('mediaImageUploadUrl is not configured');
      }

      const formData = new FormData();
      formData.append('image', file);
      if (title) {
        formData.append('title', title);
      }

      const response = await fetch(uploadUrl, {
        method: 'POST',
        credentials: 'same-origin',
        body: formData,
      });

      const data = await this.parseJsonSafe(response);
      if (!response.ok || data.success === false) {
        throw new Error(data.error || `Failed to upload image: ${response.status}`);
      }

      return data;
    }

    /**
     * Save content using JSON:API (alternative method).
     *
     * @param {Object} content - Content to save.
     * @returns {Promise<Object>} Save response.
     */
    async saveContentJsonApi(content) {
      try {
        const response = await fetch(this.settings.endpoints?.save, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/vnd.api+json',
            'Accept': 'application/vnd.api+json',
            'X-CSRF-Token': this.csrfToken,
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            data: {
              type: `node--${this.settings.nodeType}`,
              id: this.getNodeUuid(),
              attributes: {
                field_page_content: JSON.stringify(content),
              },
            },
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.errors?.[0]?.detail || `Failed to save: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }

    /**
     * Get the node UUID from the load endpoint.
     *
     * @returns {string} Node UUID.
     */
    getNodeUuid() {
      const endpoint = this.settings.endpoints?.load || '';
      const parts = endpoint.split('/');
      return parts[parts.length - 1];
    }

    /**
     * Auto-save to localStorage.
     *
     * @param {Object} content - Content to save locally.
     */
    saveToLocalStorage(content) {
      const key = `pwc_editor_autosave_${this.settings.nodeId}`;
      try {
        localStorage.setItem(key, JSON.stringify({
          content,
          timestamp: Date.now(),
        }));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
    }

    /**
     * Load auto-saved content from localStorage.
     *
     * @returns {Object|null} Auto-saved content or null.
     */
    loadFromLocalStorage() {
      const key = `pwc_editor_autosave_${this.settings.nodeId}`;
      try {
        const data = localStorage.getItem(key);
        if (data) {
          return JSON.parse(data);
        }
      } catch (e) {
        console.warn('Failed to load from localStorage:', e);
      }
      return null;
    }

    /**
     * Clear auto-saved content.
     */
    clearLocalStorage() {
      const key = `pwc_editor_autosave_${this.settings.nodeId}`;
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('Failed to clear localStorage:', e);
      }
    }
  }

  // Create global instance
  window.pwcApiClient = new ApiClient();

  // Expose to Drupal namespace
  Drupal.pwcVisualEditor = Drupal.pwcVisualEditor || {};
  Drupal.pwcVisualEditor.api = window.pwcApiClient;

})(Drupal, drupalSettings);
