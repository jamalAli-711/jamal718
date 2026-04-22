<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\FleetStatus;

class FleetManagement extends Model
{
    use HasFactory;

    protected $table = 'fleet_management';

    protected $fillable = [
        'truck_number',
        'driver_id',
        'gps_device_id',
        'current_lat',
        'current_lon',
        'speed',
        'status',
        'last_update',
    ];

    protected function casts(): array
    {
        return [
            'status' => FleetStatus::class,
            'last_update' => 'datetime',
        ];
    }

    /**
     * السائق المرتبط بالشاحنة
     */
    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * الرحلات التي قامت بها هذه الشاحنة
     */
    public function trips()
    {
        return $this->hasMany(DeliveryTrip::class, 'truck_id');
    }
}
