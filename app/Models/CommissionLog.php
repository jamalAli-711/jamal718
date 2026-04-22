<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommissionLog extends Model
{
    use HasFactory;

    protected $table = 'commissions_log';

    protected $fillable = [
        'agent_id', 
        'order_id', 
        'order_total', 
        'commission_amount', 
        'commission_rate', 
        'payment_status', 
        'paid_at'
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function order()
    {
        return $this->belongsTo(OrderQueue::class, 'order_id');
    }
}
