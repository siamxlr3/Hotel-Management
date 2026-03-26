<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();

            // Auto-generated transaction ID e.g. TXN-20240619-000001
            $table->string('transaction_id', 30)->unique();

            $table->string('supplier_name', 200);
            $table->string('contact_person', 150)->nullable();
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->string('items', 300);
            $table->decimal('qty', 10, 2);
            $table->enum('category', ['Kg','Lt','Box','Packet','Carton']);
            $table->decimal('price', 12, 2);
            $table->decimal('total_price', 14, 2);
            $table->date('date');
            $table->enum('status', ['Paid','Unpaid'])->default('Unpaid');
            $table->timestamps();

            // Performance indexes
            $table->index('transaction_id');
            $table->index('supplier_name');
            $table->index('phone');
            $table->index('status');
            $table->index('date');
            $table->index(['status', 'date']);
            $table->index('contact_person');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
