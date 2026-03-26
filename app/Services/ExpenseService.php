<?php
namespace App\Services;

use App\Models\Expense;
use Illuminate\Pagination\LengthAwarePaginator;

class ExpenseService
{
    public function getAll(array $f): LengthAwarePaginator
    {
        $q = Expense::query();

        if (!empty($f['search'])) {
            $q->search($f['search']);
        }

        if (!empty($f['status'])) {
            $q->where('status', $f['status']);
        }

        if (!empty($f['date_from'])) {
            $q->where('date', '>=', $f['date_from']);
        }

        if (!empty($f['date_to'])) {
            $q->where('date', '<=', $f['date_to']);
        }

        $perPage = min((int)($f['per_page'] ?? 15), 100);

        return $q->latest('date')->latest('id')->paginate($perPage);
    }

    public function create(array $data): Expense
    {
        return Expense::create($data);
    }

    public function update(Expense $expense, array $data): Expense
    {
        $expense->update($data);
        return $expense->fresh();
    }

    public function delete(Expense $expense): void
    {
        $expense->delete();
    }

    /**
     * Summary stats for dashboard cards
     */
    public function getSummary(array $f = []): array
    {
        $q = Expense::query();
        $paid = Expense::where('status', 'Paid');
        $unpaid = Expense::where('status', 'Unpaid');

        if (!empty($f['date_from'])) {
            $q->where('date', '>=', $f['date_from']);
            $paid->where('date', '>=', $f['date_from']);
            $unpaid->where('date', '>=', $f['date_from']);
        }

        if (!empty($f['date_to'])) {
            $q->where('date', '<=', $f['date_to']);
            $paid->where('date', '<=', $f['date_to']);
            $unpaid->where('date', '<=', $f['date_to']);
        }

        return [
            'total_expenses'  => (float) $q->sum('grand_total'),
            'paid_total'      => (float) $paid->sum('grand_total'),
            'unpaid_total'    => (float) $unpaid->sum('grand_total'),
            'total_count'     => $q->count(),
            'paid_count'      => $paid->count(),
            'unpaid_count'    => $unpaid->count(),
        ];
    }
}
