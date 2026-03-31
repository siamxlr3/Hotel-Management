<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HomeAbout extends Model
{
    use HasFactory;
    protected $fillable = ['description', 'image'];
    protected $appends  = ['image_url'];

    public function getImageUrlAttribute()
    {
        if (!$this->image) return null;
        return str_starts_with($this->image, 'http') ? $this->image : asset('storage/' . $this->image);
    }
}
