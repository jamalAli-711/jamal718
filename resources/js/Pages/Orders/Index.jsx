import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import StatusBadge from '@/Components/StatusBadge';
import { useToast } from '@/Components/Toast';
import { ORDER_STATUSES, USER_TYPES, USER_TYPE_VALUES, formatCurrency, formatDate } from '@/constants';

export default function OrdersIndex({ auth, orders: initialOrders, stats: initialStats, customers, products, branches, currencies }) {
    const toast = useToast();
    const { flash } = usePage().props;

    const [orders, setOrders] = useState(initialOrders);
    const [stats, setStats] = useState(initialStats);

    // Sync state with props when Inertia updates (e.g. pagination or manual refresh)
    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    useEffect(() => {
        setStats(initialStats);
    }, [initialStats]);

    // Real-time listener
    useEffect(() => {
        if (typeof window.Echo !== 'undefined') {
            window.Echo.channel('orders')
                .listen('.order.placed', (e) => {
                    console.log('New order received:', e.order);
                    
                    // Add new order to top of list if we're on page 1
                    setOrders(prev => ({
                        ...prev,
                        data: [e.order, ...prev.data],
                        total: prev.total + 1
                    }));

                    // Update stats (simple increment for pending)
                    setStats(prev => ({
                        ...prev,
                        total_pending: prev.total_pending + 1
                    }));

                    toast.success(`طلب جديد رقم ${e.order.reference_number} وصل الآن!`);
                    
                    // Optional: Play notification sound
                    try {
                        const audio = new Audio('/sounds/notification.mp3');
                        audio.play();
                    } catch (err) {
                        console.warn('Audio play failed:', err);
                    }
                });

            return () => {
                window.Echo.leaveChannel('orders');
            };
        }
    }, []);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Show flash messages as toast
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // --- Create Order Form ---
    const createForm = useForm({
        customer_id: '',
        currency_id: '',
        notes: '',
        items: [{ product_id: '', branch_id: branches[0]?.id || '', product_unit_id: '', quantity: 1, unit_price: 0, _max_stock: 0, notes: '' }],
    });

    const addItem = () => {
        const customer = customers.find(c => c.id == createForm.data.customer_id);
        createForm.setData('items', [...createForm.data.items, { product_id: '', branch_id: customer?.branch_id || branches[0]?.id || '', product_unit_id: '', quantity: 1, unit_price: 0, _max_stock: 0, notes: '' }]);
    };

    const removeItem = (index) => {
        if (createForm.data.items.length <= 1) return;
        createForm.setData('items', createForm.data.items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...createForm.data.items];
        newItems[index][field] = value;

        const row = newItems[index];

        // Trigger heavy recalculation if Product, Unit, or Branch changes
        if (['product_id', 'product_unit_id', 'branch_id'].includes(field)) {
            const product = products.find(p => p.id == row.product_id);
            const customer = customers.find(c => c.id == createForm.data.customer_id);
            
            if (product) {
                // 1. Calculate Available Stock for selected Branch
                const branchPivot = product.branches?.find(b => b.id == row.branch_id);
                const rawStock = branchPivot ? Number(branchPivot.pivot.stock_quantity) : 0;
                
                // 2. Determine Unit Pricing & Conversion
                let convFactor = 1;
                
                const defaultUnit = product.units?.find(u => u.is_default_sale) || product.units?.[0];
                let price = defaultUnit ? (defaultUnit.retail_price || defaultUnit.base_price) : 0;
                if (customer && customer.user_type === USER_TYPE_VALUES.Wholesaler && defaultUnit?.wholesale_price) price = defaultUnit.wholesale_price;
                if (customer && customer.user_type === USER_TYPE_VALUES.Retailer && defaultUnit?.retail_price) price = defaultUnit.retail_price;

                if (row.product_unit_id) {
                    const pUnit = product.units?.find(u => u.id == row.product_unit_id);
                    if (pUnit) {
                        convFactor = Number(pUnit.conversion_factor) || 1;
                        if (pUnit.base_price > 0) price = pUnit.base_price;
                        if (customer?.user_type === USER_TYPE_VALUES.Wholesaler && pUnit.wholesale_price > 0) price = pUnit.wholesale_price;
                        if (customer?.user_type === USER_TYPE_VALUES.Retailer && pUnit.retail_price > 0) price = pUnit.retail_price;
                    }
                }

                row.unit_price = price;
                row._max_stock = Math.floor(rawStock / convFactor); // max user can request in this chosen unit!
            } else {
                row.unit_price = 0;
                row._max_stock = 0;
            }
        }
        createForm.setData('items', newItems);
    };

    const submitOrder = (e) => {
        e.preventDefault();
        createForm.post(route('orders.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const orderTotal = createForm.data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    // --- Status Update ---
    const statusForm = useForm({ 
        status: '',
        admin_note: ''
    });

    const openStatusModal = (order) => {
        setSelectedOrder(order);
        statusForm.setData({
            status: order.order_status,
            admin_note: order.admin_note || ''
        });
        setShowStatusModal(true);
    };

    const submitStatus = (e) => {
        e.preventDefault();
        statusForm.patch(route('orders.updateStatus', selectedOrder.id), {
            onSuccess: () => setShowStatusModal(false),
        });
    };

    // --- Order Allocation logic (App Orders) ---
    const [showAllocateModal, setShowAllocateModal] = useState(false);
    const allocateForm = useForm({ allocations: [] });

    const openAllocateModal = (order) => {
        setSelectedOrder(order);
        
        // Find unallocated items
        const unallocatedItems = order.order_items.filter(i => i.branch_id === null);
        const initAlloc = unallocatedItems.map(item => ({
            original_item_id: item.id,
            product_name: item.product?.name,
            requested_qty: item.quantity,
            splits: [{ branch_id: branches[0]?.id || '', allocated_qty: item.quantity }] // default to full split in first branch
        }));
        
        allocateForm.setData('allocations', initAlloc);
        setShowAllocateModal(true);
    };

    const updateAllocationSplit = (allocIndex, splitIndex, field, value) => {
        const newAllocs = [...allocateForm.data.allocations];
        newAllocs[allocIndex].splits[splitIndex][field] = value;
        allocateForm.setData('allocations', newAllocs);
    };

    const addSplit = (allocIndex) => {
        const newAllocs = [...allocateForm.data.allocations];
        newAllocs[allocIndex].splits.push({ branch_id: branches[0]?.id || '', allocated_qty: 1 });
        allocateForm.setData('allocations', newAllocs);
    };

    const removeSplit = (allocIndex, splitIndex) => {
        const newAllocs = [...allocateForm.data.allocations];
        if (newAllocs[allocIndex].splits.length <= 1) return;
        newAllocs[allocIndex].splits = newAllocs[allocIndex].splits.filter((_, i) => i !== splitIndex);
        allocateForm.setData('allocations', newAllocs);
    };

    const submitAllocation = (e) => {
        e.preventDefault();
        allocateForm.post(route('orders.allocate', selectedOrder.id), {
            onSuccess: () => setShowAllocateModal(false),
        });
    };

    // --- View Details ---
    const openDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    // --- Delete ---
    const deleteOrder = (order) => {
        if (confirm('هل أنت متأكد من حذف الطلب ' + order.reference_number + '؟')) {
            router.delete(route('orders.destroy', order.id));
        }
    };

    return (
        <AdminLayout user={auth.user} header="الطلبات">
            <Head title="إدارة الطلبات" />

            {/* Page Header */}
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <span className="text-xs font-black text-[#0058be] uppercase tracking-[0.3em] mb-2 block">نظام إدارة العمليات</span>
                    <h2 className="font-black text-5xl text-[#031633] tracking-tighter">إدارة طلبات المبيعات</h2>
                    <p className="text-slate-400 font-black mt-2 text-lg">متابعة دقيقة وشاملة لكافة طلبات العملاء وحالات التوصيل</p>
                </div>
                <button className="btn-primary h-16 px-10 rounded-2xl flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1" onClick={() => setShowCreateModal(true)}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    <span className="font-black uppercase tracking-widest text-lg">إنشاء طلب جديد</span>
                </button>
            </div>


            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Pending', arabic: 'معلق', value: stats.total_pending, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Processing', arabic: 'قيد التجهيز', value: stats.total_processing, color: 'text-[#0058be]', bg: 'bg-blue-50' },
                    { label: 'Shipping', arabic: 'في الطريق', value: stats.total_delivery, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Delivered', arabic: 'تم التسليم', value: stats.delivered_today, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((s, i) => (
                    <div key={i} className="stat-card group hover:bg-[#031633] transition-all duration-500 flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${s.color} group-hover:text-white/50 transition-colors`}>{s.label}</span>
                            <div className={`p-2 rounded-lg ${s.bg} group-hover:bg-white/10 transition-colors`}>
                                <div className={`w-2 h-2 rounded-full ${s.color.replace('text', 'bg')} group-hover:bg-white animate-pulse`}></div>
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-[#031633] group-hover:text-white transition-colors">{s.value}</div>
                            <div className="text-[10px] font-bold text-gray-400 group-hover:text-white/40 uppercase tracking-widest">{s.arabic}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Orders Table */}
            <div className="card-editorial overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead className="bg-slate-100 border-b-2 border-slate-200">
                            <tr className="text-right">
                                <th className="px-8 py-6 text-base font-black text-[#031633] uppercase tracking-widest">رقم المرجع</th>
                                <th className="px-8 py-6 text-base font-black text-[#031633] uppercase tracking-widest">التاريخ</th>
                                <th className="px-8 py-6 text-base font-black text-[#031633] uppercase tracking-widest text-right">العميل والفرع</th>
                                <th className="px-8 py-6 text-base font-black text-[#031633] uppercase tracking-widest text-center">عدد الأصناف</th>
                                <th className="px-8 py-6 text-base font-black text-[#031633] uppercase tracking-widest text-right">المبلغ الإجمالي</th>
                                <th className="px-8 py-6 text-base font-black text-[#031633] uppercase tracking-widest text-center">حالة الطلب</th>
                                <th className="px-8 py-6 text-base font-black text-[#031633] uppercase tracking-widest text-center">العمليات</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.data.map((order) => {
                                const hasUnallocated = order.order_items?.some(i => i.branch_id === null);
                                return (
                                 <tr key={order.id} className={hasUnallocated ? "bg-amber-50/50 border-r-4 border-amber-400" : "hover:bg-slate-50 transition-colors"}>
                                    <td className="px-8 py-6 text-base font-black text-gray-900">
                                        {order.reference_number}
                                        {hasUnallocated && <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">صرف معلق ⚠️</div>}
                                    </td>
                                    <td className="px-8 py-6 text-base font-black text-slate-500">{formatDate(order.created_at)}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="font-black text-slate-900 text-lg">{order.customer?.name}</div>
                                        <div className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">{USER_TYPES[order.customer?.user_type]?.label}</div>
                                    </td>
                                    <td className="px-8 py-6 text-center text-lg font-black">{order.order_items?.length || 0}</td>
                                    <td className="px-8 py-6 font-black text-slate-900 text-lg">
                                        {formatCurrency(order.final_amount, order.currency?.currency_code_ar)}
                                    </td>
                                    <td className="px-8 py-6 text-center"><StatusBadge status={order.order_status} /></td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {hasUnallocated ? (
                                                <button onClick={() => openAllocateModal(order)} className="text-sm text-white bg-amber-600 hover:bg-amber-700 font-black px-4 py-2 rounded-xl shadow-lg transition-transform active:scale-95">تجزئة الصرف</button>
                                            ) : (
                                                <button onClick={() => openStatusModal(order)} className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all shadow-sm border-2 border-purple-100" title="تحديث الحالة">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m13 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                </button>
                                            )}
                                            <button onClick={() => openDetails(order)} className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm border-2 border-blue-100" title="عرض التفاصيل">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                            <button onClick={() => deleteOrder(order)} className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm border-2 border-rose-100" title="حذف">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                                );
                            })}
                            {orders.data.length === 0 && (
                                <tr><td colSpan="7" className="text-center py-10 text-gray-400">لا توجد طلبات</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                    <span>عرض {orders.data.length} من {orders.total}</span>
                    <div className="flex gap-1">
                        {orders.links?.map((link, i) => (
                            link.url ? (
                                <button key={i} onClick={() => router.get(link.url)} className={`px-3 py-1 rounded border text-xs ${link.active ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ) : (
                                <span key={i} className="px-3 py-1 rounded border border-gray-200 text-gray-300 text-xs" dangerouslySetInnerHTML={{ __html: link.label }} />
                            )
                        ))}
                    </div>
                </div>
            </div>

            {/* ========== CREATE ORDER MODAL ========== */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} title="إنشاء طلب بيع جديد" maxWidth="xl">
                <form onSubmit={submitOrder}>
                    <Modal.Body>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-2">اسم العميل *</label>
                                <select
                                    className="w-full border-2 border-slate-200 rounded-xl text-lg py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-black text-slate-900 shadow-sm appearance-none bg-white"
                                    value={createForm.data.customer_id}
                                    onChange={e => createForm.setData('customer_id', e.target.value)}
                                    required
                                >
                                    <option value="">اختر العميل المستلم...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} — {USER_TYPES[c.user_type]?.label}</option>
                                    ))}
                                </select>
                                {createForm.errors.customer_id && <p className="text-sm font-black text-rose-500 mt-1 uppercase">{createForm.errors.customer_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-2">عملة الطلب (اختياري)</label>
                                <select
                                    className="w-full border-2 border-slate-200 rounded-xl text-lg py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-black text-slate-900 shadow-sm appearance-none bg-white"
                                    value={createForm.data.currency_id}
                                    onChange={e => createForm.setData('currency_id', e.target.value)}
                                >
                                    <option value="">استخدام العملة الافتراضية</option>
                                    {currencies.map(c => (
                                        <option key={c.id} value={c.id}>{c.currency_name} ({c.currency_code_en})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-2">ملاحظات إضافية على الفاتورة</label>
                            <textarea
                                className="w-full border-2 border-slate-200 rounded-xl text-lg py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-black text-slate-900 shadow-sm"
                                value={createForm.data.notes}
                                onChange={e => createForm.setData('notes', e.target.value)}
                                rows="2"
                                placeholder="اكتب أي تعليمات خاصة بالتوصيل أو التغليف هنا..."
                            ></textarea>
                        </div>


                        {/* Items */}
                        <div className="border-2 border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                            <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b-2 border-slate-200">
                                <span className="text-sm font-black text-slate-500 uppercase tracking-widest">أصناف الفاتورة (السلة)</span>
                                <button type="button" onClick={addItem} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#e31e24] transition-colors">إضافة صنف +</button>
                            </div>
                            <div className="divide-y-2 divide-slate-100">
                                {createForm.data.items.map((item, idx) => (
                                    <div key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <div className="p-6 grid grid-cols-12 gap-4 items-end bg-white">
                                        <div className="col-span-3">
                                            <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">اختر الصنف</label>
                                            <select className="w-full border-2 border-slate-100 rounded-2xl text-base py-3 px-3 font-black text-slate-900 focus:border-blue-500 transition-all bg-slate-50" value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)} required>
                                                <option value="">اسم المنتج...</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">الفرع</label>
                                            <select className="w-full border-2 border-slate-100 rounded-2xl text-base py-3 px-3 font-black text-slate-900 focus:border-blue-500 transition-all bg-slate-50 text-xs" value={item.branch_id} onChange={e => updateItem(idx, 'branch_id', e.target.value)} required>
                                                <option value="">اختر...</option>
                                                {item.product_id ? (
                                                    products.find(p => p.id == item.product_id)?.branches?.map(b => (
                                                        <option key={b.id} value={b.id}>{b.branch_name} ({b.pivot?.stock_quantity || 0})</option>
                                                    ))
                                                ) : (
                                                    branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)
                                                )}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">الوحدة</label>
                                            <select className="w-full border-2 border-slate-100 rounded-2xl text-base py-3 px-3 font-black text-slate-900 focus:border-blue-500 transition-all bg-slate-50" value={item.product_unit_id} onChange={e => updateItem(idx, 'product_unit_id', e.target.value)}>
                                                <option value="">الأساسية</option>
                                                {item.product_id && products.find(p => p.id == item.product_id)?.units?.sort((a,b) => (a.branch_id == item.branch_id ? -1 : 1)).map(u => (
                                                    <option key={u.id} value={u.id}>{u.unit?.unit_name || 'وحدة'}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex justify-between items-end mb-2">
                                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">الكمية</label>
                                                {item.product_id && <span className="text-[10px] text-emerald-600 font-extrabold">المتاح: {item._max_stock}</span>}
                                            </div>
                                            <input type="number" min="1" max={item._max_stock || 9999} className="w-full border-2 border-slate-100 rounded-2xl text-base py-3 px-3 font-black text-slate-900 text-center focus:border-blue-500 transition-all bg-slate-50" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} required />
                                            {item.quantity > item._max_stock && <p className="text-[10px] font-black text-rose-500 absolute mt-1">تجاوز المتاح!</p>}
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest text-center">الإجمالي</label>
                                            <div className="text-base font-black text-slate-900 bg-slate-100 rounded-2xl px-3 py-3 text-center border-2 border-slate-200">
                                                {formatCurrency(item.quantity * item.unit_price)}
                                            </div>
                                        </div>
                                        <div className="col-span-1 text-center pb-2">
                                            {createForm.data.items.length > 1 && (
                                                <button type="button" onClick={() => removeItem(idx)} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div key={`notes-${idx}`} className="px-6 pb-4 pt-1 bg-white border-b-2 border-slate-50">
                                        <input type="text" className="w-full border-0 bg-slate-50/50 rounded-xl text-xs py-2 px-4 italic font-bold text-slate-400 focus:ring-0 placeholder:text-slate-200" value={item.notes} onChange={e => updateItem(idx, 'notes', e.target.value)} placeholder="إضافة ملاحظة لهذا الصنف (اختياري)..." />
                                    </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-slate-900 px-8 py-6 flex justify-between items-center text-white">
                                <span className="text-lg font-black uppercase tracking-widest text-white/50">إجمالي قيمة الطلب:</span>
                                <span className="text-3xl font-black text-white">{formatCurrency(orderTotal)}</span>
                            </div>
                        </div>

                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">إلغاء</button>
                        <button type="submit" disabled={createForm.processing} className="btn-primary">
                            {createForm.processing ? 'جاري الحفظ...' : 'حفظ الطلب'}
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* ========== ORDER DETAILS MODAL ========== */}
            <Modal show={showDetailsModal} onClose={() => setShowDetailsModal(false)} title={`تفاصيل الطلب — ${selectedOrder?.reference_number || ''}`} maxWidth="xl">
                {selectedOrder && (
                    <Modal.Body>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
                            <div><span className="text-gray-500 block text-xs">العميل</span><span className="font-medium">{selectedOrder.customer?.name}</span></div>
                            <div><span className="text-gray-500 block text-xs">نوع العميل</span><span className="font-medium">{USER_TYPES[selectedOrder.customer?.user_type]?.label}</span></div>
                            <div><span className="text-gray-500 block text-xs">التاريخ</span><span className="font-medium">{formatDate(selectedOrder.created_at)}</span></div>
                            <div><span className="text-gray-500 block text-xs">الحالة</span><StatusBadge status={selectedOrder.order_status} /></div>
                        </div>

                        {selectedOrder.notes && (
                            <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
                                <span className="text-blue-800 font-bold text-xs block mb-1">ملاحظات الطلب:</span>
                                <p className="text-sm text-blue-900 leading-relaxed">{selectedOrder.notes}</p>
                            </div>
                        )}

                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="data-table mb-0">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th>#</th>
                                        <th>الصنف</th>
                                        <th>الوحدة</th>
                                        <th>الكمية</th>
                                        <th>فرع الصرف</th>
                                        <th>ملاحظة</th>
                                        <th>سعر الوحدة</th>
                                        <th>الإجمالي المتوقع</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.order_items?.map((item, i) => (
                                        <tr key={item.id} className={!item.branch_id ? "bg-amber-50" : ""}>
                                            <td className="text-center">{i + 1}</td>
                                            <td className="font-medium">{item.product?.name}</td>
                                            <td>{item.product_unit?.unit?.unit_name || '—'}</td>
                                            <td className="font-bold text-center">{item.quantity}</td>
                                            <td>
                                                {item.branch_id ? (
                                                    <span className="text-[10px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded border border-green-200">{branches.find(b=>b.id == item.branch_id)?.branch_name || 'مخصص'}</span>
                                                ) : (
                                                    <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-200">غير مخصص ⚠️</span>
                                                )}
                                            </td>
                                            <td className="text-[11px] text-gray-500 italic max-w-[140px] truncate" title={item.notes}>{item.notes || '—'}</td>
                                            <td className="text-right">
                                                {item.currency_id !== selectedOrder.currency_id ? (
                                                    <div className="flex flex-col">
                                                        <div className="text-xs text-gray-400 font-bold mb-0.5">سعر الصنف: {formatCurrency(item.unit_price, item.currency?.currency_code_ar)}</div>
                                                        <div className="font-black text-slate-900 border-t border-gray-100 pt-0.5">
                                                            <span className="text-[10px] bg-slate-100 px-1 rounded mr-1">النظام</span>
                                                            {formatCurrency(item.item_total / (item.quantity || 1), selectedOrder.currency?.currency_code_ar)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="font-bold text-slate-900">{formatCurrency(item.unit_price, item.currency?.currency_code_ar)}</div>
                                                )}
                                            </td>
                                            <td className="text-right">
                                                {item.currency_id !== selectedOrder.currency_id ? (
                                                    <div className="flex flex-col">
                                                        <div className="text-[10px] text-gray-400 font-bold mb-0.5">الأصل: {formatCurrency(item.unit_price * item.quantity, item.currency?.currency_code_ar)}</div>
                                                        <div className="font-black text-blue-700 text-lg border-t border-blue-50 pt-1">
                                                            <span className="text-[10px] bg-blue-50 px-1 rounded mr-1">النظام</span>
                                                            {formatCurrency(item.item_total, selectedOrder.currency?.currency_code_ar)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="font-bold text-blue-700">{formatCurrency(item.item_total, selectedOrder.currency?.currency_code_ar)}</div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 border-t-2 border-gray-100">
                                        <td colSpan="7" className="text-left font-bold text-gray-700 px-4 py-3">الإجمالي الصافي</td>
                                        <td className="font-bold text-blue-700 text-lg px-4 py-3">{formatCurrency(selectedOrder.final_amount, selectedOrder.currency?.currency_code_ar)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </Modal.Body>
                )}
                <Modal.Footer>
                    <div className="flex justify-between w-full">
                        <div className="flex gap-2">
                             {selectedOrder?.order_status == 1 && selectedOrder?.order_items?.some(i => i.branch_id === null) && (
                                <button onClick={() => { setShowDetailsModal(false); openAllocateModal(selectedOrder); }} className="btn-success text-xs">تخصيص الصرف الآن</button>
                             )}
                        </div>
                        <button type="button" onClick={() => setShowDetailsModal(false)} className="btn-secondary">إإغلاق</button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* ========== ALLOCATE ORDER MODAL ========== */}
            <Modal show={showAllocateModal} onClose={() => setShowAllocateModal(false)} title="تخصيص الفروع للطلب المستلم" maxWidth="2xl">
                {selectedOrder && (
                    <form onSubmit={submitAllocation}>
                        <Modal.Body>
                            <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 mb-6 flex items-start gap-3">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <div>
                                    <p className="font-bold text-sm">تخصيص مصادر التوريد</p>
                                    <p className="text-xs mt-1 leading-relaxed text-amber-700">يجب تحديد الفرع الذي سيتم خصم الكمية منه لكل صنف. يمكنك تجزئة الصنف الواحد على أكثر من فرع.</p>
                                </div>
                            </div>
                            
                            {allocateForm.errors.allocation && <div className="mb-4 text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-200">{allocateForm.errors.allocation}</div>}

                            <div className="space-y-4">
                                {allocateForm.data.allocations.map((alloc, aIndex) => {
                                    const totalAllocated = alloc.splits.reduce((sum, s) => sum + parseInt(s.allocated_qty || 0), 0);
                                    const progress = Math.min((totalAllocated / alloc.requested_qty) * 100, 100);
                                    
                                    return (
                                    <div key={aIndex} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                                        <div className="bg-gray-50 flex justify-between items-center px-4 py-2.5 border-b border-gray-200">
                                            <div>
                                                <span className="font-bold text-gray-800 text-sm">{alloc.product_name}</span>
                                                <div className="text-[10px] text-gray-500 font-medium">المطلوب الكلي: {alloc.requested_qty}</div>
                                            </div>
                                            <div className="text-left w-24">
                                                <div className="text-[9px] font-bold mb-1 flex justify-between">
                                                    <span>مخصص:</span>
                                                    <span className={totalAllocated === Number(alloc.requested_qty) ? 'text-green-600' : 'text-amber-600'}>{totalAllocated} / {alloc.requested_qty}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1">
                                                    <div className={`h-1 rounded-full ${totalAllocated === Number(alloc.requested_qty) ? 'bg-green-500' : 'bg-amber-500'}`} style={{width: `${progress}%`}}></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-white space-y-2">
                                            {alloc.splits.map((split, sIndex) => (
                                                <div key={sIndex} className="flex gap-2 items-center">
                                                    <select className="flex-1 border border-gray-300 rounded text-[11px] py-1.5 px-2 focus:ring-blue-500" value={split.branch_id} onChange={e => updateAllocationSplit(aIndex, sIndex, 'branch_id', e.target.value)} required>
                                                        <option value="">اختر الفرع...</option>
                                                        {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                                    </select>
                                                    <input type="number" min="1" className="w-20 text-center border border-gray-300 rounded text-[11px] py-1.5 px-1" value={split.allocated_qty} onChange={e => updateAllocationSplit(aIndex, sIndex, 'allocated_qty', e.target.value)} required />
                                                    <button type="button" onClick={() => removeSplit(aIndex, sIndex)} className="text-gray-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addSplit(aIndex)} className="text-[10px] font-bold text-blue-600 hover:underline">+ إضافة تقسيم</button>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" onClick={() => setShowAllocateModal(false)} className="btn-secondary">إلغاء</button>
                            <button type="submit" disabled={allocateForm.processing} className="btn-primary">حفظ وتحديث الفاتورة</button>
                        </Modal.Footer>
                    </form>
                )}
            </Modal>

            {/* ========== STATUS UPDATE MODAL ========== */}
            <Modal show={showStatusModal} onClose={() => setShowStatusModal(false)} title="تحديث حالة الطلب" maxWidth="sm">
                {selectedOrder && (
                    <form onSubmit={submitStatus}>
                        <Modal.Body>
                            <p className="text-sm text-gray-600 mb-4">اختر الحالة الجديدة للطلب <strong>{selectedOrder.reference_number}</strong></p>
                            <div className="space-y-2">
                                {Object.entries(ORDER_STATUSES).map(([key, info]) => {
                                    const numKey = Number(key);
                                    return (
                                    <label key={key} className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${statusForm.data.status == numKey ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-100 hover:bg-gray-50'}`}>
                                        <input type="radio" name="status" value={numKey} checked={statusForm.data.status == numKey} onChange={() => statusForm.setData('status', numKey)} className="text-primary focus:ring-primary h-4 w-4" />
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold ${statusForm.data.status == numKey ? 'text-primary' : 'text-gray-700'}`}>{info.label}</span>
                                            <span className="text-[10px] text-gray-400 capitalize">{info.key.replace(/_/g, ' ')}</span>
                                        </div>
                                    </label>
                                    );
                                })}
                            </div>

                            {statusForm.data.status == 5 && (
                                <div className="mt-5 p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-rose-800 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        سبب رفض الطلب (اختياري)
                                    </label>
                                    <textarea
                                        className="w-full border-rose-200 rounded-lg text-sm p-3 focus:ring-rose-500 focus:border-rose-500 bg-white placeholder:text-rose-300"
                                        rows="3"
                                        placeholder="الطلب لم يتم قبول الطلب بعد الرجاء التواصل مع ادراة المبيعات"
                                        value={statusForm.data.admin_note}
                                        onChange={e => statusForm.setData('admin_note', e.target.value)}
                                    ></textarea>
                                    <p className="text-[10px] text-rose-600 italic">سيتم إرسال هذا السبب فوراً إلى العميل كإشعار.</p>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" onClick={() => setShowStatusModal(false)} className="btn-secondary">إلغاء</button>
                            <button type="submit" disabled={statusForm.processing} className="btn-primary">
                                {statusForm.processing ? 'جاري الحفظ...' : 'تحديث الحالة'}
                            </button>
                        </Modal.Footer>
                    </form>
                )}
            </Modal>
        </AdminLayout>
    );
}
