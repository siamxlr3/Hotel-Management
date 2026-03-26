<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->string('staff_code', 20)->unique();
            $table->string('name', 200);
            $table->string('email', 150)->unique();
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->string('nid_number', 50)->unique();
            $table->string('image')->nullable();
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->foreignId('shift_id')->constrained('shifts')->onDelete('cascade');
            $table->decimal('salary', 12, 2);
            $table->date('joined_at');
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();

            $table->index('staff_code');
            $table->index('email');
            $table->index('status');
            $table->index('role_id');
            $table->index('shift_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
