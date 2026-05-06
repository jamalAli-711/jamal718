<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'units', 'images']);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->get()->map(function($product) {
            return $this->formatProduct($product);
        });

        // Return array directly to match mobile app service expectation
        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'units', 'images'])->find($id);

        if (!$product) {
            return response()->json(['message' => 'المنتج غير موجود'], 404);
        }

        return response()->json($this->formatProduct($product));
    }

    public function categories()
    {
        $categories = Category::all();
        return response()->json($categories);
    }

    private function formatProduct($product)
    {
        // Get the primary image from product_images table, or the first one available
        $primaryImage = $product->images->where('is_primary', 1)->first() ?: $product->images->first();
        
        if ($primaryImage && $primaryImage->image_path) {
            $imagePath = ltrim($primaryImage->image_path, '/');
            
            // Ensure storage/ prefix
            if (!str_starts_with($imagePath, 'storage/')) {
                $imagePath = 'storage/' . $imagePath;
            }
            
            $product->image_url = url($imagePath);
        } else {
            // Fallback to thumbnail field if images table is empty
            $imagePath = $product->thumbnail;
            if ($imagePath) {
                $imagePath = ltrim($imagePath, '/');
                if (!str_starts_with($imagePath, 'storage/')) {
                    $imagePath = 'storage/' . $imagePath;
                }
                $product->image_url = url($imagePath);
            } else {
                $product->image_url = asset('images/placeholder.png');
            }
        }

        // Get price from the default unit
        $defaultUnit = $product->units->where('is_default_sale', 1)->first() ?: $product->units->first();
        $product->price = $defaultUnit ? $defaultUnit->retail_price : 0;
        
        return $product;
    }
}
