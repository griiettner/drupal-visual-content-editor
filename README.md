# Drupal Development Environment

Docker-based Drupal 10 development environment with PostgreSQL.

## Quick Start

```bash
# Build and start containers
docker compose up -d --build

# Wait for containers to be ready, then access Drupal at:
# http://localhost:8080
```

## First-Time Setup

1. Start the containers:
   ```bash
   docker compose up -d --build
   ```

2. Open http://localhost:8080 in your browser

3. Complete the Drupal installation wizard:
   - Choose **Standard** installation profile
   - Select **PostgreSQL** as the database
   - Database settings:
     - Database name: `drupal`
     - Database username: `drupal`
     - Database password: `drupal`
     - Host: `postgres`
     - Port: `5432`

## Directory Structure

```
├── docker-compose.yml
├── Dockerfile
├── config/
│   └── sync/           # Configuration export/import (persistent)
└── web/
    ├── modules/
    │   └── custom/     # Your custom modules (persistent)
    ├── themes/
    │   └── custom/     # Your custom themes (persistent)
    └── sites/
        └── default/
            └── files/  # Uploaded media files (persistent)
```

## Useful Commands

```bash
# Start containers
docker compose up -d

# Stop containers
docker compose down

# View logs
docker compose logs -f drupal

# Access Drupal container shell
docker compose exec drupal bash

# Run Drush commands
docker compose exec drupal ./vendor/bin/drush <command>

# Clear cache
docker compose exec drupal ./vendor/bin/drush cr

# Export configuration
docker compose exec drupal ./vendor/bin/drush cex

# Import configuration
docker compose exec drupal ./vendor/bin/drush cim
```

## Persistent Volumes

The following directories are mounted as volumes and persist across container rebuilds:

- `web/modules/custom/` - Custom modules you develop
- `web/themes/custom/` - Custom themes you develop
- `web/sites/default/files/` - Uploaded media and generated files
- `config/sync/` - Drupal configuration exports

PostgreSQL data is stored in a named Docker volume (`postgres_data`).
