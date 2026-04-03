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
        Schema::create('customer_notifications', function (Blueprint $table) {
            $table->id(); // BIGINT PK
            $table->unsignedBigInteger('user_id'); // رقم العميل المستهدف
            $table->string('title', 150); // عنوان الإشعار
            $table->text('message'); // نص الإشعار
            $table->tinyInteger('type')->default(1); // 1=Order_Update, 2=New_Product, 3=Promotion
            $table->boolean('is_read')->default(false); // حالة القراءة
            $table->unsignedInteger('branch_id')->nullable(); // فرع ضبط المخزون
            $table->timestamps(); // created_at = وقت الإرسال
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_notifications');
    }
};
