<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HomeGalleryImage extends Model
{
    use HasFactory;
    protected $fillable = ['gallery'];
    protected $casts    = ['gallery' => 'array'];
}
