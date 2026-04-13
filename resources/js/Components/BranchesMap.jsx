import React, { useCallback, useRef, useState, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Autocomplete, OverlayView, Polygon } from '@react-google-maps/api';
import { Link } from '@inertiajs/react';

const YEMEN_CENTER = { lat: 15.3694, lng: 44.1910 };
const libraries = ['places'];

export default function BranchesMap({ branches = [], customers = [], stats = {}, height = '520px' }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: libraries,
    });

    const [hoveredMarker, setHoveredMarker] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [viewMode, setViewMode] = useState('all'); // 'branches', 'customers', 'all'
    const [filterBranchId, setFilterBranchId] = useState('all');
    const [showPoi, setShowPoi] = useState(false);
    const [selectedBoundary, setSelectedBoundary] = useState(null);
    const [inactivityDays, setInactivityDays] = useState(30);
    const [isTrackingInactivity, setIsTrackingInactivity] = useState(false);
    
    const mapRef = useRef(null);
    const autocompleteRef = useRef(null);
    const hoverTimeoutRef = useRef(null);

    const activeMarker = hoveredMarker || selectedMarker;

    // Filter Logic
    const filteredBranches = useMemo(() => {
        if (viewMode === 'customers') return [];
        return branches.filter(b => b.branch_lat && b.branch_lon);
    }, [branches, viewMode]);

    const filteredCustomers = useMemo(() => {
        if (viewMode === 'branches') return [];
        let list = customers.filter(c => c.lat && c.lng);
        if (filterBranchId !== 'all') {
            list = list.filter(c => c.branch_id == filterBranchId);
        }
        return list;
    }, [customers, viewMode, filterBranchId]);

    const onLoad = useCallback((map) => {
        mapRef.current = map;
        const bounds = new window.google.maps.LatLngBounds();
        let hasPoints = false;

        filteredBranches.forEach(b => {
             bounds.extend({ lat: parseFloat(b.branch_lat), lng: parseFloat(b.branch_lon) });
             hasPoints = true;
        });
        filteredCustomers.forEach(c => {
             bounds.extend({ lat: parseFloat(c.lat), lng: parseFloat(c.lng) });
             hasPoints = true;
        });

        if (hasPoints) {
            map.fitBounds(bounds, { padding: 80 });
        }
    }, [filteredBranches, filteredCustomers]);

    const onAutocompleteLoad = (autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry) {
                mapRef.current.panTo(place.geometry.location);
                mapRef.current.setZoom(12);
            }
        }
    };

    const handleMouseOver = (data, type) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setHoveredMarker({ id: data.id, type, data });
    };

    const handleMouseOut = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredMarker(null);
        }, 100);
    };

    // Custom Icons
    const branchIcon = useMemo(() => {
        if (!isLoaded || !window.google) return null;
        return {
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
            fillColor: "#0058be",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
            scale: 2,
            anchor: new window.google.maps.Point(12, 22),
        };
    }, [isLoaded]);

    const customerIcon = useMemo(() => {
        if (!isLoaded || !window.google) return null;
        return {
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
            fillColor: "#e31e24", // Royal Red
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
            scale: 1.5,
            anchor: new window.google.maps.Point(12, 22),
        };
    }, [isLoaded]);

    const inactiveCustomerIcon = useMemo(() => {
        if (!isLoaded || !window.google) return null;
        return {
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
            fillColor: "#eab308", // Golden Yellow
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
            scale: 1.7, // Slightly larger to highlight
            anchor: new window.google.maps.Point(12, 22),
        };
    }, [isLoaded]);

    if (!isLoaded) return <div style={{ height }} className="rounded-[2rem] bg-slate-50 animate-pulse border-2 border-slate-100" />;

    return (
        <div className="relative group" style={{ height }}>
            {/* Control Bar */}
            <div className="absolute top-6 left-6 right-6 z-10 flex flex-wrap gap-3 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/20 flex gap-1 pointer-events-auto transition-all hover:scale-[1.02]">
                    <button onClick={() => setViewMode('all')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>الكل</button>
                    <button onClick={() => setViewMode('branches')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'branches' ? 'bg-[#0058be] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>الفروع</button>
                    <button onClick={() => setViewMode('customers')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'customers' ? 'bg-[#e31e24] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>العملاء</button>
                </div>

                {viewMode !== 'branches' && (
                    <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/20 flex items-center pointer-events-auto transition-all hover:scale-[1.02]">
                        <span className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">التصفية:</span>
                        <select value={filterBranchId} onChange={(e) => setFilterBranchId(e.target.value)} className="bg-transparent border-none text-[11px] font-black text-slate-900 focus:ring-0 cursor-pointer pr-8">
                            <option value="all">جميع الفروع</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.branch_name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/20 pointer-events-auto">
                    <button onClick={() => setShowPoi(!showPoi)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showPoi ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-slate-500'}`}>
                        {showPoi ? 'إخفاء المعالم' : 'إظهار المحلات'}
                    </button>
                </div>

                <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/20 flex items-center pointer-events-auto transition-all hover:scale-[1.02]">
                    <span className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">تحليل الخمول:</span>
                    <input 
                        type="number" 
                        value={inactivityDays} 
                        onChange={(e) => setInactivityDays(parseInt(e.target.value) || 0)}
                        className="w-16 bg-transparent border-none text-[11px] font-black text-slate-900 focus:ring-0 p-1"
                    />
                    <span className="text-[9px] font-bold text-slate-400 ml-2">يوم</span>
                    <button 
                        onClick={() => setIsTrackingInactivity(!isTrackingInactivity)} 
                        className={`ml-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isTrackingInactivity ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-100 text-slate-500'}`}
                    >
                        {isTrackingInactivity ? 'إيقاف التتبع' : 'تتبع الخمول'}
                    </button>
                </div>
            </div>

            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '2rem' }}
                center={YEMEN_CENTER}
                zoom={6}
                onLoad={onLoad}
                onClick={() => {
                    setHoveredMarker(null);
                    setSelectedMarker(null);
                    setSelectedBoundary(null);
                }}
                options={{
                    streetViewControl: false, mapTypeControl: false, fullscreenControl: true, zoomControl: true,
                    styles: [
                        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: showPoi ? 'on' : 'off' }] },
                        { featureType: 'landscape', elementType: 'geometry.fill', stylers: [{ color: '#f8fafc' }] },
                        { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#e2e8f0' }] },
                    ],
                }}
            >
                <Autocomplete
                    onLoad={onAutocompleteLoad}
                    onPlaceChanged={onPlaceChanged}
                    options={{ componentRestrictions: { country: "ye" } }}
                >
                    <input type="text" placeholder="ابحث في اليمن..." style={{
                        boxSizing: `border-box`, border: `none`, width: `240px`, height: `40px`, padding: `0 12px`,
                        borderRadius: `12px`, boxShadow: `0 8px 16px rgba(0,0,0,0.1)`, fontSize: `13px`,
                        outline: `none`, position: `absolute`, left: `24px`, bottom: `24px`, backgroundColor: '#fff', fontWeight: 'bold'
                    }} />
                </Autocomplete>

                {/* Branch Markers */}
                {filteredBranches.map((branch) => (
                    <Marker
                        key={`branch-${branch.id}`}
                        position={{ lat: parseFloat(branch.branch_lat), lng: parseFloat(branch.branch_lon) }}
                        icon={branchIcon}
                        optimized={false}
                        onMouseOver={() => handleMouseOver(branch, 'branch')}
                        onMouseOut={handleMouseOut}
                        onClick={() => {
                            setSelectedMarker({ id: branch.id, type: 'branch', data: branch });
                            setSelectedBoundary(branch.boundary_coordinates);
                        }}
                    />
                ))}

                {/* Customer Markers with Luxury Pulse */}
                {filteredCustomers.map((customer) => {
                    const lastOrderDate = customer.last_order_at ? new Date(customer.last_order_at) : null;
                    const diffDays = lastOrderDate ? Math.floor((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24)) : 999;
                    const isInactive = isTrackingInactivity && diffDays >= inactivityDays;

                    return (
                        <React.Fragment key={`cust-group-${customer.id}`}>
                            {/* Pulse Effect */}
                            <OverlayView
                                position={{ lat: parseFloat(customer.lat), lng: parseFloat(customer.lng) }}
                                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                            >
                                <div className="relative flex items-center justify-center pointer-events-none">
                                    {/* Pulse Effect */}
                                    <div className={`absolute w-6 h-6 ${isInactive ? 'bg-yellow-500/50' : 'bg-red-500/30'} rounded-full animate-luxury-pulse pointer-events-none -translate-x-1/2 -translate-y-1/2`} />
                                    <div className={`absolute w-12 h-12 ${isInactive ? 'bg-yellow-400/30' : 'bg-red-400/20'} rounded-full animate-luxury-pulse delay-700 pointer-events-none -translate-x-1/2 -translate-y-1/2`} />
                                    
                                    {/* Shop Name Label */}
                                    <div className="absolute bottom-[42px] whitespace-nowrap px-2 py-0.5 bg-white/95 backdrop-blur-md rounded-md border border-slate-200 shadow-xl pointer-events-none -translate-x-1/2 select-none z-50">
                                        <span className="text-[9px] font-black text-slate-800 uppercase tracking-tight">{customer.name}</span>
                                    </div>
                                </div>
                            </OverlayView>
                            
                            <Marker
                                position={{ lat: parseFloat(customer.lat), lng: parseFloat(customer.lng) }}
                                icon={isInactive ? inactiveCustomerIcon : customerIcon}
                                optimized={false}
                                onMouseOver={() => handleMouseOver(customer, 'customer')}
                                onMouseOut={handleMouseOut}
                                onClick={() => {
                                    setSelectedMarker({ id: customer.id, type: 'customer', data: customer });
                                    setSelectedBoundary(null);
                                }}
                                zIndex={isInactive ? 100 : 10}
                            />
                        </React.Fragment>
                    );
                })}

                {activeMarker && (
                    <InfoWindow 
                        position={activeMarker.type === 'branch' 
                            ? { lat: parseFloat(activeMarker.data.branch_lat), lng: parseFloat(activeMarker.data.branch_lon) }
                            : { lat: parseFloat(activeMarker.data.lat), lng: parseFloat(activeMarker.data.lng) }
                        }
                        options={{
                            pixelOffset: (isLoaded && window.google) ? new window.google.maps.Size(0, -35) : null
                        }}
                        onCloseClick={() => {
                            setHoveredMarker(null);
                            setSelectedMarker(null);
                            setSelectedBoundary(null);
                        }}
                    >
                        <div className="w-64 p-0 bg-white" dir="rtl">
                            <div className={`h-1.5 w-full ${activeMarker.type === 'branch' ? 'bg-[#0058be]' : 'bg-[#e31e24]'}`} />
                            <div className="p-5">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">
                                    {activeMarker.type === 'branch' ? 'المركز الميداني' : 'ملف تتبع العميل'}
                                </span>
                                <h4 className="text-xl font-black text-slate-900 mb-1 tracking-tighter">{activeMarker.type === 'branch' ? activeMarker.data.branch_name : activeMarker.data.name}</h4>
                                <p className="text-[11px] font-bold text-slate-400 mb-6 italic">{activeMarker.type === 'branch' ? `📍 ${activeMarker.data.location_city}` : `📦 تبعية: ${activeMarker.data.branch_id ? 'فرع محدد' : 'مركزي'}`}</p>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <p className="text-[8px] font-black text-slate-400 mb-1">المبيعات</p>
                                        <p className="text-sm font-black text-slate-900">{activeMarker.type === 'branch' ? activeMarker.data.total_sales : activeMarker.data.total_spent} <span className="text-[8px] opacity-40">{stats.currency_symbol}</span></p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <p className="text-[8px] font-black text-slate-400 mb-1">الطلبات</p>
                                        <p className="text-sm font-black text-slate-900">{activeMarker.data.orders_count} <span className="text-[8px] opacity-40">ORD</span></p>
                                    </div>
                                </div>

                                <Link href={activeMarker.type === 'branch' ? route('branches.index') : route('customers.show', activeMarker.data.id)} 
                                      className={`w-full flex items-center justify-center py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all ${activeMarker.type === 'customer' ? 'hover:bg-[#e31e24]' : 'hover:bg-[#0058be]'}`}>
                                    {activeMarker.type === 'branch' ? 'معاينة اللوجستيات' : 'عرض السجل المالي'}
                                </Link>
                            </div>
                        </div>
                    </InfoWindow>
                )}
                {selectedBoundary && (
                    <Polygon
                        paths={selectedBoundary}
                        options={{
                            strokeColor: "#e31e24",
                            strokeOpacity: 0.8,
                            strokeWeight: 4,
                            fillColor: "#e31e24",
                            fillOpacity: 0.1,
                            geodesic: true,
                        }}
                    />
                )}
            </GoogleMap>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes luxury-pulse {
                    0% { transform: scale(0.6); opacity: 0.8; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                .animate-luxury-pulse {
                    animation: luxury-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .delay-700 { animation-delay: 0.7s; }
            `}} />
        </div>
    );
}
