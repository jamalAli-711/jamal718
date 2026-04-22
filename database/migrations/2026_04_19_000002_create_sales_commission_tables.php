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
        // 1. Agent-Customer Relationship (Ownership)
        if (!Schema::hasTable('agent_customers')) {
            Schema::create('agent_customers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('agent_id')->constrained('users')->onDelete('cascade')->comment('المندوب المسؤول');
                $table->foreignId('customer_id')->constrained('users')->onDelete('cascade')->comment('الزبون التابع');
                $table->unique(['agent_id', 'customer_id']);
                $table->timestamps();
            });
        }

        // 2. Commission Rules (Rules engine)
        if (!Schema::hasTable('commission_rules')) {
            Schema::create('commission_rules', function (Blueprint $table) {
                $table->id();
                $table->string('rule_name')->comment('اسم القاعدة');
                $table->string('target_type')->default('global')->comment('global, category, product, agent');
                $table->unsignedBigInteger('target_id')->nullable()->comment('ID المنتج أو الفئة إذا وجد');
                $table->decimal('commission_percentage', 5, 2)->comment('نسبة العمولة');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 3. Commissions Log (Earnings records) - Check if exists, else create
        if (!Schema::hasTable('commissions_log')) {
            Schema::create('commissions_log', function (Blueprint $table) {
                $table->id();
                $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('order_id')->constrained('orders_queue')->onDelete('cascade');
                $table->decimal('order_total', 15, 2)->comment('إجمالي الفاتورة');
                $table->decimal('commission_amount', 15, 2)->comment('مبلغ العمولة المستحق');
                $table->decimal('commission_rate', 5, 2)->default(0)->comment('النسبة المطبقة');
                $table->enum('payment_status', ['pending', 'paid'])->default('pending')->comment('حالة الدفع للمندوب');
                $table->timestamp('paid_at')->nullable();
                $table->timestamps();
            });
        } else {
            // If it exists, add missing columns if any
            Schema::table('commissions_log', function (Blueprint $table) {
                if (!Schema::hasColumn('commissions_log', 'commission_rate')) {
                    $table->decimal('commission_rate', 5, 2)->default(0)->after('commission_amount');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commissions_log');
        Schema::dropIfExists('commission_rules');
        Schema::dropIfExists('agent_customers');
    }
};
