<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id', 'supplier_name', 'contact_person',
        'phone', 'address', 'line_items', 'grand_total', 'date', 'status',
    ];

    protected $casts = [
        'line_items'  => 'array',
        'grand_total' => 'decimal:2',
        'date'        => 'date',
        'status'      => 'string',
    ];

    /**
     * Auto-generate transaction_id before creating.
     * Format: TXN-YYYYMMDD-XXXXXX (6-digit zero-padded sequence)
     */
    protected static function booted(): void
    {
        static::creating(function (Expense $expense) {
            $prefix    = 'TXN-' . now()->format('Ymd') . '-';
            $lastToday = static::where('transaction_id', 'LIKE', $prefix . '%')
                               ->orderByDesc('id')
                               ->lockForUpdate()
                               ->first();

            $seq = $lastToday
                ? ((int) substr($lastToday->transaction_id, -6)) + 1
                : 1;

            $expense->transaction_id = $prefix . str_pad($seq, 6, '0', STR_PAD_LEFT);
        });
    }

    public function scopeSearch($query, string $s)
    {
        return $query->where(function ($q) use ($s) {
            $q->where('transaction_id', 'LIKE', "%{$s}%")
              ->orWhere('supplier_name',   'LIKE', "%{$s}%")
              ->orWhere('contact_person',  'LIKE', "%{$s}%")
              ->orWhere('phone',           'LIKE', "%{$s}%");
        });
    }
}
