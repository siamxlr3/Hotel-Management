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
            $query->search($filters['search']);
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
        if ($leaveType->leaves()->exists()) {
            throw new \Exception(
                'Cannot delete this leave type because there are still leave records currently using it. ' .
                'Please consider marking it as Inactive instead.'
            );
        }

        $leaveType->delete();
    }
}
