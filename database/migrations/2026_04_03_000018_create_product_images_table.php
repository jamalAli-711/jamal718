<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // معرض صور المنتجات لتطبيق React Native
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id'); // المنتج التابع له الصورة
            $table->string('image_path'); // مسار الصورة على السيرفر (URL)
            $table->boolean('is_primary')->default(false); // هل هي الصورة الأساسية للمنتج؟
            $table->integer('sort_order')->default(0); // ترتيب العرض (1, 2, 3...)
            $table->unsignedBigInteger('created_by')->nullable(); // من رفع الصورة
            $table->unsignedBigInteger('updated_by')->nullable(); // من عدّلها
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
    }
};
