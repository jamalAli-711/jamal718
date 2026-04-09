<?php

namespace App\Http\Controllers;

use App\Models\Currency;
use App\Models\Branch;
use Illuminate\Http\Request;

use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CurrenciesController extends Controller
{
    public function index()
    {
        $currencies = Currency::with('branch')->orderBy('id', 'desc')->get();
        $branches = Branch::all();

        return Inertia::render('Currencies/Index', [
            'currencies' => $currencies,
            'branches' => $branches
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'currency_name' => 'required|string|max:50',
            'currency_code_en' => 'required|string|max:10',
            'currency_code_ar' => 'required|string|max:10',
            'exchange_rate' => 'required|numeric|min:0.0001',
            'branch_id' => 'nullable|exists:branches,id',
            'is_default' => 'boolean'
        ]);


        DB::transaction(function () use ($validated) {
            if (!empty($validated['is_default'])) {
                Currency::where('id', '>', 0)->update(['is_default' => false]);
            }

            Currency::create([
                'currency_name' => $validated['currency_name'],
                'currency_code_en' => $validated['currency_code_en'],
                'currency_code_ar' => $validated['currency_code_ar'],
                'exchange_rate' => $validated['exchange_rate'],
                'branch_id' => $validated['branch_id'],
                'is_default' => $validated['is_default'] ?? false,
                'updated_by' => auth()->id(),
            ]);

        });

        return redirect()->back()->with('success', 'تم إضافة العملة بنجاح.');
    }

    public function update(Request $request, Currency $currency)
    {
        $validated = $request->validate([
            'currency_name' => 'required|string|max:50',
            'currency_code_en' => 'required|string|max:10',
            'currency_code_ar' => 'required|string|max:10',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $currency->update([
            'currency_name' => $validated['currency_name'],
            'currency_code_en' => $validated['currency_code_en'],
            'currency_code_ar' => $validated['currency_code_ar'],
            'branch_id' => $validated['branch_id'],
            'updated_by' => auth()->id(),
        ]);


        return redirect()->back()->with('success', 'تم تحديث بيانات العملة.');
    }

    // Special controller method for quick rate and default update
    public function updateRate(Request $request, Currency $currency)
    {
        $validated = $request->validate([
            'exchange_rate' => 'required|numeric|min:0.0001',
            'is_default' => 'boolean'
        ]);

        DB::transaction(function () use ($validated, $currency) {
            if (!empty($validated['is_default'])) {
                Currency::where('id', '!=', $currency->id)->update(['is_default' => false]);
            }

            // Fallback safety: If this is the only default being set to false manually, don't allow it without setting another default first, or just accept. It's usually better to just accept or enforce via UI.
            
            $currency->update([
                'exchange_rate' => $validated['exchange_rate'],
                'is_default' => $validated['is_default'] ?? false,
                'updated_by' => auth()->id(),
            ]);
        });

        return redirect()->back()->with('success', 'تم تحديث السعر والإعدادات للعملة.');
    }

    public function destroy(Currency $currency)
    {
        if ($currency->is_default) {
            return redirect()->back()->with('error', 'لا يمكن حذف العملة الافتراضية للنظام.');
        }

        $currency->delete();

        return redirect()->back()->with('success', 'تم حذف العملة.');
    }
}
