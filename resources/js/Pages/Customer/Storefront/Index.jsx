import { useState, useEffect } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link } from '@inertiajs/react';

const BRANDS = [
    { name: 'الشفاء', src: '/storage/products/logos/al-shifa.png', matchQuery: 'الشفاء' },
    { name: 'Arla', src: '/storage/products/logos/arla.png', matchQuery: 'arla' },
    { name: 'بيقا', src: '/storage/products/logos/beqa.png', matchQuery: 'بيقا' },
    { name: 'Capri-Sun', src: '/storage/products/logos/capri-sun.png', matchQuery: 'كابري' },
    { name: 'Lurpak', src: '/storage/products/logos/lurpak.png', matchQuery: 'لورباك' },
    { name: 'Puck', src: '/storage/products/logos/puck.png', matchQuery: 'بوك' },
    { name: 'Sadia', src: '/storage/products/logos/sadia.png', matchQuery: 'ساديا' },
    { name: 'Sary', src: '/storage/products/logos/sary.png', matchQuery: 'ساري' },
    { name: 'Starbucks', src: '/storage/products/logos/starbucks.png', matchQuery: 'ستاربكس' },
    { name: 'تيما', src: '/storage/products/logos/teama.png', matchQuery: 'تيما' },
];

export default function Storefront({ products, categories }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedBrand, setSelectedBrand] = useState('all');
    const [sortBy, setSortBy] = useState('name-asc');
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

        let brandOk = true;
        if (selectedBrand !== 'all') {
            const brandObj = BRANDS.find(b => b.name === selectedBrand);
            const query = brandObj ? brandObj.matchQuery : selectedBrand;
            brandOk = p.name.toLowerCase().includes(query.toLowerCase());
        }

        const srchOk = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase());

        return catOk && brandOk && srchOk;
    });

    const sortedFiltered = [...filtered].sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'ar');
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name, 'ar');
        if (sortBy === 'in-stock') return b.in_stock - a.in_stock;
        return 0;
    });

    return (
        <CustomerLayout hideFooter={false}>
            <Head title="المعرض الحصري — المخلافي " />

            {/* Premium Toast */}
            <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-700 ${toast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none'}`}>
                <div className="bg-white/95 dark:bg-[#1a1a1f]/95 backdrop-blur-3xl border-2 border-red-500 dark:border-amber-400/30 text-black dark:text-white px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="font-black text-sm">{toast}</span>
                </div>
            </div>

            <div className="min-h-screen pb-24 text-black dark:text-white" dir="rtl">

                {/* VIP HERO SECTION */}
                <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 mb-8">
                    <div className="relative rounded-[4rem] overflow-hidden bg-gradient-to-br from-red-500/10 via-amber-500/10 to-transparent dark:from-[#0d0d10] dark:to-[#16161a] border border-gray-200 dark:border-white/5 p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-lg dark:shadow-2xl">
                        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

                        <div className="z-10 text-right flex-1 space-y-6 max-w-2xl animate-in fade-in slide-in-from-right-10 duration-1000">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 dark:bg-amber-400/10 border border-red-500/20 dark:border-amber-400/20 text-red-600 dark:text-amber-400">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 dark:bg-amber-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">بوابة التميز الغذائي والتبريد</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight">
                                مؤسسة سعيد نعمان المخلافي <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-amber-600 dark:from-amber-200 dark:to-amber-500">للتجارة والتبريد</span>
                            </h1>
                            <p className="text-sm md:text-lg font-bold text-gray-600 dark:text-white/40 leading-relaxed">
                                نوفر لكم أجود المنتجات الغذائية المبردة والجافة من علاماتكم التجارية المفضلة بأعلى معايير الحفظ والسلامة الغذائية في اليمن .
                            </p>
                            <div className="pt-4 flex flex-wrap gap-4">
                                <a href="#store-listings" className="px-8 py-4 bg-red-600 hover:bg-red-700 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg active:scale-95">
                                    تصفح المنتجات الآن
                                </a>
                            </div>
                        </div>

                        {/* Catalog 2026 Visual Card */}
                        <div className="z-10 w-full lg:w-80 bg-white dark:bg-white/[0.02] backdrop-blur-3xl p-8 rounded-[3rem] border border-gray-200 dark:border-white/5 shadow-lg flex flex-col items-center text-center space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-red-500/10 dark:bg-amber-400/10 flex items-center justify-center text-red-600 dark:text-amber-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">كتالوج المنتجات 2026</h3>
                                <p className="text-[11px] font-bold text-gray-500 dark:text-white/20 uppercase mt-1 tracking-widest">تحديث الربع السنوي الأول</p>
                            </div>
                            <button onClick={() => showToast("سيتم تحميل الكتالوج الرقمي قريباً 📄")} className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white/80 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all shadow-md">
                                تحميل الكتالوج الرقمي
                            </button>
                        </div>
                    </div>
                </section>

                {/* ===== INTERACTIVE BRANDS SECTION ===== */}
                <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-8" dir="rtl">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-l from-red-500/20 to-transparent" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 dark:text-amber-400/70">
                            تسوق حسب العلامة التجارية {selectedBrand !== 'all' && `(${selectedBrand})`}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-red-500/20 to-transparent" />
                    </div>

                    <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-6 backdrop-blur-3xl shadow-sm">
                        <div className="flex flex-wrap justify-center gap-4">
                            {/* All Brands Pill */}
                            <button
                                onClick={() => setSelectedBrand('all')}
                                className={`flex-shrink-0 w-24 h-12 flex items-center justify-center rounded-2xl border text-xs font-black tracking-widest transition-all duration-300 ${selectedBrand === 'all'
                                        ? 'bg-red-600 dark:bg-amber-400 text-white dark:text-black border-red-600 dark:border-amber-400 shadow-md scale-105'
                                        : 'bg-slate-100 dark:bg-white/[0.03] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 text-gray-700 dark:text-white/40'
                                    }`}
                            >
                                الكل
                            </button>
                            {BRANDS.map((brand, i) => (
                                <button
                                    key={i}
                                    title={brand.name}
                                    onClick={() => setSelectedBrand(selectedBrand === brand.name ? 'all' : brand.name)}
                                    className={`flex-shrink-0 w-24 h-12 flex items-center justify-center rounded-2xl border p-2 transition-all duration-300 group ${selectedBrand === brand.name
                                            ? 'bg-red-50 dark:bg-amber-400/20 border-red-500 dark:border-amber-400 ring-2 ring-red-500/20 dark:ring-amber-400/35 scale-105'
                                            : 'bg-white dark:bg-white/[0.03] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'
                                        }`}
                                >
                                    <img
                                        src={brand.src}
                                        alt={brand.name}
                                        className="max-w-full max-h-8 object-contain filter group-hover:scale-105 transition-all duration-300"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* VIP FILTER & SORT BAR */}
                <section id="store-listings" className="max-w-7xl mx-auto px-6 lg:px-12 mb-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white dark:bg-white/[0.02] backdrop-blur-3xl p-6 rounded-[3rem] border border-gray-200 dark:border-white/5 shadow-sm">

                        {/* Category Selector */}
                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                            <CategoryPill label="جميع الأصناف" active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
                            {categories.map(cat => (
                                <CategoryPill key={cat.id} label={cat.category_name} active={selectedCategory === cat.category_name} onClick={() => setSelectedCategory(cat.category_name)} />
                            ))}
                        </div>

                        {/* Search and Sort tools */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                            {/* Sort Selector */}
                            <div className="relative w-full sm:w-48">
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-3.5 text-xs font-bold text-gray-800 dark:text-white/60 focus:outline-none focus:border-red-500 dark:focus:border-amber-400 cursor-pointer appearance-none text-right"
                                >
                                    <option value="name-asc">الاسم (أ - ي)</option>
                                    <option value="name-desc">الاسم (ي - أ)</option>
                                    <option value="price-asc">السعر (الأقل أولاً)</option>
                                    <option value="price-desc">السعر (الأعلى أولاً)</option>
                                    <option value="in-stock">التوفر بالمخزن</option>
                                </select>
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/20 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                            </div>

                            {/* Search input */}
                            <div className="relative w-full sm:w-72">
                                <input
                                    type="text"
                                    placeholder="ابحث عن صنف معين..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl px-12 py-3.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-red-500 dark:focus:border-amber-400 text-right font-bold transition-all"
                                />
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                    </div>
                </section>

                {/* VIP PRODUCT GRID */}
                <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-40">
                    {sortedFiltered.length === 0 ? (
                        <div className="text-center py-40 bg-white dark:bg-white/[0.01] rounded-[4rem] border border-gray-200 dark:border-white/5 shadow-sm">
                            <h3 className="text-2xl font-black text-gray-400 dark:text-white/20">لا توجد نتائج مطابقة لتحديدك حالياً</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {sortedFiltered.map(product => (
                                <ProductCard key={product.id} product={product} quantity={quantities[product.id]} inCartQuantity={cartItems.find(i => i.product_id === product.id)?.quantity || 0} onStep={(delta) => step(product.id, delta)} onQuantityChange={(val) => handleManualQuantityChange(product.id, val)} onBlur={() => handleBlur(product.id)} onAddToCart={() => addToCart(product)} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </CustomerLayout>
    );
}

function CategoryPill({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${active
                ? 'bg-red-600 dark:bg-amber-400 text-white dark:text-black border-red-600 dark:border-amber-400 shadow-sm'
                : 'bg-slate-100 dark:bg-white/[0.03] text-gray-700 dark:text-white/40 border-gray-200 dark:border-white/5 hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-white/10'
                }`}
        >
            {label}
        </button>
    );
}

function ProductCard({ product, quantity, inCartQuantity, onStep, onQuantityChange, onBlur, onAddToCart }) {
    return (
        <div className="group bg-white dark:bg-[#16161a]/60 backdrop-blur-3xl rounded-[2.5rem] border border-gray-200 dark:border-white/5 p-5 transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-xl dark:hover:border-amber-400/25 relative overflow-hidden flex flex-col justify-between">

            {/* Selection Glow / Shadow */}
            {inCartQuantity > 0 && <div className="absolute inset-0 bg-red-500/[0.02] dark:bg-amber-400/[0.01] border border-red-500/30 dark:border-amber-400/20 rounded-[2.5rem] pointer-events-none" />}

            {/* In Cart Indicator */}
            {inCartQuantity > 0 && (
                <div className="absolute top-4 left-6 z-20 w-8 h-8 bg-red-600 dark:bg-amber-400 text-white dark:text-black rounded-xl flex items-center justify-center font-black text-xs shadow-md">
                    {inCartQuantity}
                </div>
            )}

            <div>
                {/* Image */}
                <Link href={route('customer.storefront.show', product.id)}>
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-50 dark:bg-white/5 mb-4 border border-gray-100 dark:border-transparent">
                        {product.image_path ? (
                            <img
                                src={product.image_path}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-white/5">
                                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        )}

                        {!product.in_stock && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <span className="bg-rose-600 text-white text-[9px] font-black px-5 py-1 rounded-full uppercase tracking-widest">نفدت الكمية</span>
                            </div>
                        )}
                    </div>
                </Link>

                {/* Content Details */}
                <div className="space-y-3">
                    <Link href={route('customer.storefront.show', product.id)}>
                        <h3 className="text-sm md:text-lg font-black text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 h-12 leading-tight">
                            {product.name}
                        </h3>
                    </Link>
                    <span className="inline-block text-[8px] font-black text-red-600 dark:text-white/20 uppercase tracking-widest">{product.category_name || 'صنف غذائي'}</span>
                </div>
            </div>

            {/* Actions and Price */}
            <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                            {Number(product.price).toLocaleString()}
                            <span className="text-[10px] text-gray-500 dark:text-white/20 uppercase tracking-widest mr-1">{product.default_currency_symbol}</span>
                        </div>
                        <div className="text-[9px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest mt-0.5">{product.default_unit_name}</div>
                    </div>

                    <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-2xl p-1.5 border border-gray-200 dark:border-white/10 shadow-inner">
                        <button onClick={() => onStep(1)} className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-white/40 hover:text-red-600 dark:hover:text-amber-400 font-bold transition-all">+</button>
                        <input type="text" value={quantity} onChange={(e) => onQuantityChange(e.target.value)} onBlur={onBlur} className="w-10 bg-transparent text-center font-black text-sm text-gray-900 dark:text-white border-none focus:ring-0 p-0" />
                        <button onClick={() => onStep(-1)} disabled={quantity <= 1} className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-white/40 hover:text-red-600 dark:hover:text-amber-400 font-bold transition-all disabled:opacity-10">-</button>
                    </div>
                </div>

                <button
                    onClick={onAddToCart}
                    disabled={!product.in_stock}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 dark:bg-gradient-to-r dark:from-amber-400 dark:to-amber-500 dark:hover:from-amber-500 dark:hover:to-amber-600 disabled:opacity-10 disabled:grayscale text-white dark:text-black rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-md active:scale-95"
                >
                    أضف إلى السلة
                </button>
            </div>
        </div>
    );
}