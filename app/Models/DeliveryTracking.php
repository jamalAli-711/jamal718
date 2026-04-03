<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DeliveryTracking extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'delivery_tracking';

    protected $fillable = [
        'order_id',
        'driver_name',
        'current_lat',
        'current_lon',
        'estimated_arrival',
        'status',
        'branch_id',
    ];

    protected $casts = [
        'estimated_arrival' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(OrderQueue::class, 'order_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
