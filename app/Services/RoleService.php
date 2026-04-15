<?php

namespace App\Services;

use App\Models\Role;
use Illuminate\Pagination\LengthAwarePaginator;

class RoleService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = Role::query();

        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): Role
    {
        return Role::create($data);
    }

    public function update(Role $role, array $data): Role
    {
        $role->update($data);
        return $role;
    }

    public function delete(Role $role): void
    {
        if ($role->staff()->exists()) {
            throw new \Exception(
                'Cannot delete this role because staff members are currently assigned to it. ' .
                'Please reassign those staff members first.'
            );
        }

        $role->delete();
    }
}
