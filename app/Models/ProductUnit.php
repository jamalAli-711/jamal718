<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductUnit extends Model
{
    use HasFactory;

    protected $table = 'product_units';

    protected $fillable = [
        'product_id',
        'unit_id',
        'conversion_factor',
        'base_price',
        'wholesale_price',
        'retail_price',
        'is_default_sale',
        'branch_id',
    ];

    protected $casts = [
        'is_default_sale' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
