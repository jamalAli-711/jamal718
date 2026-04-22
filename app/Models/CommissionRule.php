<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommissionRule extends Model
{
    use HasFactory;

    protected $fillable = ['rule_name', 'target_type', 'target_id', 'commission_percentage', 'is_active'];

    public function target()
    {
        if ($this->target_type === 'product') {
            return $this->belongsTo(Product::class, 'target_id');
        } elseif ($this->target_type === 'category') {
            return $this->belongsTo(Category::class, 'target_id');
        }
        return null;
    }
}
