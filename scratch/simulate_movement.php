<?php

use App\Models\FleetManagement;
use App\Events\TruckLocationUpdated;

// Bootstrap Laravel - Fixed Paths
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Ensure at least one truck exists
$truck = FleetManagement::first();

if (!$truck) {
    // Create a dummy truck if none exist
    $truck = FleetManagement::create([
        'truck_number' => 'DEMO-999',
        'status' => 'Active',
        'gps_device_id' => 'GPS-SIM-1',
        'current_lat' => 15.3694,
        'current_lon' => 44.1910,
    ]);
}

echo "Starting simulation for truck {$truck->truck_number}...\n";

// Start coordinates (Near Tahrir)
$lat = 15.35;
$lon = 44.2;

for ($i = 0; $i < 100; $i++) {
    // Slightly move in a predictable way
    $lat += 0.0002;
    $lon += 0.0001;
    
    $truck->update([
        'current_lat' => $lat,
        'current_lon' => $lon,
        'speed' => rand(30, 50),
        'last_update' => now(),
        'status' => 'Active'
    ]);
    
    event(new TruckLocationUpdated($truck));
    
    echo "[$i] Updated location: $lat, $lon\n";
    sleep(2); // Wait 2 seconds
}
