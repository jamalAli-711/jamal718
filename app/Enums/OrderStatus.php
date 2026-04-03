<?php

namespace App\Enums;

enum OrderStatus: int
{
    case Pending        = 1;
    case Processing     = 2;
    case OutForDelivery = 3;
    case Delivered      = 4;
    case Rejected       = 5;

    /**
     * Arabic label for display
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending        => 'معلق',
            self::Processing     => 'قيد التجهيز',
            self::OutForDelivery => 'في الطريق',
            self::Delivered      => 'تم التسليم',
            self::Rejected       => 'مرفوض',
        };
    }

    /**
     * Key name (for frontend compatibility)
     */
    public function key(): string
    {
        return match ($this) {
            self::Pending        => 'Pending',
            self::Processing     => 'Processing',
            self::OutForDelivery => 'Out_for_Delivery',
            self::Delivered      => 'Delivered',
            self::Rejected       => 'Rejected',
        };
    }

    /**
     * Badge color for UI
     */
    public function color(): string
    {
        return match ($this) {
            self::Pending        => 'amber',
            self::Processing     => 'blue',
            self::OutForDelivery => 'purple',
            self::Delivered      => 'green',
            self::Rejected       => 'red',
        };
    }
}
