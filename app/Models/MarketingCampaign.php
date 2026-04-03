<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarketingCampaign extends Model
{
    use HasFactory;

    protected $table = 'marketing_campaigns';

    protected $fillable = [
        'campaign_source',
        'target_segment',
        'clicks_count',
        'conversions',
    ];
}
