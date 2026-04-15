<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasFactory;

    const STATUS_PAID   = 'Paid';
    const STATUS_UNPAID = 'Unpaid';

    protected $fillable = [
        'staff_id', 'month', 'year', 'net_salary', 'bonus', 'deduction', 'status', 'paid_at'
    ];

    protected $casts = [
        'paid_at'    => 'datetime',
        'net_salary' => 'decimal:2',
        'bonus'      => 'decimal:2',
        'deduction'  => 'decimal:2',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    /**
     * Filter payroll records belonging to active staff only.
     */
    public function scopeActiveStaff($query)
    {
        return $query->whereHas('staff', function ($q) {
            $q->where('status', Staff::STATUS_ACTIVE);
        });
    }

    /**
     * Search payroll by associated staff name or staff code.
     */
    public function scopeSearchByStaff($query, string $search)
    {
        return $query->whereHas('staff', function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('staff_code', 'like', "%{$search}%");
        });
    }
}
