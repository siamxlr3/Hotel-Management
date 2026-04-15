<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    const STATUS_ACTIVE   = 'Active';
    const STATUS_INACTIVE = 'Inactive';

    protected $fillable = ['name', 'status'];

    protected $casts = [
        'status' => 'string',
    ];

    public function staff(): HasMany
    {
        return $this->hasMany(Staff::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where('name', 'LIKE', "%{$search}%");
    }
}
