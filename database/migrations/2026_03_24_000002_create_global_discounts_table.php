<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('global_discounts', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->decimal('value', 8, 2);          // discount amount or percentage
            $table->text('description')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->foreignId('room_id')
                  ->nullable()
                  ->constrained('rooms')
                  ->onDelete('set null');
            $table->timestamps();

            // Performance indexes
            $table->index('status');
            $table->index('room_id');
            $table->index(['valid_from', 'valid_until']);
            $table->index(['status', 'valid_from', 'valid_until']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('global_discounts');
    }
};
