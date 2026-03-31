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
        $this->deleteImage($oldPath);
        return app(\App\Services\CloudinaryService::class)->upload($file, $folder);
    }

    /**
     * Store multiple images and delete the old ones.
     * @param  UploadedFile[] $files
     * @param  string[]       $oldPaths
     * @return string[]
     */
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
        foreach ($files as $file) {
            $paths[] = $cloudinary->upload($file, $folder);
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
        return str_starts_with($path, 'http') ? $path : Storage::disk('public')->url($path);
    }
}
