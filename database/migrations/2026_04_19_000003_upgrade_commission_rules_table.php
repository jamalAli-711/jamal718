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
        Schema::table('commission_rules', function (Blueprint $table) {
            // Check and add rule_name if missing
            if (!Schema::hasColumn('commission_rules', 'rule_name')) {
                $table->string('rule_name')->nullable()->after('id');
            }
            
            // Check and add target_type if missing
            if (!Schema::hasColumn('commission_rules', 'target_type')) {
                $table->string('target_type')->default('global')->after('rule_name');
            }

            // Check and add target_id if missing
            if (!Schema::hasColumn('commission_rules', 'target_id')) {
                $table->unsignedBigInteger('target_id')->nullable()->after('target_type');
            }

            // Rename percentage to commission_percentage if needed for compatibility with my UI
            if (Schema::hasColumn('commission_rules', 'percentage')) {
                $table->renameColumn('percentage', 'commission_percentage');
            } else if (!Schema::hasColumn('commission_rules', 'commission_percentage')) {
                $table->decimal('commission_percentage', 5, 2)->default(0);
            }

            // Add is_active if missing
            if (!Schema::hasColumn('commission_rules', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commission_rules', function (Blueprint $table) {
            // Optional: reverse if needed
        });
    }
};
