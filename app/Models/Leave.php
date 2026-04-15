<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id', 'leave_type_id', 'start_date', 'end_date', 'reason', 'status'
    ];

    const STATUS_PENDING = 'Pending';
    const STATUS_APPROVED = 'Approved';
    const STATUS_REJECTED = 'Rejected';

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
    ];

    public function scopeActiveStaff($query)
    {
        return $query->whereHas('staff', function($q) {
            $q->where('status', Staff::STATUS_ACTIVE);
        });
    }

    public function scopeSearchByStaff($query, string $search)
    {
        return $query->whereHas('staff', function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('staff_code', 'like', "%{$search}%");
        });
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }
}
