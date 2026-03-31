<?php
// Temporary test for Cloudinary Service
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Attempting to resolve CloudinaryService...\n";
    $service = app(\App\Services\CloudinaryService::class);
    echo "Success! Service resolved.\n";
    
    echo "Cloud Name: " . env('CLOUDINARY_CLOUD_NAME') . "\n";
    echo "API Key: " . (env('CLOUDINARY_API_KEY') ? 'SET' : 'MISSING') . "\n";
    
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "TRACE: " . $e->getTraceAsString() . "\n";
}
