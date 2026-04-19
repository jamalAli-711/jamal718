<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Models\CustomerReplenishmentSetting;
use App\Models\CustomerNotification;
use App\Models\User;
use App\Enums\UserType;
use Carbon\Carbon;

class SendReplenishmentAlerts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'replenishment:daily-alerts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send morning alerts to salesman and branch managers for upcoming expected orders.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Logic: Send alert if Today >= (NextExpectedDate - AlertThresholdDays)
        $upcoming = CustomerReplenishmentSetting::where('is_active', true)
            ->whereRaw('DATE_SUB(next_expected_date, INTERVAL alert_threshold_days DAY) <= ?', [now()->startOfDay()])
            ->where('next_expected_date', '>=', now()->startOfDay()) // Avoid re-alerting for very old overdue if desired, or keep to show overdue
            ->with(['customer.branch', 'product'])
            ->get();

        if ($upcoming->isEmpty()) {
            $this->info('No replenishment alerts for today.');
            return;
        }

        foreach ($upcoming as $setting) {
            $customerName = $setting->customer->name;
            $productName = $setting->product->name;
            $expectDate = $setting->next_expected_date->format('Y-m-d');
            
            $title = 'تنبيه: تحصيل متوقع';
            $message = "العميل ({$customerName}) يتوقع طلبه لمنتج ({$productName}) بتاريخ {$expectDate}. يرجى التواصل معه.";

            // Find Sales Reps and Managers for this branch to notify
            $staffToNotify = User::where('branch_id', $setting->customer->branch_id)
                ->whereIn('user_type', [UserType::SalesManager, UserType::SalesRep, UserType::Admin])
                ->get();

            foreach ($staffToNotify as $staff) {
                CustomerNotification::create([
                    'user_id' => $staff->id,
                    'title' => $title,
                    'message' => $message,
                    'type' => 4, // 4 = Replenishment Alert
                    'branch_id' => $staff->branch_id,
                ]);
            }
        }

        $this->info("Sent alerts for {$upcoming->count()} replenishment items.");
    }
}
