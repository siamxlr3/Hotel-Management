<?php
namespace App\Services;

use App\Models\HomeFeature;
use Illuminate\Pagination\LengthAwarePaginator;

class HomeFeatureService
{
    public function getAll(array $f): LengthAwarePaginator
    {
        $q = HomeFeature::query();
        if (!empty($f['search'])) {
            $q->where('title', 'LIKE', "%{$f['search']}%")
              ->orWhere('description', 'LIKE', "%{$f['search']}%");
        }
        return $q->latest()->paginate(min((int)($f['per_page'] ?? 15), 100));
    }

    public function create(array $data): HomeFeature { return HomeFeature::create($data); }
    public function update(HomeFeature $f, array $data): HomeFeature
    {
        $f->update($data); return $f->fresh();
    }
    public function delete(HomeFeature $f): void { $f->delete(); }
}
