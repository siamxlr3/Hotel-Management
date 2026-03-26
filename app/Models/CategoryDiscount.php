<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CategoryDiscount extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'room_id', 'name', 'value',
        'description', 'status', 'valid_from', 'valid_until',
    ];

    protected $casts = [
        'value'       => 'decimal:2',
        'valid_from'  => 'date',
        'valid_until' => 'date',
        'status'      => 'string',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(RoomCategory::class, 'category_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeValid($query)
    {
        return $query->where('status', 'Active')
                     ->where(function ($q) {
                         $q->whereNull('valid_from')
                           ->orWhere('valid_from', '<=', now());
                     })
                     ->where(function ($q) {
                         $q->whereNull('valid_until')
                           ->orWhere('valid_until', '>=', now());
                     });
    }
}
