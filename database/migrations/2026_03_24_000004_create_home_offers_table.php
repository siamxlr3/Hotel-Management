<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('home_offers', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200)->index();
            $table->text('description');
            $table->decimal('discount', 5, 2)->default(0);
            $table->string('image')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();

            $table->index(['start_date', 'end_date']);
        });
    }
    public function down(): void { Schema::dropIfExists('home_offers'); }
};
