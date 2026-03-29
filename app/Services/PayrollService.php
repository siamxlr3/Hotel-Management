<?php

namespace App\Services;

use App\Models\Payroll;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PayrollService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = Payroll::with('staff.role');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('staff', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('staff_code', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['staff_id'])) {
            $query->where('staff_id', $filters['staff_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['month'])) {
            $query->where('month', $filters['month']);
        }

        if (!empty($filters['year'])) {
            $query->where('year', $filters['year']);
        }

        // Only show for active staff
        $query->whereHas('staff', function($q) {
            $q->where('status', 'Active');
        });

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): Payroll
    {
        if ($data['status'] === 'Paid' && empty($data['paid_at'])) {
            $data['paid_at'] = now();
        }
        return Payroll::create($data);
    }

    public function update(Payroll $payroll, array $data): Payroll
    {
        if (isset($data['status']) && $data['status'] === 'Paid' && empty($payroll->paid_at)) {
            $data['paid_at'] = now();
        }
        $payroll->update($data);
        return $payroll;
    }

    public function delete(Payroll $payroll): void
    {
        $payroll->delete();
    }

    /**
     * Get total pay amount with monthly filter
     */
    public function getSummary(array $filters): array
    {
        $query = Payroll::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('staff', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('staff_code', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['month'])) {
            $query->where('month', $filters['month']);
        }

        if (!empty($filters['year'])) {
            $query->where('year', $filters['year']);
        }

        return [
            'total_amount' => $query->sum(DB::raw('net_salary + bonus - deduction')),
            'count' => $query->count(),
        ];
    }
}
