import { useState, useEffect, useRef } from 'react';
import { useForm, Link } from '@inertiajs/react';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function loadGoogleMaps() {
    return new Promise((resolve) => {
        if (window.google?.maps) { resolve(); return; }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&language=ar`;
        script.async = true;
        script.onload = resolve;
        document.head.appendChild(script);
    });
}

/**
 * يفتح تطبيق الخرائط الأصلي على الجهاز:
 *  - iOS  → Apple Maps (maps://) أو Google Maps (comgooglemaps://)
 *  - Android → geo: URI (يفتح أي تطبيق خرائط مثبّت)
 *  - سطح المكتب → Google Maps في المتصفح
 */
function openInMapsApp(lat, lng, label = '') {
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/.test(ua);
    const encoded = encodeURIComponent(label);

    if (isIOS) {
        // محاولة فتح Google Maps أولاً، ثم Apple Maps كـ fallback
        const googleMapsDeep = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
        const appleMapsWeb  = `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = googleMapsDeep;
        document.body.appendChild(iframe);
        setTimeout(() => {
            document.body.removeChild(iframe);
            window.location.href = appleMapsWeb;
        }, 1200);
    } else if (isAndroid) {
        // geo: URI يفتح تطبيق الخرائط الافتراضي على Android
        window.location.href = `geo:${lat},${lng}?q=${lat},${lng}(${encoded})`;
    } else {
        // سطح المكتب: فتح Google Maps في تبويب جديد
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
            '_blank'
        );
    }
}

export default function CartContent({ onCheckoutSuccess, isGuest }) {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
    const [nearestBranches, setNearestBranches] = useState(null);
    const [isFetchingBranches, setIsFetchingBranches] = useState(false);
    const [gpsError, setGpsError] = useState(null);
    const [citizenPos, setCitizenPos] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    const { data, setData, post, processing, errors } = useForm({ items: [] });

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
        updateTotal(cart);
    }, []);

    useEffect(() => {
        if (nearestBranches && mapRef.current) {
            initMap();
        }
    }, [nearestBranches]);

    const updateTotal = (items) => {
        const sum = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(sum);
        setData('items', items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            is_gift: item.is_gift || false,
            parent_id: item.parent_id || null,
            notes: item.notes || ''
        })));
    };

    const updateQuantity = (index, delta) => {
        const newCart = [...cartItems];
        const item = newCart[index];
        if (item.is_gift) return;
        newCart[index].quantity = Math.max(1, Math.min(item.quantity + delta, item.stock_quantity));
        setCartItems(newCart);
        updateTotal(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const removeItem = (index) => {
        const itemToRemove = cartItems[index];
        let newCart = cartItems.filter((_, i) => i !== index);
        if (!itemToRemove.is_gift) {
            newCart = newCart.filter(item => item.parent_id !== itemToRemove.product_id);
        }
        setCartItems(newCart);
        updateTotal(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const processCheckout = () => {
        post(route('customer.checkout'), {
            onSuccess: () => {
                localStorage.removeItem('cart');
                window.dispatchEvent(new Event('cartUpdated'));
                if (onCheckoutSuccess) onCheckoutSuccess();
            }
        });
    };

    const submitOrder = (e) => {
        e.preventDefault();
        if (isGuest) {
            setIsGuestModalOpen(true);
        } else {
            processCheckout();
        }
    };

    const getUserLocation = () => new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('المتصفح لا يدعم تحديد الموقع'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => reject(new Error('تعذّر الحصول على موقعك. تأكد من السماح بالوصول للموقع.')),
            { timeout: 10000, enableHighAccuracy: true }
        );
    });

    const fetchNearestBranches = async () => {
        setIsFetchingBranches(true);
        setGpsError(null);
        try {
            let pos = null;
            try { pos = await getUserLocation(); setCitizenPos(pos); } catch (_) {}

            const productIds = cartItems.map(item => item.product_id);
            const url = new URL(route('api.nearest-branches'), window.location.origin);
            productIds.forEach(id => url.searchParams.append('product_ids[]', id));
            if (pos) {
                url.searchParams.set('lat', pos.lat);
                url.searchParams.set('lng', pos.lng);
            }

            const response = await fetch(url.toString());
            const responseData = await response.json();
            setNearestBranches(responseData);
            if (!pos) setGpsError('لم يتم تحديد موقعك – يتم عرض جميع النقاط بدون ترتيب.');
        } catch (error) {
            setGpsError('حدث خطأ أثناء جلب البيانات.');
        } finally {
            setIsFetchingBranches(false);
        }
    };

    const initMap = async () => {
        await loadGoogleMaps();
        if (!mapRef.current || !window.google) return;

        const center = citizenPos
            ? { lat: citizenPos.lat, lng: citizenPos.lng }
            : (nearestBranches.length > 0
                ? { lat: nearestBranches[0].lat, lng: nearestBranches[0].lng }
                : { lat: 15.5527, lng: 48.5164 });

        const map = new window.google.maps.Map(mapRef.current, {
            center,
            zoom: citizenPos ? 12 : 7,
            styles: [
                { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d44' }] },
                { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d0d1a' }] },
                { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            ],
            disableDefaultUI: true,
            zoomControl: true,
        });
        mapInstanceRef.current = map;

        // clear old markers
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        // citizen marker
        if (citizenPos) {
            const cm = new window.google.maps.Marker({
                position: citizenPos,
                map,
                title: 'موقعك',
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#fbbf24',
                    fillOpacity: 1,
                    strokeColor: '#fff',
                    strokeWeight: 3,
                },
                zIndex: 999,
            });
            markersRef.current.push(cm);
        }

        // distributor markers
        nearestBranches.forEach((branch, i) => {
            const marker = new window.google.maps.Marker({
                position: { lat: branch.lat, lng: branch.lng },
                map,
                title: branch.name,
                label: { text: String(i + 1), color: '#000', fontWeight: 'bold', fontSize: '12px' },
                icon: {
                    path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                    scale: 8,
                    fillColor: '#fbbf24',
                    fillOpacity: 1,
                    strokeColor: '#000',
                    strokeWeight: 1,
                },
            });
            marker.addListener('click', () => setSelectedBranch(branch));
            markersRef.current.push(marker);
        });
    };

    // ─── Empty cart ───────────────────────────────────────────────────────────
    if (cartItems.length === 0) {
        return (
            <div className="text-center py-24 space-y-6">
                <div className="w-24 h-24 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
                    <svg className="w-12 h-12 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </div>
                <div>
                    <h3 className="text-2xl font-black text-white/40 tracking-tighter">محفظتك الحصرية فارغة</h3>
                    <p className="text-white/20 text-xs font-bold mt-2 uppercase tracking-[0.2em]">أضف أصنافاً لتبدأ رحلتك الحصرية</p>
                </div>
            </div>
        );
    }

    // ─── Guest modal ──────────────────────────────────────────────────────────
    if (isGuestModalOpen) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
                        <span className="text-amber-400">إجراءات</span> إتمام الطلب
                    </h3>
                    <button type="button" onClick={() => { setIsGuestModalOpen(false); setNearestBranches(null); setSelectedBranch(null); }}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                </div>

                {/* Step 1: Choose path */}
                {!nearestBranches ? (
                    <div className="space-y-6">
                        {/* Merchant card */}
                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                            <h4 className="text-lg font-black text-white mb-2">هل أنت تاجر؟</h4>
                            <p className="text-sm text-white/40 mb-6">يجب أن تكون مسجلاً كتاجر في نظامنا لتتمكن من إرسال طلبات الشراء عبر المنصة مباشرة.</p>
                            <Link href={route('register')}
                                className="block w-full text-center py-4 bg-amber-400 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-500 transition-all">
                                سجل حساب تاجر الآن
                            </Link>
                        </div>

                        {/* Citizen card */}
                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                            <h4 className="text-lg font-black text-white mb-2">هل أنت مواطن مستهلك؟</h4>
                            <p className="text-sm text-white/40 mb-4">يمكنك استعراض أقرب نقاط البيع والفروع التابعة لنا والتي تتوفر فيها الأصناف التي اخترتها.</p>
                            <p className="text-xs text-amber-400/70 mb-6 flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                سيتم طلب موقعك لإيجاد أقرب نقطة بيع إليك
                            </p>
                            <button type="button" onClick={fetchNearestBranches} disabled={isFetchingBranches}
                                className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {isFetchingBranches ? (
                                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> جاري البحث...</>
                                ) : 'عرض أقرب نقاط البيع المباشر'}
                            </button>
                        </div>
                    </div>

                ) : (
                    /* Step 2: Map + list */
                    <div className="space-y-5">
                        {/* Back */}
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => { setNearestBranches(null); setSelectedBranch(null); }}
                                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                            <h4 className="text-lg font-black text-white">أقرب نقاط البيع المباشر</h4>
                            {citizenPos && (
                                <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                    مُرتّب حسب موقعك
                                </span>
                            )}
                        </div>

                        {gpsError && (
                            <div className="text-xs text-amber-400/70 bg-amber-400/5 border border-amber-400/10 rounded-xl px-4 py-2">
                                ⚠️ {gpsError}
                            </div>
                        )}

                        {nearestBranches.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-white/40 font-bold">نعتذر، لم نجد تجاراً يحملون هذه الأصناف حالياً.</p>
                            </div>
                        ) : (
                            <>
                                {/* Google Map */}
                                <div ref={mapRef} className="w-full h-56 rounded-2xl overflow-hidden border border-white/10 bg-black/40" />

                                {/* Selected branch info popup */}
                                {selectedBranch && (
                                    <div className="bg-amber-400/10 border border-amber-400/20 p-4 rounded-2xl animate-in fade-in duration-300">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="font-black text-white">{selectedBranch.name}</h5>
                                                <p className="text-xs text-amber-400">{selectedBranch.city}</p>
                                                {selectedBranch.phone && (
                                                    <a href={`tel:${selectedBranch.phone}`} className="text-xs text-white/60 mt-1 block">📞 {selectedBranch.phone}</a>
                                                )}
                                            </div>
                                            <button onClick={() => setSelectedBranch(null)} className="text-white/30 hover:text-white text-lg leading-none">×</button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => openInMapsApp(selectedBranch.lat, selectedBranch.lng, selectedBranch.name)}
                                            className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-amber-400 text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-500 transition-all">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                            ابدأ الملاحة على الخريطة
                                        </button>
                                    </div>
                                )}

                                {/* Distributor list */}
                                <div className="max-h-64 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                                    {nearestBranches.map((branch, i) => (
                                        <button key={branch.id} type="button"
                                            onClick={() => { setSelectedBranch(branch); mapInstanceRef.current?.panTo({ lat: branch.lat, lng: branch.lng }); mapInstanceRef.current?.setZoom(14); }}
                                            className={`w-full text-right bg-white/[0.03] border p-4 rounded-2xl transition-all hover:bg-white/[0.07] ${selectedBranch?.id === branch.id ? 'border-amber-400/40' : 'border-white/5'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-amber-400 text-black text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                                                    <div className="text-right">
                                                        <h5 className="font-black text-white text-sm">{branch.name}</h5>
                                                        <span className="text-[10px] text-amber-400/80">{branch.city}</span>
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    {branch.distance_km !== null && (
                                                        <span className="text-xs font-black text-white/50">{branch.distance_km} كم</span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={e => { e.stopPropagation(); openInMapsApp(branch.lat, branch.lng, branch.name); }}
                                                        className="block mt-1 text-[10px] text-amber-400 hover:text-amber-300 transition-all">
                                                        🗺 الملاحة
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {branch.products.slice(0, 4).map(p => (
                                                    <span key={p.id} className="px-2 py-0.5 bg-black/40 border border-white/5 rounded-lg text-[9px] text-white/50 font-bold">
                                                        {p.name}
                                                    </span>
                                                ))}
                                                {branch.products.length > 4 && (
                                                    <span className="px-2 py-0.5 bg-black/40 border border-white/5 rounded-lg text-[9px] text-white/30 font-bold">
                                                        +{branch.products.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // ─── Normal cart view ─────────────────────────────────────────────────────
    return (
        <form onSubmit={submitOrder} className="space-y-12">
            <div className="space-y-6 max-h-[50vh] overflow-y-auto px-2 custom-scrollbar">
                {cartItems.map((item, index) => (
                    <div key={`${item.product_id}-${index}`} className="group flex items-center gap-6 p-5 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-3xl rounded-3xl border border-white/5 transition-all duration-500">
                        <div className="w-20 h-20 bg-black rounded-2xl overflow-hidden shrink-0 border border-white/5">
                            <img src={item.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {item.is_gift && <span className="text-[8px] font-black bg-amber-400 text-black px-2 py-0.5 rounded-full uppercase tracking-widest">هدية</span>}
                                <h4 className="text-sm font-black text-white truncate">{item.name}</h4>
                            </div>
                            <div className="text-xs font-black text-amber-400/80">{Number(item.price).toLocaleString()} <span className="text-[10px] text-white/20 uppercase tracking-widest">ريال</span></div>
                        </div>
                        <div className="flex items-center gap-4">
                            {!item.is_gift ? (
                                <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/5 shadow-inner">
                                    <button type="button" onClick={() => updateQuantity(index, 1)} className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-amber-400 transition-all font-black">+</button>
                                    <span className="w-8 text-center font-black text-white text-sm">{item.quantity}</span>
                                    <button type="button" onClick={() => updateQuantity(index, -1)} disabled={item.quantity <= 1} className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-amber-400 transition-all font-black disabled:opacity-10">-</button>
                                </div>
                            ) : (
                                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] whitespace-nowrap">عنصر مجاني</div>
                            )}
                            <button type="button" onClick={() => removeItem(index)} className="w-10 h-10 flex items-center justify-center text-white/10 hover:text-rose-400 transition-all">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-10 border-t border-white/5 space-y-8">
                <div className="flex justify-between items-end">
                    <span className="text-xs font-black text-white/30 uppercase tracking-[0.4em]">إجمالي الطلب</span>
                    <div className="text-right">
                        <div className="text-4xl font-black text-white leading-none tracking-tighter">{total.toLocaleString()}</div>
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">ريال يمني</div>
                    </div>
                </div>
                <div className="space-y-4">
                    <button type="submit" disabled={processing}
                        className="w-full py-6 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:opacity-20 text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-amber-500/10 transition-all active:scale-[0.98]">
                        {processing ? 'جاري تأكيد الجلسة...' : 'تأكيد الطلب وإرساله'}
                    </button>
                    {errors.items && <p className="text-xs font-bold text-rose-500 text-center">{errors.items}</p>}
                </div>
            </div>
        </form>
    );
}
