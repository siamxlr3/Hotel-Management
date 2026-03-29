<?php

namespace App\Services;

use App\Models\Leave;
use Illuminate\Pagination\LengthAwarePaginator;

class LeaveService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = Leave::with(['staff', 'leaveType']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('staff', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('staff_code', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['staff_id'])) {
            $query->where('staff_id', $filters['staff_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('start_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('end_date', '<=', $filters['date_to']);
        }

        // Only show marks for active staff
        $query->whereHas('staff', function($q) {
            $q->where('status', 'Active');
        });

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): Leave
    {
        return Leave::create($data);
    }

    public function update(Leave $leave, array $data): Leave
    {
        $leave->update($data);
        return $leave;
    }

    public function delete(Leave $leaf): void
    {
        $leaf->delete();
    }
}
