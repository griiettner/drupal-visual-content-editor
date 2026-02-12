<?php

namespace Drupal\pwc_visual_editor\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Url;
use Drupal\file\FileInterface;
use Drupal\media\Entity\Media;
use Drupal\media\MediaTypeInterface;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

/**
 * Controller for the PWC Visual Editor.
 */
class EditorController extends ControllerBase {

  /**
   * Display the add page form for Visual Pages.
   *
   * @return array
   *   Render array for the add page.
   */
  public function addPage() {
    return [
      '#theme' => 'pwc_visual_editor_add',
      '#attached' => [
        'library' => [
          'pwc_visual_editor/editor',
        ],
        'drupalSettings' => [
          'pwcVisualEditor' => [
            'isNewPage' => TRUE,
            'createUrl' => Url::fromRoute('pwc_visual_editor.create')->toString(),
            'mediaListUrl' => $this->safeRouteUrl('pwc_visual_editor.media_list'),
            'mediaUploadUrl' => $this->safeRouteUrl('pwc_visual_editor.media_upload'),
            'mediaImageListUrl' => $this->safeRouteUrl('pwc_visual_editor.image_media_list'),
            'mediaImageUploadUrl' => $this->safeRouteUrl('pwc_visual_editor.image_media_upload'),
            'mediaUploadMaxBytes' => $this->getPhpUploadLimitBytes(),
            'startInEditMode' => TRUE,
          ],
        ],
        'html_head' => [
          [
            [
              '#type' => 'html_tag',
              '#tag' => 'link',
              '#attributes' => [
                'rel' => 'stylesheet',
                'href' => 'https://appkitcdn.pwc.com/appkit4/cdn/styles/4.10.3/appkit.min.css',
              ],
            ],
            'appkit4_css',
          ],
          [
            [
              '#type' => 'html_tag',
              '#tag' => 'script',
              '#attributes' => [
                'type' => 'module',
                'src' => 'https://appkitcdn.pwc.com/appkit4/cdn/web-components/1.15.0/dist/appkit4/appkit4.esm.js',
              ],
            ],
            'appkit4_js',
          ],
        ],
      ],
    ];
  }

  /**
   * Display the edit page for a Visual Page.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The node to edit.
   *
   * @return array
   *   Render array for the edit page.
   */
  public function editPage(NodeInterface $node) {
    // Get existing content
    $content = [];
    if ($node->hasField('field_page_content') && !$node->get('field_page_content')->isEmpty()) {
      $json = $node->get('field_page_content')->value;
      $content = json_decode($json, TRUE) ?: [];
      \Drupal::logger('pwc_visual_editor')->notice('Edit page content loaded: @content', ['@content' => $json]);
    } else {
      \Drupal::logger('pwc_visual_editor')->notice('Edit page: No content found for node @id', ['@id' => $node->id()]);
    }

    // Debug: output content to check
    \Drupal::logger('pwc_visual_editor')->notice('Parsed content blocks count: @count', [
      '@count' => isset($content['blocks']) ? count($content['blocks']) : 0,
    ]);

    return [
      '#theme' => 'pwc_visual_editor_edit',
      '#node' => $node,
      '#content' => $content,
      '#attached' => [
        'library' => [
          'pwc_visual_editor/editor',
        ],
        'drupalSettings' => [
          'pwcVisualEditor' => [
            'nodeId' => $node->id(),
            'nodeTitle' => $node->getTitle(),
            'content' => $content,
            'saveUrl' => Url::fromRoute('pwc_visual_editor.save', ['node' => $node->id()])->toString(),
            'mediaListUrl' => $this->safeRouteUrl('pwc_visual_editor.media_list'),
            'mediaUploadUrl' => $this->safeRouteUrl('pwc_visual_editor.media_upload'),
            'mediaImageListUrl' => $this->safeRouteUrl('pwc_visual_editor.image_media_list'),
            'mediaImageUploadUrl' => $this->safeRouteUrl('pwc_visual_editor.image_media_upload'),
            'mediaUploadMaxBytes' => $this->getPhpUploadLimitBytes(),
            'viewUrl' => $node->toUrl()->toString(),
            'startInEditMode' => TRUE,
          ],
        ],
        'html_head' => [
          [
            [
              '#type' => 'html_tag',
              '#tag' => 'link',
              '#attributes' => [
                'rel' => 'stylesheet',
                'href' => 'https://appkitcdn.pwc.com/appkit4/cdn/styles/4.10.3/appkit.min.css',
              ],
            ],
            'appkit4_css',
          ],
          [
            [
              '#type' => 'html_tag',
              '#tag' => 'script',
              '#attributes' => [
                'type' => 'module',
                'src' => 'https://appkitcdn.pwc.com/appkit4/cdn/web-components/1.15.0/dist/appkit4/appkit4.esm.js',
              ],
            ],
            'appkit4_js',
          ],
        ],
      ],
      // Disable caching for edit pages to always get fresh content
      '#cache' => [
        'max-age' => 0,
      ],
    ];
  }

  /**
   * Create a new Visual Page.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   JSON response with the new node info.
   */
  public function createPage(Request $request): JsonResponse {
    try {
      $data = json_decode($request->getContent(), TRUE);

      if (json_last_error() !== JSON_ERROR_NONE) {
        return new JsonResponse([
          'success' => FALSE,
          'error' => 'Invalid JSON payload',
        ], 400);
      }

      $title = $data['title'] ?? 'Untitled Page';
      $content = $data['content'] ?? ['blocks' => []];

      // Create the node
      $node = Node::create([
        'type' => 'visual_page',
        'title' => $title,
        'status' => 1,
        'field_page_content' => json_encode($content),
      ]);
      $node->save();

      return new JsonResponse([
        'success' => TRUE,
        'nodeId' => $node->id(),
        'editUrl' => Url::fromRoute('pwc_visual_editor.edit', ['node' => $node->id()])->toString(),
        'viewUrl' => $node->toUrl()->toString(),
      ]);
    }
    catch (\Exception $e) {
      return new JsonResponse([
        'success' => FALSE,
        'error' => 'Failed to create page: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Save content for a node.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The node to save content for.
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   JSON response with save status.
   */
  public function save(NodeInterface $node, Request $request): JsonResponse {
    try {
      $data = json_decode($request->getContent(), TRUE);

      if (json_last_error() !== JSON_ERROR_NONE) {
        return new JsonResponse([
          'success' => FALSE,
          'error' => 'Invalid JSON payload',
        ], 400);
      }

      // Update title if provided
      if (isset($data['title'])) {
        $node->setTitle($data['title']);
      }

      $content = $data['content'] ?? $data;

      // Validate content structure
      if (!isset($content['blocks']) || !is_array($content['blocks'])) {
        return new JsonResponse([
          'success' => FALSE,
          'error' => 'Invalid content structure: missing blocks array',
        ], 400);
      }

      // Sanitize HTML content in blocks
      $sanitized_content = $this->sanitizeBlockContent($content);

      // Store as JSON in the field_page_content field
      if ($node->hasField('field_page_content')) {
        $node->set('field_page_content', json_encode($sanitized_content));
        $node->save();

        return new JsonResponse([
          'success' => TRUE,
          'message' => 'Content saved successfully',
          'nodeId' => $node->id(),
        ]);
      }
      else {
        return new JsonResponse([
          'success' => FALSE,
          'error' => 'Content type does not have field_page_content field',
        ], 400);
      }
    }
    catch (\Exception $e) {
      return new JsonResponse([
        'success' => FALSE,
        'error' => 'Failed to save content: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * List available video media entries.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   JSON response containing media items.
   */
  public function listVideoMedia(Request $request): JsonResponse {
    try {
      $queryText = trim((string) $request->query->get('q', ''));
      $limit = (int) $request->query->get('limit', 50);
      $limit = max(1, min($limit, 100));

      $videoTypes = $this->getSupportedVideoMediaTypes();
      if (empty($videoTypes)) {
        return new JsonResponse([
          'success' => TRUE,
          'items' => [],
        ]);
      }

      $bundleIds = array_keys($videoTypes);

      $query = \Drupal::entityQuery('media')
        ->accessCheck(TRUE)
        ->condition('bundle', $bundleIds, 'IN')
        ->sort('created', 'DESC')
        ->range(0, $limit);

      if ($queryText !== '') {
        $query->condition('name', $queryText, 'CONTAINS');
      }

      $ids = $query->execute();
      if (empty($ids)) {
        return new JsonResponse([
          'success' => TRUE,
          'items' => [],
        ]);
      }

      $mediaStorage = \Drupal::entityTypeManager()->getStorage('media');
      $items = [];
      foreach ($mediaStorage->loadMultiple($ids) as $media) {
        $bundle = $media->bundle();
        $typeInfo = $videoTypes[$bundle] ?? NULL;
        if (!$typeInfo) {
          continue;
        }

        $item = $this->buildVideoMediaItem($media, $typeInfo);
        if ($item) {
          $items[] = $item;
        }
      }

      return new JsonResponse([
        'success' => TRUE,
        'items' => $items,
      ]);
    }
    catch (\Exception $e) {
      return new JsonResponse([
        'success' => FALSE,
        'error' => 'Failed to list media videos: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Upload a video file and create a Drupal Media entity.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   JSON response containing the created media item.
   */
  public function uploadVideoMedia(Request $request): JsonResponse {
    try {
      $contentLength = (int) $request->server->get('CONTENT_LENGTH', 0);
      $maxUploadBytes = $this->getPhpUploadLimitBytes();

      if ($contentLength > 0 && $maxUploadBytes > 0 && $contentLength > $maxUploadBytes) {
        return new JsonResponse([
          'success' => FALSE,
          'error' => sprintf(
            'Upload exceeds server limit (%s). Please upload a smaller file.',
            ini_get('upload_max_filesize')
          ),
        ], 400);
      }

      $uploadedFile = $request->files->get('video');
      if (!$uploadedFile instanceof UploadedFile) {
        return new JsonResponse([
          'success' => FALSE,
          'error' => sprintf(
            'No video file was provided. File may exceed server upload limit (%s).',
            ini_get('upload_max_filesize')
          ),
        ], 400);
      }

      if (!$this->isAllowedUploadedVideoFile($uploadedFile)) {
        $detectedMime = (string) $uploadedFile->getMimeType();
        $clientMime = (string) $uploadedFile->getClientMimeType();
        return new JsonResponse([
          'success' => FALSE,
          'error' => sprintf(
            'Only video files are allowed (detected mime: %s, client mime: %s).',
            $detectedMime ?: 'n/a',
            $clientMime ?: 'n/a'
          ),
        ], 400);
      }

      $videoTypes = $this->getSupportedVideoMediaTypes();
      $uploadType = $this->getUploadableVideoMediaType($videoTypes);
      if (!$uploadType) {
        return new JsonResponse([
          'success' => FALSE,
          'error' => 'No uploadable video media type is configured in Drupal.',
        ], 400);
      }

      $fileSystem = \Drupal::service('file_system');
      $fileRepository = \Drupal::service('file.repository');

      $directory = 'public://pwc_visual_editor/videos';
      $fileSystem->prepareDirectory($directory, FileSystemInterface::CREATE_DIRECTORY | FileSystemInterface::MODIFY_PERMISSIONS);

      $originalName = $uploadedFile->getClientOriginalName();
      $destination = $directory . '/' . $originalName;

      $data = file_get_contents($uploadedFile->getPathname());
      if ($data === FALSE) {
        throw new \RuntimeException('Failed to read uploaded file data.');
      }

      $file = $fileRepository->writeData($data, $destination, FileSystemInterface::EXISTS_RENAME);
      if (!$file instanceof FileInterface) {
        throw new \RuntimeException('Failed to create Drupal file entity.');
      }

      $file->setPermanent();
      $file->save();

      $sourceField = $uploadType['source_field'];
      $requestedTitle = trim((string) $request->request->get('title', ''));
      $mediaTitle = $requestedTitle !== ''
        ? $requestedTitle
        : pathinfo($file->getFilename(), PATHINFO_FILENAME);

      $media = Media::create([
        'bundle' => $uploadType['id'],
        'name' => $mediaTitle,
        'status' => 1,
        $sourceField => ['target_id' => $file->id()],
      ]);
      $media->save();

      $item = $this->buildVideoMediaItem($media, $uploadType);
      if (!$item) {
        throw new \RuntimeException('Video media was created but could not be resolved for rendering.');
      }

      return new JsonResponse([
        'success' => TRUE,
        'item' => $item,
      ]);
    }
    catch (\Exception $e) {
      return new JsonResponse([
        'success' => FALSE,
        'error' => 'Failed to upload video: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * List available image media entries.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   JSON response containing media items.
   */
  public function listImageMedia(Request $request): JsonResponse {
    try {
      $queryText = trim((string) $request->query->get('q', ''));
      $limit = (int) $request->query->get('limit', 50);
      $limit = max(1, min($limit, 100));

      $imageTypes = $this->getSupportedImageMediaTypes();
      if (empty($imageTypes)) {
        return new JsonResponse([
          'success' => TRUE,
          'items' => [],
        ]);
      }

      $bundleIds = array_keys($imageTypes);

      $query = \Drupal::entityQuery('media')
        ->accessCheck(TRUE)
        ->condition('bundle', $bundleIds, 'IN')
        ->sort('created', 'DESC')
        ->range(0, $limit);

      if ($queryText !== '') {
        $query->condition('name', $queryText, 'CONTAINS');
      }

      $ids = $query->execute();
      if (empty($ids)) {
        return new JsonResponse([
          'success' => TRUE,
          'items' => [],
        ]);
      }

      $mediaStorage = \Drupal::entityTypeManager()->getStorage('media');
      $items = [];
      foreach ($mediaStorage->loadMultiple($ids) as $media) {
        $bundle = $media->bundle();
        $typeInfo = $imageTypes[$bundle] ?? NULL;
        if (!$typeInfo) {
          continue;
        }

        $item = $this->buildImageMediaItem($media, $typeInfo);
        if ($item) {
          $items[] = $item;
        }
      }

      return new JsonResponse([
        'success' => TRUE,
        'items' => $items,
      ]);
    }
    catch (\Exception $e) {
      return new JsonResponse([
        'success' => FALSE,
        'error' => 'Failed to list media images: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Upload an image file and create a Drupal Media entity.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   JSON response containing the created media item.
   */
  public function uploadImageMedia(Request $request): JsonResponse {
    try {
      $contentLength = (int) $request->server->get('CONTENT_LENGTH', 0);
      $maxUploadBytes = $this->getPhpUploadLimitBytes();

      if ($contentLength > 0 && $maxUploadBytes > 0 && $contentLength > $maxUploadBytes) {
        return new JsonResponse([
          'success' => FALSE,
          'error' => sprintf(
            'Upload exceeds server limit (%s). Please upload a smaller file.',
            ini_get('upload_max_filesize')
          ),
        ], 400);
      }

      $uploadedFile = $request->files->get('image');
      if (!$uploadedFile instanceof UploadedFile) {
        return new JsonResponse([
          'success' => FALSE,
          'error' => sprintf(
            'No image file was provided. File may exceed server upload limit (%s).',
            ini_get('upload_max_filesize')
          ),
        ], 400);
      }

      if (!$this->isAllowedUploadedImageFile($uploadedFile)) {
        $detectedMime = (string) $uploadedFile->getMimeType();
        $clientMime = (string) $uploadedFile->getClientMimeType();
        return new JsonResponse([
          'success' => FALSE,
          'error' => sprintf(
            'Only image files are allowed (detected mime: %s, client mime: %s).',
            $detectedMime ?: 'n/a',
            $clientMime ?: 'n/a'
          ),
        ], 400);
      }

      $imageTypes = $this->getSupportedImageMediaTypes();
      $uploadType = $this->getUploadableImageMediaType($imageTypes);
      if (!$uploadType) {
        return new JsonResponse([
          'success' => FALSE,
          'error' => 'No uploadable image media type is configured in Drupal.',
        ], 400);
      }

      $fileSystem = \Drupal::service('file_system');
      $fileRepository = \Drupal::service('file.repository');

      $directory = 'public://pwc_visual_editor/images';
      $fileSystem->prepareDirectory($directory, FileSystemInterface::CREATE_DIRECTORY | FileSystemInterface::MODIFY_PERMISSIONS);

      $originalName = $uploadedFile->getClientOriginalName();
      $destination = $directory . '/' . $originalName;

      $data = file_get_contents($uploadedFile->getPathname());
      if ($data === FALSE) {
        throw new \RuntimeException('Failed to read uploaded file data.');
      }

      $file = $fileRepository->writeData($data, $destination, FileSystemInterface::EXISTS_RENAME);
      if (!$file instanceof FileInterface) {
        throw new \RuntimeException('Failed to create Drupal file entity.');
      }

      $file->setPermanent();
      $file->save();

      $sourceField = $uploadType['source_field'];
      $requestedTitle = trim((string) $request->request->get('title', ''));
      $mediaTitle = $requestedTitle !== ''
        ? $requestedTitle
        : pathinfo($file->getFilename(), PATHINFO_FILENAME);

      $media = Media::create([
        'bundle' => $uploadType['id'],
        'name' => $mediaTitle,
        'status' => 1,
        $sourceField => ['target_id' => $file->id()],
      ]);
      $media->save();

      $item = $this->buildImageMediaItem($media, $uploadType);
      if (!$item) {
        throw new \RuntimeException('Image media was created but could not be resolved for rendering.');
      }

      return new JsonResponse([
        'success' => TRUE,
        'item' => $item,
      ]);
    }
    catch (\Exception $e) {
      return new JsonResponse([
        'success' => FALSE,
        'error' => 'Failed to upload image: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get supported media bundles that represent video sources.
   *
   * @return array
   *   Array keyed by bundle ID.
   */
  protected function getSupportedVideoMediaTypes(): array {
    $mediaTypeStorage = \Drupal::entityTypeManager()->getStorage('media_type');
    $types = $mediaTypeStorage->loadMultiple();

    $supported = [];
    foreach ($types as $mediaType) {
      if (!$mediaType instanceof MediaTypeInterface) {
        continue;
      }

      $sourcePlugin = $mediaType->getSource();
      $pluginId = (string) $sourcePlugin->getPluginId();
      if (strpos($pluginId, 'video') === FALSE) {
        continue;
      }

      $sourceFieldDefinition = $sourcePlugin->getSourceFieldDefinition($mediaType);
      if (!$sourceFieldDefinition) {
        continue;
      }

      $sourceField = $sourceFieldDefinition->getName();
      $fieldType = $sourceFieldDefinition->getType();

      $supported[$mediaType->id()] = [
        'id' => $mediaType->id(),
        'label' => $mediaType->label(),
        'plugin_id' => $pluginId,
        'source_field' => $sourceField,
        'field_type' => $fieldType,
        'uploadable' => $fieldType === 'file',
      ];
    }

    return $supported;
  }

  /**
   * Pick the best media bundle for file uploads.
   *
   * @param array $videoTypes
   *   Supported video bundle metadata.
   *
   * @return array|null
   *   Selected bundle info or NULL.
   */
  protected function getUploadableVideoMediaType(array $videoTypes): ?array {
    foreach ($videoTypes as $type) {
      if (!empty($type['uploadable']) && ($type['plugin_id'] ?? '') === 'video_file') {
        return $type;
      }
    }

    foreach ($videoTypes as $type) {
      if (!empty($type['uploadable'])) {
        return $type;
      }
    }

    return NULL;
  }

  /**
   * Get supported media bundles that represent image sources.
   *
   * @return array
   *   Array keyed by bundle ID.
   */
  protected function getSupportedImageMediaTypes(): array {
    $mediaTypeStorage = \Drupal::entityTypeManager()->getStorage('media_type');
    $types = $mediaTypeStorage->loadMultiple();

    $supported = [];
    foreach ($types as $mediaType) {
      if (!$mediaType instanceof MediaTypeInterface) {
        continue;
      }

      $sourcePlugin = $mediaType->getSource();
      $pluginId = (string) $sourcePlugin->getPluginId();
      if (strpos($pluginId, 'image') === FALSE) {
        continue;
      }

      $sourceFieldDefinition = $sourcePlugin->getSourceFieldDefinition($mediaType);
      if (!$sourceFieldDefinition) {
        continue;
      }

      $sourceField = $sourceFieldDefinition->getName();
      $fieldType = $sourceFieldDefinition->getType();

      $supported[$mediaType->id()] = [
        'id' => $mediaType->id(),
        'label' => $mediaType->label(),
        'plugin_id' => $pluginId,
        'source_field' => $sourceField,
        'field_type' => $fieldType,
        'uploadable' => in_array($fieldType, ['image', 'file'], TRUE),
      ];
    }

    return $supported;
  }

  /**
   * Pick the best media bundle for image file uploads.
   *
   * @param array $imageTypes
   *   Supported image bundle metadata.
   *
   * @return array|null
   *   Selected bundle info or NULL.
   */
  protected function getUploadableImageMediaType(array $imageTypes): ?array {
    foreach ($imageTypes as $type) {
      if (!empty($type['uploadable']) && ($type['plugin_id'] ?? '') === 'image') {
        return $type;
      }
    }

    foreach ($imageTypes as $type) {
      if (!empty($type['uploadable'])) {
        return $type;
      }
    }

    return NULL;
  }

  /**
   * Build normalized media item payload for the editor.
   *
   * @param \Drupal\media\Entity\Media $media
   *   Media entity.
   * @param array $typeInfo
   *   Bundle metadata from getSupportedVideoMediaTypes().
   *
   * @return array|null
   *   Normalized item or NULL if not resolvable.
   */
  protected function buildVideoMediaItem(Media $media, array $typeInfo): ?array {
    $sourceField = $typeInfo['source_field'] ?? '';
    if (!$sourceField || !$media->hasField($sourceField) || $media->get($sourceField)->isEmpty()) {
      return NULL;
    }

    $field = $media->get($sourceField);
    $url = '';
    $mediaType = 'file';

    if (($typeInfo['field_type'] ?? '') === 'file') {
      $file = $field->entity;
      if (!$file) {
        return NULL;
      }
      $url = \Drupal::service('file_url_generator')->generateString($file->getFileUri());
    }
    else {
      $url = (string) ($field->value ?? $field->uri ?? '');
      $url = trim($url);
      if ($url === '') {
        return NULL;
      }
      $mediaType = $this->isEmbedVideoUrl($url) ? 'embed' : 'file';
    }

    return [
      'id' => (int) $media->id(),
      'title' => $media->label(),
      'bundle' => $typeInfo['id'] ?? $media->bundle(),
      'type' => $mediaType,
      'url' => $url,
    ];
  }

  /**
   * Build normalized image media item payload for the editor.
   *
   * @param \Drupal\media\Entity\Media $media
   *   Media entity.
   * @param array $typeInfo
   *   Bundle metadata from getSupportedImageMediaTypes().
   *
   * @return array|null
   *   Normalized item or NULL if not resolvable.
   */
  protected function buildImageMediaItem(Media $media, array $typeInfo): ?array {
    $sourceField = $typeInfo['source_field'] ?? '';
    if (!$sourceField || !$media->hasField($sourceField) || $media->get($sourceField)->isEmpty()) {
      return NULL;
    }

    $field = $media->get($sourceField);
    $url = '';

    if (in_array(($typeInfo['field_type'] ?? ''), ['image', 'file'], TRUE)) {
      $file = $field->entity;
      if (!$file) {
        return NULL;
      }
      $url = \Drupal::service('file_url_generator')->generateString($file->getFileUri());
    }
    else {
      $url = (string) ($field->value ?? $field->uri ?? '');
      $url = trim($url);
      if ($url === '') {
        return NULL;
      }
    }

    return [
      'id' => (int) $media->id(),
      'title' => $media->label(),
      'bundle' => $typeInfo['id'] ?? $media->bundle(),
      'type' => 'file',
      'url' => $url,
    ];
  }

  /**
   * Determine whether a URL likely points to an embeddable video page.
   *
   * @param string $url
   *   URL string.
   *
   * @return bool
   *   TRUE when URL is YouTube/Vimeo style.
   */
  protected function isEmbedVideoUrl(string $url): bool {
    $host = strtolower((string) parse_url($url, PHP_URL_HOST));
    if ($host === '') {
      return FALSE;
    }

    return str_contains($host, 'youtube.com')
      || str_contains($host, 'youtu.be')
      || str_contains($host, 'vimeo.com');
  }

  /**
   * Sanitize HTML content within blocks.
   *
   * @param array $content
   *   The content array with blocks.
   *
   * @return array
   *   Sanitized content array.
   */
  protected function sanitizeBlockContent(array $content): array {
    $allowed_tags = '<p><br><strong><b><em><i><a><ul><ol><li><span>';

    foreach ($content['blocks'] as &$block) {
      if (isset($block['attributes'])) {
        foreach ($block['attributes'] as $key => &$value) {
          if (is_string($value) && $this->isHtmlContent($value)) {
            $value = strip_tags($value, $allowed_tags);
            // Remove event handlers and javascript: URLs
            $value = preg_replace('/\s*on\w+\s*=\s*["\'][^"\']*["\']/i', '', $value);
            $value = preg_replace('/href\s*=\s*["\']javascript:[^"\']*["\']/i', 'href="#"', $value);
          }
        }
      }

      // Recursively sanitize inner blocks
      if (isset($block['innerBlocks']) && is_array($block['innerBlocks'])) {
        $block['innerBlocks'] = $this->sanitizeBlockContent(['blocks' => $block['innerBlocks']])['blocks'];
      }
    }

    return $content;
  }

  /**
   * Check if a string contains HTML content.
   *
   * @param string $value
   *   The string to check.
   *
   * @return bool
   *   TRUE if the string contains HTML tags.
   */
  protected function isHtmlContent(string $value): bool {
    return $value !== strip_tags($value);
  }

  /**
   * Validate uploaded file as a video using MIME and extension fallback.
   *
   * @param \Symfony\Component\HttpFoundation\File\UploadedFile $uploadedFile
   *   Uploaded file.
   *
   * @return bool
   *   TRUE when file appears to be a valid video.
   */
  protected function isAllowedUploadedVideoFile(UploadedFile $uploadedFile): bool {
    $detectedMime = strtolower((string) $uploadedFile->getMimeType());
    if (str_starts_with($detectedMime, 'video/')) {
      return TRUE;
    }

    $clientMime = strtolower((string) $uploadedFile->getClientMimeType());
    if (str_starts_with($clientMime, 'video/')) {
      return TRUE;
    }

    $allowedExtensions = [
      'mp4',
      'm4v',
      'mov',
      'avi',
      'webm',
      'ogv',
      'ogg',
      'wmv',
      'mkv',
      '3gp',
    ];

    $clientExtension = strtolower((string) $uploadedFile->getClientOriginalExtension());
    if ($clientExtension !== '' && in_array($clientExtension, $allowedExtensions, TRUE)) {
      return TRUE;
    }

    $originalName = (string) $uploadedFile->getClientOriginalName();
    $pathExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    return $pathExtension !== '' && in_array($pathExtension, $allowedExtensions, TRUE);
  }

  /**
   * Validate uploaded file as an image using MIME and extension fallback.
   *
   * @param \Symfony\Component\HttpFoundation\File\UploadedFile $uploadedFile
   *   Uploaded file.
   *
   * @return bool
   *   TRUE when file appears to be a valid image.
   */
  protected function isAllowedUploadedImageFile(UploadedFile $uploadedFile): bool {
    $detectedMime = strtolower((string) $uploadedFile->getMimeType());
    if (str_starts_with($detectedMime, 'image/')) {
      return TRUE;
    }

    $clientMime = strtolower((string) $uploadedFile->getClientMimeType());
    if (str_starts_with($clientMime, 'image/')) {
      return TRUE;
    }

    $allowedExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'svg',
      'avif',
      'bmp',
      'tiff',
      'tif',
    ];

    $clientExtension = strtolower((string) $uploadedFile->getClientOriginalExtension());
    if ($clientExtension !== '' && in_array($clientExtension, $allowedExtensions, TRUE)) {
      return TRUE;
    }

    $originalName = (string) $uploadedFile->getClientOriginalName();
    $pathExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    return $pathExtension !== '' && in_array($pathExtension, $allowedExtensions, TRUE);
  }

  /**
   * Get effective upload limit in bytes based on PHP ini values.
   *
   * @return int
   *   Maximum accepted request size in bytes.
   */
  protected function getPhpUploadLimitBytes(): int {
    $uploadMax = $this->parseIniSize((string) ini_get('upload_max_filesize'));
    $postMax = $this->parseIniSize((string) ini_get('post_max_size'));

    if ($uploadMax <= 0) {
      return $postMax;
    }

    if ($postMax <= 0) {
      return $uploadMax;
    }

    return min($uploadMax, $postMax);
  }

  /**
   * Convert php.ini size notation to bytes.
   *
   * @param string $size
   *   Size string (e.g. 2M, 512K, 1G).
   *
   * @return int
   *   Size in bytes.
   */
  protected function parseIniSize(string $size): int {
    $size = trim($size);
    if ($size === '') {
      return 0;
    }

    $unit = strtolower(substr($size, -1));
    $value = (float) $size;
    switch ($unit) {
      case 'g':
        $value *= 1024;
        // no break
      case 'm':
        $value *= 1024;
        // no break
      case 'k':
        $value *= 1024;
        break;
    }

    return (int) round($value);
  }

  /**
   * Resolve route URL safely when router cache is stale.
   *
   * @param string $routeName
   *   Route machine name.
   * @param array $routeParams
   *   Optional route parameters.
   *
   * @return string
   *   URL string or empty string if route doesn't exist yet.
   */
  protected function safeRouteUrl(string $routeName, array $routeParams = []): string {
    try {
      return Url::fromRoute($routeName, $routeParams)->toString();
    }
    catch (RouteNotFoundException $e) {
      return '';
    }
  }

}
