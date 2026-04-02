<?php

namespace App\Models;

use App\Traits\HandlesImageUpload;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory, HandlesImageUpload;

    protected $fillable = [
        'staff_code', 'name', 'email', 'phone', 'address', 
        'nid_number', 'image', 'role_id', 'salary', 
        'shift_id', 'joined_at', 'status'
    ];

    protected $appends = ['image_url'];

    protected $casts = [
        'joined_at' => 'date:Y-m-d',
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
        return $this->imageUrl($this->image);
    }
}
