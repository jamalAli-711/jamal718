<?php

namespace App\Http\Controllers;

use App\Models\OrderQueue;
use App\Models\Product;
use App\Models\User;
use App\Models\Branch;
use App\Enums\UserType;
use App\Enums\OrderStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'totalSales' => number_format(OrderQueue::where('order_status', OrderStatus::Delivered)->sum('final_amount')),
        ];

        $ordersCount = OrderQueue::whereIn('order_status', [OrderStatus::Pending, OrderStatus::Processing, OrderStatus::OutForDelivery])->count();
        $productsCount = Product::count();
        $customersCount = User::whereIn('user_type', [UserType::Wholesaler, UserType::Retailer, UserType::Customer])->count();

        $recentOrders = OrderQueue::with('customer')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $branches = Branch::withCount(['products', 'orders'])->get();

        return Inertia::render('Dashboard/Index', [
            'stats'          => $stats,
            'ordersCount'    => $ordersCount,
            'productsCount'  => $productsCount,
            'customersCount' => $customersCount,
            'recentOrders'   => $recentOrders,
            'branches'       => $branches,
        ]);
    }
}
