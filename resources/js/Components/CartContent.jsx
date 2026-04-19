import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function CartContent({ onCheckoutSuccess }) {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        items: []
    });

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
        updateTotal(cart);
    }, []);

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

        const newQty = Math.max(1, Math.min(item.quantity + delta, item.stock_quantity));
        newCart[index].quantity = newQty;
        
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

    const submitOrder = (e) => {
        e.preventDefault();
        post(route('customer.checkout'), {
            onSuccess: () => {
                localStorage.removeItem('cart');
                window.dispatchEvent(new Event('cartUpdated'));
                if (onCheckoutSuccess) onCheckoutSuccess();
            }
        });
    };

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
                            <div className="text-xs font-black text-amber-400/80">{item.price.toLocaleString()} <span className="text-[10px] text-white/20 uppercase tracking-widest">ريال</span></div>
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

            {/* VIP Order Summary */}
            <div className="pt-10 border-t border-white/5 space-y-8">
                <div className="flex justify-between items-end">
                    <span className="text-xs font-black text-white/30 uppercase tracking-[0.4em]">إجمالي الطلب</span>
                    <div className="text-right">
                        <div className="text-4xl font-black text-white leading-none tracking-tighter">{total.toLocaleString()}</div>
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">ريال يمني</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="w-full py-6 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:opacity-20 text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-amber-500/10 transition-all active:scale-[0.98]"
                    >
                        {processing ? 'جاري تأكيد الجلسة...' : 'تأكيد الطلب وإرساله'}
                    </button>
                    {errors.items && <p className="text-xs font-bold text-rose-500 text-center">{errors.items}</p>}
                </div>
            </div>
        </form>
    );
}
