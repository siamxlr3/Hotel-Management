<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Home extends Model
{
    use HasFactory;
    protected $fillable = ['hotel_name', 'logo', 'hero'];
    protected $casts    = ['hero' => 'array'];
    protected $appends  = ['logo_url', 'hero_urls'];

    public function getLogoUrlAttribute()
    {
        if (!$this->logo) return null;
        return str_starts_with($this->logo, 'http') ? $this->logo : asset('storage/' . $this->logo);
    }

    public function getHeroUrlsAttribute()
    {
        if (!$this->hero) return [];
        return array_map(function($path) {
            return str_starts_with($path, 'http') ? $path : asset('storage/' . $path);
        }, $this->hero);
    }
}
