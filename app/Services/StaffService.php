<?php

namespace App\Services;

use App\Models\Staff;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StaffService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = Staff::with(['role', 'shift']);

        if (!empty($filters['search'])) {
            $s = $filters['search'];
            $query->where(function($q) use ($s) {
                $q->where('staff_code', 'LIKE', "%$s%")
                  ->orWhere('name', 'LIKE', "%$s%")
                  ->orWhere('email', 'LIKE', "%$s%")
                  ->orWhere('phone', 'LIKE', "%$s%")
                  ->orWhere('nid_number', 'LIKE', "%$s%");
            });
        }

        if (!empty($filters['role_id'])) {
            $query->where('role_id', $filters['role_id']);
        }

        if (!empty($filters['shift_id'])) {
            $query->where('shift_id', $filters['shift_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('joined_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('joined_at', '<=', $filters['date_to']);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): Staff
    {
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $data['image'] = $data['image']->store('staff', 'public');
        }

        return Staff::create($data);
    }

    public function update(Staff $staff, array $data): Staff
    {
        if (!empty($data['remove_image']) && $data['remove_image'] == 1) {
            if ($staff->image) {
                Storage::disk('public')->delete($staff->image);
            }
            $data['image'] = null;
        }

        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            if ($staff->image) {
                Storage::disk('public')->delete($staff->image);
            }
            $data['image'] = $data['image']->store('staff', 'public');
        }

        $staff->update($data);
        return $staff;
    }

    public function delete(Staff $staff): void
    {
        // Image deletion handled by model boot method
        $staff->delete();
    }
}
