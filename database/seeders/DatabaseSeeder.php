<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Branch;
use App\Models\Currency;
use App\Models\Unit;
use App\Models\Category;
use App\Models\User;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\OrderQueue;
use App\Models\OrderItem;
use App\Models\DeliveryTracking;
use App\Enums\UserType;
use App\Enums\OrderStatus;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Branches
        $mainBranch = Branch::create([
            'branch_name' => 'الفرع الرئيسي',
            'location_city' => 'صنعاء',
            'manager_name' => 'أحمد أمين المخزن',
            'branch_lat' => 15.3694,
            'branch_lon' => 44.1910,
        ]);

        $branch2 = Branch::create([
            'branch_name' => 'فرع التوزيع المباشر',
            'location_city' => 'عدن',
            'manager_name' => 'محمد السقاف',
            'branch_lat' => 12.8252,
            'branch_lon' => 45.0336,
        ]);

        // 2. Currencies
        $yer = Currency::create([
            'currency_name' => 'ريال يمني',
            'currency_code' => 'YER',
            'exchange_rate' => 1.0000,
            'branch_id' => $mainBranch->id,
            'last_updated' => now(),
        ]);
        
        $sar = Currency::create([
            'currency_name' => 'ريال سعودي',
            'currency_code' => 'SAR',
            'exchange_rate' => 140.0000,
            'branch_id' => $mainBranch->id,
            'last_updated' => now(),
        ]);

        // 3. Units
        $carton = Unit::create(['unit_name' => 'كرتون', 'short_name' => 'CTN']);
        $piece = Unit::create(['unit_name' => 'حبة', 'short_name' => 'PCS']);
        $dozen = Unit::create(['unit_name' => 'درزن', 'short_name' => 'DZN']);

        // 4. Categories
        $catBeverages = Category::create(['category_name' => 'مشروبات وعصائر', 'branch_id' => $mainBranch->id]);
        $catCanned = Category::create(['category_name' => 'معلبات', 'branch_id' => $mainBranch->id]);

        // 5. Users
        $admin = User::create([
            'name' => 'مدير النظام (أمين المخزن)',
            'email' => 'admin@maklfih.com',
            'password' => Hash::make('password'),
            'user_type' => UserType::Admin,
            'phone' => '777000111',
            'address_desc' => 'مقر الشركة الرئيسي',
            'branch_id' => $mainBranch->id,
        ]);

        $merchant = User::create([
            'name' => 'مؤسسة الشموخ التجارية (جملة)',
            'email' => 'merchant@maklfih.com',
            'password' => Hash::make('password'),
            'user_type' => UserType::Wholesaler,
            'phone' => '777222333',
            'address_desc' => 'سوق الجملة',
            'branch_id' => $mainBranch->id,
        ]);

        $customer = User::create([
            'name' => 'سالم للمواد الغذائية (تجزئة)',
            'email' => 'retail@maklfih.com',
            'password' => Hash::make('password'),
            'user_type' => UserType::Retailer,
            'phone' => '777444555',
            'address_desc' => 'شارع حدة',
            'branch_id' => $mainBranch->id,
        ]);

        // 6. Products
        $pepsi = Product::create([
            'sku' => 'BEV-PEPSI-001',
            'name' => 'بيبسي كولا دايت 330 مل',
            'official_price' => 250,
            'wholesale_price' => 220,
            'retail_price' => 240,
            'category_id' => $catBeverages->id,
        ]);
        
        $pepsi->branches()->attach($mainBranch->id, ['stock_quantity' => 1500]);

        ProductUnit::create([
            'product_id' => $pepsi->id, 'unit_id' => $piece->id,
            'conversion_factor' => 1, 'base_price' => 250,
            'wholesale_price' => 220, 'retail_price' => 240,
            'is_default_sale' => true, 'branch_id' => $mainBranch->id
        ]);
        ProductUnit::create([
            'product_id' => $pepsi->id, 'unit_id' => $carton->id,
            'conversion_factor' => 24, 'base_price' => 6000,
            'wholesale_price' => 5200, 'retail_price' => 5700,
            'is_default_sale' => false, 'branch_id' => $mainBranch->id
        ]);

        $beans = Product::create([
            'sku' => 'CAN-BEANS-002',
            'name' => 'فاصولياء حمراء معلبة 400 جرام',
            'official_price' => 500,
            'wholesale_price' => 450,
            'retail_price' => 480,
            'category_id' => $catCanned->id,
        ]);
        
        $beans->branches()->attach($mainBranch->id, ['stock_quantity' => 450]);

        ProductUnit::create([
            'product_id' => $beans->id, 'unit_id' => $piece->id,
            'conversion_factor' => 1, 'base_price' => 500,
            'wholesale_price' => 450, 'retail_price' => 480,
            'is_default_sale' => true, 'branch_id' => $mainBranch->id
        ]);

        // 7. Orders
        $order1 = OrderQueue::create([
            'reference_number' => 'ORD-20260403-001',
            'customer_id' => $merchant->id,
            'order_status' => OrderStatus::Pending,
            'total_price' => 52000, 
            'currency_id' => $yer->id,
            'exchange_rate' => 1,
            'exchange_total' => 52000,
            'final_amount' => 52000,
            'branch_id' => $mainBranch->id,
        ]);

        OrderItem::create([
            'order_id' => $order1->id, 'product_id' => $pepsi->id,
            'unit_id' => $carton->id, 'conversion_factor' => 24,
            'quantity' => 10, 'unit_total' => 240,
            'unit_price' => 5200, 'item_total' => 52000,
            'currency_id' => $yer->id, 'exchange_rate' => 1,
            'exchange_total' => 52000, 'branch_id' => $mainBranch->id,
        ]);

        $order2 = OrderQueue::create([
            'reference_number' => 'ORD-20260403-002',
            'customer_id' => $customer->id,
            'order_status' => OrderStatus::OutForDelivery,
            'total_price' => 5700, 
            'currency_id' => $yer->id,
            'exchange_rate' => 1,
            'exchange_total' => 5700,
            'final_amount' => 5700,
            'branch_id' => $mainBranch->id,
        ]);

        OrderItem::create([
            'order_id' => $order2->id, 'product_id' => $pepsi->id,
            'unit_id' => $carton->id, 'conversion_factor' => 24,
            'quantity' => 1, 'unit_total' => 24,
            'unit_price' => 5700, 'item_total' => 5700,
            'currency_id' => $yer->id, 'exchange_rate' => 1,
            'exchange_total' => 5700, 'branch_id' => $mainBranch->id,
        ]);

        DeliveryTracking::create([
            'order_id' => $order2->id,
            'driver_name' => 'يحيى السائق',
            'current_lat' => 15.3500,
            'current_lon' => 44.1800,
            'estimated_arrival' => Carbon::now()->addHours(1),
            'status' => 2, // On_Way
            'branch_id' => $mainBranch->id,
        ]);
        
        $order3 = OrderQueue::create([
            'reference_number' => 'ORD-20260403-003',
            'customer_id' => $merchant->id,
            'order_status' => OrderStatus::Delivered,
            'total_price' => 45000, 
            'currency_id' => $yer->id,
            'exchange_rate' => 1,
            'exchange_total' => 45000,
            'final_amount' => 45000,
            'branch_id' => $mainBranch->id,
        ]);
        // Create some orders for App users (Indirect Fulfillment Simulation)
        $appCustomer = \App\Models\User::where('user_type', UserType::Customer)->first();
        $allProductIds = \App\Models\Product::pluck('id')->toArray();

        if ($appCustomer && count($allProductIds) > 0) {
            for ($i = 1; $i <= 5; $i++) {
                $totalPrice = 0;
                $orderQueue = \App\Models\OrderQueue::create([
                    'reference_number' => 'APP-' . now()->format('Ymd') . '-00' . $i,
                    'customer_id'      => $appCustomer->id,
                    'order_status'     => OrderStatus::Pending,
                    'total_price'      => 0, // Will be calculated
                    'currency_id'      => $defaultCurrency->id ?? null,
                    'exchange_rate'    => 1,
                    'exchange_total'   => 0,
                    'final_amount'     => 0,
                    // Note: 'branch_id' is optional for app orders but we leave it null for the whole order or default billing. We leave billing branch_id as null
                ]);

                // Create 1-3 random items for this app order with NO branch allocated
                $numItems = rand(1, 3);
                for ($j = 0; $j < $numItems; $j++) {
                    $prod = \App\Models\Product::find($allProductIds[array_rand($allProductIds)]);
                    $qty = rand(10, 50); // Customer requests a bulk of items
                    $price = $prod->retail_price ?: $prod->official_price;
                    $itemTotal = $qty * $price;

                    \App\Models\OrderItem::create([
                        'order_id'          => $orderQueue->id,
                        'product_id'        => $prod->id,
                        'unit_id'           => null,
                        'conversion_factor' => 1,
                        'quantity'          => $qty,
                        'unit_total'        => $qty,
                        'unit_price'        => $price,
                        'item_total'        => $itemTotal,
                        'branch_id'         => null, // UNALLOCATED
                    ]);

                    $totalPrice += $itemTotal;
                }

                $orderQueue->update([
                    'total_price'  => $totalPrice,
                    'final_amount' => $totalPrice,
                ]);
            }
        }
    }
}
