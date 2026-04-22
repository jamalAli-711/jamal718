<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RouteHistory extends Model
{
    use HasFactory;

    protected $table = 'route_history';

    protected $fillable = [
        'trip_id',
        'lat',
        'lon',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'recorded_at' => 'datetime',
        ];
    }

    /**
     * الرحلة المرتبطة بنقطة المسار
     */
    public function trip()
    {
        return $this->belongsTo(DeliveryTrip::class, 'trip_id');
    }
}
