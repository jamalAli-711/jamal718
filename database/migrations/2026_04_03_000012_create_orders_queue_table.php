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
        Schema::create('orders_queue', function (Blueprint $table) {
            $table->id(); // BIGINT PK - الرقم المرجعي للطلب
            $table->string('reference_number')->unique()->nullable(); // رقم المرجع للفاتورة
            $table->unsignedBigInteger('customer_id'); // معرف العميل
            $table->tinyInteger('order_status')->default(1); // 1=Pending, 2=Processing, 3=Out_for_Delivery, 4=Delivered
            $table->decimal('total_price', 15, 4)->default(0); // المبلغ الإجمالي
            $table->unsignedInteger('currency_id')->nullable(); // معرف العملة
            $table->decimal('exchange_rate', 15, 4)->default(1); // سعر الصرف
            $table->decimal('exchange_total', 15, 4)->default(0); // القيمة بالعملة الرئيسية
            $table->decimal('final_amount', 15, 4)->default(0); // المبلغ الصافي النهائي
            $table->decimal('shipping_lat', 10, 8)->nullable(); // إحداثيات العميل (عرض)
            $table->decimal('shipping_lon', 11, 8)->nullable(); // إحداثيات العميل (طول)
            $table->unsignedInteger('branch_id')->nullable(); // الفرع المسؤول
            $table->text('notes')->nullable(); // ملاحظات العميل
            $table->text('admin_note')->nullable(); // ملاحظات الإدارة
            $table->timestamps(); // created_at = تاريخ الطلب
            $table->softDeletes();

            $table->foreign('customer_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('currency_id')->references('id')->on('currencies')->nullOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders_queue');
    }
};
