import { useState, useEffect } from 'react';
import { Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function CartContent({ onCheckoutSuccess }) {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        items: [],
        notes: ''
    });

    const loadCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
        updateTotal(cart);
        
        setData('items', cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            notes: item.notes || ''
        })));
    };

    useEffect(() => {
        loadCart();
        window.addEventListener('cartUpdated', loadCart);
        return () => window.removeEventListener('cartUpdated', loadCart);
    }, []);

    const updateTotal = (items) => {
        const newTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(newTotal);
    };

    const handleQuantityInputChange = (index, value) => {
        const newCart = [...cartItems];
        
        if (value === '') {
            newCart[index].quantity = '';
            setCartItems(newCart);
            return;
        }

        const val = parseInt(value);
        if (isNaN(val) || val < 1) return;
        
        if (val > newCart[index].stock_quantity) {
            newCart[index].quantity = newCart[index].stock_quantity;
        } else {
            newCart[index].quantity = val;
        }

        setCartItems(newCart);
        updateTotal(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));

        setData('items', newCart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            notes: item.notes || ''
        })));
    };

    const handleBlur = (index) => {
        const newCart = [...cartItems];
        if (newCart[index].quantity === '' || !newCart[index].quantity) {
            newCart[index].quantity = 1;
            setCartItems(newCart);
            updateTotal(newCart);
            localStorage.setItem('cart', JSON.stringify(newCart));
            window.dispatchEvent(new Event('cartUpdated'));

            setData('items', newCart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                notes: item.notes || ''
            })));
        }
    };

    const updateQuantity = (index, delta) => {
        const current = parseInt(cartItems[index].quantity) || 1;
        handleQuantityInputChange(index, current + delta);
    };

    const removeItem = (index) => {
        const newCart = cartItems.filter((_, i) => i !== index);
        setCartItems(newCart);
        updateTotal(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));

        setData('items', newCart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            notes: item.notes || ''
        })));
    };

    const handleItemNoteChange = (index, note) => {
        const newCart = [...cartItems];
        newCart[index].notes = note;
        setCartItems(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        
        setData('items', newCart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            notes: item.notes || ''
        })));
    };

    const handleCheckout = (e) => {
        e.preventDefault();
        if (cartItems.length === 0) return;

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
            <div className="p-8 text-center text-gray-500">
                <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-xl font-medium mb-2">سلتك فارغة</h3>
                <p className="mb-6">لم تقم بإضافة أي منتجات بعد.</p>
                <Link href={route('customer.storefront')} className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700">
                    تصفح المنتجات
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-h-[80vh]">
            <div className="flex-1 overflow-y-auto pr-2">
                {errors.cart && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm">
                        {errors.cart}
                    </div>
                )}

                <ul className="divide-y divide-gray-100">
                    {cartItems.map((item, index) => (
                        <li key={index} className="py-4 flex gap-4 items-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-md shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                                {item.thumbnail ? (
                                    <img src={item.thumbnail} alt={item.name} className="object-cover w-full h-full" />
                                ) : (
                                    <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 truncate" title={item.name}>{item.name}</h4>
                                <div className="text-xs text-emerald-600 font-bold mt-0.5">{item.price.toLocaleString()} ريال</div>
                                <div className="flex items-center mt-2 gap-2">
                                    <div className="flex items-center border border-gray-200 rounded text-xs overflow-hidden">
                                        <button onClick={() => updateQuantity(index, 1)} className="px-2 py-0.5 hover:bg-gray-50 bg-white" disabled={cartItems[index].quantity >= item.stock_quantity}>+</button>
                                        <input 
                                            type="number"
                                            value={cartItems[index].quantity === undefined ? 1 : cartItems[index].quantity}
                                            onChange={(e) => handleQuantityInputChange(index, e.target.value)}
                                            onBlur={() => handleBlur(index)}
                                            className="w-10 text-center border-none bg-gray-50 focus:ring-0 text-xs font-bold p-0 hide-spinner"
                                        />
                                        <button onClick={() => updateQuantity(index, -1)} className="px-2 py-0.5 hover:bg-gray-50 bg-white" disabled={cartItems[index].quantity <= 1}>-</button>
                                    </div>
                                    <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="mt-2">
                                    <input 
                                        type="text" 
                                        placeholder="إضافة ملاحظة لهذا الصنف..." 
                                        className="w-full text-[10px] border-none bg-gray-50 rounded px-2 py-1 focus:ring-1 focus:ring-blue-100 italic" 
                                        value={item.notes || ''} 
                                        onChange={(e) => handleItemNoteChange(index, e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="text-left text-sm font-bold text-gray-900">
                                {(item.price * item.quantity).toLocaleString()} <span className="text-[10px] text-gray-400">ريال</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-4">
                <div className="px-2">
                    <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        ملاحظات عامة للطلب
                    </label>
                    <textarea 
                        className="w-full border border-gray-100 rounded-lg text-xs p-2.5 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                        rows="2"
                        placeholder="تعليمات خاصة بالتسليم أو الطلب..."
                        value={data.notes}
                        onChange={e => setData('notes', e.target.value)}
                    ></textarea>
                </div>

                <div className="flex justify-between items-center px-2">
                    <span className="text-gray-500 font-medium">الإجمالي الكلي:</span>
                    <span className="text-xl font-black text-blue-600">{total.toLocaleString()} ريال</span>
                </div>
                
                <form onSubmit={handleCheckout}>
                    <PrimaryButton className="w-full justify-center py-3" disabled={processing}>
                        تأكيد وإرسال الطلب
                    </PrimaryButton>
                </form>
            </div>
        </div>
    );
}
