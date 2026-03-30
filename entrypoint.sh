# Exit immediately if a command exits with a non-zero status
set -e

echo "Running startup commands..."

# Fix DNS resolution if needed (fallback to Google DNS)
echo "nameserver 8.8.8.8" >> /etc/resolv.conf || true

# Create the storage link at runtime (ensures it points to the mounted volume)
if [ -f artisan ]; then
    php artisan storage:link --force || echo "Storage link already exists or failed."
fi

echo "Starting Apache server..."
exec apache2-foreground
