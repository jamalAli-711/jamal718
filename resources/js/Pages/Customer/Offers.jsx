import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { formatDate } from '@/constants';

export default function Offers({ auth, offers }) {
    const [quantities, setQuantities] = useState(
        offers.reduce((acc, offer) => ({ ...acc, [offer.id]: 1 }), {})
    );
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleQtyChange = (offerId, val, stock) => {
        if (val === '') {
            setQuantities(prev => ({ ...prev, [offerId]: '' }));
            return;
        }
        const num = parseInt(val);
        if (!isNaN(num)) {
            setQuantities(prev => ({
                ...prev,
                [offerId]: Math.max(1, Math.min(num, stock || 999))
            }));
        }
    };

    const addToCart = (offer) => {
        const qty = quantities[offer.id] || 0;
        const product = offer.target_product;
        
        if (!product || qty < 1) return;

        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        const primaryIdx = cart.findIndex(i => i.product_id === product.id && !i.is_gift);
        if (primaryIdx >= 0) {
            cart[primaryIdx].quantity = Math.min(cart[primaryIdx].quantity + qty, product.calculate_stock);
        } else {
            cart.push({
                product_id: product.id,
                name: product.name,
                price: product.calculate_price,
                quantity: qty,
                thumbnail: product.thumbnail,
                stock_quantity: product.calculate_stock,
            });
        }

        if (offer.offer_type === 'Free_Unit' && qty >= offer.min_qty_to_achieve) {
            let bonusQty = offer.bonus_qty;
            if (offer.is_cumulative) {
                bonusQty = Math.floor(qty / offer.min_qty_to_achieve) * offer.bonus_qty;
            }

            const bonusProduct = offer.bonus_product || offer.target_product;
            const bonusIdx = cart.findIndex(i => i.product_id === bonusProduct.id && i.is_gift && i.parent_id === product.id);

            if (bonusIdx >= 0) {
                cart[bonusIdx].quantity += bonusQty;
            } else {
                cart.push({
                    product_id: bonusProduct.id,
                    name: `🎁 (هدية) ${bonusProduct.name}`,
                    price: 0,
                    quantity: bonusQty,
                    thumbnail: bonusProduct.thumbnail,
                    is_gift: true,
                    parent_id: product.id,
                    offer_title: offer.title
                });
            }
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        showToast(`تمت إضافة العرض الحصري للسلة! ✨`);
    };

    return (
        <CustomerLayout user={auth.user}>
            <Head title="عروض النخبة — معرض حصري" />

            {/* Premium Toast */}
            <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-700 ease-out ${toast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none'}`}>
                <div className="bg-[#1a1a1f]/90 backdrop-blur-3xl border border-amber-400/30 text-white px-10 py-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(251,191,36,0.15)] flex items-center gap-4 min-w-[320px]">
                    <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                        <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/70 leading-none mb-1">تمت الإضافة</p>
                        <span className="font-bold text-sm leading-none">{toast}</span>
                    </div>
                </div>
            </div>

            <div className="min-h-screen bg-[#0a0a0c] relative overflow-hidden" dir="rtl">
                {/* Orbital Background Effects */}
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24 relative z-10">
                    
                    {/* VIP Header Design */}
                    <div className="text-center mb-24">
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-amber-400 mb-8 backdrop-blur-md shadow-2xl">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] leading-none">المجموعة الحصرية VIP</span>
                        </div>
                        <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-none">
                            عروض <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700">النخبة</span>
                        </h1>
                        <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed italic opacity-80">
                            تجربة تسوق فارهة مُصممة لشركائنا المميزين. استفد من الخصومات الحصرية والهدايا الفريدة بضمة زر.
                        </p>
                    </div>

                    {offers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {offers.map((offer) => {
                                const qty = quantities[offer.id] || 0;
                                const product = offer.target_product;
                                const basePrice = product?.calculate_price || 0;
                                
                                // Logic
                                let savingsLabel = "";
                                let finalPrice = basePrice * qty;
                                let savedAmount = 0;

                                if (qty >= offer.min_purchase_qty) {
                                    if (offer.offer_type === 'Percentage') {
                                        savedAmount = (basePrice * offer.discount_value) * qty;
                                        finalPrice = (basePrice * (1 - offer.discount_value)) * qty;
                                        savingsLabel = `خصم ${(offer.discount_value * 100).toFixed(0)}% حصري`;
                                    } else if (offer.offer_type === 'Fixed_Amount') {
                                        savedAmount = offer.discount_value * qty;
                                        finalPrice = (basePrice - offer.discount_value) * qty;
                                        savingsLabel = `توفير ${offer.discount_value} ريال`;
                                    }
                                }

                                let bonusQty = 0;
                                if (offer.offer_type === 'Free_Unit' && qty >= offer.min_qty_to_achieve) {
                                    bonusQty = offer.is_cumulative ? Math.floor(qty / offer.min_qty_to_achieve) * offer.bonus_qty : offer.bonus_qty;
                                }

                                return (
                                    <div key={offer.id} className="vip-card group relative bg-[#16161a]/60 backdrop-blur-3xl rounded-[3rem] border border-white/5 overflow-hidden transition-all duration-700 hover:-translate-y-4 hover:border-amber-400/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                                        
                                        {/* Sweeping Shine Effect Layer */}
                                        <div className="shine-layer absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                        {/* Image Section */}
                                        <div className="h-64 bg-black overflow-hidden relative">
                                            {offer.image_path ? (
                                                <img src={`/storage/${offer.image_path}`} alt={offer.title} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-[#1a1c22]">
                                                    <svg className="w-20 h-20 text-white/5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                                                </div>
                                            )}
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#16161a] via-transparent to-transparent flex flex-col justify-end p-8">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="h-[1px] w-8 bg-amber-400" />
                                                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">{offer.offer_type === 'Free_Unit' ? 'مكافأة خاصة' : 'تسعير حصري'}</span>
                                                </div>
                                                <h3 className="text-3xl font-black text-white leading-none tracking-tighter">{offer.title}</h3>
                                            </div>
                                        </div>

                                        {/* VIP Content */}
                                        <div className="p-10 space-y-10">
                                            
                                            {/* Product Identity */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                                                        <svg className="w-8 h-8 text-amber-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1 leading-none">الصنف المستهدف</p>
                                                        <p className="text-xl font-black text-white leading-tight">{product?.name}</p>
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    <span className="text-xs font-bold text-white/30 line-through block mb-1">{basePrice.toLocaleString()}</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-2xl font-black text-amber-400">{basePrice.toLocaleString()}</span>
                                                        <span className="text-[10px] font-black text-white/40 uppercase">{product?.calculate_currency}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Luxury Calculator Panel */}
                                            <div className="bg-black/40 rounded-[2.5rem] border border-white/5 p-8 space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-white/50 uppercase tracking-[0.2em]">اختر الكمية</span>
                                                    <div className="flex items-center bg-white/5 rounded-2xl p-1.5 border border-white/10 shadow-inner group/stepper">
                                                        <button 
                                                            onClick={() => handleQtyChange(offer.id, qty + 1, product?.calculate_stock)} 
                                                            className="w-11 h-11 flex items-center justify-center text-white/40 hover:text-amber-400 hover:bg-white/5 rounded-xl transition-all font-black text-xl"
                                                        >+</button>
                                                        <input 
                                                            type="number" 
                                                            value={qty} 
                                                            onChange={(e) => handleQtyChange(offer.id, e.target.value, product?.calculate_stock)}
                                                            className="w-16 text-center border-none focus:ring-0 bg-transparent font-black text-2xl text-white p-0 hide-spinner mx-1"
                                                        />
                                                        <button 
                                                            onClick={() => handleQtyChange(offer.id, qty - 1, product?.calculate_stock)} 
                                                            className="w-11 h-11 flex items-center justify-center text-white/40 hover:text-amber-400 hover:bg-white/5 rounded-xl transition-all font-black text-xl"
                                                        >−</button>
                                                    </div>
                                                </div>

                                                {/* Calculation Logic (Styled) */}
                                                {qty > 0 && (
                                                    <div className="pt-6 mt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
                                                        {offer.offer_type === 'Free_Unit' ? (
                                                            <div className="flex items-center justify-between bg-white/[0.02] p-5 rounded-[2rem] border border-white/5">
                                                                <div>
                                                                    <p className="text-[10px] font-black text-amber-400/60 uppercase tracking-widest mb-1 leading-none">مكافأة VIP</p>
                                                                    <h4 className="text-3xl font-black text-white leading-none">{bonusQty} <span className="text-sm font-bold text-white/40">{offer.bonus_unit?.unit_name || 'وحدة'}</span></h4>
                                                                </div>
                                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-1000 ${bonusQty > 0 ? 'bg-amber-400/10 text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.2)] scale-110' : 'bg-white/5 text-white/10 opacity-30'}`}>
                                                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div className="flex justify-between items-baseline px-2">
                                                                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">{savingsLabel}</span>
                                                                    <div className="flex items-baseline gap-1 text-amber-400/80 font-black">
                                                                        <span className="text-xs">−</span>
                                                                        <span className="text-2xl">{savedAmount.toLocaleString()}</span>
                                                                        <span className="text-[10px] text-white/30 uppercase">{product?.calculate_currency}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between items-end bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                                                                    <span className="text-sm font-bold text-white/40 mb-1 leading-none">صافي المستحق</span>
                                                                    <div className="text-left">
                                                                        <span className="text-4xl font-black text-white leading-none">{finalPrice.toLocaleString()}</span>
                                                                        <span className="text-xs font-bold text-white/30 mr-2">{product?.calculate_currency}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Premium Action Button */}
                                            <div className="space-y-6">
                                                <button 
                                                    onClick={() => addToCart(offer)}
                                                    disabled={!product?.calculate_stock || (offer.offer_type === 'Free_Unit' && qty < offer.min_qty_to_achieve && qty > 0)}
                                                    className="relative w-full py-6 group/btn overflow-hidden rounded-[2.5rem] disabled:opacity-20 disabled:cursor-not-allowed"
                                                >
                                                    {/* Button Background Gradient */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 group-hover/btn:scale-x-110 transition-transform duration-500" />
                                                    
                                                    {/* Label */}
                                                    <span className="relative flex items-center justify-center gap-3 text-black font-black text-xs uppercase tracking-[0.4em]">
                                                        {!product?.calculate_stock ? 'نفد المخزون' : (
                                                            <>
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                                احجز العرض الآن
                                                            </>
                                                        )}
                                                    </span>
                                                </button>
                                                
                                                <div className="flex items-center justify-between text-[9px] font-black text-white/20 uppercase tracking-[0.3em] px-4">
                                                    <span>الصلاحية: {offer.end_date ? formatDate(offer.end_date) : 'دائم'}</span>
                                                    <span className={product?.calculate_stock < 10 ? 'text-rose-500/50' : ''}>المخزون: {product?.calculate_stock} وحدة</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-40 bg-white/[0.02] rounded-[5rem] border border-white/5 max-w-4xl mx-auto backdrop-blur-3xl">
                            <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center mx-auto mb-10 border border-white/5 shadow-2xl">
                                <svg className="w-16 h-16 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                            </div>
                            <h3 className="text-4xl font-black text-white mb-6 tracking-tighter">لا توجد عروض نخبة حالياً</h3>
                            <p className="text-white/40 text-lg font-medium max-w-md mx-auto leading-relaxed">
                                يتم تجهيز باقة جديدة من الامتيازات الحصرية. يرجى المراجعة لاحقاً.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                
                :root {
                    font-family: 'Outfit', sans-serif;
                }

                .vip-card { transition: all 0.7s cubic-bezier(0.23, 1, 0.32, 1); }
                
                .shine-layer {
                    background: linear-gradient(
                        110deg,
                        transparent 20%,
                        rgba(251, 191, 36, 0.05) 45%,
                        rgba(251, 191, 36, 0.1) 50%,
                        rgba(251, 191, 36, 0.05) 55%,
                        transparent 80%
                    );
                    background-size: 200% 100%;
                    animation: shine-sweep 3s infinite linear;
                }

                @keyframes shine-sweep {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .hide-spinner::-webkit-inner-spin-button, 
                .hide-spinner::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }

                input[type=number] {
                    -moz-appearance: textfield;
                }
            ` }} />
        </CustomerLayout>
    );
}
