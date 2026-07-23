import { useState, useEffect, useMemo } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link } from '@inertiajs/react';

export default function Storefront({ products = [], categories = [] }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [quantities, setQuantities] = useState({});
    const [cartItems, setCartItems] = useState([]);
    const [toast, setToast] = useState(null);

    // مزامنة الكميات المبدئية عند تغير المنتجات
    useEffect(() => {
        if (products.length > 0) {
            const initialQuantities = products.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {});
            setQuantities(initialQuantities);
        }
    }, [products]);

    const syncCart = () => {
        try {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartItems(cart);
        } catch (e) {
            console.error('Error reading cart from localStorage', e);
        }
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
        const max = product?.stock_quantity ?? 999;

        if (value === '') {
            setQuantities(prev => ({ ...prev, [productId]: '' }));
            return;
        }

        const num = parseInt(value, 10);
        if (!isNaN(num)) {
            setQuantities(prev => ({
                ...prev,
                [productId]: Math.max(1, Math.min(num, max))
            }));
        }
    };

    const handleBlur = (productId) => {
        if (!quantities[productId] || quantities[productId] < 1) {
            setQuantities(prev => ({ ...prev, [productId]: 1 }));
        }
    };

    const step = (productId, delta) => {
        setQuantities(prev => {
            const cur = typeof prev[productId] === 'number' ? prev[productId] : 1;
            const product = products.find(p => p.id === productId);
            const max = product?.stock_quantity ?? 999;
            return { ...prev, [productId]: Math.max(1, Math.min(cur + delta, max)) };
        });
    };

    const addToCart = (product) => {
        const qty = typeof quantities[product.id] === 'number' ? quantities[product.id] : 1;
        let cart = [];
        try {
            cart = JSON.parse(localStorage.getItem('cart') || '[]');
        } catch (e) {
            cart = [];
        }

        const idx = cart.findIndex(i => i.product_id === product.id && !i.is_gift);
        const maxStock = product.stock_quantity ?? 999;

        if (idx >= 0) {
            const currentInCart = cart[idx].quantity;
            if (currentInCart >= maxStock) {
                showToast(`وصلت للحد الأقصى المتاح من "${product.name}" ⚠️`);
                return;
            }
            cart[idx].quantity = Math.min(currentInCart + qty, maxStock);
        } else {
            cart.push({
                product_id: product.id,
                name: product.name,
                price: product.price,
                quantity: Math.min(qty, maxStock),
                thumbnail: product.image_path,
                stock_quantity: maxStock,
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        setQuantities(prev => ({ ...prev, [product.id]: 1 }));
        showToast(`تمت إضافة "${product.name}" إلى السلة بنجاح ✨`);
    };

    const filteredProducts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return products.filter(p => {
            const catOk = selectedCategory === 'all' || p.category_name === selectedCategory;
            const srchOk = !query ||
                p.name?.toLowerCase().includes(query) ||
                (p.sku && p.sku.toLowerCase().includes(query));
            return catOk && srchOk;
        });
    }, [products, selectedCategory, searchQuery]);

    return (
        <CustomerLayout hideFooter={false}>
            <Head title="المعرض الحصري — المخلافي" />

            {/* Premium Toast */}
            <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-700 ${toast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none'}`}>
                <div className="bg-white/90 dark:bg-[#1a1a1f]/90 backdrop-blur-3xl border border-red-500/50 dark:border-amber-400/30 text-black dark:text-white px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="font-black text-sm">{toast}</span>
                </div>
            </div>

            <div className="min-h-screen pb-24 text-black dark:text-white" dir="rtl">

                {/* VIP HERO ENTRANCE */}
                <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 mb-4">
                    <div className="relative rounded-[4rem] overflow-hidden bg-gray-50 dark:bg-[#0d0d10] border border-red-500/30 dark:border-white/5 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-amber-400/[0.03] to-transparent pointer-events-none" />

                        <div className="z-10 text-right flex-1">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-500 dark:text-amber-400 mb-4">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">كتالوج النخبة 2026</span>
                            </div>
                            <h1 className="md:text-2xl font-black text-black dark:text-white mb-2 tracking-tighter leading-none">
                                <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-600 via-amber-500 to-amber-700 dark:from-amber-200 dark:via-amber-400 dark:to-amber-700"> مؤسسة سعيد نعمان المخلافي للتجارة والتبريد</span>
                            </h1>
                        </div>
                    </div>
                </section>

                {/* ===== BRANDS MARQUEE ===== */}
                <BrandsMarquee />

                {/* VIP FILTER BAR */}
                <section className="max-w-7xl mx-auto px-4 lg:px-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-3xl p-4 rounded-[3rem] border border-red-500/30 dark:border-white/5">

                        <div className="flex flex-wrap gap-2">
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
                                className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-red-500/40 dark:border-white/10 rounded-[2rem] px-8 py-4 text-black dark:text-white placeholder-black/40 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400/30 text-right font-bold transition-all"
                            />
                            <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-black/40 dark:text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                </section>

                {/* VIP PRODUCT GRID */}
                <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-40">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-24 bg-black/[0.01] dark:bg-white/[0.01] rounded-[4rem] border border-red-500/30 dark:border-white/5 backdrop-blur-xl">
                            <h3 className="text-2xl font-black text-black/40 dark:text-white/30">لا توجد نتائج مطابقة لطلبك</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    quantity={quantities[product.id] ?? 1}
                                    inCartQuantity={cartItems.find(i => i.product_id === product.id)?.quantity || 0}
                                    onStep={(delta) => step(product.id, delta)}
                                    onQuantityChange={(val) => handleManualQuantityChange(product.id, val)}
                                    onBlur={() => handleBlur(product.id)}
                                    onAddToCart={() => addToCart(product)}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </CustomerLayout>
    );
}

const BRANDS = [
    { name: 'الشفاء', src: '/storage/products/logos/al-shifa.png' },
    { name: 'Arla', src: '/storage/products/logos/arla.png' },
    { name: 'بيقا', src: '/storage/products/logos/beqa.png' },
    { name: 'Capri-Sun', src: '/storage/products/logos/capri-sun.png' },
    { name: 'Lurpak', src: '/storage/products/logos/lurpak.png' },
    { name: 'Puck', src: '/storage/products/logos/puck.png' },
    { name: 'Sadia', src: '/storage/products/logos/sadia.png' },
    { name: 'Sary', src: '/storage/products/logos/sary.png' },
    { name: 'Starbucks', src: '/storage/products/logos/starbucks.png' },
    { name: 'تيما', src: '/storage/products/logos/teama.png' },
];

function BrandsMarquee() {
    return (
        <section className="max-w-7xl mx-auto px-2 lg:px-4 mb-4" dir="rtl">
            <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-gradient-to-l from-amber-400/30 to-transparent" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 dark:text-amber-400/70">علاماتنا التجارية</span>
                <div className="h-px flex-1 bg-gradient-to-r from-amber-400/30 to-transparent" />
            </div>

            <div className="relative overflow-hidden rounded-[2.5rem] bg-black/[0.02] dark:bg-white/[0.02] border border-red-500/30 dark:border-white/5 p-6 backdrop-blur-3xl">
                <div className="flex flex-wrap justify-center gap-4 w-full">
                    {BRANDS.map((brand, i) => (
                        <div
                            key={i}
                            title={brand.name}
                            className="flex-shrink-0 w-20 h-12 flex items-center justify-center
                            rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] border border-red-500/30 dark:border-white/5
                            hover:border-amber-400/50 dark:hover:border-amber-400/30 hover:bg-amber-400/[0.06]
                            transition-all duration-500 cursor-pointer px-2 group"
                        >
                            <img
                                src={brand.src}
                                alt={brand.name}
                                className="max-w-full max-h-12 object-contain filter group-hover:scale-105 transition-all duration-500"
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
            className={`px-4 py-1.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 border ${active
                ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20'
                : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/40 border-red-500/30 dark:border-white/5 hover:text-black dark:hover:text-white hover:border-red-500 dark:hover:border-white/10'
                }`}
        >
            {label}
        </button>
    );
}

function ProductCard({ product, quantity, inCartQuantity, onStep, onQuantityChange, onBlur, onAddToCart }) {
    const isOutOfStock = !product.in_stock || (product.stock_quantity !== undefined && product.stock_quantity <= 0);

    return (
        <div className="group bg-white/80 dark:bg-[#16161a]/60 backdrop-blur-3xl rounded-[3rem] border border-red-500/40 dark:border-white/5 p-4 transition-all duration-700 hover:-translate-y-2 hover:border-red-600 dark:hover:border-amber-400/20 shadow-xl dark:shadow-2xl relative overflow-hidden flex flex-col justify-between">

            {/* Selection Glow */}
            {inCartQuantity > 0 && <div className="absolute inset-0 bg-amber-400/[0.02] border border-amber-400/20 dark:border-amber-400/10 rounded-[3rem] pointer-events-none" />}

            {/* In Cart Indicator */}
            {inCartQuantity > 0 && (
                <div className="absolute top-4 left-8 z-20 w-8 h-8 bg-amber-400 text-black rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-amber-400/20">
                    {inCartQuantity}
                </div>
            )}

            <div>
                {/* Image */}
                <Link href={route('customer.storefront.show', product.id)}>
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-black/5 dark:bg-white/5 mb-3 border border-red-500/20 dark:border-transparent">
                        {product.image_path ? (
                            <img
                                src={`/storage/products/${product.image_path}`}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-black/20 dark:text-white/5">
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                        )}

                        {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center">
                                <span className="bg-rose-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">نفدت الكمية</span>
                            </div>
                        )}
                    </div>
                </Link>

                {/* Details */}
                <div className="space-y-3">
                    <Link href={route('customer.storefront.show', product.id)}>
                        <h3 className="text-sm font-black text-black dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-2 h-10 leading-tight">
                            {product.name}
                        </h3>
                    </Link>

                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <div className="text-lg font-black text-black dark:text-white">
                                {Number(product.price).toLocaleString()}
                                <span className="text-[10px] text-black/50 dark:text-white/30 uppercase tracking-widest mr-1">{product.default_currency_symbol}</span>
                            </div>
                            <div className="text-[10px] font-bold text-black/40 dark:text-white/30 uppercase">
                                {product.default_unit_name}
                            </div>
                        </div>

                        {/* Quantity Counter */}
                        <div className={`flex items-center bg-black/5 dark:bg-white/5 rounded-2xl p-1 border border-red-500/20 dark:border-white/10 ${isOutOfStock ? 'opacity-40 pointer-events-none' : ''}`}>
                            <button onClick={() => onStep(1)} disabled={isOutOfStock} className="w-7 h-7 flex items-center justify-center text-black dark:text-white hover:text-amber-500 transition-all font-bold">+</button>
                            <input
                                type="text"
                                value={quantity}
                                disabled={isOutOfStock}
                                onChange={(e) => onQuantityChange(e.target.value)}
                                onBlur={onBlur}
                                className="w-8 bg-transparent text-center font-black text-sm text-black dark:text-white border-none focus:ring-0 p-0"
                            />
                            <button onClick={() => onStep(-1)} disabled={isOutOfStock || quantity <= 1} className="w-7 h-7 flex items-center justify-center text-black dark:text-white hover:text-amber-500 transition-all disabled:opacity-20 font-bold">-</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add to Cart Button */}
            <button
                onClick={onAddToCart}
                disabled={isOutOfStock}
                className="w-full mt-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:opacity-20 disabled:grayscale text-black rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.15em] transition-all shadow-md shadow-amber-400/10 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
                {isOutOfStock ? 'غير متوفر' : 'أضف إلى السلة'}
            </button>
        </div>
    );
}