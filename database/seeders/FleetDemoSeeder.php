<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OrderQueue;

class FleetDemoSeeder extends Seeder
{
    public function run(): void
    {
        $orders = OrderQueue::where('order_status', 1)->take(10)->get();
        foreach ($orders as $idx => $order) {
            $order->update([
                'shipping_lat' => 15.35 + ($idx * 0.005),
                'shipping_lon' => 44.20 + ($idx * 0.005),
            ]);
        }
        echo "Successfully updated " . $orders->count() . " pending orders with coordinates.\n";
    }
}
