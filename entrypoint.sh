#!/bin/bash
set -e

echo "Starting deployment setup..."

# Add reliable DNS as a fallback for database resolution
# We use 'tee -a' because some environments make resolv.conf read-only for echo
echo "nameserver 8.8.8.8" | tee -a /etc/resolv.conf || true
echo "nameserver 8.8.4.4" | tee -a /etc/resolv.conf || true

# Enter the application directory
cd /var/www/html

# Create the storage link at runtime 
if [ -f artisan ]; then
    echo "Creating storage link..."
    php artisan storage:link --force || echo "Storage link already exists or failed."
else
    echo "Warning: artisan file not found at $(pwd)"
fi

echo "Starting Apache..."
exec apache2-foreground
