<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchesController extends Controller
{
    public function index()
    {
        $branches = Branch::withCount(['users', 'products', 'orders'])->get();

        return Inertia::render('Branches/Index', [
            'branches' => $branches,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_name'   => 'required|string|max:100',
            'location_city' => 'required|string|max:50',
            'manager_name'  => 'nullable|string|max:100',
            'branch_lat'    => 'nullable|numeric|between:-90,90',
            'branch_lon'    => 'nullable|numeric|between:-180,180',
        ]);

        Branch::create($validated);

        return redirect()->back()->with('success', 'تم إضافة الفرع بنجاح');
    }

    public function update(Request $request, Branch $branch)
    {
        $validated = $request->validate([
            'branch_name'   => 'required|string|max:100',
            'location_city' => 'required|string|max:50',
            'manager_name'  => 'nullable|string|max:100',
            'branch_lat'    => 'nullable|numeric|between:-90,90',
            'branch_lon'    => 'nullable|numeric|between:-180,180',
        ]);

        $branch->update($validated);

        return redirect()->back()->with('success', 'تم تحديث بيانات الفرع');
    }

    public function destroy(Branch $branch)
    {
        if ($branch->users()->count() > 0 || $branch->products()->count() > 0) {
            return redirect()->back()->with('error', 'لا يمكن حذف فرع مرتبط بمستخدمين أو منتجات');
        }
        $branch->delete();
        return redirect()->back()->with('success', 'تم حذف الفرع');
    }
}
