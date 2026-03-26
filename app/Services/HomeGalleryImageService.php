<?php
namespace App\Services;

use App\Models\HomeGalleryImage;
use App\Traits\HandlesImageUpload;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class HomeGalleryImageService
{
    use HandlesImageUpload;

    public function getAll(array $f): LengthAwarePaginator
    {
        return HomeGalleryImage::latest()
               ->paginate(min((int)($f['per_page'] ?? 15), 100));
    }

    public function create(array $data, Request $request): HomeGalleryImage
    {
        if ($request->hasFile('gallery')) {
            $data['gallery'] = $this->storeMultipleImages(
                $request->file('gallery'), 'gallery'
            );
        } else {
            $data['gallery'] = $data['gallery'] ?? [];
        }
        return HomeGalleryImage::create($data);
    }

    public function update(HomeGalleryImage $gallery, array $data, Request $request): HomeGalleryImage
    {
        $existing       = $gallery->gallery ?? [];
        $removeGallery  = $request->input('remove_gallery', []);
        $keepGallery    = $request->input('keep_gallery', []);

        // Delete removed ones from disk
        foreach ($removeGallery as $path) {
            $this->deleteImage($path);
        }

        // Keep only the ones marked to keep
        $result = array_values(array_filter(
            $existing,
            fn($p) => in_array($p, $keepGallery)
        ));

        // Append newly uploaded ones
        if ($request->hasFile('gallery')) {
            $newPaths = $this->storeMultipleImages(
                $request->file('gallery'), 'gallery'
            );
            $result = array_merge($result, $newPaths);
        }

        if ($request->has('keep_gallery') || $request->has('remove_gallery')
            || $request->hasFile('gallery')) {
            $data['gallery'] = $result;
        }

        $gallery->update($data);
        return $gallery->refresh();
    }

    public function delete(HomeGalleryImage $gallery): void
    {
        $this->deleteImages($gallery->gallery ?? []);
        $gallery->delete();
    }
}
