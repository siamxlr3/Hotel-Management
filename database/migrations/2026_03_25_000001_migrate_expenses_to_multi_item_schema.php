<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            // Add new multi-item columns if they don't exist
            if (!Schema::hasColumn('expenses', 'line_items')) {
                $table->json('line_items')->nullable()->after('address');
            }
            if (!Schema::hasColumn('expenses', 'grand_total')) {
                $table->decimal('grand_total', 14, 2)->default(0)->after('line_items');
            }
        });

        // Migrate existing single-item rows into the new format
        DB::table('expenses')->whereNull('line_items')->get()->each(function ($row) {
            $lineItem = [[
                'items'    => $row->items    ?? '',
                'category' => $row->category ?? 'Kg',
                'qty'      => $row->qty      ?? 0,
                'price'    => $row->price    ?? 0,
                'total'    => $row->total_price ?? 0,
            ]];

            DB::table('expenses')->where('id', $row->id)->update([
                'line_items'  => json_encode($lineItem),
                'grand_total' => $row->total_price ?? 0,
            ]);
        });

        // Drop the old single-item columns (only if they still exist)
        Schema::table('expenses', function (Blueprint $table) {
            $toDrop = [];
            foreach (['items', 'qty', 'category', 'price', 'total_price'] as $col) {
                if (Schema::hasColumn('expenses', $col)) {
                    $toDrop[] = $col;
                }
            }
            if (!empty($toDrop)) {
                $table->dropColumn($toDrop);
            }
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            if (!Schema::hasColumn('expenses', 'items')) {
                $table->string('items', 300)->nullable()->after('address');
            }
            if (!Schema::hasColumn('expenses', 'qty')) {
                $table->decimal('qty', 10, 2)->nullable()->after('items');
            }
            if (!Schema::hasColumn('expenses', 'category')) {
                $table->enum('category', ['Kg','Lt','Box','Packet','Carton'])->nullable()->after('qty');
            }
            if (!Schema::hasColumn('expenses', 'price')) {
                $table->decimal('price', 12, 2)->nullable()->after('category');
            }
            if (!Schema::hasColumn('expenses', 'total_price')) {
                $table->decimal('total_price', 14, 2)->nullable()->after('price');
            }
        });

        Schema::table('expenses', function (Blueprint $table) {
            foreach (['line_items', 'grand_total'] as $col) {
                if (Schema::hasColumn('expenses', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
