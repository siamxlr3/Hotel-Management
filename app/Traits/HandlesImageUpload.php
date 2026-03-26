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
        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }
        return $file->store($folder, 'public');
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
            if ($old && Storage::disk('public')->exists($old)) {
                Storage::disk('public')->delete($old);
            }
        }
        $paths = [];
        foreach ($files as $file) {
            $paths[] = $file->store($folder, 'public');
        }
        return $paths;
    }

    /**
     * Delete a single image from storage.
     */
    protected function deleteImage(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
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
     * Build full public URL for a stored path.
     */
    protected function imageUrl(?string $path): ?string
    {
        return $path ? Storage::disk('public')->url($path) : null;
    }
}
