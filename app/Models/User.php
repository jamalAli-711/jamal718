<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Enums\UserType;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'user_type',
        'phone',
        'address_desc',
        'avatar',
        'branch_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'user_type' => UserType::class,
        ];
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function locations()
    {
        return $this->hasMany(Location::class);
    }

    public function fieldInventories()
    {
        return $this->hasMany(FieldInventory::class, 'distributor_id');
    }

    public function customerNotifications()
    {
        return $this->hasMany(CustomerNotification::class);
    }

    public function orders()
    {
        return $this->hasMany(OrderQueue::class, 'customer_id');
    }

    public function replenishmentSettings()
    {
        return $this->hasMany(CustomerReplenishmentSetting::class, 'customer_id');
    }

    /**
     * الشاحنات المرتبطة بهذا المستخدم (إذا كان سائقاً)
     */
    public function trucks()
    {
        return $this->hasMany(FleetManagement::class, 'driver_id');
    }

    /**
     * رحلات التوصيل المرتبطة بهذا المستخدم (كعميل)
     */
    public function deliveryTrips()
    {
        return $this->hasMany(DeliveryTrip::class, 'customer_id');
    }

    /**
     * الزبائن التابعين لهذا المندوب
     */
    public function customers()
    {
        return $this->belongsToMany(User::class, 'agent_customers', 'agent_id', 'customer_id');
    }

    /**
     * المندوبين المسؤولين عن هذا الزبون
     */
    public function agents()
    {
        return $this->belongsToMany(User::class, 'agent_customers', 'customer_id', 'agent_id');
    }
}
