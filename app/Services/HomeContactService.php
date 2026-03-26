<?php
namespace App\Services;

use App\Models\HomeContact;
use Illuminate\Pagination\LengthAwarePaginator;

class HomeContactService
{
    public function getAll(array $f): LengthAwarePaginator
    {
        return HomeContact::latest()->paginate(min((int)($f['per_page'] ?? 15), 100));
    }

    public function create(array $data): HomeContact { return HomeContact::create($data); }
    public function update(HomeContact $c, array $data): HomeContact
    {
        $c->update($data); return $c->fresh();
    }
    public function delete(HomeContact $c): void { $c->delete(); }
}
