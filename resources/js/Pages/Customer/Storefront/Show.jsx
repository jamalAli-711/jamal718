import { useState } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function ProductShow({ product, relatedProducts }) {
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(
        product.images?.find(i => i.is_primary)?.url || product.images?.[0]?.url || product.image_path || null
    );
    const [activeTab, setActiveTab] = useState('about');
    const [addedToCart, setAddedToCart] = useState(false);

    const stepQuantity = (delta) => {
        const next = quantity + delta;
        if (next < 1 || next > product.stock_quantity) return;
        setQuantity(next);
    };

    const handleQuantityChange = (value) => {
        if (value === '') { setQuantity(''); return; }
        let num = parseInt(value);
        if (!isNaN(num)) { setQuantity(Math.max(1, Math.min(num, product.stock_quantity))); }
    };

    const handleBlur = () => {
        if (quantity === '' || quantity < 1) { setQuantity(1); }
    };

    const addToCart = () => {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingIndex = cart.findIndex(item => item.product_id === product.id && !item.is_gift);
        if (existingIndex >= 0) {
            cart[existingIndex].quantity = Math.min(cart[existingIndex].quantity + quantity, product.stock_quantity);
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
        { id: 'about', label: 'القصة الحصرية' },
        { id: 'specs', label: 'المواصفات الفنية' },
        { id: 'shipping', label: 'الاستلام الملكي' },
    ];

    return (
        <CustomerLayout hideFooter={false}>
            <Head title={`Elite: ${product.name}`} />

            {/* VIP Toast */}
            <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-700 ${addedToCart ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none'}`}>
                <div className="bg-[#1a1a1f]/90 backdrop-blur-3xl border border-amber-400/30 text-white px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span className="font-black text-sm">تمت الإضافة للمحفظة الفاخرة! ✨</span>
                </div>
            </div>

            <div className="min-h-screen pt-12 pb-32" dir="rtl">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">

                    {/* Elite Breadcrumb */}
                    <nav className="mb-16 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                        <Link href={route('customer.storefront')} className="hover:text-amber-400 transition-colors">المعرض</Link>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        <span className="text-white/40">{product.category_name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        <span className="text-amber-400/80">{product.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

                        {/* Right: Premium Gallery */}
                        <div className="lg:col-span-6 space-y-8">
                            <div className="relative aspect-square rounded-[4rem] bg-[#0d0d10] border border-white/5 overflow-hidden group shadow-2xl">
                                {activeImage ? (
                                    <img src={activeImage} className="w-full h-full object-contain p-12 transition-all duration-1000 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/5"><svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>

                            {/* Thumbnails */}
                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-4">
                                    {product.images.map((img) => (
                                        <button key={img.id} onClick={() => setActiveImage(img.url)} className={`aspect-square rounded-3xl overflow-hidden border-2 p-1.5 transition-all ${activeImage === img.url ? 'border-amber-400 bg-amber-400/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                                            <img src={img.url} className="w-full h-full object-cover rounded-2xl" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Left: Luxury Info */}
                        <div className="lg:col-span-6 flex flex-col gap-12">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full text-amber-400 mb-6 tracking-widest text-[10px] font-black uppercase">
                                    {product.category_name} • Premium Selection
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-6">
                                    {product.name}
                                </h1>
                                <p className="text-white/40 text-xl font-medium leading-relaxed italic border-r-2 border-amber-400/30 pr-6">
                                    قطعة فريدة تم اختيارها بعناية فائقة لتعبر عن تميزكم. كل تفصيلة في هذا المنتج صُممت خصيصاً للمديرين والشركاء النخبة.
                                </p>
                            </div>

                            <div className="flex items-baseline gap-4">
                                <span className="text-6xl font-black text-amber-400">{Number(product.price).toLocaleString()}</span>
                                <span className="text-xl font-black text-white/30 uppercase tracking-[0.2em]">{product.system_currency_name}</span>
                                <span className="text-white/10 mx-2 text-3xl">/</span>
                                <span className="text-2xl font-black text-white/40">{product.default_unit_name}</span>
                            </div>

                            {/* Luxury Actions */}
                            <div className="bg-[#111114] rounded-[3rem] border border-white/5 p-10 space-y-8 shadow-inner">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-white/20 uppercase tracking-[0.3em]">Adjust Quantity</span>
                                    <div className="flex items-center bg-white/5 rounded-2.5xl p-2 border border-white/10">
                                        <button onClick={() => stepQuantity(1)} disabled={quantity >= product.stock_quantity} className="w-12 h-12 flex items-center justify-center text-white/40 hover:text-amber-400 text-2xl transition-all">+</button>
                                        <input type="text" value={quantity} onChange={(e) => handleQuantityChange(e.target.value)} onBlur={handleBlur} className="w-14 bg-transparent text-center font-black text-2xl text-white border-none focus:ring-0" />
                                        <button onClick={() => stepQuantity(-1)} disabled={quantity <= 1} className="w-12 h-12 flex items-center justify-center text-white/40 hover:text-amber-400 text-2xl transition-all">-</button>
                                    </div>
                                </div>

                                <button 
                                    onClick={addToCart} 
                                    disabled={!product.in_stock}
                                    className="w-full py-6 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-amber-500/10 hover:shadow-amber-500/30 transition-all active:scale-[0.98] active:brightness-90 flex items-center justify-center gap-4"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    {product.in_stock ? 'CLAIM YOUR PRODUCT' : 'OUT OF STOCK'}
                                </button>
                            </div>

                            {/* Tech Specs Summary */}
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { label: 'Art-No', value: product.sku || 'N/A' },
                                    { label: 'Vault Stock', value: `${product.stock_quantity} Units` },
                                    { label: 'Origin', value: 'Exclusive' },
                                    { label: 'Status', value: product.in_stock ? 'Available' : 'Limited' },
                                ].map(spec => (
                                    <div key={spec.label} className="p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{spec.label}</p>
                                        <p className="text-sm font-black text-white tracking-tight">{spec.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Elite Tabs */}
                    <div className="mt-40 border-t border-white/5 pt-24">
                        <div className="flex gap-12 mb-16 overflow-x-auto pb-4 custom-scrollbar">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`text-[11px] font-black uppercase tracking-[0.5em] pb-6 relative transition-all ${activeTab === tab.id ? 'text-amber-400' : 'text-white/20 hover:text-white'}`}>
                                    {tab.label}
                                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 rounded-full shadow-glow" />}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                            <div className="space-y-8">
                                <h2 className="text-4xl font-black text-white tracking-tighter">قصة التميز والجودة</h2>
                                <p className="text-white/40 leading-loose text-lg italic">
                                    "في المخلافي، نحن لا نبيع منتجات، نحن نبيع ثقة متبادلة وتاريخاً من الجودة. هذا المنتج يمثل قمة ما توصلنا إليه في اختيار الأفضل لشركائنا."
                                </p>
                                <div className="space-y-4">
                                    {['فحص دقيق بمعدل 12 نقطة جودة.', 'تغليف بيئي فاخر قابل لإعادة التدوير.', 'دعم فني مخصص للنخبة.'].map(txt => (
                                        <div key={txt} className="flex items-center gap-4 text-sm font-bold text-white/80">
                                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                                            {txt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-12 bg-white/[0.01] rounded-[4rem] border border-white/5 backdrop-blur-3xl text-center">
                                <div className="w-24 h-24 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-glow">
                                    <svg className="w-12 h-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <h4 className="text-xl font-black text-white mb-4 tracking-tighter">ضمان المخلافي الذهبي</h4>
                                <p className="text-white/40 text-sm leading-relaxed">استمتع براحة البال المطلقة مع ضماننا الشامل على جميع المنتجات الحصرية.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
