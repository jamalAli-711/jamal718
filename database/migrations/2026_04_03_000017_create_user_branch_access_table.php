<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // صلاحيات الفروع - من يرى ماذا في أي فرع
        Schema::create('user_branch_access', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // الموظف
            $table->unsignedInteger('branch_id'); // الفرع المسموح له إدارته
            $table->tinyInteger('access_level')->default(1); // 1=View_Only, 2=Full_Control
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->cascadeOnDelete();
            $table->unique(['user_id', 'branch_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_branch_access');
    }
};
