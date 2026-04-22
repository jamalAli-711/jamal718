import { useState, useEffect, useRef } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link } from '@inertiajs/react';

// const HERO_IMG= 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80';
const HERO_IMG = '/storage/products/shun.png';

export default function Storefront({ products, categories }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [quantities, setQuantities] = useState(
        products.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})
    );
    const [cartItems, setCartItems] = useState([]);
    const [toast, setToast] = useState(null);

    const syncCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
    };

    useEffect(() => {
        syncCart();
        window.addEventListener('cartUpdated', syncCart);
        return () => window.removeEventListener('cartUpdated', syncCart);
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleManualQuantityChange = (productId, value) => {
        const product = products.find(p => p.id === productId);
        const max = product?.stock_quantity || 999;
        if (value === '') {
            setQuantities(prev => ({ ...prev, [productId]: '' }));
            return;
        }
        let num = parseInt(value);
        if (!isNaN(num)) {
            setQuantities(prev => ({
                ...prev,
                [productId]: Math.max(1, Math.min(num, max))
            }));
        }
    };

    const handleBlur = (productId) => {
        if (quantities[productId] === '' || quantities[productId] < 1) {
            setQuantities(prev => ({ ...prev, [productId]: 1 }));
        }
    };

    const step = (productId, delta) => {
        setQuantities(prev => {
            const cur = prev[productId] || 1;
            const product = products.find(p => p.id === productId);
            const max = product?.stock_quantity || 999;
            return { ...prev, [productId]: Math.max(1, Math.min(cur + delta, max)) };
        });
    };

    const addToCart = (product) => {
        const qty = quantities[product.id] || 1;
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const idx = cart.findIndex(i => i.product_id === product.id && !i.is_gift);
        if (idx >= 0) {
            cart[idx].quantity = Math.min(cart[idx].quantity + qty, product.stock_quantity);
        } else {
            cart.push({
                product_id: product.id,
                name: product.name,
                price: product.price,
                quantity: qty,
                thumbnail: product.image_path,
                stock_quantity: product.stock_quantity,
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        setQuantities(prev => ({ ...prev, [product.id]: 1 }));
        showToast(`تمت إضافة "${product.name}" إلى السلة بنجاح ✨`);
    };

    const filtered = products.filter(p => {
        const catOk = selectedCategory === 'all' || p.category_name === selectedCategory;
        const srchOk = !searchQuery || p.name.includes(searchQuery) || (p.sku || '').includes(searchQuery);
        return catOk && srchOk;
    });

    return (
        <CustomerLayout hideFooter={false}>
            <Head title="المعرض الحصري — المخلافي " />

            {/* Premium Toast */}
            <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-700 ${toast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none'}`}>
                <div className="bg-[#1a1a1f]/90 backdrop-blur-3xl border border-amber-400/30 text-white px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="font-black text-sm">{toast}</span>
                </div>
            </div>

            <div className="min-h-screen pb-24" dir="rtl">

                {/* VIP HERO ENTRANCE */}
                <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 mb-24">
                    <div className="relative rounded-[4rem] overflow-hidden bg-[#0d0d10] border border-white/5 p-12 md:p-24 flex flex-col md:flex-row items-center justify-between gap-16 md:gap-24 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-amber-400/[0.03] to-transparent pointer-events-none" />

                        <div className="z-10 text-right flex-1 animate-in fade-in slide-in-from-right-10 duration-1000">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 mb-8">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">كتالوج النخبة 2026</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-white mb-8 tracking-tighter leading-none">
                                <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700">  مؤسسة سعيد نعمان المخلافي للتجارة والتبريد</span>
                            </h1>
                            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
                                الفخامة في <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700">التسوق</span>
                            </h1>
                            <p className="text-white/40 text-xl max-w-lg leading-relaxed font-medium mb-12">
                                اكتشف تشكيلتنا الحصرية المختارة بعناية لتناسب ذوقك الرفيع. الجودة العالمية بين يديك عبر خدمات المخلافي .
                            </p>
                            <div className="flex gap-4">
                                <button className="px-10 py-5 bg-amber-400 text-black font-black rounded-3xl hover:bg-amber-500 transition-all shadow-xl shadow-amber-400/20">ابدأ الاستكشاف</button>
                                <button className="px-10 py-5 bg-white/5 text-white/60 hover:text-white border border-white/10 rounded-3xl backdrop-blur-md transition-all">عن الشركة</button>
                            </div>
                        </div>

                        {/* <div className="relative z-10 w-full max-w-sm aspect-square group animate-in zoom-in-95 duration-1000">
                            <div className="absolute inset-0 bg-amber-400/20 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            <img src={HERO_IMG} className="w-full h-full object-cover rounded-[3rem] border border-white/10 shadow-3xl transform rotate-3 group-hover:rotate-0 transition-all duration-1000" />
                        </div> */}
                    </div>
                </section>

                {/* ===== BRANDS MARQUEE ===== */}
                <BrandsMarquee />

                {/* VIP FILTER BAR */}
                <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-16">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white/[0.02] backdrop-blur-3xl p-8 rounded-[3rem] border border-white/5">

                        <div className="flex flex-wrap gap-4">
                            <CategoryPill label="جميع الأصناف" active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
                            {categories.map(cat => (
                                <CategoryPill key={cat.id} label={cat.category_name} active={selectedCategory === cat.category_name} onClick={() => setSelectedCategory(cat.category_name)} />
                            ))}
                        </div>

                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                placeholder="ابحث عن قطعة استثنائية..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400/30 text-right font-bold transition-all"
                            />
                            <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                </section>

                {/* VIP PRODUCT GRID */}
                <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-40">
                    {filtered.length === 0 ? (
                        <div className="text-center py-40 bg-white/[0.01] rounded-[5rem] border border-white/5 backdrop-blur-xl">
                            <h3 className="text-3xl font-black text-white/20">لا توجد نتائج مطابقة لطلبك</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                            {filtered.map(product => (
                                <ProductCard key={product.id} product={product} quantity={quantities[product.id]} inCartQuantity={cartItems.find(i => i.product_id === product.id)?.quantity || 0} onStep={(delta) => step(product.id, delta)} onQuantityChange={(val) => handleManualQuantityChange(product.id, val)} onBlur={() => handleBlur(product.id)} onAddToCart={() => addToCart(product)} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </CustomerLayout>
    );
}

/* ─────────────────────────────────────────────────────
   BRAND LOGOS — infinite marquee strip
───────────────────────────────────────────────────── */
const BRANDS = [
    { name: 'الشفاء',    src: '/storage/products/logos/al-shifa.png'  },
    { name: 'Arla',      src: '/storage/products/logos/arla.png'       },
    { name: 'بيقا',      src: '/storage/products/logos/beqa.png'       },
    { name: 'Capri-Sun', src: '/storage/products/logos/capri-sun.png'  },
    { name: 'Lurpak',    src: '/storage/products/logos/lurpak.png'     },
    { name: 'Puck',      src: '/storage/products/logos/puck.png'       },
    { name: 'Sadia',     src: '/storage/products/logos/sadia.png'      },
    { name: 'Sary',      src: '/storage/products/logos/sary.png'       },
    { name: 'Starbucks', src: '/storage/products/logos/starbucks.png'  },
    { name: 'تيما',      src: '/storage/products/logos/teama.png'      },
];

function BrandsMarquee() {
    // duplicate list so the loop is seamless
    const tiles = [...BRANDS, ...BRANDS];

    return (
        <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-16" dir="rtl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gradient-to-l from-amber-400/30 to-transparent" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400/70">علاماتنا التجارية</span>
                <div className="h-px flex-1 bg-gradient-to-r from-amber-400/30 to-transparent" />
            </div>

            {/* Track */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.02] border border-white/5 p-6 backdrop-blur-3xl">
                {/* fade edges */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10
                                bg-gradient-to-l from-[#0d0d10] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10
                                bg-gradient-to-r from-[#0d0d10] to-transparent" />

                {/* inject keyframes once */}
                <style>{`
                    @keyframes marquee-rtl {
                        from { transform: translateX(0); }
                        to   { transform: translateX(-50%); }
                    }
                    .brands-track {
                        display: flex;
                        gap: 3rem;
                        width: max-content;
                        animation: marquee-rtl 28s linear infinite;
                    }
                    .brands-track:hover { animation-play-state: paused; }
                `}</style>

                <div className="brands-track">
                    {tiles.map((brand, i) => (
                        <div
                            key={i}
                            title={brand.name}
                            className="flex-shrink-0 w-32 h-20 flex items-center justify-center
                                       rounded-2xl bg-white/[0.04] border border-white/5
                                       hover:border-amber-400/30 hover:bg-amber-400/[0.06]
                                       transition-all duration-500 cursor-pointer px-4 group"
                        >
                            <img
                                src={brand.src}
                                alt={brand.name}
                                className="max-w-full max-h-12 object-contain
                                           filter grayscale opacity-50
                                           group-hover:grayscale-0 group-hover:opacity-100
                                           transition-all duration-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CategoryPill({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 border ${active ? 'bg-amber-400 text-black border-amber-400' : 'bg-white/5 text-white/40 border-white/5 hover:text-white hover:border-white/10'
                }`}
        >
            {label}
        </button>
    );
}

function ProductCard({ product, quantity, inCartQuantity, onStep, onQuantityChange, onBlur, onAddToCart }) {
    return (
        <div className="group bg-[#16161a]/60 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-8 transition-all duration-700 hover:-translate-y-4 hover:border-amber-400/20 shadow-2xl relative overflow-hidden">

            {/* Selection Glow */}
            {inCartQuantity > 0 && <div className="absolute inset-0 bg-amber-400/[0.02] border border-amber-400/10 rounded-[3rem] pointer-events-none" />}

            {/* In Cart Indicator */}
            {inCartQuantity > 0 && (
                <div className="absolute top-8 left-8 z-20 w-10 h-10 bg-amber-400 text-black rounded-2xl flex items-center justify-center font-black text-xs shadow-lg shadow-amber-400/20">
                    {inCartQuantity}
                </div>
            )}

            {/* Image */}
            <Link href={route('customer.storefront.show', product.id)}>
                <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white/5 mb-8">
                    {product.image_path ? (
                        <img src={product.image_path} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/5"><svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z" /></svg></div>
                    )}

                    {!product.in_stock && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center">
                            <span className="bg-rose-500 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest">نفدت الكمية</span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Details */}
            <div className="space-y-6">
                <Link href={route('customer.storefront.show', product.id)}>
                    <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors line-clamp-2 h-14 leading-tight">{product.name}</h3>
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-2xl font-black text-white">{Number(product.price).toLocaleString()} <span className="text-[10px] text-white/20 uppercase tracking-widest mr-1">{product.default_currency_symbol}</span></div>
                        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">{product.default_unit_name}</div>
                    </div>

                    <div className="flex items-center bg-white/5 rounded-2xl p-1.5 border border-white/10 shadow-inner">
                        <button onClick={() => onStep(1)} className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-amber-400 transition-all">+</button>
                        <input type="text" value={quantity} onChange={(e) => onQuantityChange(e.target.value)} onBlur={onBlur} className="w-10 bg-transparent text-center font-black text-lg text-white border-none focus:ring-0 p-0" />
                        <button onClick={() => onStep(-1)} disabled={quantity <= 1} className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-amber-400 transition-all disabled:opacity-10">-</button>
                    </div>
                </div>

                <button
                    onClick={onAddToCart}
                    disabled={!product.in_stock}
                    className="w-full py-5 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:opacity-10 disabled:grayscale text-black rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-400/10 active:scale-95"
                >
                    أضف إلى السلة
                </button>
            </div>
        </div>
    );
}
