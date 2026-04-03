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
        
        // Fetch products with their categories and check availability in customer branch
        $products = Product::with(['category', 'images', 'branches' => function($query) use ($user) {
            $query->where('branch_product.branch_id', $user->branch_id);
        }])->get()->map(function($product) use ($user) {
            $price = $product->official_price;
            
            if ($user->user_type == UserType::Wholesaler->value) {
                $price = $product->wholesale_price;
            } elseif ($user->user_type == UserType::Retailer->value) {
                $price = $product->retail_price;
            }

            $branchPivot = $product->branches->first();
            $stock = $branchPivot ? $branchPivot->pivot->stock_quantity : 0;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category_name' => $product->category ? $product->category->category_name : 'غير مصنف',
                'image_path' => $product->thumbnail, // Contains /storage/ prefix already
                'price' => $price,
                'in_stock' => $stock > 0,
                'stock_quantity' => $stock
            ];
        });

        $categories = Category::all();

        return Inertia::render('Customer/Storefront/Index', [
            'products' => $products,
            'categories' => $categories
        ]);
    }

    public function show($id)
    {
        $user = Auth::user();

        $product = Product::with(['category', 'images', 'units.unit', 'branches' => function($query) use ($user) {
            $query->where('branch_product.branch_id', $user->branch_id);
        }])->findOrFail($id);

        // Determine price based on user type
        $price = $product->official_price;
        if ($user->user_type == UserType::Wholesaler->value) {
            $price = $product->wholesale_price;
        } elseif ($user->user_type == UserType::Retailer->value) {
            $price = $product->retail_price;
        }

        $branchPivot = $product->branches->first();
        $stock = $branchPivot ? $branchPivot->pivot->stock_quantity : 0;

        // Related products (same category, exclude this product)
        $relatedProducts = Product::with(['category', 'images', 'branches' => function($q) use ($user) {
            $q->where('branch_product.branch_id', $user->branch_id);
        }])
        ->where('category_id', $product->category_id)
        ->where('id', '!=', $product->id)
        ->limit(4)
        ->get()
        ->map(function($p) use ($user) {
            $relPrice = $p->official_price;
            if ($user->user_type == UserType::Wholesaler->value) $relPrice = $p->wholesale_price;
            elseif ($user->user_type == UserType::Retailer->value) $relPrice = $p->retail_price;
            $branchPivot = $p->branches->first();
            return [
                'id' => $p->id,
                'name' => $p->name,
                'price' => $relPrice,
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
                'price'         => $price,
                'official_price'=> $product->official_price,
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
