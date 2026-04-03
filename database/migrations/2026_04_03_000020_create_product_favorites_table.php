<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // مفضلة المنتجات
        Schema::create('product_favorites', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // المستخدم (العميل أو التاجر)
            $table->unsignedBigInteger('product_id'); // المنتج المفضل
            $table->timestamp('added_at')->useCurrent(); // تاريخ الإضافة للمفضلة
            $table->unsignedInteger('branch_id')->nullable(); // فرع المحافظة

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->nullOnDelete();
            $table->unique(['user_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_favorites');
    }
};
