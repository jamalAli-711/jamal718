import { useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, StandaloneSearchBox } from '@react-google-maps/api';
import { useState } from 'react';

const YEMEN_CENTER = { lat: 15.5527, lng: 44.0170 };
const libraries = ['places'];

export default function BranchesMap({ branches = [], height = '380px' }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: libraries,
    });

    const [activeMarker, setActiveMarker] = useState(null);
    const mapRef = useRef(null);
    const searchBoxRef = useRef(null);

    const branchesWithCoords = branches.filter(b => b.branch_lat && b.branch_lon);

    const onLoad = useCallback((map) => {
        mapRef.current = map;
        // Fit bounds to show all markers
        if (branchesWithCoords.length > 1) {
            const bounds = new window.google.maps.LatLngBounds();
            branchesWithCoords.forEach(b => {
                bounds.extend({ lat: parseFloat(b.branch_lat), lng: parseFloat(b.branch_lon) });
            });
            map.fitBounds(bounds, { padding: 60 });
        }
    }, [branchesWithCoords]);

    const onSearchLoad = useCallback(ref => {
        searchBoxRef.current = ref;
    }, []);

    const onPlacesChanged = () => {
        const places = searchBoxRef.current?.getPlaces();
        if (places && places.length > 0) {
            const place = places[0];
            const newLocation = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            };
            if (mapRef.current) {
                mapRef.current.panTo(newLocation);
                mapRef.current.setZoom(12);
            }
        }
    };

    if (!isLoaded) {
        return (
            <div style={{ height }} className="rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 animate-pulse">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    جاري تحميل الخريطة...
                </div>
            </div>
        );
    }

    if (branchesWithCoords.length === 0) {
        return (
            <div style={{ height }} className="rounded-lg bg-gray-50 flex flex-col items-center justify-center border border-gray-200 text-center px-4">
                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p className="text-sm text-gray-400 font-medium">لا توجد فروع بمواقع محددة</p>
                <p className="text-xs text-gray-300 mt-1">حدد موقع الفرع من صفحة إدارة الفروع</p>
            </div>
        );
    }

    const center = branchesWithCoords.length === 1
        ? { lat: parseFloat(branchesWithCoords[0].branch_lat), lng: parseFloat(branchesWithCoords[0].branch_lon) }
        : YEMEN_CENTER;

    return (
        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm relative" style={{ height }}>
            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={center}
                zoom={branchesWithCoords.length === 1 ? 12 : 6}
                onLoad={onLoad}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    zoomControl: true,
                    styles: [
                        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
                    ],
                }}
            >
                <StandaloneSearchBox
                    onLoad={onSearchLoad}
                    onPlacesChanged={onPlacesChanged}
                >
                    <input
                        type="text"
                        placeholder="ابحث عن مدينة أو منطقة..."
                        className="absolute top-3 right-[50%] translate-x-[50%] w-3/4 max-w-sm h-10 px-4 rounded-full shadow-lg border-0 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </StandaloneSearchBox>

                {branchesWithCoords.map((branch) => (
                    <Marker
                        key={branch.id}
                        position={{ lat: parseFloat(branch.branch_lat), lng: parseFloat(branch.branch_lon) }}
                        title={branch.branch_name}
                        onClick={() => setActiveMarker(branch.id)}
                    >
                        {activeMarker === branch.id && (
                            <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                                <div style={{ direction: 'rtl', textAlign: 'right', padding: '4px 0' }}>
                                    <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#1f2937' }}>{branch.branch_name}</h4>
                                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>📍 {branch.location_city}</p>
                                    {branch.manager_name && (
                                        <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', margin: 0 }}>المدير: {branch.manager_name}</p>
                                    )}
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '11px', color: '#6b7280' }}>
                                        <span><strong>{branch.products_count || 0}</strong> منتج</span>
                                        <span><strong>{branch.orders_count || 0}</strong> طلب</span>
                                    </div>
                                </div>
                            </InfoWindow>
                        )}
                    </Marker>
                ))}
            </GoogleMap>
        </div>
    );
}
