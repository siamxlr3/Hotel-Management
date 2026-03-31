<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    protected string $cloudName;
    protected string $apiKey;
    protected string $apiSecret;
    protected Client $client;

    public function __construct()
    {
        $this->cloudName = env('CLOUDINARY_CLOUD_NAME');
        $this->apiKey    = env('CLOUDINARY_API_KEY');
        $this->apiSecret = env('CLOUDINARY_API_SECRET');
        $this->client    = new Client();
    }

    /**
     * Upload an image to Cloudinary.
     *
     * @param UploadedFile $file
     * @param string $folder
     * @return string|null The secure URL of the uploaded image
     */
    public function upload(UploadedFile $file, string $folder): ?string
    {
        try {
            $timestamp = time();
            $params = [
                'folder'    => $folder,
                'timestamp' => $timestamp,
            ];

            // Generate signature
            ksort($params);
            $paramString = http_build_query($params);
            $paramString = str_replace(['%2F', '%3A'], ['/', ':'], $paramString); // Cloudinary signature requires raw slashes
            $signature = sha1($paramString . $this->apiSecret);

            $response = $this->client->post("https://api.cloudinary.com/v1_1/{$this->cloudName}/image/upload", [
                'multipart' => [
                    [
                        'name'     => 'file',
                        'contents' => fopen($file->getRealPath(), 'r'),
                        'filename' => $file->getClientOriginalName(),
                    ],
                    ['name' => 'api_key',   'contents' => $this->apiKey],
                    ['name' => 'timestamp', 'contents' => $timestamp],
                    ['name' => 'signature', 'contents' => $signature],
                    ['name' => 'folder',    'contents' => $folder],
                ],
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            return $result['secure_url'] ?? null;

        } catch (\Exception $e) {
            Log::error('Cloudinary Upload Failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete an image from Cloudinary using its URL or public ID.
     * Note: For simplicity, this handles the basic delete case.
     */
    public function delete(?string $url): bool
    {
        if (!$url) return false;

        try {
            // Extract public_id from secure_url
            // Example: https://res.cloudinary.com/dgsmvky0e/image/upload/v12345/room/abc.jpg -> room/abc
            $path = parse_url($url, PHP_URL_PATH);
            $parts = explode('/', $path);
            
            // The public_id is usually after 'upload/' and before the extension
            $uploadIndex = array_search('upload', $parts);
            if ($uploadIndex === false) return false;

            // Remove 'upload' and version (v12345) if present
            $idParts = array_slice($parts, $uploadIndex + 2);
            $publicIdWithExt = implode('/', $idParts);
            $publicId = pathinfo($publicIdWithExt, PATHINFO_FILENAME);
            $fullPublicId = dirname($publicIdWithExt) !== '.' 
                ? dirname($publicIdWithExt) . '/' . $publicId 
                : $publicId;

            $timestamp = time();
            $params = [
                'public_id' => $fullPublicId,
                'timestamp' => $timestamp,
            ];

            ksort($params);
            $paramString = http_build_query($params);
            $paramString = str_replace('%2F', '/', $paramString);
            $signature = sha1($paramString . $this->apiSecret);

            $this->client->post("https://api.cloudinary.com/v1_1/{$this->cloudName}/image/destroy", [
                'multipart' => [
                    ['name' => 'public_id', 'contents' => $fullPublicId],
                    ['name' => 'api_key',   'contents' => $this->apiKey],
                    ['name' => 'timestamp', 'contents' => $timestamp],
                    ['name' => 'signature', 'contents' => $signature],
                ],
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Cloudinary Delete Failed: ' . $e->getMessage());
            return false;
        }
    }
}
