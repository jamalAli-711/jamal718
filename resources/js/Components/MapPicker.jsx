import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from '@react-google-maps/api';

const YEMEN_CENTER = { lat: 15.5527, lng: 44.0170 };
const libraries = ['places'];

export default function MapPicker({ lat, lng, onLocationChange, height = '300px' }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: libraries,
    });

    const [marker, setMarker] = useState(
        lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null
    );

    const mapRef = useRef(null);
    const searchBoxRef = useRef(null);

    const onLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const handleClick = useCallback((e) => {
        const pos = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
        };
        setMarker(pos);
        if (onLocationChange) {
            onLocationChange(pos.lat, pos.lng);
        }
    }, [onLocationChange]);

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
            setMarker(newLocation);
            if (mapRef.current) {
                mapRef.current.panTo(newLocation);
                mapRef.current.setZoom(16);
            }
            if (onLocationChange) onLocationChange(newLocation.lat, newLocation.lng);
        }
    };

    if (!isLoaded) {
        return (
            <div style={{ height }} className="rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    جاري تحميل الخريطة...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm relative" style={{ height }}>
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={marker || YEMEN_CENTER}
                    zoom={marker ? 14 : 6}
                    onClick={handleClick}
                    onLoad={onLoad}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: true,
                        zoomControl: true,
                    }}
                >
                    <StandaloneSearchBox
                        onLoad={onSearchLoad}
                        onPlacesChanged={onPlacesChanged}
                    >
                        <input
                            type="text"
                            placeholder="بحث عن موقع..."
                            className="absolute top-3 right-[50%] translate-x-[50%] w-3/4 max-w-sm h-10 px-4 rounded-full shadow-lg border-0 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </StandaloneSearchBox>

                    {/* Geolocation Hook */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                        const pos = {
                                            lat: position.coords.latitude,
                                            lng: position.coords.longitude,
                                        };
                                        setMarker(pos);
                                        if (mapRef.current) {
                                            mapRef.current.panTo(pos);
                                            mapRef.current.setZoom(16);
                                        }
                                        if (onLocationChange) onLocationChange(pos.lat, pos.lng);
                                    },
                                    () => {
                                        alert("تعذر الوصول إلى موقعك. يرجى تفعيل إعدادات الموقع.");
                                    }
                                );
                            } else {
                                alert("متصفحك لا يدعم تحديد الموقع.");
                            }
                        }}
                        className="absolute bottom-6 right-6 bg-white w-10 h-10 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.3)] flex items-center justify-center hover:bg-gray-50 focus:outline-none transition-colors"
                        title="استخدام موقعي الحالي"
                    >
                        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364 6.364l-1.414-1.414M7.05 7.05L5.636 5.636m12.728 0l-1.414 1.414M7.05 16.95l-1.414 1.414M12 18a6 6 0 100-12 6 6 0 000 12z" />
                        </svg>
                    </button>

                    {marker && (
                        <Marker
                            position={marker}
                            draggable={true}
                            onDragEnd={(e) => {
                                const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                                setMarker(pos);
                                if (onLocationChange) onLocationChange(pos.lat, pos.lng);
                            }}
                        />
                    )}
                </GoogleMap>
            </div>
            {marker ? (
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                        📍 {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
                    </span>
                    <button
                        type="button"
                        onClick={() => { setMarker(null); if (onLocationChange) onLocationChange(null, null); }}
                        className="text-red-500 hover:text-red-700 font-medium"
                    >
                        إزالة الموقع
                    </button>
                </div>
            ) : (
                <p className="text-xs text-gray-400 text-center">انقر على الخريطة لتحديد موقع الفرع</p>
            )}
        </div>
    );
}
