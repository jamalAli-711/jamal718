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
        Schema::create('locations', function (Blueprint $table) {
            $table->id(); // bigInt PK
            $table->unsignedBigInteger('user_id'); // ربط الموقع بصاحب المحل
            $table->decimal('latitude', 10, 8); // خط العرض
            $table->decimal('longitude', 11, 8); // خط الطول
            $table->boolean('is_verified')->default(false); // هل المحل معتمد؟
            $table->unsignedInteger('branch_id')->nullable(); // الفرع المسؤول
            $table->unsignedBigInteger('created_by')->nullable(); // المستخدم المنشئ
            $table->unsignedBigInteger('updated_by')->nullable(); // آخر من عدّل
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
