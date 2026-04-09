import { useState } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link } from '@inertiajs/react';

// ─── Heroic placeholder image via DiceBear / Unsplash fallback ───────────────
const HERO_IMG = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80';
const NEWSLETTER_IMG = 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&q=80';

export default function Storefront({ products, categories }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [quantities, setQuantities] = useState(
        products.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})
    );
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const step = (productId, delta) => {
        setQuantities(prev => {
            const cur = prev[productId] || 1;
            const product = products.find(p => p.id === productId);
            const max = product?.stock_quantity || 999;
            const next = Math.max(1, Math.min(cur + delta, max));
            return { ...prev, [productId]: next };
        });
    };

    const addToCart = (product) => {
        const qty = quantities[product.id] || 1;
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const idx = cart.findIndex(i => i.product_id === product.id);
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
        showToast(`تمت إضافة "${product.name}" إلى السلة 🛒`);
    };

    const filtered = products.filter(p => {
        const catOk = selectedCategory === 'all' || p.category_name === selectedCategory;
        const srchOk = !searchQuery || p.name.includes(searchQuery) || (p.sku || '').includes(searchQuery);
        return catOk && srchOk;
    });

    return (
        <CustomerLayout hideFooter={true}>
            <Head title="المنتجات — المخلافي" />

            {/* ─── Toast Notification ─── */}
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="bg-[#1a1c4e] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-72">
                    <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>
                    <span className="font-bold text-sm">{toast}</span>
                </div>
            </div>

            <div className="bg-[#f8f9fb] min-h-screen" dir="rtl">

                {/* ══════════════════════════════════════════════
                    HERO SECTION
                ══════════════════════════════════════════════ */}
                <section className="max-w-screen-2xl mx-auto px-6 sm:px-8 pt-8 mb-12">
                    <div className="relative overflow-hidden rounded-3xl bg-[#1a1c4e] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16">
                        {/* Radial glow */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                             style={{background: 'radial-gradient(circle at 20% 50%, #ffffff 0%, transparent 55%)'}}/>

                        {/* Text — RTL so this is on the right */}
                        <div className="z-10 text-right flex-1">
                            <span className="inline-block px-4 py-1 rounded-full bg-[#c00011]/20 text-[#c00011] text-xs font-black mb-6 tracking-[0.3em] uppercase">
                                Premium Selection
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                                منتجات الشركة
                            </h1>
                            <p className="text-white/60 text-base md:text-lg max-w-lg leading-relaxed">
                                نقدم لكم تشكيلة مختارة من أفضل المنتجات العالمية والمحلية بجودة استثنائية وتجربة تسوق عصرية تلبي احتياجاتكم اليومية عبر شركة المخلافي.
                            </p>
                        </div>

                        {/* Hero Image — rotated card effect */}
                        <div className="relative z-10 w-full max-w-xs md:max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 shrink-0 border-4 border-white/10">
                            <img
                                src={HERO_IMG}
                                alt="منتجات المخلافي"
                                className="w-full h-full object-cover"
                                onError={e => {
                                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="%231a2340" width="400" height="400"/><text fill="white" font-size="80" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">🛒</text></svg>';
                                }}
                            />
                            {/* Overlay shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c4e]/30 to-transparent"/>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    FILTER BAR
                ══════════════════════════════════════════════ */}
                <section className="max-w-screen-2xl mx-auto px-6 sm:px-8 mb-10">
                    <div className="flex flex-col md:flex-row-reverse items-start md:items-center justify-between gap-5 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">

                        {/* Category pills */}
                        <div className="flex flex-wrap gap-2">
                            <CategoryPill
                                label="الكل"
                                active={selectedCategory === 'all'}
                                onClick={() => setSelectedCategory('all')}
                            />
                            {categories.map(cat => (
                                <CategoryPill
                                    key={cat.id}
                                    label={cat.category_name}
                                    active={selectedCategory === cat.category_name}
                                    onClick={() => setSelectedCategory(cat.category_name)}
                                />
                            ))}
                        </div>

                        {/* Count + Search */}
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="flex items-center gap-2 text-gray-400 text-sm whitespace-nowrap">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 4a2 2 0 100 4m0-4a2 2 0 110 4m6-4a2 2 0 100 4m0-4a2 2 0 110 4"/>
                                </svg>
                                <span>عرض <strong className="text-gray-600">{filtered.length}</strong> من أصل <strong className="text-gray-600">{products.length}</strong> منتج</span>
                            </div>
                            <div className="relative flex-1 md:flex-none">
                                <input
                                    type="text"
                                    placeholder="بحث عن منتج..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full md:w-52 bg-gray-50 border border-gray-200 rounded-xl text-sm pr-4 pl-10 py-2.5 text-right focus:outline-none focus:ring-2 focus:ring-[#c00011]/20 focus:border-[#c00011]"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    PRODUCT GRID
                ══════════════════════════════════════════════ */}
                <section className="max-w-screen-2xl mx-auto px-6 sm:px-8 mb-24">
                    {filtered.length === 0 ? (
                        <div className="text-center py-32">
                            <div className="text-8xl mb-6">🔍</div>
                            <h3 className="text-2xl font-black text-gray-400 mb-2">لا توجد منتجات مطابقة</h3>
                            <p className="text-gray-400">جرّب تغيير الفئة أو مصطلح البحث</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    quantity={quantities[product.id] || 1}
                                    onStep={(delta) => step(product.id, delta)}
                                    onAddToCart={() => addToCart(product)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* ══════════════════════════════════════════════
                    NEWSLETTER / CTA
                ══════════════════════════════════════════════ */}
                <section className="max-w-screen-2xl mx-auto px-6 sm:px-8 mb-16">
                    <div className="bg-[#e7e8ea] rounded-3xl p-10 md:p-14 flex flex-col md:flex-row-reverse items-center gap-12 overflow-hidden">

                        {/* Text */}
                        <div className="flex-1 text-right">
                            <h2 className="text-3xl md:text-4xl font-black text-[#1a1c4e] mb-4">
                                كن أول من يعرف
                            </h2>
                            <p className="text-gray-500 text-base md:text-lg mb-8 leading-relaxed">
                                اشترك في نشرتنا الإخبارية للحصول على أحدث العروض والمنتجات الحصرية مباشرة في بريدك.
                            </p>
                            <form className="flex flex-col sm:flex-row-reverse gap-3" onSubmit={e => e.preventDefault()}>
                                <input
                                    type="email"
                                    placeholder="بريدك الإلكتروني"
                                    className="flex-1 bg-white border-0 rounded-xl px-5 py-4 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#1a1c4e]/20 shadow-sm"
                                />
                                <button
                                    type="submit"
                                    className="bg-[#1a1c4e] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#0d0f3a] transition-all whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                >
                                    اشترك الآن
                                </button>
                            </form>
                        </div>

                        {/* Image */}
                        <div className="flex-1 relative">
                            <img
                                src={NEWSLETTER_IMG}
                                alt="منتجات طازجة"
                                className="rounded-2xl shadow-xl w-full h-60 object-cover transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                                onError={e => {
                                    e.target.parentElement.innerHTML = '<div class="w-full h-60 bg-white/50 rounded-2xl flex items-center justify-center text-7xl">🛒</div>';
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    FOOTER
                ══════════════════════════════════════════════ */}
                <footer className="bg-[#f3f4f6] border-t border-gray-200 w-full py-12 px-8">
                    <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row-reverse justify-between items-center gap-8">

                        {/* Logo + Copyright */}
                        <div className="flex flex-col items-center md:items-end gap-3">
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="font-black text-[#1a1c4e] text-xl leading-none">Al-Mekhlafi</div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">المخلافي</div>
                                </div>
                                <div className="w-12 h-12 bg-[#c00011] rounded-2xl flex items-center justify-center shadow-md">
                                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                                    </svg>
                                </div>
                            </div>
                            <p className="text-gray-400 text-[11px] uppercase tracking-widest">
                                © {new Date().getFullYear()} AL-MEKHLAFI COMPANY. ALL RIGHTS RESERVED.
                            </p>
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap justify-center gap-8 text-xs uppercase tracking-widest text-gray-500">
                            {['سياسة الخصوصية', 'شروط الخدمة', 'معلومات الشحن', 'اتصل بنا'].map(link => (
                                <a key={link} href="#" className="hover:text-[#c00011] transition-colors">
                                    {link}
                                </a>
                            ))}
                        </div>

                        {/* Social Icons */}
                        <div className="flex gap-3">
                            {[
                                { path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z', label: 'public' },
                                { path: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z', label: 'email' },
                                { path: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z', label: 'hub' },
                            ].map((s, i) => (
                                <a key={i} href="#"
                                   className="w-9 h-9 bg-gray-200 hover:bg-[#c00011] hover:text-white text-gray-400 transition-all rounded-xl flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d={s.path}/>
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>
                </footer>
            </div>
        </CustomerLayout>
    );
}

// ─── Category Pill ────────────────────────────────────────────────────────────
function CategoryPill({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                active
                    ? 'bg-[#c00011] text-white shadow-md shadow-[#c00011]/20'
                    : 'bg-gray-100 text-gray-500 hover:text-[#c00011] hover:bg-gray-100'
            }`}
        >
            {label}
        </button>
    );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, quantity, onStep, onAddToCart }) {
    return (
        <div className="group bg-white rounded-2xl p-4 transition-all duration-300 hover:-translate-y-2 border border-gray-100"
             style={{boxShadow: '0 12px 32px rgba(26,28,78,0.06)'}}>

            {/* Image Area */}
            <Link href={route('customer.storefront.show', product.id)}>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-5 cursor-pointer">
                    {product.image_path ? (
                        <img
                            src={product.image_path}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
                            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                        <span className="bg-[#1a1c4e] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tight">
                            {product.category_name || 'منتج'}
                        </span>
                    </div>

                    {/* Out of Stock */}
                    {!product.in_stock && (
                        <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex items-center justify-center">
                            <span className="bg-gray-700 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                                نفد المخزون
                            </span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Info */}
            <div className="space-y-3">
                <Link href={route('customer.storefront.show', product.id)}>
                    <h3 className="text-base font-bold text-[#1a1c4e] group-hover:text-[#c00011] transition-colors line-clamp-2 text-right leading-snug">
                        {product.name}
                    </h3>
                </Link>

                {/* Price + Quantity */}
                <div className="flex items-center justify-between gap-2">
                    <div className="text-right">
                        <span className="text-2xl font-black text-[#c00011] leading-none">
                            {Number(product.price).toLocaleString('ar-SA', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
                        </span>
                        <span className="text-xs font-bold text-gray-400 mr-1">{product.default_currency_symbol}</span>
                    </div>


                    {/* Qty Stepper */}
                    <div className="flex items-center bg-gray-100 rounded-xl p-1 shrink-0">
                        <button
                            disabled={!product.in_stock}
                            onClick={() => onStep(1)}
                            className="w-8 h-8 flex items-center justify-center text-[#1a1c4e] hover:bg-white rounded-lg transition-all text-lg font-bold disabled:opacity-30"
                        >
                            +
                        </button>
                        <span className="px-2.5 font-black text-sm text-[#1a1c4e] min-w-6 text-center">
                            {quantity}
                        </span>
                        <button
                            disabled={!product.in_stock || quantity <= 1}
                            onClick={() => onStep(-1)}
                            className="w-8 h-8 flex items-center justify-center text-[#1a1c4e] hover:bg-white rounded-lg transition-all text-lg font-bold disabled:opacity-30"
                        >
                            −
                        </button>
                    </div>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={onAddToCart}
                    disabled={!product.in_stock}
                    className="w-full py-3.5 bg-[#c00011] hover:bg-[#a30010] disabled:bg-gray-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-[#c00011]/20 active:scale-95 text-sm"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.9 18 8 18h12v-2H8.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0023.47 5H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                    أضف للسلة
                </button>
            </div>
        </div>
    );
}
