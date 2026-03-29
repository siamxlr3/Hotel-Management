<?php

namespace App\Services;

use App\Models\Attendance;
use Illuminate\Pagination\LengthAwarePaginator;

class AttendanceService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = Attendance::with('staff');

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
            $query->where('date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('date', '<=', $filters['date_to']);
        }

        // Only show attendance for active staff
        $query->whereHas('staff', function($q) {
            $q->where('status', 'Active');
        });

        return $query->latest('date')->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): Attendance
    {
        return Attendance::create($data);
    }

    public function update(Attendance $attendance, array $data): Attendance
    {
        $attendance->update($data);
        return $attendance;
    }

    public function delete(Attendance $attendance): void
    {
        $attendance->delete();
    }
}
