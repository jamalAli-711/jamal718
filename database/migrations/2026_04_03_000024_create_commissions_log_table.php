<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // سجل مستحقات العمولات
        Schema::create('commissions_log', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id'); // الطلب المرتبط
            $table->unsignedBigInteger('agent_id'); // المندوب المستحق
            $table->decimal('order_total', 15, 4); // مبلغ الفاتورة الإجمالي
            $table->decimal('commission_amount', 15, 4); // مبلغ العمولة المحسوب
            $table->tinyInteger('status')->default(1); // 1=Pending, 2=Earned, 3=Paid, 4=Cancelled
            $table->timestamp('paid_at')->nullable(); // تاريخ صرف العمولة
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders_queue')->cascadeOnDelete();
            $table->foreign('agent_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commissions_log');
    }
};
