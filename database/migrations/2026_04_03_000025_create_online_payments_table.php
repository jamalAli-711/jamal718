<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // عمليات الدفع الإلكتروني
        Schema::create('online_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id'); // الطلب المرتبط
            $table->string('transaction_ref', 100)->unique(); // رقم مرجع النظام (أولده لارافل)
            $table->string('gateway_id', 50)->nullable(); // المرجع القادم من بوابة الدفع
            $table->string('payment_method', 50); // Visa, MasterCard, Wallet_API
            $table->decimal('amount', 15, 4); // المبلغ
            $table->string('currency_code', 10); // YER, USD, SAR
            $table->tinyInteger('status')->default(1); // 1=Initiated, 2=Pending, 3=Success, 4=Failed, 5=Cancelled
            $table->json('raw_response')->nullable(); // الرد الكامل من البوابة
            $table->timestamp('callback_at')->nullable(); // وقت رد البوابة
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders_queue')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('online_payments');
    }
};
