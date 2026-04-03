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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id(); // BIGINT PK - المعرف الفريد للصنف
            $table->unsignedBigInteger('order_id'); // الربط بالطلب الرئيسي
            $table->unsignedBigInteger('product_id'); // رقم المنتج
            $table->unsignedInteger('unit_id')->nullable(); // الوحدة المختارة (كرتون، حبة..)
            $table->decimal('conversion_factor', 10, 3)->default(1); // معامل التحويل
            $table->integer('quantity')->default(1); // الكمية المطلوبة بالوحدة المختارة
            $table->decimal('unit_total', 10, 3)->default(0); // إجمالي الكمية بالأصغر لضبط المخزن
            $table->integer('free_bonus_units')->default(0); // الكمية المجانية
            $table->decimal('unit_price', 15, 4)->default(0); // سعر الوحدة وقت البيع
            $table->decimal('item_total', 15, 4)->default(0); // إجمالي السعر للصنف
            $table->unsignedInteger('currency_id')->nullable(); // العملة المستخدمة
            $table->decimal('exchange_rate', 15, 4)->default(1); // سعر الصرف للصنف
            $table->decimal('exchange_total', 15, 4)->default(0); // القيمة المعادلة بالعملة الرئيسية
            $table->unsignedInteger('branch_id')->nullable(); // فرع التنفيذ
            $table->text('notes')->nullable(); // ملاحظات الصنف (إضافات، طلبات خاصة)
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('order_id')->references('id')->on('orders_queue')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->foreign('unit_id')->references('id')->on('units')->nullOnDelete();
            $table->foreign('currency_id')->references('id')->on('currencies')->nullOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
