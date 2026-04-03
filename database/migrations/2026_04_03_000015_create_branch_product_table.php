<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_product', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('branch_id');
            $table->unsignedBigInteger('product_id');
            $table->decimal('stock_quantity', 15, 4)->default(0); // الكمية الموجودة في هذا الفرع تحديداً
            $table->timestamps();

            $table->foreign('branch_id')->references('id')->on('branches')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            
            // A product can only have one stock entry per branch
            $table->unique(['branch_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_product');
    }
};
