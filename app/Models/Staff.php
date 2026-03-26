<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Staff extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_code', 'name', 'email', 'phone', 'address', 
        'nid_number', 'image', 'role_id', 'salary', 
        'shift_id', 'joined_at', 'status'
    ];

    protected $casts = [
        'joined_at' => 'date',
        'salary' => 'decimal:2',
        'status' => 'string',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function leaves()
    {
        return $this->hasMany(Leave::class);
    }

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }

    /**
     * Get the image URL.
     */
    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    /**
     * Delete image from storage when deleting staff or updating image.
     */
    public static function boot()
    {
        parent::boot();

        static::deleting(function ($staff) {
            if ($staff->image) {
                Storage::disk('public')->delete($staff->image);
            }
        });
    }
}
