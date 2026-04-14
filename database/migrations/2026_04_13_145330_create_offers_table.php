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
        Schema::create('offers', function (Blueprint $table) {
            $table->id()->comment('المعرف الفريد للعرض');
            $table->string('title', 150)->comment('اسم العرض الترويجي (مثلاً: عرض السلة الرمضانية)');
            
            // حالة العرض والصورة
            $table->boolean('is_active')->default(true)->comment('حالة العرض (1: نشط، 0: متوقف يدوياً)');
            $table->string('image_path', 255)->nullable()->comment('مسار صورة البانر الإعلاني للعرض لتظهر في تطبيق الموبايل');

            // نوع العرض والمنتج الأساسي
            $table->enum('offer_type', ['Percentage', 'Fixed_Amount', 'Free_Unit'])
                  ->comment('نوع العرض: نسبة مئوية، مبلغ ثابت، أو وحدات مجانية (هدية)');
            
            $table->foreignId('target_product_id')->constrained('products')
                  ->comment('المعرف الخاص بالمنتج الذي يجب شراؤه لتفعيل العرض');

            // الكميات والقيود
            $table->integer('min_purchase_qty')->default(1)
                  ->comment('الحد الأدنى للكمية المشتراة لتفعيل العرض (مثلاً: شراء 10 كرتون)');
            
            $table->integer('min_qty_to_achieve')->default(1)
                  ->comment('الكمية المطلوبة لتحقيق العرض (مثلاً: في عرض 10+1 تكون هذه القيمة 10)');

            $table->integer('quantity_limit')->nullable()
                  ->comment('الكمية القصوى المتاحة ضمن هذا العرض لحماية المخزون (مثلاً: أول 500 قطعة فقط)');
            
            // القيم المالية
            $table->decimal('discount_value', 15, 4)->nullable()
                  ->comment('قيمة الخصم إذا كان النوع نسبة (0.10) أو مبلغ ثابت (500)');
            
            // الهدايا (المكافآت)
            $table->integer('bonus_qty')->nullable()
                  ->comment('كمية الوحدات المجانية الممنوحة للعميل');
            
            $table->foreignId('bonus_product_id')->nullable()->constrained('products')
                  ->comment('المعرف الخاص بالمنتج المجاني (قد يكون نفس المنتج المشتري أو منتجاً آخر)');
            
            $table->foreignId('bonus_unit_id')->nullable()->constrained('units')
                  ->comment('وحدة الكمية المجانية الممنوحة (حبة، كرتون، إلخ)');
            
            // شروط إضافية وتواريخ
            $table->boolean('is_cumulative')->default(false)
                  ->comment('هل العرض مضاعف؟ (مثلاً: إذا اشترى 20 يحصل على 2 مجاناً عند تفعيل هذا الخيار)');
            
            $table->timestamp('start_date')->nullable()->comment('تاريخ ووقت بداية سريان العرض');
            $table->timestamp('end_date')->nullable()->comment('تاريخ ووقت نهاية سريان العرض');
            
            // النطاق والمستهدفين
            $table->foreignId('branch_id')->constrained('branches')
                  ->comment('المعرف الخاص بالفرع المشمول بالعرض');
            
            $table->enum('user_type', ['Wholesaler', 'Retailer', 'Distributor', 'End_User'])
                  ->comment('فئة العميل المستهدفة من هذا العرض');
            
            $table->string('apply_coupon', 20)->nullable()
                  ->comment('كود التفعيل في حال كان العرض يتطلب كوبون يدوي');

            $table->softDeletes()->comment('تاريخ الحذف الناعم للرقابة والتقارير');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
