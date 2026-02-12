/**
 * @file
 * Image block component.
 *
 * Supports direct image URLs and Drupal Media-backed images
 * selected/uploaded from the settings panel.
 */

(function (Drupal) {
  'use strict';

  class ImageBlock extends window.PwcBaseBlock {
    static get blockName() { return 'image'; }
    static get blockTitle() { return 'Image'; }
    static get blockIcon() { return ''; }
    static get blockDescription() { return 'Add an image from URL, Drupal Media, or Upload.'; }
    static get blockCategory() { return 'media'; }

    static get blockSettings() {
      return [
        {
          name: 'sourceType',
          type: 'optionButtons',
          label: 'Source Type',
          default: 'url',
          tab: 'typography',
          options: [
            { value: 'url', label: 'URL' },
            { value: 'media', label: 'Media' },
            { value: 'upload', label: 'Upload' },
          ],
        },
        {
          name: 'imageUrl',
          type: 'text',
          label: 'Image URL',
          default: '',
          tab: 'typography',
          placeholder: 'https://... or /sites/default/files/...',
          showWhenSourceType: ['url'],
        },
        {
          name: 'mediaId',
          type: 'mediaImagePicker',
          label: 'Select Drupal Image',
          default: '',
          tab: 'typography',
          showWhenSourceType: ['media'],
        },
        {
          name: 'mediaUpload',
          type: 'imageUpload',
          label: 'Upload Image to Drupal Media',
          default: '',
          tab: 'typography',
          showWhenSourceType: ['upload'],
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Alt Text',
          default: '',
          tab: 'typography',
          placeholder: 'Describe the image',
        },
        {
          name: 'showCaption',
          type: 'toggle',
          label: 'Show Caption',
          default: false,
          tab: 'style',
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Caption',
          default: '',
          tab: 'style',
          placeholder: 'Add image caption',
        },
        {
          name: 'aspectRatio',
          type: 'optionButtons',
          label: 'Aspect Ratio',
          default: 'auto',
          tab: 'layout',
          options: [
            { value: '16:9', label: '16:9' },
            { value: '4:3', label: '4:3' },
            { value: '1:1', label: '1:1' },
            { value: '3:4', label: '3:4' },
            { value: 'auto', label: 'Auto' },
          ],
        },
        {
          name: 'objectFit',
          type: 'optionButtons',
          label: 'Object Fit',
          default: 'cover',
          tab: 'layout',
          options: [
            { value: 'cover', label: 'Cover' },
            { value: 'contain', label: 'Contain' },
          ],
        },
        {
          name: 'maxWidth',
          type: 'text',
          label: 'Max Width',
          default: '',
          tab: 'layout',
          placeholder: 'e.g. 960px, 100%, none',
        },
        {
          name: 'textAlign',
          type: 'alignment',
          label: 'Alignment',
          default: '',
          tab: 'layout',
          options: [
            { value: '', label: 'None', icon: 'align-left' },
            { value: 'pwc-text-left', label: 'Left', icon: 'align-left' },
            { value: 'pwc-text-center', label: 'Center', icon: 'align-center' },
            { value: 'pwc-text-right', label: 'Right', icon: 'align-right' },
          ],
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
          placeholder: 'e.g., my-image-block',
        },
      ];
    }

    static get observedAttributes() {
      return [
        'block-id',
        'source-type',
        'image-url',
        'media-id',
        'media-url',
        'media-name',
        'alt',
        'show-caption',
        'caption',
        'aspect-ratio',
        'object-fit',
        'max-width',
        'text-align',
        'margin',
        'padding',
        'custom-classes',
      ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue || !this.isConnected) return;
      this.render();
      this.addHoverControls();
    }

    render() {
      const sourceType = this.getAttribute('source-type') || 'url';
      const mediaUrl = this.getAttribute('media-url') || '';
      const rawUrl = (sourceType === 'media' || sourceType === 'upload')
        ? (mediaUrl || this.getAttribute('image-url') || '')
        : (this.getAttribute('image-url') || '');

      const imageUrl = this.sanitizeUrl(rawUrl);
      const alt = this.getAttribute('alt') || '';
      const showCaption = this.getBooleanAttribute('show-caption', false);
      const caption = this.getAttribute('caption') || '';
      const aspectRatio = this.getAttribute('aspect-ratio') || 'auto';
      const objectFit = this.getAttribute('object-fit') || 'cover';
      const maxWidth = this.getSafeStyleValue(this.getAttribute('max-width') || '');
      const textAlign = this.getAttribute('text-align') || '';
      const margin = this.getAttribute('margin') || '';
      const padding = this.getAttribute('padding') || '';
      const customClasses = this.getAttribute('custom-classes') || '';

      const wrapperClasses = [
        'pwc-image-wrapper',
        textAlign,
        ...this.getSafeClassTokens(margin),
        ...this.getSafeClassTokens(padding),
        ...this.getSafeClassTokens(customClasses),
      ].join(' ');

      const ratioStyle = this.getRatioStyle(aspectRatio);
      const hasRatio = !!ratioStyle;
      const mediaStyles = [];
      if (ratioStyle) mediaStyles.push(`aspect-ratio:${ratioStyle}`);
      if (maxWidth) mediaStyles.push(`max-width:${maxWidth}`);
      const mediaStyleAttr = mediaStyles.length > 0 ? ` style="${mediaStyles.join(';')}"` : '';

      const mediaHtml = imageUrl
        ? `
          <div class="pwc-image-media"${mediaStyleAttr}>
            <img src="${this.escapeAttr(imageUrl)}" alt="${this.escapeAttr(alt)}" style="width:100%;${hasRatio ? 'height:100%;' : 'height:auto;'}object-fit:${this.escapeAttr(objectFit)};display:block;">
          </div>
        `
        : `
          <div class="pwc-image-placeholder">
            <p class="pwc-image-placeholder__title">Image block</p>
            <p class="pwc-image-placeholder__text">Add an image URL or select a Drupal Media image.</p>
          </div>
        `;

      const captionHtml = showCaption && caption
        ? `<figcaption class="pwc-image-caption">${this.escapeAttr(caption)}</figcaption>`
        : '';

      this.innerHTML = `
        <figure class="${wrapperClasses}">
          ${mediaHtml}
          ${captionHtml}
        </figure>
      `;
    }

    getBooleanAttribute(name, defaultValue = false) {
      const value = this.getAttribute(name);
      if (value === null) return defaultValue;
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

    getSafeStyleValue(value) {
      const trimmed = String(value || '').trim();
      if (!trimmed) return '';
      if (/^(none|auto)$/i.test(trimmed)) return trimmed.toLowerCase();
      if (/^\d+(\.\d+)?(px|%|vw|vh|rem|em)$/.test(trimmed)) return trimmed;
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

    getRatioStyle(ratio) {
      const value = String(ratio || '').trim();
      if (!value || value === 'auto') return '';
      const parts = value.split(':');
      if (parts.length !== 2) return '';
      const w = Number(parts[0]);
      const h = Number(parts[1]);
      if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return '';
      return `${w} / ${h}`;
    }

    escapeAttr(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }

  customElements.define('pwc-image', ImageBlock);

  if (window.pwcBlockRegistry) {
    window.pwcBlockRegistry.register(ImageBlock);
  }

})(Drupal);
