<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Branch;
use App\Models\Currency;
use App\Models\Category;
use App\Models\FieldInventory;
use App\Models\Location;
use App\Models\User;
use App\Enums\UserType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

        // ── Currency resolution ──────────────────────────────────────────────
        if ($user) {
            $branch       = $user->branch()->with('currency')->first();
            $displayCurrency = ($branch && $branch->currency)
                ? $branch->currency
                : Currency::where('is_default', true)->first();
        } else {
            // Guest: use system default currency
            $displayCurrency = Currency::where('is_default', true)->first();
        }

        // ── Products ─────────────────────────────────────────────────────────
        if ($user) {
            // Authenticated: only products available in the user's branch
            $query = Product::whereHas('units', fn($q) => $q->where('branch_id', $user->branch_id))
                ->with(['category', 'images',
                    'units'    => fn($q) => $q->where('branch_id', $user->branch_id)->with(['currency', 'unit']),
                    'branches' => fn($q) => $q->where('branch_product.branch_id', $user->branch_id),
                ]);
        } else {
            // Guest: show all products across all branches (public catalogue)
            $query = Product::with(['category', 'images',
                'units'    => fn($q) => $q->with(['currency', 'unit']),
                'branches',
            ]);
        }

        $products = $query->get()->map(function ($product) use ($user, $displayCurrency) {
            $branchUnits = $product->units;
            $defaultUnit = $branchUnits->where('is_default_sale', true)->first() ?? $branchUnits->first();

            $price = $defaultUnit ? ($defaultUnit->retail_price ?: $defaultUnit->base_price) : 0;
            if ($user) {
                if ($user->user_type == UserType::Wholesaler && $defaultUnit?->wholesale_price) {
                    $price = $defaultUnit->wholesale_price;
                } elseif ($user->user_type == UserType::Retailer && $defaultUnit?->retail_price) {
                    $price = $defaultUnit->retail_price;
                }
            }

            $unitCurrency  = $defaultUnit ? $defaultUnit->currency : null;
            $unitRate      = $unitCurrency ? $unitCurrency->exchange_rate : 1;
            $displayRate   = $displayCurrency ? $displayCurrency->exchange_rate : 1;
            $convertedPrice = $price * ($unitRate / $displayRate);
            $isSameAsDisplay = $unitCurrency && $displayCurrency && ($unitCurrency->id === $displayCurrency->id);

            // Stock: sum across all branches for guests; branch-specific for users
            $branchPivot = $user
                ? $product->branches->first()
                : $product->branches->first(); // still first for simplicity
            $stock = $branchPivot ? $branchPivot->pivot->stock_quantity : 0;

            return [
                'id'                     => $product->id,
                'name'                   => $product->name,
                'sku'                    => $product->sku,
                'category_id'            => $product->category_id,
                'category_name'          => $product->category ? $product->category->category_name : 'غير مصنف',
                'image_path'             => $product->thumbnail,
                'price'                  => $convertedPrice,
                'original_price'         => $price,
                'default_unit_name'      => $defaultUnit && $defaultUnit->unit ? $defaultUnit->unit->unit_name : 'وحدة',
                'currency_symbol'        => $unitCurrency ? $unitCurrency->currency_name : '',
                'default_currency_symbol'=> $displayCurrency ? $displayCurrency->currency_name : '',
                'is_multi_currency'      => !$isSameAsDisplay,
                'in_stock'               => $stock > 0,
                'stock_quantity'         => $stock,
            ];
        });

        $categories = Category::all();

        return Inertia::render('Customer/Storefront/Index', [
            'products'       => $products,
            'categories'     => $categories,
            'systemCurrency' => $displayCurrency,
            'isGuest'        => !$user,
        ]);
    }

    public function show($id)
    {
        $user = Auth::user();

        if ($user) {
            $branch          = $user->branch()->with('currency')->first();
            $displayCurrency = ($branch && $branch->currency)
                ? $branch->currency
                : Currency::where('is_default', true)->first();
        } else {
            $displayCurrency = Currency::where('is_default', true)->first();
        }

        if ($user) {
            $product = Product::with(['category', 'images',
                'units'    => fn($q) => $q->where('branch_id', $user->branch_id)->with(['currency', 'unit']),
                'branches' => fn($q) => $q->where('branch_product.branch_id', $user->branch_id),
            ])->findOrFail($id);
        } else {
            $product = Product::with(['category', 'images',
                'units'    => fn($q) => $q->with(['currency', 'unit']),
                'branches',
            ])->findOrFail($id);
        }

        $branchUnits = $product->units;
        $defaultUnit = $branchUnits->where('is_default_sale', true)->first() ?? $branchUnits->first();
        $price       = $defaultUnit ? ($defaultUnit->retail_price ?: $defaultUnit->base_price) : 0;
        $offPrice    = $defaultUnit ? $defaultUnit->base_price : 0;

        if ($user) {
            if ($user->user_type == UserType::Wholesaler && $defaultUnit?->wholesale_price) {
                $price = $defaultUnit->wholesale_price;
            } elseif ($user->user_type == UserType::Retailer && $defaultUnit?->retail_price) {
                $price = $defaultUnit->retail_price;
            }
        }

        $unitCurrency    = $defaultUnit ? $defaultUnit->currency : null;
        $unitRate        = $unitCurrency ? $unitCurrency->exchange_rate : 1;
        $displayRate     = $displayCurrency ? $displayCurrency->exchange_rate : 1;
        $convertedPrice  = $price * ($unitRate / $displayRate);
        $isSameAsDisplay = $unitCurrency && $displayCurrency && ($unitCurrency->id === $displayCurrency->id);

        $branchPivot = $product->branches->first();
        $stock       = $branchPivot ? $branchPivot->pivot->stock_quantity : 0;

        // Related products
        if ($user) {
            $relQuery = Product::whereHas('units', fn($q) => $q->where('branch_id', $user->branch_id))
                ->with(['category', 'images',
                    'units'    => fn($q) => $q->where('branch_id', $user->branch_id)->with(['currency', 'unit']),
                    'branches' => fn($q) => $q->where('branch_product.branch_id', $user->branch_id),
                ]);
        } else {
            $relQuery = Product::with(['category', 'images',
                'units'    => fn($q) => $q->with(['currency', 'unit']),
                'branches',
            ]);
        }

        $relatedProducts = $relQuery
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->limit(4)->get()
            ->map(function ($p) use ($user, $displayCurrency) {
                $bu      = $p->units;
                $defUnit = $bu->where('is_default_sale', true)->first() ?? $bu->first();
                $relPrice = $defUnit ? ($defUnit->retail_price ?: $defUnit->base_price) : 0;
                if ($user) {
                    if ($user->user_type == UserType::Wholesaler && $defUnit?->wholesale_price) $relPrice = $defUnit->wholesale_price;
                    elseif ($user->user_type == UserType::Retailer && $defUnit?->retail_price) $relPrice = $defUnit->retail_price;
                }
                $uc          = $defUnit ? $defUnit->currency : null;
                $ur          = $uc ? $uc->exchange_rate : 1;
                $dr          = $displayCurrency ? $displayCurrency->exchange_rate : 1;
                $convPrice   = $relPrice * ($ur / $dr);
                $bp          = $p->branches->first();
                return [
                    'id'              => $p->id,
                    'name'            => $p->name,
                    'price'           => $convPrice,
                    'image_path'      => $p->thumbnail,
                    'default_unit_name' => $defUnit && $defUnit->unit ? $defUnit->unit->unit_name : 'وحدة',
                    'in_stock'        => $bp ? $bp->pivot->stock_quantity > 0 : false,
                    'stock_quantity'  => $bp ? $bp->pivot->stock_quantity : 0,
                    'category_name'   => $p->category ? $p->category->category_name : '',
                ];
            });

        return Inertia::render('Customer/Storefront/Show', [
            'product' => [
                'id'                  => $product->id,
                'name'                => $product->name,
                'sku'                 => $product->sku,
                'price'               => $convertedPrice,
                'original_price'      => $price,
                'is_multi_currency'   => !$isSameAsDisplay,
                'currency_name'       => $unitCurrency ? $unitCurrency->currency_name : '',
                'system_currency_name'=> $displayCurrency ? $displayCurrency->currency_name : '',
                'official_price'      => $offPrice,
                'category_name'       => $product->category ? $product->category->category_name : 'غير مصنف',
                'images'              => $product->images->map(fn($img) => [
                    'id'         => $img->id,
                    'url'        => "/storage/{$img->image_path}",
                    'is_primary' => $img->is_primary,
                ]),
                'thumbnail'           => $product->thumbnail,
                'default_unit_name'   => $defaultUnit && $defaultUnit->unit ? $defaultUnit->unit->unit_name : 'وحدة',
                'in_stock'            => $stock > 0,
                'stock_quantity'      => $stock,
            ],
            'relatedProducts' => $relatedProducts,
            'isGuest'         => !$user,
        ]);
    }

    /**
     * Public endpoint: given a list of product_ids (with their category_ids),
     * find all distributors that carry those categories from field_inventory,
     * then sort by Haversine distance from the citizen's location.
     *
     * Query params:
     *   product_ids[]   – list of product IDs in the cart
     *   lat             – citizen's latitude  (optional, for sorting)
     *   lng             – citizen's longitude (optional, for sorting)
     */
    public function nearestBranches(Request $request)
    {
        $productIds  = $request->input('product_ids', []);
        $citizenLat  = $request->input('lat');
        $citizenLng  = $request->input('lng');

        if (empty($productIds)) {
            return response()->json([]);
        }

        // ── Step 1: get category_ids of the requested products ─────────────────
        $categoryIds = Product::whereIn('id', $productIds)
            ->pluck('category_id')
            ->unique()
            ->filter()
            ->values()
            ->toArray();

        // ── Step 2: find distributors who have products in those categories
        //            with stock > 0 in field_inventory ─────────────────────────
        $distributorIds = FieldInventory::whereHas('product', function ($q) use ($categoryIds) {
                $q->whereIn('category_id', $categoryIds);
            })
            ->pluck('distributor_id')
            ->unique()
            ->filter()
            ->values()
            ->toArray();

        if (empty($distributorIds)) {
            return response()->json([]);
        }

        // ── Step 3: load distributors with their locations & available products ─
        $distributors = User::whereIn('id', $distributorIds)
            ->with([
                'locations',
                'fieldInventories' => function ($q) use ($categoryIds) {
                    $q->whereHas('product', fn($p) => $p->whereIn('category_id', $categoryIds))
                      ->with('product:id,name,category_id');
                },
            ])
            ->get();

        // ── Step 4: build result with distance calculation ─────────────────────
        $result = $distributors->map(function ($distributor) use ($citizenLat, $citizenLng) {
            /** @var Location|null $location */
            $location = $distributor->locations->first();

            if (!$location) {
                return null;
            }

            $distKm = null;
            if ($citizenLat !== null && $citizenLng !== null && $location->latitude && $location->longitude) {
                $distKm = $this->haversineKm(
                    (float) $citizenLat,
                    (float) $citizenLng,
                    (float) $location->latitude,
                    (float) $location->longitude
                );
            }

            // Unique products from field_inventory
            $products = $distributor->fieldInventories
                ->filter(fn($fi) => $fi->product !== null)
                ->map(fn($fi) => [
                    'id'    => $fi->product->id,
                    'name'  => $fi->product->name,
                    'stock' => $fi->current_stock,
                ])
                ->unique('id')
                ->values();

            return [
                'id'          => 'dist_' . $distributor->id,
                'name'        => $distributor->name,
                'phone'       => $distributor->phone ?? null,
                'city'        => $distributor->address_desc ?? 'غير محدد',
                'lat'         => (float) $location->latitude,
                'lng'         => (float) $location->longitude,
                'distance_km' => $distKm !== null ? round($distKm, 2) : null,
                'products'    => $products,
            ];
        })
        ->filter()  // remove nulls (no location)
        ->values();

        // ── Step 5: sort by distance if citizen location provided ──────────────
        if ($citizenLat !== null && $citizenLng !== null) {
            $result = $result->sortBy('distance_km')->values();
        }

        return response()->json($result);
    }

    /**
     * Haversine formula – returns distance in kilometers.
     */
    private function haversineKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $R   = 6371; // Earth radius in km
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a   = sin($dLat / 2) ** 2
             + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    public function cart()
    {
        return Inertia::render('Customer/Cart/Index');
    }

    public function offers()
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        $branch = $user->branch()->with('currency')->first();
        $displayCurrency = ($branch && $branch->currency)
            ? $branch->currency
            : Currency::where('is_default', true)->first();

        $offers = $this->offerService->getEligibleOffers($user)
            ->load([
                'targetProduct' => function ($q) use ($user) {
                    $q->with(['units' => function ($qu) use ($user) {
                        $qu->where('branch_id', $user->branch_id)->with(['currency', 'unit']);
                    }, 'branches' => function ($qb) use ($user) {
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

                $price = $defaultUnit ? ($defaultUnit->retail_price ?: $defaultUnit->base_price) : 0;
                if ($user->user_type == UserType::Wholesaler && $defaultUnit?->wholesale_price) {
                    $price = $defaultUnit->wholesale_price;
                } elseif ($user->user_type == UserType::Retailer && $defaultUnit?->retail_price) {
                    $price = $defaultUnit->retail_price;
                }

                $unitCurrency    = $defaultUnit ? $defaultUnit->currency : null;
                $unitRate        = $unitCurrency ? $unitCurrency->exchange_rate : 1;
                $displayRate     = $displayCurrency ? $displayCurrency->exchange_rate : 1;
                $convertedPrice  = $price * ($unitRate / $displayRate);

                $branchPivot = $product->branches->first();
                $stock       = $branchPivot ? $branchPivot->pivot->stock_quantity : 0;

                $product->calculate_price    = $convertedPrice;
                $product->calculate_stock    = $stock;
                $product->calculate_currency = $displayCurrency ? $displayCurrency->currency_name : 'ريال';
                $product->calculate_unit     = $defaultUnit && $defaultUnit->unit ? $defaultUnit->unit->unit_name : 'وحدة';

                return $offer;
            });

        return Inertia::render('Customer/Offers', [
            'offers' => $offers
        ]);
    }
}
