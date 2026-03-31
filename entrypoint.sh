#!/bin/bash
set -e

echo "Starting deployment setup..."

# Add reliable DNS as a fallback for database resolution
# We use 'tee -a' because some environments make resolv.conf read-only for echo
echo "nameserver 8.8.8.8" | tee -a /etc/resolv.conf || true
echo "nameserver 8.8.4.4" | tee -a /etc/resolv.conf || true

# Enter the application directory
cd /var/www/html

# Fix permissions at runtime (ensures mount is writeable by web server)
echo "Fixing storage permissions..."
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Force-clean and recreate the storage link at runtime 
# This ensures that even if 'public/storage' exists from a previous build, 
# it gets replaced by the correct symlink to the persistent volume.
if [ -f artisan ]; then
    echo "Recreating storage symlink..."
    rm -rf public/storage
    php artisan storage:link --force || echo "Storage link creation failed."
else
    echo "Warning: artisan file not found at $(pwd)"
fi

echo "Starting Apache..."
exec apache2-foreground
