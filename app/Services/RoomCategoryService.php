<?php
namespace App\Services;

use App\Models\RoomCategory;
use Illuminate\Pagination\LengthAwarePaginator;

class RoomCategoryService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = RoomCategory::withCount('rooms');

        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = min((int)($filters['per_page'] ?? 15), 100);

        return $query->latest()->paginate($perPage);
    }

    public function create(array $data): RoomCategory
    {
        return RoomCategory::create($data);
    }

    public function update(RoomCategory $category, array $data): RoomCategory
    {
        $category->update($data);
        return $category->fresh();
    }

    public function delete(RoomCategory $category): void
    {
        if ($category->rooms()->exists()) {
            throw new \Exception(
                'Cannot delete this category because it has rooms assigned. ' .
                'Please reassign or delete those rooms first.'
            );
        }
        // PERMANENT delete — no soft delete
        $category->delete();
    }
}
