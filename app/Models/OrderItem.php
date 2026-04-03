<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'order_items';

    protected $fillable = [
        'order_id',
        'product_id',
        'unit_id',
        'conversion_factor',
        'quantity',
        'unit_total',
        'free_bonus_units',
        'unit_price',
        'item_total',
        'currency_id',
        'exchange_rate',
        'exchange_total',
        'branch_id',
        'notes',
    ];

    public function order()
    {
        return $this->belongsTo(OrderQueue::class, 'order_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
