<?php
namespace App\Services;

use App\Models\Tax;
use Illuminate\Pagination\LengthAwarePaginator;

class TaxService
{
    public function getAll(array $f): LengthAwarePaginator
    {
        $q = Tax::query();
        if (!empty($f['search']))  $q->search($f['search']);
        if (!empty($f['status']))  $q->where('status', $f['status']);
        return $q->latest()->paginate(min((int)($f['per_page'] ?? 15), 100));
    }

    public function create(array $d): Tax
    {
        return Tax::create($d);
    }

    public function update(Tax $tax, array $d): Tax
    {
        $tax->update($d);
        return $tax->fresh();
    }

    public function delete(Tax $tax): void
    {
        $tax->delete();
    }
}
