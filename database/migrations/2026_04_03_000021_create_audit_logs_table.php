<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // الصندوق الأسود - سجل العمليات والتدقيق
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); // الموظف الذي قام بالعملية
            $table->tinyInteger('action'); // 1=CREATE, 2=UPDATE, 3=DELETE, 4=LOGIN
            $table->string('table_name', 50); // اسم الجدول المتأثر
            $table->unsignedBigInteger('record_id')->nullable(); // رقم السجل المتأثر
            $table->json('old_values')->nullable(); // البيانات قبل التعديل
            $table->json('new_values')->nullable(); // البيانات بعد التعديل
            $table->string('ip_address', 45)->nullable(); // عنوان الجهاز
            $table->unsignedInteger('branch_id')->nullable(); // الفرع الذي تمت فيه العملية
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->nullOnDelete();
            $table->index(['table_name', 'record_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
