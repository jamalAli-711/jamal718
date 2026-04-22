<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\OrderStatus;

class OrderQueue extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'orders_queue';

    protected function casts(): array
    {
        return [
            'order_status' => OrderStatus::class,
        ];
    }

    protected $fillable = [
        'reference_number',
        'customer_id',
        'order_status',
        'total_price',
        'currency_id',
        'exchange_rate',
        'exchange_total',
        'final_amount',
        'shipping_lat',
        'shipping_lon',
        'branch_id',
        'notes',
        'admin_note',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function deliveryTracking()
    {
        return $this->hasOne(DeliveryTracking::class, 'order_id');
    }

    /**
     * رحلات التوصيل المرتبطة بهذا الطلب
     */
    public function deliveryTrips()
    {
        return $this->hasMany(DeliveryTrip::class, 'order_id');
    }
}
