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
        Schema::create('delivery_tracking', function (Blueprint $table) {
            $table->id(); // BIGINT PK
            $table->unsignedBigInteger('order_id'); // مرتبط بجدول الطلبات
            $table->string('driver_name', 100)->nullable(); // اسم السائق
            $table->decimal('current_lat', 10, 8)->nullable(); // خط العرض الحالي (GPS)
            $table->decimal('current_lon', 11, 8)->nullable(); // خط الطول الحالي (GPS)
            $table->timestamp('estimated_arrival')->nullable(); // الوقت المتوقع للوصول
            $table->tinyInteger('status')->default(1); // 1=In_Warehouse, 2=On_Way, 3=Delivered
            $table->unsignedInteger('branch_id')->nullable(); // فرع ضبط المخزون
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('order_id')->references('id')->on('orders_queue')->cascadeOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_tracking');
    }
};
