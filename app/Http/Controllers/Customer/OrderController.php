<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\OrderQueue;
use App\Models\OrderItem;
use App\Models\Product;
use App\Enums\UserType;
use App\Enums\OrderStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Events\OrderPlaced;

class OrderController extends Controller
{
    public function index()
    {
        $orders = OrderQueue::where('customer_id', Auth::id())
            ->with('orderItems.product.images')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Customer/Orders/Index', [
            'orders' => $orders
        ]);
    }

    public function show($id)
    {
        $order = OrderQueue::where('customer_id', Auth::id())
            ->with(['orderItems.product.images', 'orderItems.productUnit.unit', 'branch'])
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

        $refNumber = 'CUST-' . now()->format('Ymd') . '-' . str_pad(OrderQueue::whereDate('created_at', today())->count() + 1, 3, '0', STR_PAD_LEFT);
        $totalPrice = 0;

        $order = OrderQueue::create([
            'reference_number' => $refNumber,
            'customer_id'      => $customer->id,
            'order_status'     => OrderStatus::Pending,
            'total_price'      => 0,
            'currency_id'      => 1, // Default currency
            'exchange_rate'    => 1,
            'exchange_total'   => 0,
            'final_amount'     => 0,
            'branch_id'        => $customer->branch_id,
            'notes'            => $validated['notes'] ?? null,
        ]);

        foreach ($validated['items'] as $item) {
            $product = Product::find($item['product_id']);
            
            $defaultUnit = $product->units()->where('is_default_sale', true)->first() ?? $product->units()->first();
            $unitPrice = $defaultUnit ? ($defaultUnit->retail_price ?: $defaultUnit->base_price) : 0;
            
            if ($customer->user_type == UserType::Wholesaler->value && $defaultUnit && $defaultUnit->wholesale_price) $unitPrice = $defaultUnit->wholesale_price;
            elseif ($customer->user_type == UserType::Retailer->value && $defaultUnit && $defaultUnit->retail_price) $unitPrice = $defaultUnit->retail_price;

            $itemTotal = $item['quantity'] * $unitPrice;
            $totalPrice += $itemTotal;

            OrderItem::create([
                'order_id'          => $order->id,
                'product_id'        => $item['product_id'],
                'product_unit_id'   => $defaultUnit?->id,
                'quantity'          => $item['quantity'],
                'unit_total'        => $item['quantity'] * ($defaultUnit?->conversion_factor ?: 1),
                'unit_price'        => $unitPrice,
                'item_total'        => $itemTotal,
                'currency_id'       => 1,
                'exchange_rate'     => 1,
                'exchange_total'    => $itemTotal,
                'branch_id'         => $customer->branch_id,
                'notes'             => $item['notes'] ?? null,
            ]);
        }

        $order->update([
            'total_price'    => $totalPrice,
            'exchange_total' => $totalPrice,
            'final_amount'   => $totalPrice,
        ]);

        // Dispatch broadcast event for real-time update
        event(new OrderPlaced($order));

        // Redirect back allowing frontend to clear local storage
        return redirect()->route('customer.orders.show', $order->id)->with('success', 'تم إنشاء الطلب بنجاح! رقم الطلب: ' . $refNumber);
    }
}
