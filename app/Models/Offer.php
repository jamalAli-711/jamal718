<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Offer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'is_active',
        'image_path',
        'offer_type',
        'target_product_id',
        'min_purchase_qty',
        'min_qty_to_achieve',
        'quantity_limit',
        'discount_value',
        'bonus_qty',
        'bonus_product_id',
        'bonus_unit_id',
        'is_cumulative',
        'start_date',
        'end_date',
        'branch_id',
        'user_type',
        'apply_coupon',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_cumulative' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'discount_value' => 'decimal:4',
        'min_purchase_qty' => 'integer',
        'min_qty_to_achieve' => 'integer',
        'quantity_limit' => 'integer',
        'bonus_qty' => 'integer',
    ];

    /**
     * Get the product that must be purchased to activate the offer.
     */
    public function targetProduct()
    {
        return $this->belongsTo(Product::class, 'target_product_id');
    }

    /**
     * Get the bonus product given in the offer.
     */
    public function bonusProduct()
    {
        return $this->belongsTo(Product::class, 'bonus_product_id');
    }

    /**
     * Get the unit of the bonus product.
     */
    public function bonusUnit()
    {
        return $this->belongsTo(Unit::class, 'bonus_unit_id');
    }

    /**
     * Get the branch the offer belongs to.
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
