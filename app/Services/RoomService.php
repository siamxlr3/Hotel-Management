<?php
namespace App\Services;

use App\Models\Room;
use App\Traits\HandlesImageUpload;
use Illuminate\Pagination\LengthAwarePaginator;

class RoomService
{
    use HandlesImageUpload;

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
            $data['images'] = $this->storeMultipleImages($data['new_images'], 'room');
        }

        // Clean up data to avoid passing file objects to create
        unset($data['new_images']);

        $room = Room::create($data);
        return $room->load('category:id,name');
    }

    public function update(Room $room, array $data): Room
    {
        $existingPaths = $data['existing_images'] ?? [];
        $newFiles      = $data['new_images'] ?? [];

        // 1. Image management via Trait
        $newPaths = $this->storeMultipleImages($newFiles, 'room', array_diff($room->images ?? [], $existingPaths));

        // 2. Combine remaining and new paths
        $data['images'] = array_merge($existingPaths, $newPaths);

        // Clean up data
        unset($data['new_images'], $data['existing_images']);

        $room->update($data);
        return $room->load('category:id,name');
    }

    public function delete(Room $room): void
    {
        $this->deleteImages($room->images ?? []);
        $room->delete();
    }
}
