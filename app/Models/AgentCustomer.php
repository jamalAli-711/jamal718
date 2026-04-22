<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentCustomer extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = ['agent_id', 'customer_id'];

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }
}
