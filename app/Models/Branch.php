<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'branches';

    protected $fillable = [
        'branch_name',
        'location_city',
        'manager_name',
        'branch_lat',
        'branch_lon',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function locations()
    {
        return $this->hasMany(Location::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class)->withPivot('stock_quantity')->withTimestamps();
    }

    public function productUnits()
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

    public function customerNotifications()
    {
        return $this->hasMany(CustomerNotification::class);
    }

    public function orders()
    {
        return $this->hasMany(OrderQueue::class, 'branch_id');
    }

    public function currencies()
    {
        return $this->hasMany(Currency::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }
}
