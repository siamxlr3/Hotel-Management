<?php

namespace App\Services;

use App\Models\Shift;
use Illuminate\Pagination\LengthAwarePaginator;

class ShiftService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = Shift::query();

        if (!empty($filters['search'])) {
            $query->where('name', 'LIKE', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): Shift
    {
        return Shift::create($data);
    }

    public function update(Shift $shift, array $data): Shift
    {
        $shift->update($data);
        return $shift;
    }

    public function delete(Shift $shift): void
    {
        $shift->delete();
    }
}
