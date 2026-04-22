<?php

namespace App\Enums;

enum FleetStatus: string
{
    case Active      = 'Active';
    case Maintenance = 'Maintenance';
    case Idle        = 'Idle';

    public function label(): string
    {
        return match ($this) {
            self::Active      => 'نشط',
            self::Maintenance => 'صيانة',
            self::Idle        => 'متوقف',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Active      => 'green',
            self::Maintenance => 'amber',
            self::Idle        => 'gray',
        };
    }
}
