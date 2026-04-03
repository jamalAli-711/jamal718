<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasFactory;

    protected $table = 'currencies';

    protected $fillable = [
        'currency_name',
        'currency_code',
        'exchange_rate',
        'last_updated',
        'branch_id',
    ];

    protected $casts = [
        'last_updated' => 'datetime',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function orders()
    {
        return $this->hasMany(OrderQueue::class);
    }
}
