<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Category;
use App\Models\Unit;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        $products = Product::with(['units.unit', 'category', 'branches', 'images'])
            ->withSum('branches as total_stock', 'branch_product.stock_quantity')
            ->orderBy('id', 'desc')
            ->paginate(20);

        $defaultCurrency = \App\Models\Currency::where('is_default', true)->first() ?? \App\Models\Currency::first();
        $totalStockValValue = 0;
        foreach ($products->items() as $p) {
            $defaultUnit = $p->units->where('is_default_sale', true)->first() ?? $p->units->first();
            if ($defaultUnit) {
                $price = ($defaultUnit->retail_price > 0) ? $defaultUnit->retail_price : $defaultUnit->base_price;
                // Get unit currency
                $unitCurrency = \App\Models\Currency::find($defaultUnit->currency_id) ?? $defaultCurrency;
                // Convert to default currency (Target)
                // ConvertedValue = Price * (SourceRate / TargetRate)
                $convertedPrice = $price * ($unitCurrency->exchange_rate / $defaultCurrency->exchange_rate);
                $totalStockValValue += ($p->total_stock * $convertedPrice);
            }
        }

        $stats = [
            'total_products' => Product::count(),
            'low_stock'      => Product::whereDoesntHave('branches')->count(),
            'total_value'    => number_format($totalStockValValue),
            'currency_symbol'=> $defaultCurrency->currency_code_ar
        ];

        $units = Unit::select('id', 'unit_name', 'short_name')->get();
        $categories = Category::select('id', 'category_name')->get();
        $branches = Branch::select('id', 'branch_name')->get();
        $currencies = \App\Models\Currency::select('id', 'currency_name', 'currency_code_en', 'currency_code_ar', 'exchange_rate', 'is_default')->get();

        return Inertia::render('Inventory/Index', [
            'products'   => $products,
            'stats'      => $stats,
            'units'      => $units,
            'categories' => $categories,
            'branches'   => $branches,
            'currencies' => $currencies,
            'default_currency' => $defaultCurrency,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku'             => 'required|string|unique:products,sku',
            'name'            => 'required|string|max:255',
            'category_id'     => 'nullable|exists:categories,id',
            'images'          => 'nullable|array',
            'images.*'        => 'image|max:2048',
            'primary_index'   => 'nullable|integer',
            
            // Branch Stock
            'branch_id'       => 'required|exists:branches,id',
            'stock_quantity'  => 'required|numeric|min:0',
        ]);

        $product = Product::create([
            'sku'             => $validated['sku'],
            'name'            => $validated['name'],
            'category_id'     => $validated['category_id'] ?? null,
        ]);

        // Handle Images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('products', 'public');
                $product->images()->create([
                    'image_path' => $path,
                    'is_primary' => (isset($validated['primary_index']) && $index == $validated['primary_index']) || ($index === 0 && !isset($validated['primary_index'])),
                    'created_by' => auth()->id(),
                ]);
            }
        }

        // Attach initial stock
        $product->branches()->attach($validated['branch_id'], ['stock_quantity' => $validated['stock_quantity']]);

        return redirect()->back()->with('success', 'تم إضافة الصنف بنجاح وإيداعه في الفرع المُختار.');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'category_id'      => 'nullable|exists:categories,id',
            'new_images'       => 'nullable|array',
            'new_images.*'     => 'image|max:2048',
            'deleted_images'   => 'nullable|array',
            'primary_image_id' => 'nullable', // Can be an ID or an index like 'new_0'
        ]);

        $product->update([
            'name'            => $validated['name'],
            'category_id'     => $validated['category_id'] ?? null,
        ]);

        // 1. Delete requested images
        if (!empty($validated['deleted_images'])) {
            $imagesToDelete = $product->images()->whereIn('id', $validated['deleted_images'])->get();
            foreach ($imagesToDelete as $img) {
                Storage::disk('public')->delete($img->image_path);
                $img->delete();
            }
        }

        // 2. Upload new images & handle primary selection
        if ($request->hasFile('new_images')) {
            foreach ($request->file('new_images') as $index => $file) {
                $isPrimary = ($validated['primary_image_id'] === "new_{$index}");
                
                // If we are setting a new image as primary, we must unset others FIRST
                if ($isPrimary) {
                    $product->images()->update(['is_primary' => false]);
                }

                $path = $file->store('products', 'public');
                $product->images()->create([
                    'image_path' => $path,
                    'is_primary' => $isPrimary,
                    'created_by' => auth()->id(),
                ]);
            }
        }

        // 3. Handle primary selection for existing images (only if not already set by a new image)
        if (isset($validated['primary_image_id']) && is_numeric($validated['primary_image_id'])) {
            $product->images()->update(['is_primary' => false]);
            $product->images()->where('id', $validated['primary_image_id'])->update(['is_primary' => true]);
        }

        return redirect()->back()->with('success', 'تم تحديث بيانات الصنف بنجاح');
    }
    
    public function updateStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'stock_quantity' => 'required|numeric|min:0',
        ]);

        $product->branches()->syncWithoutDetaching([
            $validated['branch_id'] => ['stock_quantity' => $validated['stock_quantity']]
        ]);

        return redirect()->back()->with('success', 'تم تحديث مخزون الصنف في الفرع المختار بنجاح.');
    }

    public function updateUnits(Request $request, Product $product)
    {
        $validated = $request->validate([
            'units' => 'required|array',
            'units.*.unit_id' => 'required|exists:units,id',
            'units.*.branch_id' => 'required|exists:branches,id',
            'units.*.currency_id' => 'required|exists:currencies,id',
            'units.*.conversion_factor' => 'required|numeric|min:1',
            'units.*.base_price' => 'required|numeric|min:0',
            'units.*.wholesale_price' => 'required|numeric|min:0',
            'units.*.retail_price' => 'required|numeric|min:0',
            'units.*.is_default_sale' => 'boolean',
        ]);

        ProductUnit::where('product_id', $product->id)->delete();

        foreach ($validated['units'] as $unitData) {
            ProductUnit::create([
                'product_id' => $product->id,
                ...$unitData
            ]);
        }

        return redirect()->back()->with('success', 'تم حفظ ربط وتسعير الوحدات الفرعية بنجاح.');
    }

    public function destroy(Product $product)
    {
        foreach ($product->images as $img) {
            Storage::disk('public')->delete($img->image_path);
            $img->delete();
        }
        $product->delete();
        return redirect()->back()->with('success', 'تم حذف الصنف بنجاح');
    }
}
