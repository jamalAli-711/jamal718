<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'products';

    protected $fillable = [
        'sku',
        'name',
        'official_price',
        'wholesale_price',
        'retail_price',
        'category_id',
    ];

    protected $appends = ['thumbnail'];

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    /**
     * Get the primary image URL or a placeholder.
     */
    public function getThumbnailAttribute()
    {
        $primary = $this->images->where('is_primary', true)->first() ?: $this->images->first();
        return $primary ? "/storage/{$primary->image_path}" : null;
    }

    public function branches()
    {
        return $this->belongsToMany(Branch::class)->withPivot('stock_quantity')->withTimestamps();
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function units()
    {
        return $this->hasMany(ProductUnit::class);
    }

    public function fieldInventories()
    {
        return $this->hasMany(FieldInventory::class);
    }

    public function pricingRules()
    {
        return $this->hasMany(PricingRule::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
