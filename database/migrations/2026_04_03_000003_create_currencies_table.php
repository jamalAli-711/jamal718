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
        Schema::create('currencies', function (Blueprint $table) {
            $table->increments('id'); // INT PK
            $table->string('currency_name', 50); // اسم العملة
            $table->string('currency_code', 10); // رمز العملة (YER, SAR, USD)
            $table->decimal('exchange_rate', 15, 4); // سعر الصرف
            $table->timestamp('last_updated')->nullable(); // تاريخ آخر تحديث
            $table->unsignedInteger('branch_id')->nullable(); // الفرع المحدد
            $table->timestamps();

            $table->foreign('branch_id')->references('id')->on('branches')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
