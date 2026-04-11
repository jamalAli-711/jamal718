import { useState } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function ProductShow({ product, relatedProducts }) {
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(
        product.images?.find(i => i.is_primary)?.url || product.images?.[0]?.url || null
    );
    const [activeTab, setActiveTab] = useState('about');
    const [addedToCart, setAddedToCart] = useState(false);

    const stepQuantity = (delta) => {
        const next = quantity + delta;
        if (next < 1) return;
        if (next > product.stock_quantity) return;
        setQuantity(next);
    };

    const handleQuantityChange = (value) => {
        if (value === '') {
            setQuantity('');
            return;
        }
        let num = parseInt(value);
        if (!isNaN(num)) {
            setQuantity(Math.max(1, Math.min(num, product.stock_quantity)));
        }
    };

    const handleBlur = () => {
        if (quantity === '' || quantity < 1) {
            setQuantity(1);
        }
    };

    const addToCart = () => {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingIndex = cart.findIndex(item => item.product_id === product.id);
        if (existingIndex >= 0) {
            cart[existingIndex].quantity = Math.min(
                cart[existingIndex].quantity + quantity,
                product.stock_quantity
            );
        } else {
            cart.push({
                product_id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                thumbnail: activeImage,
                stock_quantity: product.stock_quantity
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
    };

    const tabs = [
        { id: 'about', label: 'عن المنتج' },
        { id: 'specs', label: 'الحقائق الغذائية' },
        { id: 'reviews', label: 'التقييمات' },
        { id: 'shipping', label: 'سياسة الشحن' },
    ];

    return (
        <CustomerLayout hideFooter={true}>
            <Head title={product.name} />

            {/* ─── Added to Cart Toast ─── */}
            {addedToCart && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] bg-[#1a2340] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-in">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span className="font-bold">تمت إضافة المنتج إلى السلة!</span>
                </div>
            )}

            <div className="bg-[#f8f9fb] min-h-screen" dir="rtl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">

                    {/* ─── Breadcrumb ─── */}
                    <nav className="mb-8 flex items-center gap-2 text-sm text-gray-400">
                        <Link href={route('customer.storefront')} className="hover:text-[#e31e24] transition-colors">
                            المنتجات
                        </Link>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-gray-400">{product.category_name}</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-[#1a2340] font-medium truncate max-w-xs">{product.name}</span>
                    </nav>

                    {/* ─── Main Product Layout ─── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                        {/* Right: Image Gallery */}
                        <div className="lg:col-span-7 flex flex-col gap-4">
                            {/* Main Image */}
                            <div className="relative bg-white rounded-3xl overflow-hidden aspect-square group shadow-sm">
                                {activeImage ? (
                                    <img
                                        src={activeImage}
                                        alt={product.name}
                                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 p-6"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}

                                {/* Favorite Button */}
                                <button className="absolute top-5 left-5 p-3 bg-white/90 backdrop-blur rounded-full shadow hover:bg-white transition-all active:scale-90">
                                    <svg className="w-5 h-5 text-gray-400 hover:text-[#e31e24] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                </button>
                            </div>

                            {/* Thumbnails */}
                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {product.images.map((img, index) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setActiveImage(img.url)}
                                            className={`rounded-xl overflow-hidden cursor-pointer transition-all p-1 ${
                                                activeImage === img.url
                                                    ? 'border-2 border-[#e31e24] bg-white shadow-sm'
                                                    : 'border-2 border-transparent bg-white hover:border-gray-200'
                                            }`}
                                        >
                                            <img
                                                src={img.url}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full aspect-square object-contain rounded-lg"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Left: Product Info */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            {/* Badge + Name */}
                            <div>
                                <span className="inline-block py-1 px-3 bg-red-50 text-[#e31e24] rounded-full text-xs font-bold mb-3 tracking-wide">
                                    {product.category_name}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-black text-[#1a2340] leading-tight mb-3">
                                    {product.name}
                                </h1>

                                {/* Rating */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center text-yellow-400">
                                        {[1,2,3,4,5].map(s => (
                                            <svg key={s} className="w-4 h-4" fill={s <= 4 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-400 font-medium">4.8 (120 تقييم)</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-3xl font-black text-[#e31e24]">
                                    {Number(product.price).toLocaleString('ar-SA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    <span className="text-base font-bold mr-1">{product.system_currency_name}</span>
                                    <span className="mx-2 text-gray-300 text-lg">/</span>
                                    <span className="text-xl font-bold text-gray-500">{product.default_unit_name}</span>
                                </span>
                            </div>


                            {/* Description */}
                            <p className="text-gray-500 leading-relaxed text-sm">
                                منتج عالي الجودة بمعايير احترافية. الرقم التعريفي: {product.sku}. متاح للطلب عبر متجرنا الإلكتروني مع توصيل سريع وآمن.
                            </p>

                            {/* Quantity + Stock */}
                            <div className="flex items-center gap-6">
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">الكمية</label>
                                    <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                                        <button
                                            onClick={() => stepQuantity(-1)}
                                            disabled={quantity <= 1}
                                            className="w-9 h-9 flex items-center justify-center text-[#e31e24] hover:bg-white rounded-lg transition-all disabled:opacity-30 text-xl font-bold"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="text"
                                            value={quantity}
                                            onChange={(e) => handleQuantityChange(e.target.value)}
                                            onBlur={handleBlur}
                                            className="w-10 bg-transparent text-center font-black text-[#1a2340] text-lg outline-none border-none focus:ring-0 p-0"
                                            disabled={!product.in_stock}
                                        />
                                        <button
                                            onClick={() => stepQuantity(1)}
                                            disabled={quantity >= product.stock_quantity}
                                            className="w-9 h-9 flex items-center justify-center text-[#e31e24] hover:bg-white rounded-lg transition-all disabled:opacity-30 text-xl font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">الحالة</label>
                                    <div className="flex items-center gap-2 py-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${product.in_stock ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                                        <span className={`text-sm font-bold ${product.in_stock ? 'text-emerald-700' : 'text-red-600'}`}>
                                            {product.in_stock ? 'متوفر في المخزون' : 'نفد المخزون'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Add to Cart */}
                            <button
                                onClick={addToCart}
                                disabled={!product.in_stock}
                                className="w-full py-4 bg-[#e31e24] hover:bg-[#c41920] disabled:bg-gray-300 text-white rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 shadow-md"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                أضف للسلة
                            </button>

                            {/* Specs Card */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                                <h3 className="text-base font-black text-[#1a2340] mb-3">معلومات إضافية</h3>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                    {[
                                        { label: 'رمز المنتج', value: product.sku },
                                        { label: 'التصنيف', value: product.category_name },
                                        { label: 'المخزون المتوفر', value: `${product.stock_quantity} وحدة` },
                                        { label: 'رقم المنتج', value: `#${product.id}` },
                                    ].map(spec => (
                                        <div key={spec.label}>
                                            <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-widest">{spec.label}</span>
                                            <span className="font-bold text-[#1a2340] text-sm">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex items-center gap-6 py-2">
                                {[
                                    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'جودة مضمونة' },
                                    { icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', label: 'توصيل سريع' },
                                    { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'دفع آمن' },
                                ].map(badge => (
                                    <div key={badge.label} className="flex items-center gap-2 text-gray-500">
                                        <svg className="w-5 h-5 text-[#e31e24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={badge.icon} />
                                        </svg>
                                        <span className="text-xs font-bold">{badge.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ─── TABS SECTION ─── */}
                    <section className="mt-20">
                        <div className="border-b border-gray-200 flex gap-8 mb-10 overflow-x-auto">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 -mb-px ${
                                        activeTab === tab.id
                                            ? 'text-[#1a2340] border-[#e31e24]'
                                            : 'text-gray-400 border-transparent hover:text-[#1a2340]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* About Tab */}
                            <div className="space-y-5">
                                <h2 className="text-2xl font-black text-[#1a2340]">منتج مختار بعناية فائقة</h2>
                                <p className="text-gray-500 leading-loose text-sm">
                                    نؤمن بأن الجودة لا تُساوم. كل منتج يمر بمراحل فحص دقيقة لضمان وصوله إليك بأفضل حالة ممكنة، مع الحفاظ على المواصفات الأصلية والطعم الأصيل.
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        'خالٍ من الإضافات الكيميائية والمواد الحافظة الضارة.',
                                        'تغليف محكم يحافظ على الجودة حتى لحظة التسليم.',
                                        'خيار مثالي للاستخدام اليومي والمناسبات الخاصة.',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 bg-[#e31e24] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Nutrition Facts */}
                            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-6 bg-red-50/50 border-b border-gray-100">
                                    <h3 className="text-lg font-black text-[#1a2340]">الحقائق الغذائية (لكل 100 جرام)</h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    {[
                                        { label: 'السعرات الحرارية', value: '282 سعرة' },
                                        { label: 'إجمالي الكربوهيدرات', value: '75 جم' },
                                        { label: 'الألياف الغذائية', value: '8 جم' },
                                        { label: 'بروتين', value: '2.5 جم' },
                                        { label: 'بوتاسيوم', value: '656 ملجم' },
                                    ].map((fact, i) => (
                                        <div key={i} className={`flex justify-between items-center py-2 ${i < 4 ? 'border-b border-gray-50' : ''}`}>
                                            <span className="text-gray-500 text-sm">{fact.label}</span>
                                            <span className="font-black text-[#1a2340] text-sm">{fact.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ─── RELATED PRODUCTS ─── */}
                    {relatedProducts && relatedProducts.length > 0 && (
                        <section className="mt-20">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-[#1a2340]">منتجات قد تعجبك</h2>
                                    <p className="text-gray-400 text-sm mt-1">مختارات أخرى من نفس الفئة</p>
                                </div>
                                <Link
                                    href={route('customer.storefront')}
                                    className="text-[#e31e24] font-bold text-sm flex items-center gap-1 hover:underline"
                                >
                                    عرض الكل
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                {relatedProducts.map(related => (
                                    <Link
                                        key={related.id}
                                        href={route('customer.storefront.show', related.id)}
                                        className="group cursor-pointer block"
                                    >
                                        <div className="bg-white rounded-2xl overflow-hidden mb-3 relative aspect-[4/5] shadow-sm">
                                            {related.image_path ? (
                                                <img
                                                    src={related.image_path}
                                                    alt={related.name}
                                                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                            {/* Quick add button */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    // Add to cart with qty 1
                                                    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
                                                    const idx = cart.findIndex(i => i.product_id === related.id);
                                                    if (idx >= 0) { cart[idx].quantity += 1; }
                                                    else { cart.push({ product_id: related.id, name: related.name, price: related.price, quantity: 1, thumbnail: related.image_path, stock_quantity: related.stock_quantity }); }
                                                    localStorage.setItem('cart', JSON.stringify(cart));
                                                    window.dispatchEvent(new Event('cartUpdated'));
                                                }}
                                                className="absolute bottom-3 left-3 p-2 bg-white rounded-full shadow hover:bg-[#e31e24] hover:text-white transition-all text-gray-500 group/btn"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <h3 className="font-bold text-[#1a2340] text-sm mb-1 line-clamp-1 group-hover:text-[#e31e24] transition-colors">{related.name}</h3>
                                        <span className="text-[#e31e24] font-black text-base">
                                            {Number(related.price).toLocaleString('ar-SA', {minimumFractionDigits: 2, maximumFractionDigits: 2})} {product.system_currency_name}
                                            <span className="mx-1 text-gray-300 text-xs">/</span>
                                            <span className="text-xs font-bold text-gray-500">{related.default_unit_name}</span>
                                        </span>

                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* ─── FOOTER ─── */}
            <footer className="bg-[#f3f4f6] border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row-reverse items-center justify-between gap-8">
                    <div className="flex flex-col items-center md:items-start gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#e31e24] rounded-xl flex items-center justify-center">
                                <span className="text-white font-black text-xl">S</span>
                            </div>
                            <span className="text-xl font-black text-[#1a2340]">Al-Mekhlafi</span>
                        </div>
                        <p className="text-gray-400 text-xs max-w-xs text-center md:text-right">
                            مؤسسة المخلافي للمنتجات، جودة نعتز بها وتاريخ نرويه في كل منتج.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400">
                        {['الشروط والأحكام', 'سياسة الخصوصية', 'تواصل معنا', 'الشحن والتوصيل'].map(link => (
                            <a key={link} href="#" className="hover:text-[#e31e24] transition-colors underline underline-offset-4">
                                {link}
                            </a>
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                </svg>
                            </div>
                            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H5c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h14c.6 0 1 .4 1 1v10c0 .6-.4 1-1 1zm-7-9H8V7h4v2zm4 0h-2V7h2v2zm-4 4H8v-2h4v2zm4 0h-2v-2h2v2zm-4 4H8v-2h4v2zm4 0h-2v-2h2v2z"/>
                                </svg>
                            </div>
                        </div>
                        <p className="text-gray-400 text-xs">© {new Date().getFullYear()} المخلافي. جميع الحقوق محفوظة.</p>
                    </div>
                </div>
            </footer>
        </CustomerLayout>
    );
}
