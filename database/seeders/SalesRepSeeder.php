<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SalesRepSeeder extends Seeder
{
    public function run(): void
    {
        $reps = [
            ['name' => 'محمد العبسي', 'email' => 'alabsi@maklfih.test', 'phone' => '771234001'],
            ['name' => 'أحمد الشرجبي', 'email' => 'sharjabi@maklfih.test', 'phone' => '771234002'],
            ['name' => 'عبدالله بانافع', 'email' => 'banafea@maklfih.test', 'phone' => '771234003'],
        ];

        foreach ($reps as $rep) {
            User::firstOrCreate(
                ['email' => $rep['email']],
                [
                    'name'      => $rep['name'],
                    'phone'     => $rep['phone'],
                    'password'  => Hash::make('password'),
                    'user_type' => 8, // SalesRep
                ]
            );
        }

        echo "Created " . count($reps) . " sales representatives successfully.\n";
    }
}
