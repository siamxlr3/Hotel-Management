<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HomeGalleryImage extends Model
{
    use HasFactory;
    protected $fillable = ['gallery'];
    protected $casts    = ['gallery' => 'array'];
    protected $appends  = ['gallery_urls'];

    public function getGalleryUrlsAttribute()
    {
        if (!$this->gallery) return [];
        return array_map(function($path) {
            return str_starts_with($path, 'http') ? $path : asset('storage/' . $path);
        }, $this->gallery);
    }
}
