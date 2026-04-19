<?php

namespace App\Observers;

use App\Models\OrderQueue;
use App\Enums\OrderStatus;
use App\Models\CustomerReplenishmentSetting;

class OrderQueueObserver
{
    /**
     * Handle the OrderQueue "created" event.
     */
    public function created(OrderQueue $orderQueue): void
    {
        // Immediately update replenishment when a customer places an order (Pending)
        // or when an order starts being processed.
        if ($orderQueue->order_status === OrderStatus::Pending || 
            $orderQueue->order_status === OrderStatus::Processing || 
            $orderQueue->order_status === OrderStatus::Delivered) {
            $this->updateReplenishment($orderQueue);
        }
    }

    /**
     * Handle the OrderQueue "updated" event.
     */
    public function updated(OrderQueue $orderQueue): void
    {
        // Only update when transitioning to a fulfilled state (Processing starts the cycle)
        if ($orderQueue->isDirty('order_status') && 
            ($orderQueue->order_status === OrderStatus::Processing || $orderQueue->order_status === OrderStatus::Delivered)) {
            $this->updateReplenishment($orderQueue);
        }
    }

    protected function updateReplenishment(OrderQueue $order): void
    {
        $order->loadMissing('orderItems');
        
        foreach ($order->orderItems as $item) {
            $setting = CustomerReplenishmentSetting::where('customer_id', $order->customer_id)
                ->where('product_id', $item->product_id)
                ->where('is_active', true)
                ->first();

            if ($setting) {
                // Calculation: Next Expected = Today + Cycle Days
                $setting->updateNextDate(now());
            }
        }
    }
}
