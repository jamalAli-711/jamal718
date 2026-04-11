<?php

namespace App\Http\Controllers;

use App\Models\OrderQueue;
use App\Models\Product;
use App\Models\User;
use App\Models\Branch;
use App\Models\Currency;
use App\Enums\UserType;
use App\Enums\OrderStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $defaultCurrency = Currency::where('is_default', true)->first();
        $currencySymbol = $defaultCurrency ? $defaultCurrency->currency_code_ar : 'ر.ي';

        $stats = [
            'totalSales' => number_format(OrderQueue::where('order_status', OrderStatus::Delivered)->sum('final_amount'), 2),
            'currency_symbol' => $currencySymbol
        ];

        $ordersCount = OrderQueue::whereIn('order_status', [OrderStatus::Pending, OrderStatus::Processing, OrderStatus::OutForDelivery])->count();
        $productsCount = Product::count();
        $customersCount = User::whereIn('user_type', [UserType::Wholesaler, UserType::Retailer, UserType::Customer])->count();

        $recentOrders = OrderQueue::with('customer')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Branches with total sales and marker data
        $branches = Branch::all()->map(function($branch) {
            return [
                'id' => $branch->id,
                'branch_name' => $branch->branch_name,
                'branch_lat' => $branch->branch_lat,
                'branch_lon' => $branch->branch_lon,
                'products_count' => $branch->products()->count(),
                'orders_count' => $branch->orders()->count(),
                'total_sales' => number_format($branch->orders()->where('order_status', OrderStatus::Delivered)->sum('final_amount'), 2),
                'location_city' => $branch->location_city,
                'manager_name' => $branch->manager_name,
            ];
        });

        // Customers with latest locations and stats for the map
        $customers = User::whereIn('user_type', [UserType::Wholesaler, UserType::Retailer, UserType::Customer])
            ->with(['locations' => fn($q) => $q->latest()])
            ->get()
            ->map(function($user) {
                $loc = $user->locations->first();
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'user_type' => $user->user_type->value,
                    'user_type_label' => $user->user_type->label(),
                    'branch_id' => $user->branch_id,
                    'orders_count' => $user->orders()->count(),
                    'total_spent' => number_format($user->orders()->sum('final_amount'), 2),
                    'lat' => $loc?->latitude,
                    'lng' => $loc?->longitude,
                ];
            })
            ->filter(fn($c) => $c['lat'] && $c['lng'])
            ->values();

        return Inertia::render('Dashboard/Index', [
            'stats'          => $stats,
            'ordersCount'    => $ordersCount,
            'productsCount'  => $productsCount,
            'customersCount' => $customersCount,
            'recentOrders'   => $recentOrders,
            'branches'       => $branches,
            'customers'      => $customers,
        ]);
    }
}
