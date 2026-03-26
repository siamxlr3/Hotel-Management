<?php
namespace App\Services;

use App\Models\CategoryDiscount;
use Illuminate\Pagination\LengthAwarePaginator;

class CategoryDiscountService
{
    public function getAll(array $f): LengthAwarePaginator
    {
        // Eager load category + room — prevents N+1
        $q = CategoryDiscount::with([
            'category:id,name',
            'room:id,room_number',
        ]);
        if (!empty($f['search']))
            $q->where('name', 'LIKE', "%{$f['search']}%")
              ->orWhereHas('category', fn($c) =>
                  $c->where('name', 'LIKE', "%{$f['search']}%")
              );
        if (!empty($f['status']))
            $q->where('status', $f['status']);
        if (!empty($f['category_id']))
            $q->where('category_id', $f['category_id']);
        return $q->latest()->paginate(min((int)($f['per_page'] ?? 15), 100));
    }

    public function create(array $d): CategoryDiscount
    {
        $cd = CategoryDiscount::create($d);
        return $cd->load('category:id,name', 'room:id,room_number');
    }

    public function update(CategoryDiscount $cd, array $d): CategoryDiscount
    {
        $cd->update($d);
        return $cd->load('category:id,name', 'room:id,room_number');
    }

    public function delete(CategoryDiscount $cd): void
    {
        $cd->delete();
    }
}
