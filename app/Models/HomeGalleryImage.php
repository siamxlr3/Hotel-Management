<?php
namespace App\Models;

use App\Traits\HandlesImageUpload;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeGalleryImage extends Model
{
    use HasFactory, HandlesImageUpload;

    protected $fillable = ['gallery'];
    protected $casts    = ['gallery' => 'array'];
    protected $appends  = ['gallery_urls'];

    public function getGalleryUrlsAttribute()
    {
        if (!$this->gallery) return [];
        return array_map(fn($path) => $this->imageUrl($path), $this->gallery);
    }
}
