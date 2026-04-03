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
        Schema::create('field_inventory', function (Blueprint $table) {
            $table->id(); // bigInt PK
            $table->unsignedBigInteger('distributor_id'); // معرف التاجر
            $table->unsignedBigInteger('product_id'); // المنتج
            $table->integer('current_stock')->default(0); // الكمية المتوفرة عند الموزع حالياً
            $table->timestamp('last_update')->nullable(); // تاريخ آخر تحديث
            $table->unsignedInteger('branch_id')->nullable(); // فرع ضبط المخزون
            $table->timestamps();

            $table->foreign('distributor_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('field_inventory');
    }
};
