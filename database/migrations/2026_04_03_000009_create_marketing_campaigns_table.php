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
        Schema::create('marketing_campaigns', function (Blueprint $table) {
            $table->id(); // bigInt PK
            $table->string('campaign_source'); // مصدر الإعلان (Facebook, Google, etc)
            $table->tinyInteger('target_segment')->default(0); // 0=All, 2=Wholesaler, 3=Retailer, 4=Customer
            $table->integer('clicks_count')->default(0); // عدد النقرات
            $table->integer('conversions')->default(0); // عدد الطلبات المكتملة
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketing_campaigns');
    }
};
