<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Currency;
use App\Models\Category;
use App\Enums\UserType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class StorefrontController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $branch = $user->branch()->with('currency')->first();
        // The currency to display prices in (from branch or system default)
        $displayCurrency = ($branch && $branch->currency) 
            ? $branch->currency 
            : Currency::where('is_default', true)->first();

        $sysDefaultCurrency = Currency::where('is_default', true)->first();

        // Fetch products that have units for the customer's branch
        $products = Product::whereHas('units', function($q) use ($user) {
            $q->where('branch_id', $user->branch_id);
        })
        ->with(['category', 'images', 'units' => function($q) use ($user) {
            $q->where('branch_id', $user->branch_id)->with('currency');
        }, 'branches' => function($query) use ($user) {
            $query->where('branch_product.branch_id', $user->branch_id);
        }])->get()->map(function($product) use ($user, $displayCurrency) {
            // Units for THIS branch
            $branchUnits = $product->units;
            $defaultUnit = $branchUnits->where('is_default_sale', true)->first() ?? $branchUnits->first();
            
            // Raw price from DB
            $price = $defaultUnit ? ($defaultUnit->retail_price ?: $defaultUnit->base_price) : 0;
            if ($user->user_type == UserType::Wholesaler && $defaultUnit && $defaultUnit->wholesale_price) {
                $price = $defaultUnit->wholesale_price;
            } elseif ($user->user_type == UserType::Retailer && $defaultUnit && $defaultUnit->retail_price) {
                $price = $defaultUnit->retail_price;
            }

            // Conversion logic (Relative to Display Currency)
            $unitCurrency = $defaultUnit ? $defaultUnit->currency : null;
            $isSameAsDisplay = $unitCurrency && $displayCurrency && ($unitCurrency->id === $displayCurrency->id);
            $convertedPrice = $price;
            
            if (!$isSameAsDisplay && $unitCurrency) {
                // Direct multiplier logic as requested by user: Price * Exchange_Rate
                $convertedPrice = $price * $unitCurrency->exchange_rate;
            }


            $branchPivot = $product->branches->first();
            $stock = $branchPivot ? $branchPivot->pivot->stock_quantity : 0;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category_name' => $product->category ? $product->category->category_name : 'غير مصنف',
                'image_path' => $product->thumbnail,
                'price' => $convertedPrice, 
                'original_price' => $price,
                'currency_symbol' => $unitCurrency ? $unitCurrency->currency_name : '',
                'default_currency_symbol' => $displayCurrency ? $displayCurrency->currency_name : '',
                'is_multi_currency' => !$isSameAsDisplay,
                'in_stock' => $stock > 0,
                'stock_quantity' => $stock
            ];
        });

        $categories = Category::all();

        return Inertia::render('Customer/Storefront/Index', [
            'products' => $products,
            'categories' => $categories,
            'systemCurrency' => $displayCurrency
        ]);
    }

    public function show($id)
    {
        $user = Auth::user();
        $branch = $user->branch()->with('currency')->first();
        $displayCurrency = ($branch && $branch->currency) 
            ? $branch->currency 
            : Currency::where('is_default', true)->first();

        $product = Product::with(['category', 'images', 'units' => function($q) use ($user) {
            $q->where('branch_id', $user->branch_id)->with('currency');
        }, 'branches' => function($query) use ($user) {
            $query->where('branch_product.branch_id', $user->branch_id);
        }])->findOrFail($id);

        // Determine price based on user type
        $branchUnits = $product->units;
        $defaultUnit = $branchUnits->where('is_default_sale', true)->first() ?? $branchUnits->first();
        
        $price = $defaultUnit ? ($defaultUnit->retail_price ?: $defaultUnit->base_price) : 0;
        $offPrice = $defaultUnit ? $defaultUnit->base_price : 0;
        
        if ($user->user_type == UserType::Wholesaler && $defaultUnit && $defaultUnit->wholesale_price) {
            $price = $defaultUnit->wholesale_price;
        } elseif ($user->user_type == UserType::Retailer && $defaultUnit && $defaultUnit->retail_price) {
            $price = $defaultUnit->retail_price;
        }

        // Conversion
        $unitCurrency = $defaultUnit ? $defaultUnit->currency : null;
        $isSameAsDisplay = $unitCurrency && $displayCurrency && ($unitCurrency->id === $displayCurrency->id);
        $convertedPrice = $price;
        if (!$isSameAsDisplay && $unitCurrency) {
            $convertedPrice = $price * $unitCurrency->exchange_rate;
        }


        $branchPivot = $product->branches->first();
        $stock = $branchPivot ? $branchPivot->pivot->stock_quantity : 0;

        // Related products (filtered by same branch)
        $relatedProducts = Product::whereHas('units', function($q) use ($user) {
            $q->where('branch_id', $user->branch_id);
        })
        ->with(['category', 'images', 'units' => function($q) use ($user) {
            $q->where('branch_id', $user->branch_id)->with('currency');
        }, 'branches' => function($q) use ($user) {
            $q->where('branch_product.branch_id', $user->branch_id);
        }])
        ->where('category_id', $product->category_id)
        ->where('id', '!=', $product->id)
        ->limit(4)
        ->get()
        ->map(function($p) use ($user, $displayCurrency) {
            $branchUnits = $p->units;
            $defUnit = $branchUnits->where('is_default_sale', true)->first() ?? $branchUnits->first();
            $relPrice = $defUnit ? ($defUnit->retail_price ?: $defUnit->base_price) : 0;
            if ($user->user_type == UserType::Wholesaler && $defUnit && $defUnit->wholesale_price) $relPrice = $defUnit->wholesale_price;
            elseif ($user->user_type == UserType::Retailer && $defUnit && $defUnit->retail_price) $relPrice = $defUnit->retail_price;
            
            $unitCurr = $defUnit ? $defUnit->currency : null;
            $convPrice = $relPrice;
            if ($unitCurr && $displayCurrency && $unitCurr->id !== $displayCurrency->id) {
                $convPrice = $relPrice * $unitCurr->exchange_rate;
            }


            $branchPivot = $p->branches->first();
            return [
                'id' => $p->id,
                'name' => $p->name,
                'price' => $convPrice,
                'image_path' => $p->thumbnail,
                'in_stock' => $branchPivot ? $branchPivot->pivot->stock_quantity > 0 : false,
                'stock_quantity' => $branchPivot ? $branchPivot->pivot->stock_quantity : 0,
                'category_name' => $p->category ? $p->category->category_name : '',
            ];
        });

        return Inertia::render('Customer/Storefront/Show', [
            'product' => [
                'id'            => $product->id,
                'name'          => $product->name,
                'sku'           => $product->sku,
                'price'         => $convertedPrice,
                'original_price'=> $price,
                'is_multi_currency' => !$isSameAsDisplay,
                'currency_name' => $unitCurrency ? $unitCurrency->currency_name : '',
                'system_currency_name' => $displayCurrency ? $displayCurrency->currency_name : '',
                'official_price'=> $offPrice,
                'category_name' => $product->category ? $product->category->category_name : 'غير مصنف',
                'images'        => $product->images->map(fn($img) => [
                    'id'         => $img->id,
                    'url'        => "/storage/{$img->image_path}",
                    'is_primary' => $img->is_primary,
                ]),
                'thumbnail'     => $product->thumbnail,
                'in_stock'      => $stock > 0,
                'stock_quantity'=> $stock,
            ],
            'relatedProducts' => $relatedProducts,
        ]);
    }



    public function cart()
    {
        // For LocalStorage cart we just render the view.
        // We can pass the products so the frontend can populate the latest prices.
        return Inertia::render('Customer/Cart/Index', [
             // The Vue/React component will use LocalStorage items
        ]);
    }
}
