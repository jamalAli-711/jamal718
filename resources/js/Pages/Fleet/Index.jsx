import React, { useState, useMemo, useCallback, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api';

const libraries = ['places'];
const YEMEN_CENTER = { lat: 15.3694, lng: 44.1910 };

export default function FleetIndex({ trucks = [], drivers = [], pendingOrders = [], activeTrips = {}, replenishmentAlerts = [] }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const mapOptions = useMemo(() => ({
        disableDefaultUI: true,
        clickableIcons: false,
        styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }],
            },
            {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }],
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
            },
            {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }],
            },
            {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }],
            },
            {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }],
            },
            {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }],
            },
            {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [{ color: "#f3d19c" }],
            },
            {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#2f3948" }],
            },
            {
                featureType: "transit.station",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
            },
            {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }],
            },
            {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }],
            },
        ],
    }), []);

    const [liveTrucks, setLiveTrucks] = useState(trucks);

    React.useEffect(() => {
        setLiveTrucks(trucks);
    }, [trucks]);

    React.useEffect(() => {
        if (typeof window.Echo !== 'undefined') {
            window.Echo.channel('fleet-tracking')
                .listen('.truck.location.updated', (e) => {
                    setLiveTrucks(prev => prev.map(t => 
                        t.id === e.truck.id ? { ...t, ...e.truck } : t
                    ));
                });
            return () => window.Echo.leaveChannel('fleet-tracking');
        }
    }, []);

    const [selectedOrders, setSelectedOrders] = useState([]);
    const [assigningToTruck, setAssigningToTruck] = useState(null);
    const [selectedTrip, setSelectedTrip] = useState(null); // For viewing active trip details
    const mapRef = useRef(null);

    const { data, setData, post, processing, reset } = useForm({
        truck_id: '',
        order_ids: [],
    });

    const toggleOrderSelection = (orderId) => {
        setSelectedOrders(prev => 
            prev.includes(orderId) 
                ? prev.filter(id => id !== orderId) 
                : [...prev, orderId]
        );
    };

    const handleAssign = () => {
        if (selectedOrders.length === 0 || !assigningToTruck) return;
        
        router.post(route('fleet.trips.store'), {
            truck_id: assigningToTruck,
            order_ids: selectedOrders,
        }, {
            onSuccess: () => {
                setSelectedOrders([]);
                setAssigningToTruck(null);
                reset();
            }
        });
    };

    const onLoad = useCallback((map) => {
        mapRef.current = map;
        const bounds = new window.google.maps.LatLngBounds();
        let hasPoints = false;

        // Extend bounds to pending orders
        pendingOrders.forEach(order => {
            if (order.shipping_lat && order.shipping_lon) {
                bounds.extend({ lat: parseFloat(order.shipping_lat), lng: parseFloat(order.shipping_lon) });
                hasPoints = true;
            }
        });

        // Extend bounds to active liveTrucks
        liveTrucks.forEach(truck => {
            if (truck.current_lat && truck.current_lon) {
                bounds.extend({ lat: parseFloat(truck.current_lat), lng: parseFloat(truck.current_lon) });
                hasPoints = true;
            }
        });

        if (hasPoints) {
            map.fitBounds(bounds, { padding: 50 });
        }
    }, [pendingOrders, liveTrucks]);

    const focusOnTruck = (truck) => {
        if (truck.current_lat && truck.current_lon && mapRef.current) {
            mapRef.current.panTo({ 
                lat: parseFloat(truck.current_lat), 
                lng: parseFloat(truck.current_lon) 
            });
            mapRef.current.setZoom(15);
            setSelectedTrip(truck.id);
        }
    };

    // Icons
    const truckIcon = (status) => ({
        path: "M44.02,23.36,37.16,16.5A4.47,4.47,0,0,0,34,15.19H29.15V13.5a1.5,1.5,0,0,0-1.5-1.5H13.75a1.5,1.5,0,0,0-1.5,1.5v28.8H9a1.5,1.5,0,0,0,0,3h6a6,6,0,0,0,12,0H39.5a6,6,0,0,0,12,0h6a1.5,1.5,0,0,0,0-3h-3.3l-.22-14.77A4.45,4.45,0,0,0,44.02,23.36ZM21,43.8a3,3,0,1,1,3-3A3,3,0,0,1,21,43.8Zm24.45,0a3,3,0,1,1,3-3A3,3,0,0,1,45.45,43.8Zm6.75-2.7h-6.2a6,6,0,0,0-11,0H27.15a6,6,0,0,0-11,0H15.25v-25.8h10.9v1.5a1.5,1.5,0,0,0,1.5,1.5H34a1.5,1.5,0,0,1,1.06.44l5,5H34a1.5,1.5,0,0,0,0,3h9l.17,11.36h0Z",
        fillColor: status === 'Active' ? '#10b981' : (status === 'Maintenance' ? '#f59e0b' : '#64748b'),
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#ffffff',
        scale: 0.6,
        anchor: isLoaded ? new window.google.maps.Point(30,30) : null,
    });

    const destinationIcon = {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
        fillColor: '#fbbf24',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#ffffff',
        scale: 1.2,
        anchor: isLoaded ? new window.google.maps.Point(12, 22) : null,
    };

    return (
        <AdminLayout
            user={usePage().props.auth.user}
            header="لوحة التحكم المركزية والأسطول"
        >
            <Head title="Fleet Management" />

            <div className="flex h-[calc(100vh-140px)] gap-4 p-4 overflow-hidden" dir="rtl">
                
                {/* Left Side: Orders Manager */}
                <div className="w-1/4 flex flex-col gap-4">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col flex-grow">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-black text-slate-900">طلبات الانتظار</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{pendingOrders.length} طلب متاح التوزيع</p>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route('fleet.reports')} className="bg-slate-200 text-slate-700 text-[10px] font-black px-3 py-1.5 rounded-xl hover:bg-slate-300 transition-all">التقارير</Link>
                                <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-1.5 rounded-xl">{selectedOrders.length}</span>
                            </div>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto p-2 space-y-2 custom-scrollbar">
                            {pendingOrders.map(order => (
                                <div 
                                    key={order.id}
                                    onClick={() => toggleOrderSelection(order.id)}
                                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${selectedOrders.includes(order.id) ? 'border-slate-900 bg-slate-50 shadow-md' : 'border-transparent bg-white hover:border-slate-100'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-slate-400">#{order.reference_number || order.id}</span>
                                        <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full">جاهز للتوزيع</span>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 mb-1">{order.customer?.name}</h4>
                                    <p className="text-[10px] text-slate-500 line-clamp-1">📍 {order.notes || 'لا يوجد عنوان مفصل'}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="flex -space-x-2 rtl:space-x-reverse">
                                            <div className="w-5 h-5 rounded-full bg-slate-200 border border-white" />
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400">{order.total_price} {order.currency_symbol}</span>
                                    </div>
                                </div>
                            ))}
                            {pendingOrders.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <span className="text-2xl">📦</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-400">لا توجد طلبات معلقة حالياً</p>
                                </div>
                            )}
                        </div>

                        {selectedOrders.length > 0 && (
                            <div className="p-4 bg-slate-900 border-t border-slate-100">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">اختر الشاحنة للإسناد:</label>
                                <select 
                                    className="w-full bg-white/10 border-none rounded-xl text-white text-xs font-bold focus:ring-1 focus:ring-white/20 mb-3"
                                    value={assigningToTruck || ''}
                                    onChange={(e) => setAssigningToTruck(e.target.value)}
                                >
                                    <option value="" className="text-slate-900">-- اختر شاحنة --</option>
                                    {liveTrucks.filter(t => t.status !== 'Maintenance').map(truck => (
                                        <option key={truck.id} value={truck.id} className="text-slate-900">
                                            {truck.truck_number} ({truck.driver?.name || 'بدون سائق'})
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    onClick={handleAssign}
                                    disabled={!assigningToTruck || processing}
                                    className="w-full py-3 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
                                >
                                    {processing ? 'جاري التنفيذ...' : 'بدء الرحلة الآن'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center: Live Map Tracking */}
                <div className="flex-grow flex flex-col gap-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 relative flex-grow">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                center={YEMEN_CENTER}
                                zoom={6}
                                onLoad={onLoad}
                                options={mapOptions}
                            >
                                {/* Active Trucks */}
                                {liveTrucks.map(truck => (
                                    truck.current_lat && truck.current_lon && (
                                        <Marker
                                            key={`truck-${truck.id}`}
                                            position={{ lat: parseFloat(truck.current_lat), lng: parseFloat(truck.current_lon) }}
                                            icon={truckIcon(truck.status)}
                                            title={truck.truck_number}
                                            onClick={() => setSelectedTrip(truck.id)}
                                        />
                                    )
                                ))}

                                {/* Order Destinations (Markers) */}
                                {pendingOrders.map(order => (
                                    order.shipping_lat && (
                                        <Marker
                                            key={`order-dest-${order.id}`}
                                            position={{ lat: parseFloat(order.shipping_lat), lng: parseFloat(order.shipping_lon) }}
                                            icon={destinationIcon}
                                            opacity={selectedOrders.includes(order.id) ? 1 : 0.4}
                                        />
                                    )
                                ))}

                                {/* Visual Trip Path for Active Trips */}
                                {Object.keys(activeTrips).map(tripCode => {
                                    const tripPoints = activeTrips[tripCode]
                                        .filter(t => t.target_lat)
                                        .sort((a, b) => a.delivery_sequence - b.delivery_sequence)
                                        .map(t => ({ lat: parseFloat(t.target_lat), lng: parseFloat(t.target_lon) }));
                                    
                                    const truck = liveTrucks.find(tr => tr.id === activeTrips[tripCode][0].truck_id);
                                    if (truck && truck.current_lat) {
                                        tripPoints.unshift({ lat: parseFloat(truck.current_lat), lng: parseFloat(truck.current_lon) });
                                    }

                                    return (
                                        <Polyline
                                            key={tripCode}
                                            path={tripPoints}
                                            options={{
                                                strokeColor: '#fbbf24',
                                                strokeOpacity: 0.6,
                                                strokeWeight: 3,
                                                icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 2 }, offset: "0", repeat: "20px" }],
                                            }}
                                        />
                                    );
                                })}
                            </GoogleMap>
                        ) : (
                            <div className="w-full h-full bg-slate-50 animate-pulse flex items-center justify-center">
                                <p className="text-slate-400 font-bold">جاري تحميل الخارطة اللوجستية...</p>
                            </div>
                        )}

                        {/* Live Stat Overlay */}
                        <div className="absolute top-6 left-6 flex gap-3 pointer-events-none">
                            <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-slate-100 pointer-events-auto">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">الرحلات النشطة</p>
                                <p className="text-lg font-black text-slate-900">{Object.keys(activeTrips).length}</p>
                            </div>
                            <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-slate-100 pointer-events-auto">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">حمولة الأسطول</p>
                                <p className="text-lg font-black text-slate-900">{(liveTrucks.filter(t => t.status === 'Active').length / liveTrucks.length * 100).toFixed(0)}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Status Feed */}
                    <div className="h-1/3 bg-white/50 backdrop-blur-xl rounded-[2rem] border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col">
                        <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            تحديثات الميدان الحية
                        </h3>
                        <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar">
                            {Object.keys(activeTrips).map(tripCode => {
                                const trip = activeTrips[tripCode][0];
                                return (
                                    <div key={tripCode} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                🚚
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900">{tripCode}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold">{trip.truck?.truck_number} - {trip.truck?.driver?.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <div className="text-left">
                                                <p className="text-[8px] font-black text-slate-400 uppercase">المرحلة</p>
                                                <p className="text-[10px] font-black text-blue-600">توصيل منفذ {activeTrips[tripCode].filter(t => t.status === 'Delivered').length + 1} من {activeTrips[tripCode].length}</p>
                                            </div>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-500 transition-all duration-1000" 
                                                    style={{ width: `${(activeTrips[tripCode].filter(t => t.status === 'Delivered').length / activeTrips[tripCode].length) * 100}%` }} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Side: Fleet Summary */}
                <div className="w-1/5 flex flex-col gap-4">
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl">
                        <h3 className="text-sm font-black mb-6 flex justify-between items-center">
                            الأسطول
                            <span className="text-[10px] opacity-40">LIVE</span>
                        </h3>
                        <div className="space-y-6">
                            {liveTrucks.map(truck => (
                                <div 
                                    key={truck.id} 
                                    className={`relative cursor-pointer transition-all hover:bg-white/5 p-3 -m-3 rounded-2xl ${selectedTrip === truck.id ? 'bg-white/10 ring-1 ring-white/20' : ''}`}
                                    onClick={() => focusOnTruck(truck)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-xs font-black">{truck.truck_number}</h4>
                                            <p className="text-[10px] opacity-50 font-bold">{truck.driver?.name || 'شاغر'}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${truck.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                            {truck.status === 'Active' ? 'في رحلة' : (truck.status === 'Maintenance' ? 'صيانة' : 'جاهز')}
                                        </span>
                                    </div>
                                    {truck.status === 'Active' && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex-grow h-1 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 animate-shimmer" style={{ width: '40%' }} />
                                            </div>
                                            <span className="text-[8px] font-black opacity-40">40%</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-grow bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200 p-6 shadow-xl flex flex-col">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">تنبيهات الذكاء اللوجستي</h3>
                        <div className="space-y-4 overflow-y-auto custom-scrollbar flex-grow">
                            {replenishmentAlerts.length > 0 ? replenishmentAlerts.map((alert, idx) => (
                                <div key={idx} className={`p-3 rounded-2xl border ${alert.severity === 'critical' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
                                    <p className={`text-[9px] font-black ${alert.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'} uppercase mb-1`}>
                                        {alert.severity === 'critical' ? 'تنبيه حرج 🚨' : 'تنبيه نفاذ مخزون 🛒'}
                                    </p>
                                    <p className="text-[10px] text-slate-900 font-bold leading-relaxed">
                                        بناءً على السجل، بضاعة "{alert.customer_name}" من {alert.product_name} {alert.days_left < 0 ? 'انتهت بالفعل' : `ستنتهي خلال ${alert.days_left} أيام`}.
                                    </p>
                                    <button className={`mt-2 w-full py-1.5 ${alert.severity === 'critical' ? 'bg-rose-600' : 'bg-amber-600'} text-white rounded-lg text-[9px] font-black uppercase tracking-widest`}>
                                        إصدار أمر مبيعات
                                    </button>
                                </div>
                            )) : (
                                <div className="text-center py-8">
                                    <p className="text-[10px] font-bold text-slate-400">لا توجد تنبيهات حالياً</p>
                                </div>
                            )}
                            
                            {/* Placeholder for Route Deviation Alert (Mocked for Demo) */}
                            <div className="p-3 bg-red-50 rounded-2xl border border-red-100 opacity-50">
                                <p className="text-[9px] font-black text-red-600 uppercase mb-1">انحراف مسار (تجريبي) ⚠️</p>
                                <p className="text-[10px] text-slate-900 font-bold leading-relaxed">جاري مراقبة المسارات الحية...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(250%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite linear;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                }
            `}} />
        </AdminLayout>
    );
}
