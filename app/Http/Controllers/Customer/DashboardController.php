<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\OrderQueue;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        $recentOrders = OrderQueue::where('customer_id', $user->id)
            ->with(['orderItems.product'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $stats = [
            'total_orders' => OrderQueue::where('customer_id', $user->id)->count(),
            'pending_orders' => OrderQueue::where('customer_id', $user->id)
                                          ->where('order_status', \App\Enums\OrderStatus::Pending)
                                          ->count(),
            'total_spent' => OrderQueue::where('customer_id', $user->id)
                                       ->where('order_status', \App\Enums\OrderStatus::Delivered)
                                       ->sum('final_amount')
        ];

        return Inertia::render('Customer/Dashboard', [
            'recentOrders' => $recentOrders,
            'stats' => $stats
        ]);
    }
}
