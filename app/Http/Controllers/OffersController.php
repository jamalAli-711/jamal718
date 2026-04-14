<?php

namespace App\Http\Controllers;

use App\Models\Offer;
use App\Models\Product;
use App\Models\Branch;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OffersController extends Controller
{
    public function index()
    {
        $offers = Offer::with(['targetProduct', 'bonusProduct', 'bonusUnit', 'branch'])
            ->orderBy('created_at', 'desc')
            ->get();

        $products = Product::select('id', 'name')->get();
        $branches = Branch::select('id', 'branch_name')->get();
        $units = Unit::select('id', 'unit_name')->get();

        return Inertia::render('Offers/Index', [
            'offers'   => $offers,
            'products' => $products,
            'branches' => $branches,
            'units'    => $units,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'               => 'required|string|max:150',
            'is_active'           => 'boolean',
            'image_path'          => 'nullable|string|max:255',
            'offer_type'          => 'required|in:Percentage,Fixed_Amount,Free_Unit',
            'target_product_id'   => 'required|exists:products,id',
            'min_purchase_qty'    => 'required|integer|min:1',
            'min_qty_to_achieve'  => 'required|integer|min:1',
            'quantity_limit'      => 'nullable|integer|min:1',
            'discount_value'      => 'nullable|numeric',
            'bonus_qty'           => 'nullable|integer|min:1',
            'bonus_product_id'    => 'nullable|exists:products,id',
            'bonus_unit_id'       => 'nullable|exists:units,id',
            'is_cumulative'       => 'boolean',
            'start_date'          => 'nullable|date',
            'end_date'            => 'nullable|date|after_or_equal:start_date',
            'branch_id'           => 'required|exists:branches,id',
            'user_type'           => 'required|in:Wholesaler,Retailer,Distributor,End_User',
            'apply_coupon'        => 'nullable|string|max:20',
        ]);

        Offer::create($validated);

        return redirect()->back()->with('success', 'تم إنشاء العرض بنجاح');
    }

    public function update(Request $request, Offer $offer)
    {
        $validated = $request->validate([
            'title'               => 'required|string|max:150',
            'is_active'           => 'boolean',
            'image_path'          => 'nullable|string|max:255',
            'offer_type'          => 'required|in:Percentage,Fixed_Amount,Free_Unit',
            'target_product_id'   => 'required|exists:products,id',
            'min_purchase_qty'    => 'required|integer|min:1',
            'min_qty_to_achieve'  => 'required|integer|min:1',
            'quantity_limit'      => 'nullable|integer|min:1',
            'discount_value'      => 'nullable|numeric',
            'bonus_qty'           => 'nullable|integer|min:1',
            'bonus_product_id'    => 'nullable|exists:products,id',
            'bonus_unit_id'       => 'nullable|exists:units,id',
            'is_cumulative'       => 'boolean',
            'start_date'          => 'nullable|date',
            'end_date'            => 'nullable|date|after_or_equal:start_date',
            'branch_id'           => 'required|exists:branches,id',
            'user_type'           => 'required|in:Wholesaler,Retailer,Distributor,End_User',
            'apply_coupon'        => 'nullable|string|max:20',
        ]);

        $offer->update($validated);

        return redirect()->back()->with('success', 'تم تحديث العرض بنجاح');
    }

    public function destroy(Offer $offer)
    {
        $offer->delete();
        return redirect()->back()->with('success', 'تم حذف العرض بنجاح');
    }

    public function toggleActive(Offer $offer)
    {
        $offer->update(['is_active' => !$offer->is_active]);
        return redirect()->back()->with('success', 'تم تغيير حالة العرض');
    }
}
