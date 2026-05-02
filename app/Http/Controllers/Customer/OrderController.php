<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\OrderQueue;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\FieldInventory;
use App\Enums\UserType;
use App\Enums\OrderStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Events\OrderPlaced;
use App\Services\OfferService;

class OrderController extends Controller
{
    protected $offerService;

    public function __construct(OfferService $offerService)
    {
        $this->offerService = $offerService;
    }

    public function index()
    {
        $userId = Auth::id();
        $orders = OrderQueue::where('customer_id', $userId)
            ->with(['orderItems.product.images', 'orderItems.currency', 'currency'])
            ->orderBy('created_at', 'desc')
            ->get();

        $stats = [
            'total_orders' => OrderQueue::where('customer_id', $userId)->count(),
            'pending_orders' => OrderQueue::where('customer_id', $userId)
                                          ->where('order_status', OrderStatus::Pending)
                                          ->count(),
            'total_spent' => OrderQueue::where('customer_id', $userId)
                                       ->where('order_status', OrderStatus::Delivered)
                                       ->sum('final_amount')
        ];

        return Inertia::render('Customer/Orders/Index', [
            'orders' => $orders,
            'stats' => $stats
        ]);
    }

    public function show($id)
    {
        $order = OrderQueue::where('customer_id', Auth::id())
            ->with(['orderItems.product.images', 'orderItems.productUnit.unit', 'orderItems.currency', 'branch', 'currency'])
            ->findOrFail($id);

        return Inertia::render('Customer/Orders/Show', [
            'order' => $order
        ]);
    }

    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
            'notes' => 'nullable|string',
            'coupon' => 'nullable|string|max:20',
        ]);

        $customer = Auth::user();

        // Stock Validation
        foreach ($validated['items'] as $item) {
            $product = Product::with(['branches' => function($q) use ($customer) {
                $q->where('branches.id', $customer->branch_id);
            }])->find($item['product_id']);

            $branchPivot = $product->branches->first();
            $availableStock = $branchPivot ? $branchPivot->pivot->stock_quantity : 0;
            
            if ($availableStock < $item['quantity']) {
                return redirect()->back()->withErrors([
                    'cart' => "الكمية المطلوبة من {$product->name} غير متوفرة حالياً في منطقتك."
                ]);
            }
        }

        // Generate a guaranteed unique reference number
        do {
            $refNumber = 'CUST-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -4)) . rand(10, 99);
        } while (OrderQueue::where('reference_number', $refNumber)->exists());
        
        // ─── 1. Identify Branch Currency (Target) ───
        $branch = $customer->branch()->with('currency')->first();
        $targetCurrency = ($branch && $branch->currency) 
            ? $branch->currency 
            : \App\Models\Currency::where('is_default', true)->first();
        
        $targetRate = $targetCurrency ? $targetCurrency->exchange_rate : 1;

        $order = OrderQueue::create([
            'reference_number' => $refNumber,
            'customer_id'      => $customer->id,
            'order_status'     => OrderStatus::Pending,
            'total_price'      => 0, // This will be the SUM in Branch Currency
            'currency_id'      => $targetCurrency->id, 
            'exchange_rate'    => $targetRate, // Reference rate for the whole order
            'exchange_total'   => 0,
            'final_amount'     => 0,
            'branch_id'        => $customer->branch_id,
            'notes'            => $validated['notes'] ?? null,
        ]);

        $totalConvertedPrice = 0;

        foreach ($validated['items'] as $item) {
            $product = Product::with(['units' => function($q) use ($customer) {
                $q->where('branch_id', $customer->branch_id)->with('currency');
            }])->find($item['product_id']);
            
            $defaultUnit = $product->units->where('is_default_sale', true)->first() ?? $product->units->first();
            
            // Raw price (Source Currency)
            $originalPrice = $defaultUnit ? ($defaultUnit->retail_price ?: $defaultUnit->base_price) : 0;
            if ($customer->user_type == UserType::Wholesaler->value && $defaultUnit && $defaultUnit->wholesale_price) $originalPrice = $defaultUnit->wholesale_price;
            elseif ($customer->user_type == UserType::Retailer->value && $defaultUnit && $defaultUnit->retail_price) $originalPrice = $defaultUnit->retail_price;

            // ─── 2. Universal Conversion ───
            $sourceCurrency = $defaultUnit ? $defaultUnit->currency : null;
            $sourceRate = $sourceCurrency ? $sourceCurrency->exchange_rate : 1;
            
            // Converted price per unit in Branch Currency
            $convertedUnitPrice = $originalPrice * ($sourceRate / $targetRate);
            $itemTotalConverted = $item['quantity'] * $convertedUnitPrice;

            $totalConvertedPrice += $itemTotalConverted;

            // --- OFFER LOGIC START ---
            // Prepare data for OfferService
            $cartItems = collect($validated['items'])->map(function($i) use ($customer, $targetRate) {
                $product = Product::with(['units' => function($q) use ($customer) {
                    $q->where('branch_id', $customer->branch_id)->with('currency');
                }])->find($i['product_id']);
                
                $defaultUnit = $product->units->where('is_default_sale', true)->first() ?? $product->units->first();
                $originalPrice = $defaultUnit ? ($defaultUnit->retail_price ?: $defaultUnit->base_price) : 0;
                
                if ($customer->user_type == UserType::Wholesaler->value && $defaultUnit && $defaultUnit->wholesale_price) $originalPrice = $defaultUnit->wholesale_price;
                elseif ($customer->user_type == UserType::Retailer->value && $defaultUnit && $defaultUnit->retail_price) $originalPrice = $defaultUnit->retail_price;

                $sourceCurrency = $defaultUnit ? $defaultUnit->currency : null;
                $sourceRate = $sourceCurrency ? $sourceCurrency->exchange_rate : 1;
                $convertedUnitPrice = $originalPrice * ($sourceRate / $targetRate);

                return [
                    'product_id' => $i['product_id'],
                    'quantity'   => $i['quantity'],
                    'unit_price' => $convertedUnitPrice,
                ];
            });

            $offerResult = $this->offerService->applyOffers($customer, $cartItems, $validated['coupon'] ?? null);

            // Update current item price if a discount was applied
            $processedTarget = collect($offerResult['items'])->firstWhere('product_id', $item['product_id']);
            if ($processedTarget) {
                // Since convertedUnitPrice was used, we update convertedUnitPrice
                $convertedUnitPrice = $processedTarget->unit_price;
                $itemTotalConverted = $item['quantity'] * $convertedUnitPrice;
                // Re-calculate the totalConvertedPrice would be tricky inside loop without carefulness
            }
            // --- OFFER LOGIC END ---

            OrderItem::create([
                'order_id'          => $order->id,
                'product_id'        => $item['product_id'],
                'product_unit_id'   => $defaultUnit?->id,
                'quantity'          => $item['quantity'],
                'unit_total'        => $item['quantity'] * ($defaultUnit?->conversion_factor ?: 1),
                
                'unit_price'        => round($convertedUnitPrice, 4),
                'currency_id'       => $targetCurrency->id,
                'exchange_rate'     => $targetRate,
                
                'item_total'        => round($itemTotalConverted, 4),
                'exchange_total'    => round($itemTotalConverted, 4),
                
                'branch_id'         => $customer->branch_id,
                'notes'             => $item['notes'] ?? null,
            ]);
        }

        // Recalculate totalConvertedPrice from all items to account for discounts
        $totalConvertedPrice = $order->orderItems()->sum('item_total');

        $order->update([
            'total_price'    => round($totalConvertedPrice, 4),
            'exchange_total' => round($totalConvertedPrice, 4),
            'final_amount'   => round($totalConvertedPrice, 4),
        ]);

        // --- ADD BONUS ITEMS FROM OFFERS ---
        if (!empty($offerResult['bonuses'])) {
            foreach ($offerResult['bonuses'] as $bonus) {
                OrderItem::create([
                    'order_id'          => $order->id,
                    'product_id'        => $bonus['product_id'],
                    'product_unit_id'   => null,
                    'quantity'          => $bonus['quantity'],
                    'unit_total'        => $bonus['quantity'], 
                    'unit_price'        => 0,
                    'item_total'        => 0,
                    'currency_id'       => $targetCurrency->id,
                    'exchange_rate'     => $targetRate,
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

        // ── Auto-link: ensure every ordered product is registered in field_inventory ──
        // If the product is not yet linked to this distributor, add it with stock = 0
        $orderedProductIds = collect($validated['items'])->pluck('product_id')->unique()->toArray();

        foreach ($orderedProductIds as $productId) {
            $exists = FieldInventory::where('distributor_id', $customer->id)
                ->where('product_id', $productId)
                ->exists();

            if (!$exists) {
                FieldInventory::create([
                    'distributor_id' => $customer->id,
                    'product_id'     => $productId,
                    'current_stock'  => 0,
                    'branch_id'      => $customer->branch_id,
                    'last_update'    => now(),
                ]);
            }
        }
        // ──────────────────────────────────────────────────────────────────────────

        // Dispatch broadcast event for real-time update
        event(new OrderPlaced($order));

        // Redirect back allowing frontend to clear local storage
        return redirect()->route('customer.orders.show', $order->id)->with('success', 'تم إنشاء الطلب بنجاح! رقم الطلب: ' . $refNumber);
    }
}
