<?php
namespace App\Services;

use App\Models\GlobalDiscount;
use Illuminate\Pagination\LengthAwarePaginator;

class GlobalDiscountService
{
    public function getAll(array $f): LengthAwarePaginator
    {
        // Eager load room to prevent N+1
        $q = GlobalDiscount::with('room:id,room_number');
        if (!empty($f['search']))
            $q->where('name', 'LIKE', "%{$f['search']}%");
        if (!empty($f['status']))
            $q->where('status', $f['status']);
        return $q->latest()->paginate(min((int)($f['per_page'] ?? 15), 100));
    }

    public function create(array $d): GlobalDiscount
    {
        $g = GlobalDiscount::create($d);
        return $g->load('room:id,room_number');
    }

    public function update(GlobalDiscount $g, array $d): GlobalDiscount
    {
        $g->update($d);
        return $g->load('room:id,room_number');
    }

    public function delete(GlobalDiscount $g): void
    {
        $g->delete();
    }
}
