<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrdersController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\BranchesController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\CurrenciesController;
use App\Http\Controllers\CustomersController;
use App\Http\Controllers\OffersController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

use App\Http\Controllers\Customer\DashboardController as CustomerDashboardController;
use App\Http\Controllers\Customer\StorefrontController as CustomerStorefrontController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;

Route::middleware(['auth', 'verified'])->group(function () {
    // Admin Only Routes
    Route::middleware(['admin'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        
        // Orders (Admin side)
        Route::get('/orders', [OrdersController::class, 'index'])->name('orders.index');
        Route::patch('/orders/{order}/status', [OrdersController::class, 'updateStatus'])->name('orders.updateStatus');
        Route::post('/orders/{order}/allocate', [OrdersController::class, 'allocate'])->name('orders.allocate');
        Route::delete('/orders/{order}', [OrdersController::class, 'destroy'])->name('orders.destroy');

        // Inventory
        Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
        Route::post('/inventory', [InventoryController::class, 'store'])->name('inventory.store');
        Route::put('/inventory/{product}', [InventoryController::class, 'update'])->name('inventory.update');
        Route::post('/inventory/{product}/stock', [InventoryController::class, 'updateStock'])->name('inventory.updateStock');
        Route::post('/inventory/{product}/units', [InventoryController::class, 'updateUnits'])->name('inventory.updateUnits');
        Route::delete('/inventory/{product}', [InventoryController::class, 'destroy'])->name('inventory.destroy');

        // Branches
        Route::get('/branches', [BranchesController::class, 'index'])->name('branches.index');
        Route::post('/branches', [BranchesController::class, 'store'])->name('branches.store');
        Route::put('/branches/{branch}', [BranchesController::class, 'update'])->name('branches.update');
        Route::delete('/branches/{branch}', [BranchesController::class, 'destroy'])->name('branches.destroy');

        // Units
        Route::get('/units', [\App\Http\Controllers\UnitsController::class, 'index'])->name('units.index');
        Route::post('/units', [\App\Http\Controllers\UnitsController::class, 'store'])->name('units.store');
        Route::put('/units/{unit}', [\App\Http\Controllers\UnitsController::class, 'update'])->name('units.update');
        Route::delete('/units/{unit}', [\App\Http\Controllers\UnitsController::class, 'destroy'])->name('units.destroy');

        // Categories
        Route::get('/categories', [\App\Http\Controllers\CategoriesController::class, 'index'])->name('categories.index');
        Route::post('/categories', [\App\Http\Controllers\CategoriesController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [\App\Http\Controllers\CategoriesController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [\App\Http\Controllers\CategoriesController::class, 'destroy'])->name('categories.destroy');

        // Settings & Currencies
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::get('/currencies', [CurrenciesController::class, 'index'])->name('currencies.index');
        Route::post('/currencies', [CurrenciesController::class, 'store'])->name('currencies.store');
        Route::put('/currencies/{currency}', [CurrenciesController::class, 'update'])->name('currencies.update');
        Route::patch('/currencies/{currency}/rate', [CurrenciesController::class, 'updateRate'])->name('currencies.updateRate');
        Route::delete('/currencies/{currency}', [CurrenciesController::class, 'destroy'])->name('currencies.destroy');

        // Customers
        Route::get('/customers', [CustomersController::class, 'index'])->name('customers.index');
        Route::get('/customers/{customer}', [CustomersController::class, 'show'])->name('customers.show');

        // Offers
        Route::get('/offers', [OffersController::class, 'index'])->name('offers.index');
        Route::post('/offers', [OffersController::class, 'store'])->name('offers.store');
        Route::put('/offers/{offer}', [OffersController::class, 'update'])->name('offers.update');
        Route::delete('/offers/{offer}', [OffersController::class, 'destroy'])->name('offers.destroy');
        Route::patch('/offers/{offer}/toggle', [OffersController::class, 'toggleActive'])->name('offers.toggle');
    });

    // Customer App Routes (Available to all authenticated users)
    Route::prefix('customer')->name('customer.')->group(function () {
        Route::get('/dashboard', [CustomerDashboardController::class, 'index'])->name('dashboard');
        Route::get('/storefront', [CustomerStorefrontController::class, 'index'])->name('storefront');
        Route::get('/storefront/{product}', [CustomerStorefrontController::class, 'show'])->name('storefront.show');
        Route::get('/cart', [CustomerStorefrontController::class, 'cart'])->name('cart');
        Route::post('/checkout', [CustomerOrderController::class, 'checkout'])->name('checkout');
        Route::get('/orders', [CustomerOrderController::class, 'index'])->name('orders');
        Route::get('/orders/{order}', [CustomerOrderController::class, 'show'])->name('orders.show');
        Route::get('/offers', [CustomerStorefrontController::class, 'offers'])->name('offers');
    });

    // Shared actions (like store order)
    Route::post('/orders', [OrdersController::class, 'store'])->name('orders.store');
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
