<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // قواعد العمولات للمناديب
        Schema::create('commission_rules', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedBigInteger('agent_id')->nullable(); // مندوب محدد (أو null للجميع)
            $table->unsignedInteger('category_id')->nullable(); // فئة منتجات محددة
            $table->decimal('percentage', 5, 2); // نسبة العمولة مثلا 2.50
            $table->decimal('min_order_value', 15, 4)->default(0); // الحد الأدنى للطلب
            $table->timestamps();

            $table->foreign('agent_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commission_rules');
    }
};
