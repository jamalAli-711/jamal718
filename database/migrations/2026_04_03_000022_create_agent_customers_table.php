<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ربط المندوب بالزبائن
        Schema::create('agent_customers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('agent_id'); // معرف المندوب
            $table->unsignedBigInteger('customer_id'); // معرف الزبون
            $table->timestamp('assigned_at')->useCurrent(); // تاريخ الربط
            $table->boolean('is_active')->default(true); // هل العلاقة قائمة؟

            $table->foreign('agent_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('customer_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unique(['agent_id', 'customer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_customers');
    }
};
