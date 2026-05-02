<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/categories', function () {
    return response()->json(\App\Models\Category::all());
});

Route::get('/products', function () {
    // Basic product list with images if any
    $products = \App\Models\Product::with('category')->get()->map(function($product) {
        $product->image_url = $product->image_url ?? ($product->image ? asset('storage/'.$product->image) : null);
        return $product;
    });
    return response()->json($products);
});

Route::get('/branches', function () {
    return response()->json(['branches' => \App\Models\Branch::all()]);
});

Route::get('/notifications', function (Request $request) {
    return response()->json(['unread_count' => 0]);
});

Route::get('/favorites', function (Request $request) {
    return response()->json([]);
});

Route::post('/login', function (Request $request) {
    $request->validate(['phone' => 'required', 'password' => 'required']);
    if (!\Illuminate\Support\Facades\Auth::attempt($request->only('phone', 'password'))) {
        return response()->json(['message' => 'بيانات الدخول غير صحيحة'], 401);
    }
    $user = \Illuminate\Support\Facades\Auth::user();
    $token = $user->createToken('mobile-app')->plainTextToken;
    return response()->json(['access_token' => $token, 'user' => $user]);
});

Route::post('/register', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string',
        'phone' => 'required|string|unique:users',
        'password' => 'required|string',
        'branch_id' => 'required',
        'lat' => 'required',
        'lng' => 'required',
    ]);
    
    $user = \App\Models\User::create([
        'name' => $validated['name'],
        'phone' => $validated['phone'],
        'email' => $validated['phone'] . '@example.com',
        'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
        'branch_id' => $validated['branch_id'],
        'user_type' => $request->user_type ?? 4,
    ]);

    \App\Models\Location::create([
        'user_id' => $user->id,
        'latitude' => $validated['lat'],
        'longitude' => $validated['lng'],
        'branch_id' => $validated['branch_id'],
        'is_verified' => false,
    ]);

    $token = $user->createToken('mobile-app')->plainTextToken;
    return response()->json(['access_token' => $token, 'user' => $user]);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/orders', function (Request $request) {
        $orders = \App\Models\OrderQueue::where('customer_id', $request->user()->id)
            ->with(['orderItems.product'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($order) {
                $order->status = $order->order_status;
                return $order;
            });
        return response()->json($orders);
    });

    Route::post('/orders', function (Request $request) {
        return response()->json(['success' => true, 'message' => 'سيتم معالجة الطلب قريباً.']);
    });

    Route::post('/notifications/{id}/read', function (Request $request, $id) {
        $notification = $request->user()->notifications()->find($id);
        if ($notification) $notification->markAsRead();
        return response()->json(['success' => true]);
    });

    Route::post('/notifications/read-all', function (Request $request) {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    });
});

\Illuminate\Support\Facades\Broadcast::routes(['middleware' => ['auth:sanctum']]);
