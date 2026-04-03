<?php

namespace App\Enums;

enum UserType: int
{
    case Admin        = 1;
    case Wholesaler   = 2;
    case Retailer     = 3;
    case Customer     = 4;
    case Sales        = 5;  // مبيعات
    case SalesManager = 6;  // ادارة المبيعات
    case Accountant   = 7;  // حسابات
    case SalesRep     = 8;  // مندوبين
    case Driver       = 9;  // السائقين
    case Distributor  = 10; // الموزعين

    /**
     * Arabic label for display
     */
    public function label(): string
    {
        return match ($this) {
            self::Admin        => 'مدير النظام',
            self::Wholesaler   => 'تاجر جملة',
            self::Retailer     => 'تاجر تجزئة',
            self::Customer     => 'عميل',
            self::Sales        => 'مبيعات',
            self::SalesManager => 'إدارة المبيعات',
            self::Accountant   => 'حسابات',
            self::SalesRep     => 'مندوبين',
            self::Driver       => 'سائق',
            self::Distributor  => 'موزع',
        };
    }

    /**
     * Key name (for frontend compatibility)
     */
    public function key(): string
    {
        return match ($this) {
            self::Admin        => 'Admin',
            self::Wholesaler   => 'Wholesaler',
            self::Retailer     => 'Retailer',
            self::Customer     => 'Customer',
            self::Sales        => 'Sales',
            self::SalesManager => 'SalesManager',
            self::Accountant   => 'Accountant',
            self::SalesRep     => 'SalesRep',
            self::Driver       => 'Driver',
            self::Distributor  => 'Distributor',
        };
    }
}
