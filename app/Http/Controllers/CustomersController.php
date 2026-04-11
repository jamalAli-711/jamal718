<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Branch;
use App\Models\OrderQueue;
use App\Models\Currency;
use App\Enums\UserType;
use App\Enums\OrderStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CustomersController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $request->input('branch_id');

        // 1. Get Default Currency for calculation
        $defaultCurrency = Currency::where('is_default', true)->first() ?? Currency::first();
        $defaultRate = $defaultCurrency ? $defaultCurrency->exchange_rate : 1;

        // 2. Base Query for Customers
        $customersQuery = User::whereIn('user_type', [UserType::Wholesaler, UserType::Retailer, UserType::Customer])
            ->with(['branch']);

        if ($branchId) {
            $customersQuery->where('branch_id', $branchId);
        }

        // 3. Stats Calculation (Filtered by branch if applicable)
        $ordersQuery = OrderQueue::where('order_status', '!=', OrderStatus::Rejected);
        if ($branchId) {
            $ordersQuery->where('branch_id', $branchId);
        }

        $totalOrdersCount = (clone $ordersQuery)->count();
        
        // Summing exchange_total and converting to default currency
        // Converted = exchange_total / default_rate
        $totalSalesExchange = (clone $ordersQuery)->sum('exchange_total');
        $totalSalesConverted = $defaultRate > 0 ? ($totalSalesExchange / $defaultRate) : $totalSalesExchange;

        $stats = [
            'total_sales'      => number_format($totalSalesConverted, 2),
            'total_orders'     => $totalOrdersCount,
            'total_customers'  => (clone $customersQuery)->count(),
            'currency_symbol'  => $defaultCurrency->currency_code_ar,
        ];

        // 4. Fetch Customers with summarized data
        $customers = $customersQuery
            ->withCount(['orders' => function($q) {
                $q->where('order_status', '!=', OrderStatus::Rejected);
            }])
            ->get()
            ->map(function($customer) use ($defaultRate) {
                // Calculate total spent for this customer (in default currency)
                $spentExchange = $customer->orders()
                    ->where('order_status', '!=', OrderStatus::Rejected)
                    ->sum('exchange_total');
                
                $customer->total_spent = $defaultRate > 0 ? ($spentExchange / $defaultRate) : $spentExchange;
                $customer->user_type_label = $customer->user_type->label();
                return $customer;
            });

        $branches = Branch::select('id', 'branch_name')->get();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'stats'     => $stats,
            'branches'  => $branches,
            'filters'   => [
                'branch_id' => $branchId
            ]
        ]);
    }

    public function show(User $customer)
    {
        $customer->load(['branch', 'orders.orderItems.product', 'orders.orderItems.productUnit.unit', 'orders.orderItems.currency', 'orders.currency', 'orders.branch']);

        $defaultCurrency = Currency::where('is_default', true)->first() ?? Currency::first();
        $defaultRate = $defaultCurrency ? $defaultCurrency->exchange_rate : 1;

        $orders = $customer->orders()
            ->with(['orderItems.product', 'orderItems.productUnit.unit', 'orderItems.currency', 'branch', 'currency'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($order) use ($defaultRate) {
                $order->status_label = $order->order_status->label();
                $order->status_color = $order->order_status->color();
                // Converted total for the list
                $order->converted_total = $defaultRate > 0 ? ($order->exchange_total / $defaultRate) : $order->exchange_total;
                return $order;
            });

        // Totals for this specific customer
        $totalSpentExchange = $customer->orders()
            ->where('order_status', '!=', OrderStatus::Rejected)
            ->sum('exchange_total');
        
        $stats = [
            'total_spent'     => number_format($defaultRate > 0 ? ($totalSpentExchange / $defaultRate) : $totalSpentExchange, 2),
            'orders_count'    => $customer->orders()->count(),
            'currency_symbol' => $defaultCurrency->currency_code_ar
        ];

        $statusOptions = collect(OrderStatus::cases())->map(fn($status) => [
            'value' => $status->value,
            'label' => $status->label(),
            'color' => $status->color(),
        ]);

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
            'orders'   => $orders,
            'stats'    => $stats,
            'default_currency' => $defaultCurrency,
            'status_options' => $statusOptions
        ]);
    }
}
