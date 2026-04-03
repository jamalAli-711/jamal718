<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // جدول الصلاحيات
        Schema::create('permissions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100); // اسم الصلاحية (edit_prices, approve_bonus, view_gps)
            $table->string('guard_name', 20)->default('web'); // نوع الحماية (api, web)
            $table->string('module_name', 50)->nullable(); // القسم التابع له (Sales, Accounting, Inventory)
            $table->timestamps();
        });

        // جدول ربط المستخدمين بالصلاحيات
        Schema::create('permission_user', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedInteger('permission_id');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('permission_id')->references('id')->on('permissions')->cascadeOnDelete();
            $table->unique(['user_id', 'permission_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permission_user');
        Schema::dropIfExists('permissions');
    }
};
