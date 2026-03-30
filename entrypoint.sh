#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Running startup commands..."

# Create the storage link at runtime (ensures it points to the mounted volume)
php artisan storage:link --force

# (Optional) Run migrations automatically on deployment
# php artisan migrate --force

echo "Starting Apache server..."
exec apache2-foreground
