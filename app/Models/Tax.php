<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tax extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'rate', 'status'];

    protected $casts = [
        'rate'   => 'decimal:2',
        'status' => 'string',
    ];

    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeSearch($query, string $s)
    {
        return $query->where('name', 'LIKE', "%{$s}%");
    }
}
