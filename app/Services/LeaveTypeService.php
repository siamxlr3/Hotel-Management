<?php

namespace App\Services;

use App\Models\LeaveType;
use Illuminate\Pagination\LengthAwarePaginator;

class LeaveTypeService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = LeaveType::query();

        if (!empty($filters['search'])) {
            $query->where('name', 'LIKE', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): LeaveType
    {
        return LeaveType::create($data);
    }

    public function update(LeaveType $leaveType, array $data): LeaveType
    {
        $leaveType->update($data);
        return $leaveType;
    }

    public function delete(LeaveType $leaveType): void
    {
        $leaveType->delete();
    }
}
