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

use App\Services\OfferService;

class StorefrontController extends Controller
{
    protected $offerService;

    public function __construct(OfferService $offerService)
    {
        $this->offerService = $offerService;
    }

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
            $q->where('branch_id', $user->branch_id)->with(['currency', 'unit']);
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

            // Conversion logic (Universal: Price * (SourceRate / TargetRate))
            $unitCurrency = $defaultUnit ? $defaultUnit->currency : null;
            $unitRate = $unitCurrency ? $unitCurrency->exchange_rate : 1;
            $displayRate = $displayCurrency ? $displayCurrency->exchange_rate : 1;
            
            $convertedPrice = $price * ($unitRate / $displayRate);
            $isSameAsDisplay = $unitCurrency && $displayCurrency && ($unitCurrency->id === $displayCurrency->id);


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
                'default_unit_name' => $defaultUnit && $defaultUnit->unit ? $defaultUnit->unit->unit_name : 'وحدة',
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
            $q->where('branch_id', $user->branch_id)->with(['currency', 'unit']);
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

        // Conversion (Universal: Price * (SourceRate / TargetRate))
        $unitCurrency = $defaultUnit ? $defaultUnit->currency : null;
        $unitRate = $unitCurrency ? $unitCurrency->exchange_rate : 1;
        $displayRate = $displayCurrency ? $displayCurrency->exchange_rate : 1;
        $convertedPrice = $price * ($unitRate / $displayRate);
        $isSameAsDisplay = $unitCurrency && $displayCurrency && ($unitCurrency->id === $displayCurrency->id);


        $branchPivot = $product->branches->first();
        $stock = $branchPivot ? $branchPivot->pivot->stock_quantity : 0;

        // Related products (filtered by same branch)
        $relatedProducts = Product::whereHas('units', function($q) use ($user) {
            $q->where('branch_id', $user->branch_id);
        })
        ->with(['category', 'images', 'units' => function($q) use ($user) {
            $q->where('branch_id', $user->branch_id)->with(['currency', 'unit']);
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
            $unitRate = $unitCurr ? $unitCurr->exchange_rate : 1;
            $displayRate = $displayCurrency ? $displayCurrency->exchange_rate : 1;
            $convPrice = $relPrice * ($unitRate / $displayRate);


            $branchPivot = $p->branches->first();
            return [
                'id' => $p->id,
                'name' => $p->name,
                'price' => $convPrice,
                'image_path' => $p->thumbnail,
                'default_unit_name' => $defUnit && $defUnit->unit ? $defUnit->unit->unit_name : 'وحدة',
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
                'default_unit_name' => $defaultUnit && $defaultUnit->unit ? $defaultUnit->unit->unit_name : 'وحدة',
                'in_stock'      => $stock > 0,
                'stock_quantity'=> $stock,
            ],
            'relatedProducts' => $relatedProducts,
        ]);
    }



    public function cart()
    {
        return Inertia::render('Customer/Cart/Index');
    }

    public function offers()
    {
        $user = Auth::user();
        $branch = $user->branch()->with('currency')->first();
        $displayCurrency = ($branch && $branch->currency) 
            ? $branch->currency 
            : Currency::where('is_default', true)->first();

        // Load offers and their target products with branch-specific units and stock
        $offers = $this->offerService->getEligibleOffers($user)
            ->load([
                'targetProduct' => function($q) use ($user) {
                    $q->with(['units' => function($qu) use ($user) {
                        $qu->where('branch_id', $user->branch_id)->with(['currency', 'unit']);
                    }, 'branches' => function($qb) use ($user) {
                        $qb->where('branch_product.branch_id', $user->branch_id);
                    }]);
                },
                'bonusProduct',
                'bonusUnit'
            ])
            ->map(function ($offer) use ($user, $displayCurrency) {
                $product = $offer->targetProduct;
                if (!$product) return $offer;

                $branchUnits = $product->units;
                $defaultUnit = $branchUnits->where('is_default_sale', true)->first() ?? $branchUnits->first();

                // Determine price based on user type
                $price = $defaultUnit ? ($defaultUnit->retail_price ?: $defaultUnit->base_price) : 0;
                if ($user->user_type == UserType::Wholesaler && $defaultUnit && $defaultUnit->wholesale_price) {
                    $price = $defaultUnit->wholesale_price;
                } elseif ($user->user_type == UserType::Retailer && $defaultUnit && $defaultUnit->retail_price) {
                    $price = $defaultUnit->retail_price;
                }

                // Currency Conversion
                $unitCurrency = $defaultUnit ? $defaultUnit->currency : null;
                $unitRate = $unitCurrency ? $unitCurrency->exchange_rate : 1;
                $displayRate = $displayCurrency ? $displayCurrency->exchange_rate : 1;
                $convertedPrice = $price * ($unitRate / $displayRate);

                // Stock Info
                $branchPivot = $product->branches->first();
                $stock = $branchPivot ? $branchPivot->pivot->stock_quantity : 0;

                // Add calculated fields to the product object inside the offer
                $product->calculate_price = $convertedPrice;
                $product->calculate_stock = $stock;
                $product->calculate_currency = $displayCurrency ? $displayCurrency->currency_name : 'ريال';
                $product->calculate_unit = $defaultUnit && $defaultUnit->unit ? $defaultUnit->unit->unit_name : 'وحدة';

                return $offer;
            });

        return Inertia::render('Customer/Offers', [
            'offers' => $offers
        ]);
    }
}
