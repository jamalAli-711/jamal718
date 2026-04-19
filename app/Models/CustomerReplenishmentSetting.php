<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerReplenishmentSetting extends Model
{
    protected $fillable = [
        'customer_id',
        'product_id',
        'reorder_cycle_days',
        'alert_threshold_days',
        'minimum_stock_level',
        'last_fulfilled_date',
        'next_expected_date',
        'preferred_quantity',
        'is_active'
    ];

    protected $casts = [
        'last_fulfilled_date' => 'date',
        'next_expected_date' => 'date',
        'is_active' => 'boolean'
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calculate and update the next expected date based on last fulfillment.
     */
    public function updateNextDate($lastDate = null)
    {
        $lastDate = $lastDate ?: now();
        $this->update([
            'last_fulfilled_date' => $lastDate,
            'next_expected_date' => $lastDate->copy()->addDays($this->reorder_cycle_days)
        ]);
    }
}
