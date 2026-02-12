FROM drupal:10-php8.3-apache

# Install PostgreSQL driver
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo_pgsql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Increase upload limits for media-heavy visual editor workflows.
RUN { \
      echo 'upload_max_filesize=256M'; \
      echo 'post_max_size=256M'; \
      echo 'max_execution_time=300'; \
      echo 'max_input_time=300'; \
    } > /usr/local/etc/php/conf.d/pwc-upload-limits.ini

# Set proper permissions
RUN mkdir -p /var/www/html/sites/default/files \
    && chown -R www-data:www-data /var/www/html/sites/default/files \
    && chmod -R 755 /var/www/html/sites/default/files

# Create custom directories
RUN mkdir -p /var/www/html/modules/custom \
    && mkdir -p /var/www/html/themes/custom \
    && mkdir -p /var/www/html/config/sync \
    && chown -R www-data:www-data /var/www/html/modules/custom \
    && chown -R www-data:www-data /var/www/html/themes/custom \
    && chown -R www-data:www-data /var/www/html/config/sync

WORKDIR /var/www/html
