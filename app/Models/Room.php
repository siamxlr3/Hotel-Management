<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_number', 'category_id', 'base_price',
        'capacity', 'features', 'images', 'floor', 'status',
    ];

    protected $appends = ['image_urls'];

    public function getImageUrlsAttribute()
    {
        return array_map(function($path) {
            return str_starts_with($path, 'http') ? $path : asset('storage/' . $path);
        }, $this->images ?? []);
    }

    protected $casts = [
        'features'   => 'array',
        'images'     => 'array',
        'base_price' => 'decimal:2',
        'capacity'   => 'integer',
        'floor'      => 'integer',
        'status'     => 'string',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(RoomCategory::class, 'category_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'Available');
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('room_number', 'LIKE', "%{$search}%")
              ->orWhereHas('category', fn($q2) =>
                  $q2->where('name', 'LIKE', "%{$search}%")
              )
              ->orWhereRaw(
                  "JSON_SEARCH(features, 'one', ?) IS NOT NULL",
                  ["%{$search}%"]
              );
        });
    }
}
