<?php

namespace Drupal\pwc_visual_editor\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;

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

}
