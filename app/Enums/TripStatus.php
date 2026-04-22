<?php

namespace App\Enums;

enum TripStatus: string
{
    case Waiting   = 'Waiting';
    case OnWay     = 'On_Way';
    case Delivered = 'Delivered';

    public function label(): string
    {
        return match ($this) {
            self::Waiting   => 'في الانتظار',
            self::OnWay     => 'في الطريق',
            self::Delivered => 'تم التوصيل',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Waiting   => 'amber',
            self::OnWay     => 'blue',
            self::Delivered => 'green',
        };
    }
}
