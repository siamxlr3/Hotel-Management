<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    use HasFactory;

    const STATUS_RESERVED = 'Reserved';
    const STATUS_OCCUPIED = 'Occupied';
    const STATUS_CLEANING = 'Cleaning';
    const STATUS_AVAILABLE = 'Available';
    const STATUS_CANCELLED = 'Cancelled';
    const STATUS_PAID = 'Paid';
    const STATUS_UNPAID = 'Unpaid';

    protected $fillable = [
        'transaction_id', 'room_id', 'guest_name', 'guest_phone', 'guest_email',
        'identity_type', 'identity_number', 'person_count', 'check_in', 'check_out',
        'payment_method', 'subtotal', 'tax_percent', 'global_discount_percent', 'category_discount_percent',
        'tax_amount', 'discount_amount', 'total_amount', 'booking_type', 'status',
        'payment_status', 'checked_in_at', 'checked_out_at', 'cancelled_at'
    ];

    protected $casts = [
        'check_in'                  => 'datetime',
        'check_out'                 => 'datetime',
        'checked_in_at'             => 'datetime',
        'checked_out_at'            => 'datetime',
        'cancelled_at'              => 'datetime',
        'subtotal'                  => 'decimal:2',
        'tax_percent'               => 'decimal:2',
        'global_discount_percent'   => 'decimal:2',
        'category_discount_percent' => 'decimal:2',
        'tax_amount'                => 'decimal:2',
        'discount_amount'           => 'decimal:2',
        'total_amount'              => 'decimal:2',
    ];

    /**
     * Relationship: A reservation belongs to a room.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    /**
     * Boot function to generate transaction_id automatically.
     */
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($reservation) {
            if (empty($reservation->transaction_id)) {
                $reservation->transaction_id = 'TRX-' . strtoupper(uniqid());
            }
        });
    }

    /**
     * Scope for searching reservations
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('transaction_id', 'LIKE', "%{$search}%")
              ->orWhere('guest_name', 'LIKE', "%{$search}%")
              ->orWhere('guest_phone', 'LIKE', "%{$search}%")
              ->orWhere('guest_email', 'LIKE', "%{$search}%")
              ->orWhere('identity_number', 'LIKE', "%{$search}%");
        });
    }
}
