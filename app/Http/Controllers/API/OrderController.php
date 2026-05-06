<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrderQueue;
use App\Models\OrderQueueItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = OrderQueue::where('customer_id', $request->user()->id)
            ->with(['orderItems.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'branch_id' => 'required|exists:branches,id',
            'total_amount' => 'required|numeric',
        ]);

        try {
            DB::beginTransaction();

            $order = OrderQueue::create([
                'customer_id' => $request->user()->id,
                'branch_id' => $request->branch_id,
                'total_price' => $request->total_amount,
                'order_status' => 'pending',
                'payment_status' => 'pending',
            ]);

            foreach ($request->items as $item) {
                OrderQueueItem::create([
                    'order_queue_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'] ?? 0, // Assuming price is passed or fetched
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'تم استلام طلبك بنجاح وسيتم معالجته قريباً.',
                'order_id' => $order->id
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'حدث خطأ أثناء معالجة الطلب: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $order = OrderQueue::where('customer_id', $request->user()->id)
            ->with(['orderItems.product', 'branch'])
            ->find($id);

        if (!$order) {
            return response()->json(['message' => 'الطلب غير موجود'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $order
        ]);
    }
}
