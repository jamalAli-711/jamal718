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
            $table->string('currency_code_en', 10); // رمز العملة (YER, SAR, USD)
            $table->string('currency_code_ar', 10); // رمز العملة (ريال, دولار)
            $table->decimal('exchange_rate', 15, 4); // سعر الصرف
            $table->unsignedBigInteger('updated_by')->nullable(); // آخر من عدّل
            $table->unsignedInteger('branch_id')->nullable(); // الفرع المحدد
            $table->boolean('is_default')->default(false); // العملة الافتراضية للنظام
            $table->timestamps();
            $table->foreign('branch_id')->references('id')->on('branches')->nullOnDelete();
        });

        Schema::table('branches', function (Blueprint $table) {
            $table->unsignedInteger('currency_id')->nullable()->after('manager_name');
            $table->foreign('currency_id')->references('id')->on('currencies')->nullOnDelete();
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
