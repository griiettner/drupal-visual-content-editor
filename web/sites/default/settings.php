<?php

/**
 * Local Drupal settings persisted on host.
 */

$databases['default']['default'] = [
  'driver' => 'pgsql',
  'database' => 'drupal',
  'username' => 'drupal',
  'password' => 'drupal',
  'host' => 'postgres',
  'port' => '5432',
  'prefix' => '',
];

$settings['hash_salt'] = 'pwc-visual-editor-local-salt-2026-02-11';
$settings['config_sync_directory'] = '/var/www/html/config/sync';

$settings['trusted_host_patterns'] = [
  '^localhost$',
  '^127\\.0\\.0\\.1$',
  '^localhost:8080$',
];

if (file_exists($app_root . '/' . $site_path . '/settings.local.php')) {
  include $app_root . '/' . $site_path . '/settings.local.php';
}

