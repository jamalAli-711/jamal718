<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoriesController extends Controller
{
    public function index()
    {
        $categories = Category::with('branch')->get();
        $branches = Branch::all();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'branches' => $branches,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_name' => 'required|string|max:100',
            'description'   => 'nullable|string',
            'branch_id'     => 'nullable|exists:branches,id',
        ]);

        Category::create($validated);

        return redirect()->back()->with('success', 'تم إضافة الفئة بنجاح.');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'category_name' => 'required|string|max:100',
            'description'   => 'nullable|string',
            'branch_id'     => 'nullable|exists:branches,id',
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'تم تعديل الفئة بنجاح.');
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->back()->with('success', 'تم حذف الفئة.');
    }
}
