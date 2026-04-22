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
        // 1. جدول إدارة الأسطول والجي بي اس (fleet_management)
        Schema::create('fleet_management', function (Blueprint $table) {
            $table->id()->comment('المعرف الفريد للشاحنة');
            $table->string('truck_number', 50)->comment('رقم اللوحة أو الكود الداخلي');
            $table->unsignedBigInteger('driver_id')->nullable()->comment('ربط بالسائق (من جدول المستخدمين)');
            $table->string('gps_device_id', 50)->unique()->comment('كود جهاز التتبع (Unique)');
            $table->decimal('current_lat', 10, 8)->nullable()->comment('آخر خط عرض مسجل من الجهاز');
            $table->decimal('current_lon', 11, 8)->nullable()->comment('آخر خط طول مسجل من الجهاز');
            $table->integer('speed')->nullable()->comment('السرعة اللحظية (لرقابة التهور)');
            $table->enum('status', ['Active', 'Maintenance', 'Idle'])->default('Idle')->comment('حالة الشاحنة');
            $table->timestamp('last_update')->nullable()->comment('وقت آخر إشارة وصلت من الـ GPS');
            $table->timestamps();

            $table->foreign('driver_id')->references('id')->on('users')->nullOnDelete();
        });

        // 2. جدول رحلات التوصيل المتعددة (delivery_trips)
        Schema::create('delivery_trips', function (Blueprint $table) {
            $table->id()->comment('معرف الرحلة');
            $table->string('trip_code', 20)->comment('رقم مرجعي (مثلاً: TRIP-2026-001)');
            $table->unsignedBigInteger('truck_id')->comment('الشاحنة المكلفة بالرحلة');
            $table->unsignedBigInteger('order_id')->comment('الطلب المحدد (يتكرر مع كل عميل في الرحلة)');
            $table->unsignedBigInteger('customer_id')->comment('العميل المستلم لهذا الطلب');
            $table->integer('delivery_sequence')->comment('ترتيب الوصول (العميل 1، العميل 2، العميل 3)');
            $table->decimal('target_lat', 10, 8)->comment('إحداثيات موقع العميل (الهدف)');
            $table->decimal('target_lon', 11, 8)->comment('إحداثيات موقع العميل (الهدف)');
            $table->timestamp('estimated_arrival')->nullable()->comment('الوقت المتوقع للوصول لهذا العميل');
            $table->enum('status', ['Waiting', 'On_Way', 'Delivered'])->default('Waiting')->comment('حالة الطلب في الرحلة');
            $table->timestamps();

            $table->foreign('truck_id')->references('id')->on('fleet_management')->cascadeOnDelete();
            $table->foreign('order_id')->references('id')->on('orders_queue')->cascadeOnDelete();
            $table->foreign('customer_id')->references('id')->on('users')->cascadeOnDelete();
        });

        // 3. جدول سجل المسار التاريخي (route_history)
        Schema::create('route_history', function (Blueprint $table) {
            $table->id()->comment('معرف السجل');
            $table->unsignedBigInteger('trip_id')->comment('ربط بنقطة محددة في رحلة معينة');
            $table->decimal('lat', 10, 8)->comment('خط العرض في تلك اللحظة');
            $table->decimal('lon', 11, 8)->comment('خط الطول في تلك اللحظة');
            $table->timestamp('recorded_at')->comment('الوقت الدقيق لتسجيل النقطة');
            $table->timestamps();

            $table->foreign('trip_id')->references('id')->on('delivery_trips')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('route_history');
        Schema::dropIfExists('delivery_trips');
        Schema::dropIfExists('fleet_management');
    }
};
