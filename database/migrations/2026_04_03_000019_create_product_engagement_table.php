<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // إحصائيات تفاعل المنتجات
        Schema::create('product_engagement', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id'); // المنتج
            $table->integer('views_count')->default(0); // عدد المشاهدات الفريدة
            $table->integer('favorites_count')->default(0); // عدد مرات الإضافة للمفضلة
            $table->integer('active_users_count')->default(0); // عدد المستخدمين المتفاعلين حالياً
            $table->timestamp('last_activity')->nullable(); // تاريخ آخر تفاعل
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_engagement');
    }
};
