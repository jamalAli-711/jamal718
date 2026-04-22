<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\TripStatus;

class DeliveryTrip extends Model
{
    use HasFactory;

    protected $table = 'delivery_trips';

    protected $fillable = [
        'trip_code',
        'truck_id',
        'order_id',
        'customer_id',
        'delivery_sequence',
        'target_lat',
        'target_lon',
        'estimated_arrival',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => TripStatus::class,
            'estimated_arrival' => 'datetime',
        ];
    }

    /**
     * الشاحنة المكلفة بالرحلة
     */
    public function truck()
    {
        return $this->belongsTo(FleetManagement::class, 'truck_id');
    }

    /**
     * الطلب المرتبط بالرحلة
     */
    public function order()
    {
        return $this->belongsTo(OrderQueue::class, 'order_id');
    }

    /**
     * العميل المستلم للطلب
     */
    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * السجل التاريخي للمسار خلال الرحلة
     */
    public function routeHistory()
    {
        return $this->hasMany(RouteHistory::class, 'trip_id');
    }
}
