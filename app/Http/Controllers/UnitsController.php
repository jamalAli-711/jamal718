<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnitsController extends Controller
{
    public function index()
    {
        $units = Unit::all();

        return Inertia::render('Units/Index', [
            'units' => $units,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_name'  => 'required|string|max:50',
            'short_name' => 'required|string|max:10',
        ]);

        Unit::create($validated);

        return redirect()->back()->with('success', 'تم إضافة الوحدة بنجاح.');
    }

    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'unit_name'  => 'required|string|max:50',
            'short_name' => 'required|string|max:10',
        ]);

        $unit->update($validated);

        return redirect()->back()->with('success', 'تم تعديل الوحدة بنجاح.');
    }

    public function destroy(Unit $unit)
    {
        $unit->delete();

        return redirect()->back()->with('success', 'تم حذف الوحدة.');
    }
}
