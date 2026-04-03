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
        Schema::create('product_units', function (Blueprint $table) {
            $table->id(); // BIGINT PK
            $table->unsignedBigInteger('product_id'); // ربط الوحدة بالمنتج
            $table->unsignedInteger('unit_id'); // نوع الوحدة من جدول units
            $table->decimal('conversion_factor', 10, 3)->default(1); // معامل التحويل
            $table->decimal('base_price', 10, 3)->default(0); // السعر الرسمي للوحدة
            $table->decimal('wholesale_price', 10, 3)->default(0); // السعر الخاص بالجملة
            $table->decimal('retail_price', 10, 3)->default(0); // السعر الخاص بالتجزئة
            $table->boolean('is_default_sale')->default(false); // هل هي الوحدة الافتراضية للبيع
            $table->unsignedInteger('branch_id')->nullable(); // الفرع التابع له السعر
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->foreign('unit_id')->references('id')->on('units')->cascadeOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_units');
    }
};
