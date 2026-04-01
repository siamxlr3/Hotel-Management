<?php
namespace App\Models;

use App\Traits\HandlesImageUpload;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeOffer extends Model
{
    use HasFactory, HandlesImageUpload;

    protected $fillable = ['title','description','discount','image','start_date','end_date'];
    protected $casts    = [
        'discount'   => 'decimal:2',
        'start_date' => 'date:Y-m-d',
        'end_date'   => 'date:Y-m-d',
    ];
    protected $appends  = ['image_url'];

    public function getImageUrlAttribute()
    {
        return $this->imageUrl($this->image);
    }
}
