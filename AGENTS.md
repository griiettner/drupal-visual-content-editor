# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Docker-based Drupal 10 development environment running on Apache with PHP 8.3 and PostgreSQL 16. This is a containerized setup designed for local development with persistent volumes for custom code and configuration.

### Active Custom Modules
- **pwc_visual_editor**: Front-end visual content editor with Gutenberg-inspired block editing
  - JavaScript-based component architecture with vanilla JS (no framework)
  - Custom routing for visual page creation/editing bypassing Drupal admin
  - Block-based content system with registry pattern
  - API endpoints for content persistence
  - Located at: `web/modules/custom/pwc_visual_editor/`

## Architecture

### Container Structure
- **drupal container**: Official Drupal 10 image with custom PostgreSQL drivers, Drush, and Apache
- **postgres container**: PostgreSQL 16 Alpine with health checks and persistent volume
- All Drupal core files exist within the container at `/opt/drupal`
- Development work happens in mounted volumes that persist outside containers

### Persistent Data Strategy
Only specific directories are mounted as volumes to survive container rebuilds:
- `web/modules/custom/` - Custom module development
- `web/themes/custom/` - Custom theme development  
- `web/sites/default/files/` - Uploaded media and generated assets
- `config/sync/` - Configuration management exports
- PostgreSQL data stored in named volume `postgres_data`

**CRITICAL**: Core Drupal files, contrib modules, and vendor directory exist only inside the container. Never edit these on the host filesystem.

## Essential Commands

### Container Management
```bash
# Start environment
docker compose up -d

# Rebuild containers (e.g., after Dockerfile changes)
docker compose up -d --build

# Stop containers
docker compose down

# View Drupal logs
docker compose logs -f drupal

# Access Drupal container shell
docker compose exec drupal bash
```

### Drush Commands
All Drush commands must be run inside the container:

```bash
# Clear cache
docker compose exec drupal bash -c "cd /opt/drupal && ./vendor/bin/drush cr"

# Export configuration to config/sync/
docker compose exec drupal bash -c "cd /opt/drupal && ./vendor/bin/drush cex"

# Import configuration from config/sync/
docker compose exec drupal bash -c "cd /opt/drupal && ./vendor/bin/drush cim"

# Check Drupal status
docker compose exec drupal bash -c "cd /opt/drupal && ./vendor/bin/drush status"

# Run database updates
docker compose exec drupal bash -c "cd /opt/drupal && ./vendor/bin/drush updb"

# Generate one-time login link
docker compose exec drupal bash -c "cd /opt/drupal && ./vendor/bin/drush uli"
```

### Database Connection
When Drupal is not yet installed and the setup wizard prompts for database credentials:
- Database name: `drupal`
- Database username: `drupal`  
- Database password: `drupal`
- Host: `postgres` (container name, not localhost)
- Port: `5432`

Access site at: http://localhost:8080

## Module & Theme Development

### Creating Custom Modules
Place new modules in `web/modules/custom/`. Standard Drupal 10 module structure:
```
web/modules/custom/my_module/
├── my_module.info.yml
├── my_module.module
└── src/
```

### Creating Custom Themes
Place new themes in `web/themes/custom/`. Standard Drupal 10 theme structure:
```
web/themes/custom/my_theme/
├── my_theme.info.yml
├── my_theme.libraries.yml
└── templates/
```

### After Adding/Modifying Modules or Themes
```bash
# Clear cache to recognize new code
docker compose exec drupal bash -c "cd /opt/drupal && ./vendor/bin/drush cr"

# Enable a module
docker compose exec drupal bash -c "cd /opt/drupal && ./vendor/bin/drush en my_module"

# Enable and set as default theme
docker compose exec drupal bash -c "cd /opt/drupal && ./vendor/bin/drush then my_theme"
```

## Configuration Management

Drupal configuration is managed via the config sync directory for environment portability.

### Export Configuration
After making configuration changes in the UI:
```bash
docker compose exec drupal bash -c "cd /opt/drupal && ./vendor/bin/drush cex"
```
This exports to `config/sync/` which is version controlled.

### Import Configuration  
To apply configuration from `config/sync/`:
```bash
docker compose exec drupal bash -c "cd /opt/drupal && ./vendor/bin/drush cim"
```

### Configuration Workflow
1. Make configuration changes via Drupal admin UI
2. Export with `drush cex`
3. Commit changes in `config/sync/` to version control
4. Other developers import with `drush cim` after pulling

## Working with Composer

To add contributed modules or PHP dependencies:
```bash
# Access container
docker compose exec drupal bash

# Inside container
composer require drupal/module_name

# Exit container and clear cache
docker compose exec drupal bash -c "cd /opt/drupal && ./vendor/bin/drush cr"
```

**Note**: Composer changes don't persist outside the container unless the Dockerfile is modified to include them in the build.

## Troubleshooting

### Container Won't Start
Check logs: `docker compose logs drupal postgres`

### Permission Issues
File permissions inside the container are managed by `www-data` user. If you encounter permission issues in mounted volumes:
```bash
docker compose exec drupal chown -R www-data:www-data /opt/drupal/web/sites/default/files
```

### Database Connection Failed
Verify PostgreSQL container is healthy: `docker compose ps postgres`
Check environment variables in docker-compose.yml match database credentials.

### Cache Issues
Always clear cache after code changes: `docker compose exec drupal bash -c "cd /opt/drupal && ./vendor/bin/drush cr"`

## Development Mode

**Development mode is ENABLED** in this environment via `settings.local.php`. This provides:

### What Works Without Cache Clear:
- **Twig template changes** - Show immediately
- **CSS/JS changes** - Aggregation disabled, changes appear instantly
- **Render cache disabled** - Content updates show right away
- **Detailed error messages** - Full error output for debugging

### What Still Requires Cache Clear:
- Module/theme installation/uninstallation
- Changes to `*.services.yml` files
- Changes to `*.routing.yml` files
- Changes to `*.schema.yml` files
- PHP code changes in `.module` or `.install` files
- Adding new hooks or altering existing hooks

### Development Files Location:
- Settings: `/opt/drupal/web/sites/default/settings.local.php` (inside container)
- Services: `/opt/drupal/web/sites/development.services.yml` (inside container)

## PWC Visual Editor Module Architecture

### Structure
```
web/modules/custom/pwc_visual_editor/
├── js/
│   ├── services/              # Core services
│   │   ├── editor-state.js    # State management
│   │   ├── api-client.js      # Backend communication
│   │   └── block-registry.js  # Block type registration
│   ├── components/            # UI components
│   │   ├── blocks/            # Block implementations
│   │   │   ├── base-block.js  # Base block class
│   │   │   └── heading.js     # Heading block example
│   │   ├── block-toolbar.js
│   │   ├── settings-panel.js
│   │   ├── block-inserter.js
│   │   ├── rich-text-toolbar.js
│   │   └── block-library-panel.js
│   └── editor.js              # Main entry point
├── css/
│   ├── editor.css             # Editor UI styles
│   └── visual-page.css        # Front-end page styles
├── templates/                 # Twig templates
├── src/
│   └── Controller/
│       └── EditorController.php
├── pwc_visual_editor.libraries.yml
├── pwc_visual_editor.routing.yml
├── pwc_visual_editor.permissions.yml
└── pwc_visual_editor.module
```

### Key Routes
- `/visual-editor/add` - Create new visual page
- `/visual-editor/{node}/edit` - Edit existing visual page
- `/api/pwc-visual-editor/save/{node}` - Save content API
- `/api/pwc-visual-editor/create` - Create page API

### Development Workflow for This Module
1. JavaScript/CSS changes show immediately (development mode enabled)
2. Template changes show immediately
3. Routing or service changes require: `docker compose exec drupal bash -c "cd /opt/drupal && ./vendor/bin/drush cr"`
4. New block types: Add to `js/components/blocks/`, register in block-registry.js, clear cache
