<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasColumn('room_categories', 'deleted_at')) {
            Schema::table('room_categories', function (Blueprint $table) {
                $table->dropColumn('deleted_at');
            });
        }

        if (Schema::hasColumn('rooms', 'deleted_at')) {
            Schema::table('rooms', function (Blueprint $table) {
                $table->dropColumn('deleted_at');
            });
        }
    }

    public function down(): void
    {
        Schema::table('room_categories', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('rooms', function (Blueprint $table) {
            $table->softDeletes();
        });
    }
};
