<?php

namespace App\Services;

use App\Models\Payroll;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PayrollService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = Payroll::with('staff.role')
            ->activeStaff();

        $this->applyFilters($query, $filters);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): Payroll
    {
        // Auto-populate paid_at when status is set to Paid
        if ($data['status'] === Payroll::STATUS_PAID && empty($data['paid_at'])) {
            $data['paid_at'] = now();
        }
        return Payroll::create($data);
    }

    public function update(Payroll $payroll, array $data): Payroll
    {
        // Capture the paid_at timestamp the first time a record is set to Paid
        if (isset($data['status']) && $data['status'] === Payroll::STATUS_PAID && empty($payroll->paid_at)) {
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
     * Get aggregate summary stats for the current filter set.
     */
    public function getSummary(array $filters): array
    {
        $query = Payroll::query();

        $this->applyFilters($query, $filters);

        return [
            'total_amount' => (float) $query->sum(DB::raw('net_salary + bonus - deduction')),
            'count'        => $query->count(),
        ];
    }

    /**
     * Apply shared, common filters to a query builder.
     * Centralizes logic that is used in both getAll() and getSummary().
     */
    private function applyFilters($query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $query->searchByStaff($filters['search']);
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

        if (!empty($filters['month'])) {
            $query->where('month', $filters['month']);
        }

        if (!empty($filters['year'])) {
            $query->where('year', $filters['year']);
        }
    }
}

