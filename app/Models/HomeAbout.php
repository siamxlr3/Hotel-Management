<?php
namespace App\Models;

use App\Traits\HandlesImageUpload;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeAbout extends Model
{
    use HasFactory, HandlesImageUpload;

    protected $fillable = ['description', 'image'];
    protected $appends  = ['image_url'];

    public function getImageUrlAttribute()
    {
        return $this->imageUrl($this->image);
    }
}
