<?php

namespace App\Http\Controllers;

use App\Models\FleetManagement;
use App\Models\DeliveryTrip;
use App\Models\OrderQueue;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Enums\TripStatus;
use App\Enums\FleetStatus;
use App\Enums\UserType;
use App\Enums\OrderStatus;
use App\Models\CustomerReplenishmentSetting;
use Carbon\Carbon;

class FleetController extends Controller
{
    /**
     * Display the fleet management and trip preparation dashboard.
     */
    public function index()
    {
        return Inertia::render('Fleet/Index', [
            'trucks' => FleetManagement::with(['driver', 'trips' => function($q) {
                $q->where('status', '!=', TripStatus::Delivered);
            }])->get(),
            'drivers' => User::whereIn('user_type', [UserType::Driver, UserType::Distributor])->get(),
            'pendingOrders' => OrderQueue::where('order_status', OrderStatus::Pending)
                ->whereNotNull('shipping_lat')
                ->whereNotNull('shipping_lon')
                ->whereDoesntHave('deliveryTrips', function($q) {
                    $q->whereIn('status', [TripStatus::Waiting, TripStatus::OnWay]);
                })
                ->with('customer')
                ->get(),
            'activeTrips' => DeliveryTrip::with(['truck.driver', 'order.customer'])
                ->where('status', '!=', TripStatus::Delivered)
                ->get()
                ->groupBy('trip_code'),
            'replenishmentAlerts' => CustomerReplenishmentSetting::with(['customer', 'product'])
                ->where('is_active', true)
                ->get()
                ->map(function($item) {
                    $daysLeft = now()->startOfDay()->diffInDays(Carbon::parse($item->next_expected_date)->startOfDay(), false);
                    if ($daysLeft <= $item->alert_threshold_days) {
                        return [
                            'customer_name' => $item->customer->name,
                            'product_name' => $item->product->name,
                            'days_left' => $daysLeft,
                            'severity' => $daysLeft < 0 ? 'critical' : 'warning',
                        ];
                    }
                    return null;
                })->filter()->values()
        ]);
    }

    /**
     * Prepare and assign a new trip.
     */
    public function storeTrip(Request $request)
    {
        $request->validate([
            'truck_id' => 'required|exists:fleet_management,id',
            'order_ids' => 'required|array',
            'order_ids.*' => 'exists:orders_queue,id',
        ]);

        $truck = FleetManagement::findOrFail($request->truck_id);
        $trip_code = 'TRIP-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

        // Get orders with coordinates and validate
        $orders = OrderQueue::whereIn('id', $request->order_ids)->get();

        foreach ($orders as $order) {
            if (!$order->shipping_lat || !$order->shipping_lon) {
                return redirect()->back()->with('error', 'الطلب رقم ' . ($order->reference_number ?? $order->id) . ' لا يحتوي على إحداثيات موقع الجي بي اس.');
            }
        }

        // Simple Nearest Neighbor Routing Algorithm
        // 1. Start from truck's current position (or a branch center)
        $currentLat = $truck->current_lat ?? 15.3694;
        $currentLon = $truck->current_lon ?? 44.1910;
        
        $unvisited = $orders->values();
        $sequence = 1;

        while ($unvisited->count() > 0) {
            // Find closest order to current position
            $closestIndex = null;
            $minDist = null;

            foreach ($unvisited as $index => $order) {
                // Euclidean distance squared (fine for small areas)
                $dist = pow($order->shipping_lat - $currentLat, 2) + pow($order->shipping_lon - $currentLon, 2);
                if ($minDist === null || $dist < $minDist) {
                    $minDist = $dist;
                    $closestIndex = $index;
                }
            }

            $closestOrder = $unvisited->pull($closestIndex);
            
            DeliveryTrip::create([
                'trip_code' => $trip_code,
                'truck_id' => $truck->id,
                'order_id' => $closestOrder->id,
                'customer_id' => $closestOrder->customer_id,
                'delivery_sequence' => $sequence++,
                'target_lat' => $closestOrder->shipping_lat,
                'target_lon' => $closestOrder->shipping_lon,
                'status' => TripStatus::Waiting,
            ]);

            // Update order status
            $closestOrder->update(['order_status' => OrderStatus::Processing]);

            // Move current position to this stop
            $currentLat = $closestOrder->shipping_lat;
            $currentLon = $closestOrder->shipping_lon;
        }

        // Update truck status
        $truck->update(['status' => FleetStatus::Active]);

        return redirect()->back()->with('success', 'تم تحسين خط السير وإرسال المهمة للسائق بنجاح');
    }

    /**
     * Display logistics reports and analytics.
     */
    public function reports()
    {
        $stats = [
            'total_trips' => DeliveryTrip::distinct('trip_code')->count(),
            'completed_deliveries' => DeliveryTrip::where('status', TripStatus::Delivered)->count(),
            'active_fleet' => FleetManagement::where('status', FleetStatus::Active)->count(),
            'fleet_performance' => FleetManagement::withCount(['trips' => function($q) {
                $q->where('status', TripStatus::Delivered);
            }])->get(),
            'trip_logs' => DeliveryTrip::with(['truck', 'order.customer'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->groupBy('trip_code')
        ];

        return Inertia::render('Fleet/Reports', $stats);
    }

    /**
     * API for updating truck location (Logistic Tracking).
     */
    public function updateLocation(Request $request)
    {
        $request->validate([
            'gps_device_id' => 'required|exists:fleet_management,gps_device_id',
            'lat' => 'required|numeric',
            'lon' => 'required|numeric',
            'speed' => 'nullable|integer',
        ]);

        $truck = FleetManagement::where('gps_device_id', $request->gps_device_id)->first();
        
        $truck->update([
            'current_lat' => $request->lat,
            'current_lon' => $request->lon,
            'speed' => $request->speed,
            'last_update' => now(),
        ]);

        // Dispatch real-time update event
        event(new \App\Events\TruckLocationUpdated($truck));

        // Record route history if the truck is on an active trip
        $activeTrip = DeliveryTrip::where('truck_id', $truck->id)
            ->where('status', TripStatus::OnWay)
            ->first();

        if ($activeTrip) {
            \App\Models\RouteHistory::create([
                'trip_id' => $activeTrip->id,
                'lat' => $request->lat,
                'lon' => $request->lon,
                'recorded_at' => now(),
            ]);
            
            // TODO: Logic for 'Route deviation' detection can be implemented here
            // by comparing ($request->lat, $request->lon) with the planned sequence.
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Display a listing of the fleet.
     */
    public function list()
    {
        return Inertia::render('Fleet/FleetList', [
            'trucks' => FleetManagement::with('driver')->get(),
            'drivers' => User::whereIn('user_type', [UserType::Driver, UserType::Distributor])->get(),
        ]);
    }

    /**
     * Store a newly created truck.
     */
    public function store(Request $request)
    {
        $request->validate([
            'truck_number' => 'required|string|unique:fleet_management,truck_number',
            'driver_id' => 'nullable|exists:users,id',
            'gps_device_id' => 'nullable|string|unique:fleet_management,gps_device_id',
            'status' => 'required|string',
        ]);

        FleetManagement::create($request->all());

        return redirect()->back()->with('success', 'تم إضافة المركبة للأسطول بنجاح');
    }

    /**
     * Update the specified truck.
     */
    public function update(Request $request, $id)
    {
        $truck = FleetManagement::findOrFail($id);
        
        $request->validate([
            'truck_number' => 'required|string|unique:fleet_management,truck_number,' . $id,
            'driver_id' => 'nullable|exists:users,id',
            'gps_device_id' => 'nullable|string|unique:fleet_management,gps_device_id,' . $id,
            'status' => 'required|string',
        ]);

        $truck->update($request->all());

        return redirect()->back()->with('success', 'تم تحديث بيانات المركبة بنجاح');
    }

    /**
     * Remove the specified truck.
     */
    public function destroy($id)
    {
        $truck = FleetManagement::findOrFail($id);
        $truck->delete();

        return redirect()->back()->with('success', 'تم حذف المركبة من الأسطول بنجاح');
    }
}
