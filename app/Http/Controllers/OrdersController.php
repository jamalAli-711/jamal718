<?php

namespace App\Http\Controllers;

use App\Models\OrderQueue;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Currency;
use App\Models\Unit;
use App\Enums\UserType;
use App\Enums\OrderStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Events\OrderUpdated;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Services\OfferService;

class OrdersController extends Controller
{
    protected $offerService;

    public function __construct(OfferService $offerService)
    {
        $this->offerService = $offerService;
    }

    public function index()
    {
        $orders = OrderQueue::with(['customer', 'orderItems.product', 'orderItems.productUnit.unit', 'orderItems.currency', 'branch', 'currency'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $stats = [
            'total_pending'    => OrderQueue::where('order_status', OrderStatus::Pending)->count(),
            'total_processing' => OrderQueue::where('order_status', OrderStatus::Processing)->count(),
            'total_delivery'   => OrderQueue::where('order_status', OrderStatus::OutForDelivery)->count(),
            'delivered_today'  => OrderQueue::where('order_status', OrderStatus::Delivered)->whereDate('updated_at', today())->count(),
        ];

        // Data needed for the "Create Order" modal
        $customers = User::whereIn('user_type', [UserType::Wholesaler, UserType::Retailer, UserType::Customer])
            ->select('id', 'name', 'user_type', 'phone', 'branch_id')
            ->get();

        $branches = \App\Models\Branch::select('id', 'branch_name')->get();

        $products = Product::with(['units.unit', 'branches' => function($q) {
                // To get pivot stock_quantity
                $q->select('branches.id', 'branch_name');
            }])
            ->select('id', 'name', 'sku', 'category_id')
            ->withSum('branches as total_stock', 'branch_product.stock_quantity')
            ->get();

        $currencies = \App\Models\Currency::select('id', 'currency_name', 'currency_code_en', 'exchange_rate', 'branch_id')->get();

        return Inertia::render('Orders/Index', [
            'orders'     => $orders,
            'stats'      => $stats,
            'customers'  => $customers,
            'branches'   => $branches,
            'products'   => $products,
            'currencies' => $currencies,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:users,id',
            'currency_id' => 'nullable|exists:currencies,id',
            'items'       => 'required|array|min:1',
            'items.*.product_id'  => 'required|exists:products,id',
            'items.*.product_unit_id' => 'nullable|exists:product_units,id',
            'items.*.branch_id'   => 'required|exists:branches,id',
            'items.*.quantity'    => 'required|integer|min:1',
            'items.*.notes'       => 'nullable|string',
            'notes'               => 'nullable|string',
            'coupon'              => 'nullable|string|max:20',
        ]);

        $customer = User::findOrFail($validated['customer_id']);
        $currency = $validated['currency_id'] ? Currency::find($validated['currency_id']) : null;
        $exchangeRate = $currency ? $currency->exchange_rate : 1;

        // Validation 1: Strict Inventory Check BEFORE touching the DB
        foreach ($validated['items'] as $item) {
            $product = Product::with(['branches' => function($q) use ($item) {
                $q->where('branches.id', $item['branch_id']);
            }])->find($item['product_id']);

            $branchPivot = $product->branches->first();
            $availableStock = $branchPivot ? $branchPivot->pivot->stock_quantity : 0;
            
            // Calculate base total quantity required in primary units (pieces)
            $conversionFactor = 1;
            if (!empty($item['product_unit_id'])) {
                $prodUnit = \App\Models\ProductUnit::find($item['product_unit_id']);
                if ($prodUnit) {
                    $conversionFactor = $prodUnit->conversion_factor;
                }
            }

            $neededStock = $item['quantity'] * $conversionFactor;

            if ($availableStock < $neededStock) {
                return redirect()->back()->withErrors(['items' => "الكمية المطلوبة من {$product->name} ({$neededStock} حبة الأساسية) تتجاوز المتوفر ({$availableStock}) في الفرع المنصرف منه!"]);
            }
        }

        // Generate reference number
        $refNumber = 'ORD-' . now()->format('Ymd') . '-' . str_pad(OrderQueue::whereDate('created_at', today())->count() + 1, 3, '0', STR_PAD_LEFT);

        $totalPrice = 0;

        $order = OrderQueue::create([
            'reference_number' => $refNumber,
            'customer_id'      => $customer->id,
            'order_status'     => OrderStatus::Pending,
            'total_price'      => 0,
            'currency_id'      => $validated['currency_id'],
            'exchange_rate'    => $exchangeRate,
            'exchange_total'   => 0,
            'final_amount'     => 0,
            'branch_id'        => $customer->branch_id, // Default billing branch
            'notes'            => $validated['notes'] ?? null,
        ]);

        foreach ($validated['items'] as $item) {
            $product = Product::find($item['product_id']);
            
            // Re-Determine Pricing and Unit Factor SERVER-SIDE
            $conversionFactor = 1;
            $unitPrice = 0;

            if (!empty($item['product_unit_id'])) {
                $prodUnit = \App\Models\ProductUnit::find($item['product_unit_id']);
            } else {
                $prodUnit = $product->units()->where('is_default_sale', true)->first() ?? $product->units()->first();
            }

            if ($prodUnit) {
                $conversionFactor = $prodUnit->conversion_factor;
                $unitPrice = $prodUnit->base_price;
                if ($customer->user_type === UserType::Wholesaler && $prodUnit->wholesale_price > 0) $unitPrice = $prodUnit->wholesale_price;
                if ($customer->user_type === UserType::Retailer && $prodUnit->retail_price > 0) $unitPrice = $prodUnit->retail_price;
            }

            $itemTotal = $item['quantity'] * $unitPrice;

            // --- OFFER LOGIC START ---
            // Prepare data for OfferService
            $cartItems = collect($validated['items'])->map(function($i) use ($customer) {
                // We need to determine the base unit price for the offer service
                $product = Product::find($i['product_id']);
                $pUnit = $i['product_unit_id'] ? \App\Models\ProductUnit::find($i['product_unit_id']) : ($product->units()->where('is_default_sale', true)->first() ?? $product->units()->first());
                $price = $pUnit ? ($pUnit->retail_price ?: $pUnit->base_price) : 0;
                if ($customer->user_type === UserType::Wholesaler && $pUnit?->wholesale_price > 0) $price = $pUnit->wholesale_price;
                if ($customer->user_type === UserType::Retailer && $pUnit?->retail_price > 0) $price = $pUnit->retail_price;

                return [
                    'product_id' => $i['product_id'],
                    'quantity'   => $i['quantity'],
                    'unit_price' => $price,
                ];
            });

            $offerResult = $this->offerService->applyOffers($customer, $cartItems, $validated['coupon'] ?? null);

            // Update current item price if a discount was applied
            $processedTarget = collect($offerResult['items'])->firstWhere('product_id', $item['product_id']);
            if ($processedTarget) {
                $unitPrice = $processedTarget->unit_price;
                $itemTotal = $item['quantity'] * $unitPrice;
            }
            // --- OFFER LOGIC END ---

            $totalPrice += $itemTotal;

            OrderItem::create([
                'order_id'          => $order->id,
                'product_id'        => $item['product_id'],
                'product_unit_id'   => $prodUnit ? $prodUnit->id : null,
                'quantity'          => $item['quantity'],
                'unit_total'        => $item['quantity'] * $conversionFactor,
                'unit_price'        => $unitPrice,
                'item_total'        => $itemTotal,
                'currency_id'       => $validated['currency_id'],
                'exchange_rate'     => $exchangeRate,
                'exchange_total'    => $itemTotal * $exchangeRate,
                'branch_id'         => $item['branch_id'], // LINE-ITEM BRANCH SOURCING!
                'notes'             => $item['notes'] ?? null,
            ]);
        }

        $order->update([
            'total_price'    => $totalPrice,
            'exchange_total' => $totalPrice * $exchangeRate,
            'final_amount'   => $totalPrice,
        ]);

        // --- ADD BONUS ITEMS FROM OFFERS ---
        if (!empty($offerResult['bonuses'])) {
            foreach ($offerResult['bonuses'] as $bonus) {
                OrderItem::create([
                    'order_id'          => $order->id,
                    'product_id'        => $bonus['product_id'],
                    'product_unit_id'   => null, // Optional: find a product_unit_id matching the bonus_unit_id
                    'quantity'          => $bonus['quantity'],
                    'unit_total'        => $bonus['quantity'], // assuming primary unit for now
                    'unit_price'        => 0,
                    'item_total'        => 0,
                    'currency_id'       => $validated['currency_id'],
                    'exchange_rate'     => $exchangeRate,
                    'exchange_total'    => 0,
                    'branch_id'         => $customer->branch_id,
                    'notes'             => 'هدية: ' . $bonus['title'],
                ]);
            }
        }

        // Decrement Offer Limits
        if (!empty($offerResult['applied_offers'])) {
             $this->offerService->decrementOfferLimits(collect($offerResult['applied_offers'])->pluck('id')->toArray());
        }
        // --- END BONUSES ---

        return redirect()->back()->with('success', 'تم إنشاء الطلب بنجاح — ' . $refNumber);
    }

    public function allocate(Request $request, $id)
    {
        $order = OrderQueue::findOrFail($id);

        if ($order->order_status !== OrderStatus::Pending) {
            return redirect()->back()->withErrors(['allocation' => 'لا يمكن تخصيص طلباته لم تعد في حالة الانتظار.']);
        }

        $validated = $request->validate([
            'allocations' => 'required|array',
            'allocations.*.original_item_id' => 'required|exists:order_items,id',
            'allocations.*.splits' => 'required|array|min:1',
            'allocations.*.splits.*.branch_id' => 'required|exists:branches,id',
            'allocations.*.splits.*.allocated_qty' => 'required|numeric|min:1',
        ]);

        DB::beginTransaction();

        try {
            foreach ($validated['allocations'] as $alloc) {
                $originalItem = OrderItem::find($alloc['original_item_id']);
                
                if (!$originalItem || $originalItem->order_id !== $order->id) {
                    continue;
                }

                // Verify the total allocated equals the requested quantity
                $totalAllocated = collect($alloc['splits'])->sum('allocated_qty');
                
                if ($totalAllocated != $originalItem->quantity) {
                    throw new \Exception("إجمالي الكمية المخصصة للصنف {$originalItem->product->name} لا يتطابق مع الكمية المطلوبة ({$originalItem->quantity}).");
                }

                // Validate Branch Stocks
                foreach ($alloc['splits'] as $split) {
                    $branch = \App\Models\Branch::find($split['branch_id']);
                    $product = Product::with(['branches' => function($q) use ($split) {
                        $q->where('branches.id', $split['branch_id']);
                    }])->find($originalItem->product_id);

                    $branchPivot = $product->branches->first();
                    $availableStock = $branchPivot ? $branchPivot->pivot->stock_quantity : 0;
                    
                    $cf = $originalItem->productUnit ? $originalItem->productUnit->conversion_factor : 1;
                    $neededBaseQty = $split['allocated_qty'] * $cf;

                    if ($availableStock < $neededBaseQty) {
                        throw new \Exception("الكمية المخصصة ({$neededBaseQty}) من المنتج {$product->name} تتجاوز الرصيد المتوفر ({$availableStock}) في فرع {$branch->branch_name}.");
                    }
                }

                // Everything is valid! Delete original unmapped row, create split mapped rows!
                foreach ($alloc['splits'] as $split) {
                    $qty = $split['allocated_qty'];
                    $cf = $originalItem->productUnit ? $originalItem->productUnit->conversion_factor : 1;
                    $itemTotal = ($qty * $cf) * $originalItem->unit_price;

                    OrderItem::create([
                        'order_id'          => $order->id,
                        'product_id'        => $originalItem->product_id,
                        'product_unit_id'   => $originalItem->product_unit_id,
                        'quantity'          => $qty,
                        'unit_total'        => $qty * $cf,
                        'unit_price'        => $originalItem->unit_price,
                        'item_total'        => $itemTotal,
                        'currency_id'       => $originalItem->currency_id,
                        'exchange_rate'     => $originalItem->exchange_rate,
                        'exchange_total'    => $itemTotal * $originalItem->exchange_rate,
                        'branch_id'         => $split['branch_id'],
                    ]);
                }
                
                // Remove the old unallocated item
                $originalItem->delete();
            }

            DB::commit();
            return redirect()->back()->with('success', 'تم تخصيص الأصناف على المخازن بنجاح!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['allocation' => $e->getMessage()]);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $order = OrderQueue::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|integer|in:1,2,3,4,5',
            'admin_note' => 'nullable|string',
        ]);

        $newStatus = OrderStatus::from($validated['status']);

        // If shifting to Delivered, deduct stock
        if ($newStatus === OrderStatus::Delivered && $order->order_status !== OrderStatus::Delivered) {
            foreach ($order->orderItems as $item) {
                // Find pivot and subtract
                $product = Product::find($item->product_id);
                if ($product) {
                    $pivot = $product->branches()->where('branch_id', $item->branch_id)->first();
                    $currentStock = $pivot ? $pivot->pivot->stock_quantity : 0;
                    
                    $product->branches()->syncWithoutDetaching([
                        $item->branch_id => ['stock_quantity' => $currentStock - $item->unit_total]
                    ]);
                }
            }
        }

        // Optional: If reverting from Delivered to something else, add stock back
        if ($order->order_status === OrderStatus::Delivered && $newStatus !== OrderStatus::Delivered) {
            foreach ($order->orderItems as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $pivot = $product->branches()->where('branch_id', $item->branch_id)->first();
                    $currentStock = $pivot ? $pivot->pivot->stock_quantity : 0;
                    
                    $product->branches()->syncWithoutDetaching([
                        $item->branch_id => ['stock_quantity' => $currentStock + $item->unit_total]
                    ]);
                }
            }
        }

        $adminNote = $validated['admin_note'] ?? null;
        if ($newStatus === OrderStatus::Rejected && empty($adminNote)) {
            $adminNote = 'الطلب لم يتم قبول الطلب بعد الرجاء التواصل مع ادراة المبيعات';
        }

        $order->update([
            'order_status' => $newStatus,
            'admin_note' => $adminNote,
        ]);

        // Broadcast to customer
        event(new OrderUpdated($order));

        return redirect()->back()->with('success', 'تم تحديث حالة الطلب بنجاح');
    }

    public function destroy($id)
    {
        $order = OrderQueue::findOrFail($id);
        $ref = $order->reference_number;

        // If it was delivered, return stock before deleting
        if ($order->order_status === OrderStatus::Delivered) {
            foreach ($order->orderItems as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $pivot = $product->branches()->where('branch_id', $item->branch_id)->first();
                    $currentStock = $pivot ? $pivot->pivot->stock_quantity : 0;
                    
                    $product->branches()->syncWithoutDetaching([
                        $item->branch_id => ['stock_quantity' => $currentStock + $item->unit_total]
                    ]);
                }
            }
        }

        $order->orderItems()->delete();
        $order->delete();

        return redirect()->back()->with('success', 'تم حذف الطلب ' . $ref);
    }
}
