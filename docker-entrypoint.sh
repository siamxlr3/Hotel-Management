#!/bin/sh
set -e

# Re-create the storage symlink at runtime, AFTER the persistent disk is mounted.
# The disk mounts to storage/app/public, then we link public/storage -> storage/app/public
if [ ! -L /var/www/html/public/storage ]; then
    php artisan storage:link --force
fi

# Ensure correct permissions on the (now-mounted) persistent disk
chown -R www-data:www-data /var/www/html/storage
chmod -R 775 /var/www/html/storage

# Start Apache
exec apache2-foreground
