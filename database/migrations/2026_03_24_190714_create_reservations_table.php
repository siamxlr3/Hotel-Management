<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id', 50)->unique();
            $table->foreignId('room_id')->constrained('rooms')->onDelete('restrict');
            
            $table->string('guest_name', 150);
            $table->string('guest_phone', 30);
            $table->string('guest_email', 150)->nullable();
            
            $table->enum('identity_type', ['NID', 'PASSPORT', 'DRIVING LICENCE']);
            $table->string('identity_number', 100);
            
            $table->unsignedTinyInteger('person_count')->default(1);
            $table->dateTime('check_in');
            $table->dateTime('check_out');
            
            $table->string('payment_method', 50)->nullable();
            
            $table->decimal('subtotal', 12, 2)->nullable();
            $table->decimal('tax_percent', 5, 2)->nullable();
            $table->decimal('global_discount_percent', 5, 2)->nullable();
            $table->decimal('category_discount_percent', 5, 2)->nullable();
            
            $table->decimal('tax_amount', 12, 2)->nullable();
            $table->decimal('discount_amount', 12, 2)->nullable();
            $table->decimal('total_amount', 12, 2)->nullable();
            
            $table->enum('booking_type', ['Booking', 'Reservation'])->default('Booking');
            $table->enum('status', ['Paid', 'Unpaid', 'Reserved', 'Occupied', 'Cleaning', 'Available', 'Cancelled'])->default('Unpaid');
            $table->string('payment_status', 50)->nullable();
            
            $table->dateTime('checked_in_at')->nullable();
            $table->dateTime('checked_out_at')->nullable();
            $table->dateTime('cancelled_at')->nullable();
            
            $table->timestamps();

            // Indexes for faster lookups
            $table->index('transaction_id');
            $table->index('room_id');
            $table->index(['check_in', 'check_out']);
            $table->index('guest_name');
            $table->index('identity_number');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
