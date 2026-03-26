<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Home extends Model
{
    use HasFactory;
    protected $fillable = ['hotel_name', 'logo', 'hero'];
    protected $casts    = ['hero' => 'array'];
}
