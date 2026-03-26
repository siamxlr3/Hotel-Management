<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('home_contacts', function (Blueprint $table) {
            $table->id();
            $table->string('phone', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('address', 300)->nullable();
            $table->string('facebook', 300)->nullable();
            $table->string('instagram', 300)->nullable();
            $table->string('tiktok', 300)->nullable();
            $table->text('maps_iframe')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('home_contacts'); }
};
