<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('category_discounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')
                  ->constrained('room_categories')
                  ->onDelete('cascade');
            $table->foreignId('room_id')
                  ->nullable()
                  ->constrained('rooms')
                  ->onDelete('set null');
            $table->string('name', 100);
            $table->decimal('value', 8, 2);
            $table->text('description')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->timestamps();

            // Performance indexes
            $table->index('category_id');
            $table->index('room_id');
            $table->index('status');
            $table->index(['category_id', 'status']);
            $table->index(['valid_from', 'valid_until']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_discounts');
    }
};
