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

    useEffect(() => { setOrders(initialOrders); }, [initialOrders]);
    useEffect(() => { setStats(initialStats); }, [initialStats]);

    useEffect(() => {
        if (typeof window.Echo !== 'undefined') {
            window.Echo.channel('orders')
                .listen('.order.placed', (e) => {
                    setOrders(prev => ({ ...prev, data: [e.order, ...prev.data], total: prev.total + 1 }));
                    setStats(prev => ({ ...prev, total_pending: prev.total_pending + 1 }));
                    toast.success(`طلب جديد رقم ${e.order.reference_number} وصل الآن!`);
                    try { const audio = new Audio('/sounds/notification.mp3'); audio.play(); } catch (err) {}
                });
            return () => { window.Echo.leaveChannel('orders'); };
        }
    }, []);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const createForm = useForm({
        customer_id: '', currency_id: '', notes: '',
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

        if (['product_id', 'product_unit_id', 'branch_id'].includes(field)) {
            const product = products.find(p => p.id == row.product_id);
            const customer = customers.find(c => c.id == createForm.data.customer_id);
            if (product) {
                const branchPivot = product.branches?.find(b => b.id == row.branch_id);
                const rawStock = branchPivot ? Number(branchPivot.pivot.stock_quantity) : 0;
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
                row._max_stock = Math.floor(rawStock / convFactor);
            } else {
                row.unit_price = 0;
                row._max_stock = 0;
            }
        }
        createForm.setData('items', newItems);
    };

    const submitOrder = (e) => {
        e.preventDefault();
        createForm.post(route('orders.store'), { onSuccess: () => { setShowCreateModal(false); createForm.reset(); }, });
    };

    const orderTotal = createForm.data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    const statusForm = useForm({ status: '', admin_note: '' });

    const openStatusModal = (order) => {
        setSelectedOrder(order);
        statusForm.setData({ status: order.order_status, admin_note: order.admin_note || '' });
        setShowStatusModal(true);
    };

    const submitStatus = (e) => {
        e.preventDefault();
        statusForm.patch(route('orders.updateStatus', selectedOrder.id), { onSuccess: () => setShowStatusModal(false), });
    };

    const [showAllocateModal, setShowAllocateModal] = useState(false);
    const allocateForm = useForm({ allocations: [] });

    const openAllocateModal = (order) => {
        setSelectedOrder(order);
        const unallocatedItems = order.order_items.filter(i => i.branch_id === null);
        allocateForm.setData('allocations', unallocatedItems.map(item => ({
            original_item_id: item.id,
            product_name: item.product?.name,
            requested_qty: item.quantity,
            splits: [{ branch_id: branches[0]?.id || '', allocated_qty: item.quantity }]
        })));
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
        allocateForm.post(route('orders.allocate', selectedOrder.id), { onSuccess: () => setShowAllocateModal(false), });
    };

    const openDetails = (order) => { setSelectedOrder(order); setShowDetailsModal(true); };

    const deleteOrder = (order) => {
        if (confirm('هل أنت متأكد من حذف الطلب ' + order.reference_number + '؟')) {
            router.delete(route('orders.destroy', order.id));
        }
    };

    return (
        <AdminLayout user={auth.user} header="الطلبات">
            <Head title="إدارة الطلبات — VIP Ledger" />

            <div className="pb-24 animate-in fade-in duration-1000" dir="rtl">
                
                {/* VIP Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 p-10 bg-white/[0.01] rounded-[4rem] border border-white/5 shadow-3xl">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full text-amber-500 tracking-[0.4em] text-[10px] font-black uppercase">
                            سجل العمليات التجارية
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                        </div>
                        <h2 className="text-6xl font-black text-white tracking-tighter leading-none">سجل طلبات المبيعات</h2>
                        <p className="text-white/20 font-bold text-xl italic pr-6 border-r-4 border-amber-400/20">مركز السيطرة على التدفقات المالية والتوريد اللوجستي.</p>
                    </div>
                    <button onClick={() => setShowCreateModal(true)} className="group px-12 py-6 bg-amber-400 hover:bg-amber-500 text-black font-black rounded-[2rem] flex items-center gap-4 shadow-[0_20px_50px_-10px_rgba(251,191,36,0.3)] hover:scale-105 active:scale-95 transition-all">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        <span className="text-xs uppercase tracking-[0.2em]">إنشاء طلب جديد</span>
                    </button>
                </div>

                {/* VIP Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    <StatusStat label="قيد الانتظار" value={stats.total_pending} color="text-amber-500" bg="bg-amber-500/5" />
                    <StatusStat label="قيد المعالجة" value={stats.total_processing} color="text-blue-500" bg="bg-blue-500/5" />
                    <StatusStat label="قيد التوصيل" value={stats.total_delivery} color="text-purple-500" bg="bg-purple-500/5" />
                    <StatusStat label="تم التسليم" value={stats.delivered_today} color="text-emerald-500" bg="bg-emerald-500/5" />
                </div>

                {/* VIP Ledger Table */}
                <div className="bg-[#0c0c0e]/80 backdrop-blur-3xl rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-white/[0.01]">
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">رقم الطلب</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">التاريخ</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">بيانات العميل</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">عدد الأصناف</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">قيمة الطلب</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">حالة الطلب</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {orders.data.map((order) => {
                                    const hasUnallocated = order.order_items?.some(i => i.branch_id === null);
                                    return (
                                        <tr key={order.id} className={`group transition-all ${hasUnallocated ? 'bg-amber-400/[0.02]' : 'hover:bg-white/[0.01]'}`}>
                                            <td className="px-12 py-10">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-2xl font-black text-white tracking-tighter group-hover:text-amber-400 transition-colors">#{order.reference_number}</span>
                                                    {hasUnallocated && (
                                                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
                                                            بانتظار التخصيص ⚠️
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-12 py-10">
                                                <span className="text-sm font-black text-white/30 uppercase tracking-widest">{formatDate(order.created_at)}</span>
                                            </td>
                                            <td className="px-12 py-10">
                                                <div className="flex flex-col gap-1">
                                                    <h4 className="text-xl font-black text-white leading-none">{order.customer?.name}</h4>
                                                    <span className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest italic">{USER_TYPES[order.customer?.user_type]?.label}</span>
                                                </div>
                                            </td>
                                            <td className="px-12 py-10 text-center text-2xl font-black text-white/60 tracking-tighter">
                                                {order.order_items?.length || 0} <span className="text-[10px] opacity-30 tracking-widest ml-1 uppercase">صنف</span>
                                            </td>
                                            <td className="px-12 py-10">
                                                <div className="text-2xl font-black text-white tracking-tighter">
                                                    {formatCurrency(order.final_amount, '')}
                                                    <span className="text-xs text-white/20 ml-2 uppercase tracking-widest">{order.currency?.currency_code_ar}</span>
                                                </div>
                                            </td>
                                            <td className="px-12 py-10 text-center">
                                                <div className="transform scale-110">
                                                    <StatusBadge status={order.order_status} />
                                                </div>
                                            </td>
                                            <td className="px-12 py-10 text-center text-center">
                                                <div className="flex items-center justify-center gap-4">
                                                    {hasUnallocated ? (
                                                        <button onClick={() => openAllocateModal(order)} className="px-6 py-3 bg-amber-400/10 border border-amber-400/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-amber-400 hover:text-black transition-all shadow-xl">معالجة التخصيص</button>
                                                    ) : (
                                                        <OpButton onClick={() => openStatusModal(order)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m13 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} tooltip="Update Lifecycle" color="purple-500" />
                                                    )}
                                                    <OpButton onClick={() => openDetails(order)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} tooltip="View Details" color="blue-500" />
                                                    <OpButton onClick={() => deleteOrder(order)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} tooltip="Archive Record" color="rose-500" />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Elite Pagination */}
                    <div className="p-10 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">عرض {orders.data.length} من {orders.total} سجل</span>
                        <div className="flex gap-2">
                            {orders.links?.map((link, i) => (
                                link.url ? (
                                    <button 
                                        key={i} 
                                        onClick={() => router.get(link.url)} 
                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${link.active ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`} 
                                        dangerouslySetInnerHTML={{ __html: link.label }} 
                                    />
                                ) : (
                                    <span key={i} className="px-5 py-2.5 rounded-xl text-[10px] font-black text-white/10 uppercase tracking-widest bg-white/[0.02]" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modals Section */}
                
                {/* 1. Create Order Modal */}
                <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} title="إنشاء طلب مبيعات جديد" maxWidth="xl">
                    <form onSubmit={submitOrder}>
                        <Modal.Body className="space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">العميل المستهدف</label>
                                    <select 
                                        value={createForm.data.customer_id}
                                        onChange={e => createForm.setData('customer_id', e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="">اختر العميل...</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({USER_TYPES[c.user_type]?.label})</option>)}
                                    </select>
                                    {createForm.errors.customer_id && <p className="text-rose-500 text-[10px] font-bold">{createForm.errors.customer_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">عملة الفوترة</label>
                                    <select 
                                        value={createForm.data.currency_id}
                                        onChange={e => createForm.setData('currency_id', e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="">عملة النظام الافتراضية</option>
                                        {currencies.map(c => <option key={c.id} value={c.id}>{c.currency_name} ({c.currency_code_en})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black text-white/40 uppercase tracking-widest px-2">
                                    <span>بنود الطلب</span>
                                    <button type="button" onClick={addItem} className="text-amber-400 hover:text-amber-300 transition-colors">+ إضافة صنف</button>
                                </div>
                                <div className="space-y-4">
                                    {createForm.data.items.map((item, index) => (
                                        <div key={index} className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl relative group">
                                            <button type="button" onClick={() => removeItem(index)} className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                            <div className="grid grid-cols-12 gap-4">
                                                <div className="col-span-4 space-y-2">
                                                    <select 
                                                        value={item.product_id}
                                                        onChange={e => updateItem(index, 'product_id', e.target.value)}
                                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-amber-500/30 transition-all"
                                                    >
                                                        <option value="">اختر المنتج...</option>
                                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-span-3 space-y-2">
                                                    <select 
                                                        value={item.branch_id}
                                                        onChange={e => updateItem(index, 'branch_id', e.target.value)}
                                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white"
                                                    >
                                                        <option value="">تخصيص المخزن...</option>
                                                        {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-span-3 space-y-2">
                                                    <select 
                                                        value={item.product_unit_id}
                                                        onChange={e => updateItem(index, 'product_unit_id', e.target.value)}
                                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white"
                                                    >
                                                        <option value="">الوحدة...</option>
                                                        {products.find(p => p.id == item.product_id)?.units?.map(u => (
                                                            <option key={u.id} value={u.id}>{u.unit?.unit_name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-2 space-y-2">
                                                    <input 
                                                        type="number" 
                                                        value={item.quantity}
                                                        onChange={e => updateItem(index, 'quantity', e.target.value)}
                                                        min="1"
                                                        max={item._max_stock}
                                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white text-center"
                                                        placeholder="qty"
                                                    />
                                                </div>
                                            </div>
                                            {item._max_stock > 0 && (
                                                <div className="mt-3 flex justify-between items-center px-2">
                                                    <span className="text-[9px] font-bold text-emerald-400">سعر الوحدة: {formatCurrency(item.unit_price, '')} </span>
                                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">المتوفر: {item._max_stock} وحدة</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex justify-between items-end bg-black/40 p-8 rounded-3xl border border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">إجمالي الطلب التقديري</p>
                                        <p className="text-3xl font-black text-amber-400 tracking-tighter">{formatCurrency(orderTotal, '')} <span className="text-xs uppercase tracking-widest">ريال</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">عدد العناصر</p>
                                        <p className="text-xl font-black text-white">{createForm.data.items.length}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">ملاحظات إضافية</label>
                                    <textarea 
                                        value={createForm.data.notes}
                                        onChange={e => createForm.setData('notes', e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-amber-400 transition-all font-bold resize-none h-24"
                                        placeholder="أي تعليمات خاصة بالطلب أو التوصيل..."
                                    />
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" onClick={() => setShowCreateModal(false)} className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all">إلغاء</button>
                            <button type="submit" disabled={createForm.processing} className="px-12 py-4 bg-amber-400 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-amber-400/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                                {createForm.processing ? 'جاري التنفيذ...' : 'اعتماد الطلب رسمياً'}
                            </button>
                        </Modal.Footer>
                    </form>
                </Modal>

                {/* 2. Status Update Modal */}
                <Modal show={showStatusModal} onClose={() => setShowStatusModal(false)} title="تحديث دورة حياة الطلب" maxWidth="md">
                    <form onSubmit={submitStatus}>
                        <Modal.Body className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">الحالة الجديدة</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(ORDER_STATUSES).map(([key, statusObj]) => (
                                        <button 
                                            type="button"
                                            key={key}
                                            onClick={() => statusForm.setData('status', key)}
                                            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${statusForm.data.status == key 
                                                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-500/20' 
                                                : 'bg-white/[0.03] border-white/10 text-white/30 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            {statusObj.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">ملاحظة المدير</label>
                                <textarea 
                                    value={statusForm.data.admin_note}
                                    onChange={e => statusForm.setData('admin_note', e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white h-32 resize-none"
                                    placeholder="اشرح سبب تغيير الحالة..."
                                />
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" onClick={() => setShowStatusModal(false)} className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest transition-all">إلغاء</button>
                            <button type="submit" disabled={statusForm.processing} className="px-10 py-4 bg-purple-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-purple-500/20 active:scale-95 transition-all">
                                {statusForm.processing ? 'جاري التحديث...' : 'تأكيد الحالة'}
                            </button>
                        </Modal.Footer>
                    </form>
                </Modal>

                {/* 3. Allocation Modal */}
                <Modal show={showAllocateModal} onClose={() => setShowAllocateModal(false)} title="تخصيص الموارد اللوجستية" maxWidth="2xl">
                    <form onSubmit={submitAllocation}>
                        <Modal.Body className="space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <p className="text-white/40 text-xs text-center border-b border-white/5 pb-4">يرجى تحديد الفروع المسؤولة عن توفير كل صنف من أصناف الطلب.</p>
                            {allocateForm.data.allocations.map((alloc, aIndex) => (
                                <div key={aIndex} className="space-y-4 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-lg font-black text-white tracking-tighter">{alloc.product_name} <span className="text-[10px] text-white/20 uppercase tracking-widest ml-2">[{alloc.requested_qty} مطلوبة]</span></h4>
                                        <button type="button" onClick={() => addSplit(aIndex)} className="text-[9px] font-black text-amber-500 uppercase tracking-widest hover:text-amber-400">+ تقسيم السحب</button>
                                    </div>
                                    <div className="space-y-3">
                                        {alloc.splits.map((split, sIndex) => (
                                            <div key={sIndex} className="flex gap-4 items-center">
                                                <select 
                                                    value={split.branch_id}
                                                    onChange={e => updateAllocationSplit(aIndex, sIndex, 'branch_id', e.target.value)}
                                                    className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white"
                                                >
                                                    {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                                </select>
                                                <input 
                                                    type="number" 
                                                    value={split.allocated_qty}
                                                    onChange={e => updateAllocationSplit(aIndex, sIndex, 'allocated_qty', e.target.value)}
                                                    className="w-24 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-center text-white"
                                                />
                                                <button type="button" onClick={() => removeSplit(aIndex, sIndex)} className="w-10 h-10 flex items-center justify-center text-rose-500/40 hover:text-rose-500 transition-all">×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" onClick={() => setShowAllocateModal(false)} className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">تجاهل</button>
                            <button type="submit" disabled={allocateForm.processing} className="px-10 py-4 bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all">
                                {allocateForm.processing ? 'جاري التخصيص...' : 'تأكيد التوزيع اللوجستي'}
                            </button>
                        </Modal.Footer>
                    </form>
                </Modal>

                {/* 4. Order Details Modal */}
                <Modal show={showDetailsModal} onClose={() => setShowDetailsModal(false)} title={`تفاصيل السجل التجاري: #${selectedOrder?.reference_number}`} maxWidth="xl">
                    <Modal.Body className="space-y-10 py-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block mb-2">بيانات العميل</span>
                                    <h4 className="text-3xl font-black text-white tracking-tighter">{selectedOrder?.customer?.name}</h4>
                                    <p className="text-xs font-bold text-amber-500/60 uppercase tracking-widest">{selectedOrder?.customer?.phone}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block mb-2">المخزن الرئيسي للفوترة</span>
                                    <h5 className="text-xl font-black text-white/80">{selectedOrder?.branch?.branch_name}</h5>
                                </div>
                            </div>
                            <div className="flex flex-col items-end justify-center bg-white/[0.02] border border-white/5 p-8 rounded-[3rem]">
                                <StatusBadge status={selectedOrder?.order_status} />
                                <div className="mt-6 text-right">
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block mb-1">إجمالي الفاتورة</span>
                                    <span className="text-4xl font-black text-white tracking-tighter">{formatCurrency(selectedOrder?.final_amount, '')}</span>
                                    <span className="text-xs font-black text-amber-500 ml-2 uppercase tracking-widest">{selectedOrder?.currency?.currency_code_en}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block px-4">بنود التوريد</span>
                            <div className="bg-black/40 rounded-[2.5rem] border border-white/5 overflow-hidden">
                                <table className="w-full text-right text-xs">
                                    <thead>
                                        <tr className="bg-white/5">
                                            <th className="px-6 py-4 font-black uppercase tracking-widest text-white/40">المنتج</th>
                                            <th className="px-6 py-4 font-black uppercase tracking-widest text-white/40 text-center">الكمية</th>
                                            <th className="px-6 py-4 font-black uppercase tracking-widest text-white/40">السعر</th>
                                            <th className="px-6 py-4 font-black uppercase tracking-widest text-white/40">المجموع</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {selectedOrder?.order_items?.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 font-black text-white">{item.product?.name}</td>
                                                <td className="px-6 py-4 font-black text-white/60 text-center">{item.quantity}</td>
                                                <td className="px-6 py-4 font-black text-white/60">{formatCurrency(item.unit_price, '')}</td>
                                                <td className="px-6 py-4 font-black text-amber-400">{formatCurrency(item.item_total, '')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {selectedOrder?.admin_note && (
                            <div className="space-y-2 p-6 bg-rose-500/[0.02] border border-rose-500/10 rounded-2xl">
                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block">ملاحظات إدارية</span>
                                <p className="text-xs font-bold text-white/60 leading-relaxed">{selectedOrder.admin_note}</p>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={() => setShowDetailsModal(false)} className="w-full py-5 bg-white/[0.03] hover:bg-white/[0.06] text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl transition-all">إغلاق السجل</button>
                    </Modal.Footer>
                </Modal>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            ` }} />
        </AdminLayout>
    );
}

function StatusStat({ label, value, color, bg }) {
    return (
        <div className={`p-8 rounded-[3rem] border border-white/5 ${bg} group transition-all duration-700 relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${color.replace('text', 'bg')} opacity-40`} />
            <div className="flex justify-between items-start mb-6">
                <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${color}`}>{label}</span>
                <div className={`w-2 h-2 rounded-full ${color.replace('text', 'bg')} animate-pulse`} />
            </div>
            <div className="text-5xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform origin-right">{value}</div>
        </div>
    );
}

function OpButton({ onClick, icon, tooltip, color }) {
    return (
        <button 
            onClick={onClick} 
            title={tooltip}
            className={`w-14 h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group`}
        >
            <div className={`text-white/20 group-hover:text-white transition-colors`}>{icon}</div>
        </button>
    );
}
