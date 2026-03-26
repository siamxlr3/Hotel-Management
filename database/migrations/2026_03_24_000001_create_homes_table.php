<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('homes', function (Blueprint $table) {
            $table->id();
            $table->string('hotel_name', 200);
            $table->string('logo')->nullable();           // single image path
            $table->json('hero')->nullable();             // array of image paths
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('homes'); }
};
