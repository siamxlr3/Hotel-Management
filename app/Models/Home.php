<?php
namespace App\Models;

use App\Traits\HandlesImageUpload;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Home extends Model
{
    use HasFactory, HandlesImageUpload;

    protected $fillable = ['hotel_name', 'logo', 'hero'];
    protected $casts    = ['hero' => 'array'];
    protected $appends  = ['logo_url', 'hero_urls'];

    public function getLogoUrlAttribute()
    {
        return $this->imageUrl($this->logo);
    }

    public function getHeroUrlsAttribute()
    {
        if (!$this->hero) return [];
        return array_map(fn($path) => $this->imageUrl($path), $this->hero);
    }
}
