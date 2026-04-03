<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FieldInventory extends Model
{
    use HasFactory;

    protected $table = 'field_inventory';

    protected $fillable = [
        'distributor_id',
        'product_id',
        'current_stock',
        'last_update',
        'branch_id',
    ];

    protected $casts = [
        'last_update' => 'datetime',
    ];

    public function distributor()
    {
        return $this->belongsTo(User::class, 'distributor_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
