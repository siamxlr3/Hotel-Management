<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HomeOffer extends Model
{
    use HasFactory;
    protected $fillable = ['title','description','discount','image','start_date','end_date'];
    protected $casts    = [
        'discount'   => 'decimal:2',
        'start_date' => 'date',
        'end_date'   => 'date',
    ];
}
