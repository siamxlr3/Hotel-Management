# Stage 1: Build Node (React/Vite) Assets
FROM node:20 AS node_builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: PHP & Apache Production Server
FROM php:8.2-apache

# Install system dependencies & PHP extensions required by Laravel
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    git \
    curl \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Enable Apache mod_rewrite (critical for Laravel routing)
RUN a2enmod rewrite

# Install absolute latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory inside container
WORKDIR /var/www/html

# Copy existing application directory contents
COPY . /var/www/html

# Copy the successfully built Vite assets from Stage 1 into the public folder
COPY --from=node_builder /app/public/build /var/www/html/public/build

# Update Apache configuration to point permanently to Laravel's /public folder
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Set directory permissions for Laravel write-access
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Run Composer installation for PHP dependencies
RUN composer install --optimize-autoloader --no-dev

# Copy the runtime startup script and make it executable
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port 80 for Render routing
EXPOSE 80

# Use the runtime script as the main container command
CMD ["/usr/local/bin/entrypoint.sh"]
