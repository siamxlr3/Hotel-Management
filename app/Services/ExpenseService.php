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

        if (!empty($f['date_from'])) {
            $q->where('date', '>=', $f['date_from']);
        }
        if (!empty($f['date_to'])) {
            $q->where('date', '<=', $f['date_to']);
        }

        $all = $q->get();

        return [
            'total_expenses'  => (float) $all->sum('grand_total'),
            'paid_total'      => (float) $all->where('status', 'Paid')->sum('grand_total'),
            'unpaid_total'    => (float) $all->where('status', 'Unpaid')->sum('grand_total'),
            'total_count'     => $all->count(),
            'paid_count'      => $all->where('status', 'Paid')->count(),
            'unpaid_count'    => $all->where('status', 'Unpaid')->count(),
        ];
    }
}
