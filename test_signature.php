<?php
require 'vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$cloudName = $_ENV['CLOUDINARY_CLOUD_NAME'];
$apiKey = $_ENV['CLOUDINARY_API_KEY'];
$apiSecret = $_ENV['CLOUDINARY_API_SECRET'];
$folder = 'test_room';
$timestamp = time();

$params = [
    'folder'    => $folder,
    'timestamp' => $timestamp,
];

ksort($params);
// Laravel's implementation in CloudinaryService:
$paramString = '';
foreach ($params as $key => $value) {
    // Cloudinary string generation is actually usually "key=value&key2=value2"
}
// Using http_build_query
$paramString = http_build_query($params);
$paramString = str_replace(['%2F', '%3A'], ['/', ':'], $paramString); 
$signature = sha1($paramString . $apiSecret);

$client = new \GuzzleHttp\Client();
try {
    $response = $client->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload", [
        'multipart' => [
            [
                'name'     => 'file',
                'contents' => fopen('.env', 'r'), // Use any file just to test, will fail on filetype but NOT on signature
                'filename' => 'dummy.txt'
            ],
            ['name' => 'api_key',   'contents' => $apiKey],
            ['name' => 'timestamp', 'contents' => $timestamp],
            ['name' => 'signature', 'contents' => $signature],
            ['name' => 'folder',    'contents' => $folder],
        ],
    ]);
    echo "SUCCESS: " . $response->getBody() . "\n";
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "ERROR: " . $e->getResponse()->getBody() . "\n";
}
