/**
 * @file
 * Video block component.
 *
 * Supports direct video URLs, embed URLs (YouTube/Vimeo),
 * and Drupal Media-backed videos selected/uploaded from settings panel.
 */

(function (Drupal) {
  'use strict';

  class VideoBlock extends window.PwcBaseBlock {
    static get blockName() { return 'video'; }
    static get blockTitle() { return 'Video'; }
    static get blockIcon() { return ''; }
    static get blockDescription() { return 'Add a video from URL, embed, or Drupal Media.'; }
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
          name: 'videoUrl',
          type: 'text',
          label: 'Video URL',
          default: '',
          tab: 'typography',
          placeholder: 'https://... (MP4/WebM or YouTube/Vimeo URL)',
          help: 'Supports direct video links and embed URLs (YouTube/Vimeo).',
          showWhenSourceType: ['url'],
        },
        {
          name: 'mediaId',
          type: 'mediaVideoPicker',
          label: 'Select Drupal Video',
          default: '',
          tab: 'typography',
          showWhenSourceType: ['media'],
        },
        {
          name: 'mediaUpload',
          type: 'videoUpload',
          label: 'Upload Video to Drupal Media',
          default: '',
          tab: 'typography',
          showWhenSourceType: ['upload'],
        },
        {
          name: 'title',
          type: 'text',
          label: 'Video Title',
          default: '',
          tab: 'typography',
          placeholder: 'Accessible video title',
        },
        {
          name: 'showControls',
          type: 'toggle',
          label: 'Show Controls',
          default: true,
          tab: 'style',
        },
        {
          name: 'disableDownload',
          type: 'toggle',
          label: 'Disable Download',
          default: true,
          tab: 'style',
        },
        {
          name: 'autoplay',
          type: 'toggle',
          label: 'Autoplay',
          default: false,
          tab: 'style',
        },
        {
          name: 'muted',
          type: 'toggle',
          label: 'Muted',
          default: false,
          tab: 'style',
        },
        {
          name: 'loop',
          type: 'toggle',
          label: 'Loop',
          default: false,
          tab: 'style',
        },
        {
          name: 'playsInline',
          type: 'toggle',
          label: 'Play Inline',
          default: true,
          tab: 'style',
        },
        {
          name: 'preload',
          type: 'select',
          label: 'Preload',
          default: 'metadata',
          tab: 'style',
          options: [
            { value: 'none', label: 'None' },
            { value: 'metadata', label: 'Metadata' },
            { value: 'auto', label: 'Auto' },
          ],
        },
        {
          name: 'posterUrl',
          type: 'text',
          label: 'Poster URL',
          default: '',
          tab: 'style',
          placeholder: 'https://.../poster.jpg',
        },
        {
          name: 'aspectRatio',
          type: 'optionButtons',
          label: 'Aspect Ratio',
          default: '16:9',
          tab: 'layout',
          options: [
            { value: '16:9', label: '16:9' },
            { value: '4:3', label: '4:3' },
            { value: '1:1', label: '1:1' },
            { value: '21:9', label: '21:9' },
            { value: 'auto', label: 'Auto' },
          ],
        },
        {
          name: 'objectFit',
          type: 'optionButtons',
          label: 'Object Fit',
          default: 'contain',
          tab: 'layout',
          options: [
            { value: 'contain', label: 'Contain' },
            { value: 'cover', label: 'Cover' },
          ],
        },
        {
          name: 'maxWidth',
          type: 'text',
          label: 'Max Width',
          default: '',
          tab: 'layout',
          placeholder: 'e.g. 960px, 80%, none',
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
          placeholder: 'Describe this video',
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
          placeholder: 'e.g., my-video-block',
        },
      ];
    }

    static get observedAttributes() {
      return [
        'block-id',
        'source-type',
        'video-url',
        'media-id',
        'media-url',
        'media-type',
        'media-name',
        'title',
        'show-controls',
        'disable-download',
        'autoplay',
        'muted',
        'loop',
        'plays-inline',
        'preload',
        'poster-url',
        'aspect-ratio',
        'object-fit',
        'max-width',
        'text-align',
        'show-caption',
        'show-caption-explicit',
        'caption',
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
      const title = this.getAttribute('title') || '';
      const mediaUrl = this.getAttribute('media-url') || '';
      const mediaType = this.getAttribute('media-type') || '';
      const rawUrl = (sourceType === 'media' || sourceType === 'upload')
        ? (mediaUrl || this.getAttribute('video-url') || '')
        : (this.getAttribute('video-url') || '');

      const normalizedUrl = this.sanitizeUrl(rawUrl);
      const embedUrl = this.normalizeEmbedUrl(normalizedUrl);
      const isEmbed = mediaType === 'embed' || !!embedUrl;

      const controls = this.getBooleanAttribute('show-controls', true);
      const disableDownload = this.getBooleanAttribute('disable-download', true);
      const autoplay = this.getBooleanAttribute('autoplay', false) && !this.isEditingMode();
      const muted = this.getBooleanAttribute('muted', false);
      const loop = this.getBooleanAttribute('loop', false);
      const playsInline = this.getBooleanAttribute('plays-inline', true);
      const preload = this.getAttribute('preload') || 'metadata';
      const posterUrl = this.sanitizeUrl(this.getAttribute('poster-url') || '');
      const aspectRatio = this.getAttribute('aspect-ratio') || '16:9';
      const objectFit = this.getAttribute('object-fit') || 'contain';
      const maxWidth = this.getSafeStyleValue(this.getAttribute('max-width') || '');
      const textAlign = this.getAttribute('text-align') || '';
      const showCaption = this.getBooleanAttribute('show-caption', false);
      const showCaptionExplicit = this.getBooleanAttribute('show-caption-explicit', false);
      const caption = this.getAttribute('caption') || '';
      const margin = this.getAttribute('margin') || '';
      const padding = this.getAttribute('padding') || '';
      const customClasses = this.getAttribute('custom-classes') || '';

      const wrapperClasses = [
        'pwc-video-wrapper',
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

      let mediaHtml = '';

      if (!normalizedUrl) {
        mediaHtml = `
          <div class="pwc-video-placeholder">
            <p class="pwc-video-placeholder__title">Video block</p>
            <p class="pwc-video-placeholder__text">Add a video URL or select a Drupal Media item.</p>
          </div>
        `;
      } else if (isEmbed) {
        const src = this.escapeAttr(embedUrl || normalizedUrl);
        const iframeTitle = this.escapeAttr(title || 'Embedded video');
        const iframeStyle = hasRatio
          ? 'width:100%;height:100%;border:0;'
          : 'width:100%;min-height:360px;border:0;';
        mediaHtml = `
          <div class="pwc-video-embed"${mediaStyleAttr}>
            <iframe
              src="${src}"
              title="${iframeTitle}"
              style="${iframeStyle}"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>
        `;
      } else {
        const src = this.escapeAttr(normalizedUrl);
        const posterAttr = posterUrl ? ` poster="${this.escapeAttr(posterUrl)}"` : '';
        const controlsAttr = controls ? ' controls' : '';
        const controlsListAttr = disableDownload ? ' controlslist="nodownload"' : '';
        const autoplayAttr = autoplay ? ' autoplay' : '';
        const mutedAttr = muted ? ' muted' : '';
        const loopAttr = loop ? ' loop' : '';
        const playsInlineAttr = playsInline ? ' playsinline' : '';
        const titleAttr = title ? ` title="${this.escapeAttr(title)}"` : '';
        const safePreload = ['none', 'metadata', 'auto'].includes(preload) ? preload : 'metadata';
        const videoStyle = `object-fit:${this.escapeAttr(objectFit)};width:100%;${hasRatio ? 'height:100%;' : 'height:auto;'}display:block;`;

        mediaHtml = `
          <div class="pwc-video-player"${mediaStyleAttr}>
            <video${controlsAttr}${controlsListAttr}${autoplayAttr}${mutedAttr}${loopAttr}${playsInlineAttr}${posterAttr} preload="${safePreload}"${titleAttr} style="${videoStyle}">
              <source src="${src}">
              Your browser does not support the video tag.
            </video>
          </div>
        `;
      }

      const shouldShowCaption = !!caption && (!showCaptionExplicit || showCaption);
      const captionHtml = shouldShowCaption
        ? `<p class="pwc-video-caption">${this.escapeAttr(caption)}</p>`
        : '';

      this.innerHTML = `
        <div class="${wrapperClasses}">
          ${mediaHtml}
          ${captionHtml}
        </div>
      `;
    }

    isEditingMode() {
      return !!(window.pwcEditorState && window.pwcEditorState.isEditing);
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

      // Relative site URLs (e.g. /sites/default/files/...)
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

    normalizeEmbedUrl(url) {
      if (!url) return '';

      try {
        const parsed = new URL(url, window.location.origin);
        const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
        const path = parsed.pathname;

        if (host === 'youtu.be') {
          const id = path.replace(/^\/+/, '').split('/')[0];
          return id ? `https://www.youtube.com/embed/${id}` : '';
        }

        if (host === 'youtube.com' || host === 'm.youtube.com') {
          if (path.startsWith('/embed/')) {
            const id = path.split('/')[2];
            return id ? `https://www.youtube.com/embed/${id}` : '';
          }

          if (path.startsWith('/shorts/')) {
            const id = path.split('/')[2];
            return id ? `https://www.youtube.com/embed/${id}` : '';
          }

          if (path === '/watch') {
            const id = parsed.searchParams.get('v');
            return id ? `https://www.youtube.com/embed/${id}` : '';
          }
        }

        if (host === 'vimeo.com' || host === 'player.vimeo.com') {
          if (path.startsWith('/video/')) {
            const id = path.split('/')[2];
            return id ? `https://player.vimeo.com/video/${id}` : '';
          }

          const id = path.replace(/^\/+/, '').split('/')[0];
          if (/^\d+$/.test(id)) {
            return `https://player.vimeo.com/video/${id}`;
          }
        }
      } catch (e) {
        return '';
      }

      return '';
    }

    escapeAttr(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }

  customElements.define('pwc-video', VideoBlock);

  if (window.pwcBlockRegistry) {
    window.pwcBlockRegistry.register(VideoBlock);
  }

})(Drupal);
