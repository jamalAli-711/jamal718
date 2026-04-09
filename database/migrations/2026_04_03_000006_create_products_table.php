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
        Schema::create('products', function (Blueprint $table) {
            $table->id(); // bigInt PK
            $table->string('sku')->unique(); // رمز المنتج الفريد
            $table->string('name'); // اسم المنتج
            $table->decimal('stock_quantity', 15, 3)->default(0); // الكمية الكلية
            $table->unsignedInteger('category_id')->nullable(); // فئة المنتج
            $table->unsignedInteger('branch_id')->nullable(); // الفرع
            $table->unsignedBigInteger('created_by')->nullable(); // المستخدم المنشئ
            $table->unsignedBigInteger('updated_by')->nullable(); // آخر من عدّل
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
