<?php

namespace App\Services;

use App\Models\Leave;
use Illuminate\Pagination\LengthAwarePaginator;

class LeaveService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = Leave::query()->with(['staff', 'leaveType']);

        if (!empty($filters['search'])) {
            $query->searchByStaff($filters['search']);
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

        // Only show for active staff
        $query->activeStaff();

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): Leave
    {
        if ($this->hasOverlap($data['staff_id'], $data['start_date'], $data['end_date'])) {
            throw new \Exception('This staff member already has an approved leave during the selected dates.');
        }

        return Leave::create($data);
    }

    public function update(Leave $leave, array $data): Leave
    {
        if (isset($data['status']) && $data['status'] === Leave::STATUS_APPROVED) {
            if ($this->hasOverlap($leave->staff_id, $data['start_date'] ?? $leave->start_date, $data['end_date'] ?? $leave->end_date, $leave->id)) {
                throw new \Exception('This staff member already has an approved leave during the selected dates.');
            }
        }

        $leave->update($data);
        return $leave;
    }

    public function delete(Leave $leave): void
    {
        $leave->delete();
    }

    /**
     * Check if a staff member has an approved leave overlapping with the given dates.
     */
    private function hasOverlap($staffId, $startDate, $endDate, $ignoreId = null): bool
    {
        return Leave::where('staff_id', $staffId)
            ->where('status', Leave::STATUS_APPROVED)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                  ->orWhereBetween('end_date', [$startDate, $endDate])
                  ->orWhere(function ($sub) use ($startDate, $endDate) {
                      $sub->where('start_date', '<=', $startDate)
                          ->where('end_date', '>=', $endDate);
                  });
            })
            ->exists();
    }
}
