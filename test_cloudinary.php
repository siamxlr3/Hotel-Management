<?php
require 'vendor/autoload.php';

// Manually load .env to test keys
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$cloudName = $_ENV['CLOUDINARY_CLOUD_NAME'] ?? 'NOT FOUND';
$apiKey = $_ENV['CLOUDINARY_API_KEY'] ?? 'NOT FOUND';
$apiSecret = $_ENV['CLOUDINARY_API_SECRET'] ?? 'NOT FOUND';

echo "Testing Cloudinary Keys...\n";
echo "Cloud Name: $cloudName\n";
echo "API Key: $apiKey\n";
echo "API Secret: " . ($apiSecret !== 'NOT FOUND' ? '********' : 'NOT FOUND') . "\n";

$timestamp = time();
$params = ['timestamp' => $timestamp];
ksort($params);
$paramString = "timestamp=$timestamp" . $apiSecret;
$signature = sha1($paramString);

$client = new \GuzzleHttp\Client();
try {
    echo "Sending test request to Cloudinary...\n";
    $response = $client->post("https://api.cloudinary.com/v1_1/$cloudName/image/upload", [
        'multipart' => [
            ['name' => 'file', 'contents' => 'https://cloudinary-res.cloudinary.com/image/upload/dpr_auto,w_auto/v1/Cloudinary_logo_for_white_bg.svg'],
            ['name' => 'api_key', 'contents' => $apiKey],
            ['name' => 'timestamp', 'contents' => $timestamp],
            ['name' => 'signature', 'contents' => $signature],
        ]
    ]);
    echo "SUCCESS! Cloudinary connected and test image uploaded.\n";
} catch (\Exception $e) {
    echo "FAILED! Error: " . $e->getMessage() . "\n";
    if ($e instanceof \GuzzleHttp\Exception\RequestException && $e->hasResponse()) {
        echo "Cloudinary Error Detail: " . $e->getResponse()->getBody() . "\n";
    }
}
