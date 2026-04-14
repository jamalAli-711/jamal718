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
