<?php
namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait HandlesImageUpload
{
    /**
     * Store a single image and delete the old one.
     */
    protected function storeImage(
        UploadedFile $file,
        string $folder,
        ?string $oldPath = null
    ): string {
        if ($oldPath) $this->deleteImage($oldPath);
        
        $cloudinary = app(\App\Services\CloudinaryService::class);
        if ($cloudinary->isReady()) {
            $url = $cloudinary->upload($file, $folder);
            if ($url) return $url;
        }

        // Fallback to local storage
        \Illuminate\Support\Facades\Log::info("Cloudinary disabled or failed. Falling back to local disk for: {$folder}");
        return $file->store($folder, 'public');
    }

    protected function storeMultipleImages(
        array $files,
        string $folder,
        array $oldPaths = []
    ): array {
        foreach ($oldPaths as $old) {
            $this->deleteImage($old);
        }
        
        $paths = [];
        $cloudinary = app(\App\Services\CloudinaryService::class);
        $isCloudReady = $cloudinary->isReady();

        if (!$isCloudReady) {
            \Illuminate\Support\Facades\Log::info("Cloudinary not ready. Using local disk for multiple images in: {$folder}");
        }

        foreach ($files as $file) {
            $uploadedPath = null;
            if ($isCloudReady) {
                $uploadedPath = $cloudinary->upload($file, $folder);
            }
            
            // Fallback to local if cloud fails or not ready
            $paths[] = $uploadedPath ?? $file->store($folder, 'public');
        }
        return $paths;
    }

    /**
     * Delete a single image from storage (Smart Delete).
     */
    protected function deleteImage(?string $path): void
    {
        if (!$path) return;

        if (filter_var($path, FILTER_VALIDATE_URL) || str_starts_with($path, 'http')) {
            app(\App\Services\CloudinaryService::class)->delete($path);
        } else {
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }

    /**
     * Delete multiple images from storage.
     */
    protected function deleteImages(array $paths): void
    {
        foreach ($paths as $path) {
            $this->deleteImage($path);
        }
    }

    /**
     * Build full public URL for a stored path (Smart URL).
     */
    protected function imageUrl(?string $path): ?string
    {
        if (!$path) return null;
        
        // If it's already a full URL (Cloudinary), return as is
        if (str_starts_with($path, 'http')) return $path;

        // Otherwise, return as a public storage asset URL
        return asset('storage/' . $path);
    }
}
