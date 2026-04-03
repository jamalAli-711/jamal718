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
        Schema::create('branches', function (Blueprint $table) {
            $table->increments('id'); // INT PK
            $table->string('branch_name', 100); // اسم الفرع
            $table->string('location_city', 50); // المحافظة
            $table->string('manager_name', 100)->nullable(); // اسم المدير
            $table->decimal('branch_lat', 10, 8)->nullable(); // إحداثيات الفرع (عرض)
            $table->decimal('branch_lon', 11, 8)->nullable(); // إحداثيات الفرع (طول)
            $table->timestamps();
            $table->softDeletes();
        });

        // Add foreign key to users table
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('branch_id')->references('id')->on('branches')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
        });

        Schema::dropIfExists('branches');
    }
};
