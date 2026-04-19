<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\CustomerReplenishmentSetting;
use App\Models\Branch;
use App\Models\Product;
use App\Models\User;
use App\Enums\UserType;
use Inertia\Inertia;
use Carbon\Carbon;

class ReplenishmentController extends Controller
{
    public function index(Request $request)
    {
        $customers = User::whereIn('user_type', [UserType::Wholesaler, UserType::Retailer, UserType::Customer])
            ->whereHas('replenishmentSettings')
            ->with(['replenishmentSettings.product', 'branch'])
            ->when($request->branch_id, function($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            })
            ->orderBy('name', 'asc')
            ->paginate(15);

        return Inertia::render('Replenishment/Index', [
            'customerGroups' => $customers,
            'customers' => User::whereIn('user_type', [UserType::Wholesaler, UserType::Retailer, UserType::Customer])->get(['id', 'name', 'branch_id']),
            'products' => Product::all(['id', 'name']),
            'branches' => Branch::all(['id', 'branch_name']),
            'filters' => $request->only(['branch_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
            'reorder_cycle_days' => 'required|integer|min:1',
            'alert_threshold_days' => 'required|integer|min:0',
            'minimum_stock_level' => 'nullable|integer',
            'preferred_quantity' => 'nullable|integer',
        ]);

        CustomerReplenishmentSetting::create($validated);

        return back()->with('success', 'تم إضافة إعداد التوريد بنجاح');
    }

    public function update(Request $request, CustomerReplenishmentSetting $replenishment)
    {
        $validated = $request->validate([
            'reorder_cycle_days' => 'required|integer|min:1',
            'alert_threshold_days' => 'required|integer|min:0',
            'minimum_stock_level' => 'nullable|integer',
            'preferred_quantity' => 'nullable|integer',
            'is_active' => 'required|boolean',
        ]);

        $replenishment->update($validated);

        return back()->with('success', 'تم تحديث الإعدادات بنجاح');
    }

    public function destroy(CustomerReplenishmentSetting $replenishment)
    {
        $replenishment->delete();
        return back()->with('success', 'تم حذف الإعداد بنجاح');
    }

    public function report(Request $request)
    {
        $query = CustomerReplenishmentSetting::with(['customer.branch', 'product'])
            ->where('is_active', true);

        if ($request->branch_id) {
            $query->whereHas('customer', function($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            });
        }

        // We fetch all initially to calculate totals and status
        $allPredictions = $query->orderBy('next_expected_date', 'asc')->get()
            ->map(function($item) {
                $daysLeft = now()->startOfDay()->diffInDays(Carbon::parse($item->next_expected_date)->startOfDay(), false);
                $item->days_left = $daysLeft;
                
                // Color coding logic based on user-defined threshold
                if ($daysLeft < 0) {
                    $item->status_color = 'rose';   // Overdue
                    $item->is_due = true;
                } elseif ($daysLeft <= $item->alert_threshold_days) {
                    $item->status_color = 'red'; // Urgent (Threshold reached)
                    $item->is_due = true;
                } elseif ($daysLeft <= ($item->alert_threshold_days + 5)) {
                    $item->status_color = 'amber'; // Upcoming
                    $item->is_due = false;
                } else {
                    $item->status_color = 'emerald';           // Safe
                    $item->is_due = false;
                }

                return $item;
            });

        // Filter for specific product if requested
        $predictions = $allPredictions;
        if ($request->product_id) {
            $predictions = $allPredictions->where('product_id', $request->product_id)
                ->where('is_due', true); // Only due customers for this product as per "Current Market Demand" request
        }

        // Calculate total expected quantity for due items (global or filtered)
        $totalExpectedQuantity = ($request->product_id) 
            ? $predictions->sum('preferred_quantity')
            : $allPredictions->where('is_due', true)->sum('preferred_quantity');

        // Fetch products that exist in settings for the filter
        $productsInSettings = CustomerReplenishmentSetting::with('product')
            ->select('product_id')
            ->groupBy('product_id')
            ->get()
            ->map(function($setting) {
                return $setting->product;
            })
            ->filter();

        return Inertia::render('Replenishment/Report', [
            'predictions' => $predictions->values(), // values() to reset keys after filter
            'branches' => Branch::all(['id', 'branch_name']),
            'products' => $productsInSettings,
            'totalExpectedQuantity' => $totalExpectedQuantity,
            'filters' => $request->only(['branch_id', 'product_id']),
        ]);
    }
}
