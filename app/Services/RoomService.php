<?php
namespace App\Services;

use App\Models\Room;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class RoomService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = Room::with('category:id,name,status');

        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['floor'])) {
            $query->where('floor', $filters['floor']);
        }

        $perPage = min((int)($filters['per_page'] ?? 15), 100);

        return $query->latest()->paginate($perPage);
    }

    public function create(array $data): Room
    {
        if (isset($data['new_images']) && is_array($data['new_images'])) {
            $data['images'] = $this->uploadImages($data['new_images']);
        }

        $room = Room::create($data);
        return $room->load('category:id,name');
    }

    public function update(Room $room, array $data): Room
    {
        $existingPaths = $data['existing_images'] ?? [];
        $newFiles      = $data['new_images'] ?? [];

        // 1. Identify images to delete (those NOT in existingPaths)
        $currentImages = $room->images ?? [];
        $toDelete      = array_diff($currentImages, $existingPaths);
        $this->deleteImages($toDelete);

        // 2. Upload new ones
        $newPaths = $this->uploadImages($newFiles);

        // 3. Combine remaining and new paths
        $data['images'] = array_merge($existingPaths, $newPaths);

        $room->update($data);
        return $room->load('category:id,name');
    }

    public function delete(Room $room): void
    {
        $this->deleteImages($room->images);
        $room->delete();
    }

    private function uploadImages(array $files): array
    {
        $paths = [];
        foreach ($files as $file) {
            $paths[] = Storage::disk('public')->put('room', $file);
        }
        return $paths;
    }

    private function deleteImages(?array $images): void
    {
        if ($images) {
            foreach ($images as $image) {
                Storage::disk('public')->delete($image);
            }
        }
    }
}
