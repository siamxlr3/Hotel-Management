<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number', 20)->unique();
            $table->foreignId('category_id')
                  ->constrained('room_categories')
                  ->onDelete('restrict');
            $table->decimal('base_price', 10, 2);
            $table->unsignedTinyInteger('capacity');
            $table->json('features')->nullable();   // ["WiFi","AC","TV"]
            $table->unsignedTinyInteger('floor');
            $table->enum('status', ['Available', 'Occupied', 'Reserved', 'Maintenance', 'Cleaning'])->default('Available');
            $table->timestamps();
            $table->softDeletes();

            // Composite indexes for common query patterns
            $table->index('room_number');
            $table->index('category_id');
            $table->index(['status', 'category_id']);
            $table->index(['floor', 'status']);
            $table->index('base_price');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
