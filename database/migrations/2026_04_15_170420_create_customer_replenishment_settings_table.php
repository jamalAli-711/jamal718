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
        if (!Schema::hasTable('customer_replenishment_settings')) {
            Schema::create('customer_replenishment_settings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
                $table->integer('reorder_cycle_days')->default(30);
                $table->integer('minimum_stock_level')->nullable();
                $table->date('last_fulfilled_date')->nullable();
                $table->date('next_expected_date')->nullable();
                $table->integer('preferred_quantity')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                // Indexing for faster Morning Alert scans
                $table->index(['next_expected_date', 'is_active']);
                $table->unique(['customer_id', 'product_id'], 'cust_prod_replenish_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_replenishment_settings');
    }
};
