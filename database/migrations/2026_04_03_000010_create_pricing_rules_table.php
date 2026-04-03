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
        Schema::create('pricing_rules', function (Blueprint $table) {
            $table->increments('id'); // INT PK
            $table->unsignedBigInteger('product_id'); // رقم المنتج
            $table->tinyInteger('user_type'); // 2=Wholesaler, 3=Retailer, 4=Customer
            $table->integer('min_quantity')->default(1); // الحد الأدنى للكمية لتفعيل الخصم
            $table->decimal('discount_percentage', 5, 2)->default(0); // نسبة الخصم
            $table->dateTime('start_date')->nullable(); // بداية تفعيل العرض
            $table->dateTime('end_date')->nullable(); // نهاية العرض
            $table->unsignedInteger('branch_id')->nullable(); // فرع ضبط المخزون
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricing_rules');
    }
};
