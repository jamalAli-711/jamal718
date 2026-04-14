import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { useToast } from '@/Components/Toast';
import { formatCurrency, formatDate } from '@/constants';

export default function OffersIndex({ auth, offers, products, branches, units }) {
    const toast = useToast();
    const { flash } = usePage().props;

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const initialValues = {
        title: '', is_active: true, image_path: '', offer_type: 'Percentage',
        target_product_id: '', min_purchase_qty: 1, min_qty_to_achieve: 1,
        quantity_limit: null, discount_value: '', bonus_qty: '',
        bonus_product_id: '', bonus_unit_id: '', is_cumulative: false,
        start_date: '', end_date: '', branch_id: '', user_type: 'End_User', apply_coupon: '',
    };

    const addForm = useForm(initialValues);
    const editForm = useForm(initialValues);

    const submitAdd = (e) => {
        e.preventDefault();
        addForm.post(route('offers.store'), { onSuccess: () => { setShowAddModal(false); addForm.reset(); }, });
    };

    const openEdit = (offer) => {
        setEditingOffer(offer);
        editForm.setData({
            title: offer.title, is_active: !!offer.is_active, image_path: offer.image_path || '',
            offer_type: offer.offer_type, target_product_id: offer.target_product_id,
            min_purchase_qty: offer.min_purchase_qty, min_qty_to_achieve: offer.min_qty_to_achieve,
            quantity_limit: offer.quantity_limit, discount_value: offer.discount_value || '',
            bonus_qty: offer.bonus_qty || '', bonus_product_id: offer.bonus_product_id || '',
            bonus_unit_id: offer.bonus_unit_id || '', is_cumulative: !!offer.is_cumulative,
            start_date: offer.start_date ? offer.start_date.split('T')[0] : '',
            end_date: offer.end_date ? offer.end_date.split('T')[0] : '',
            branch_id: offer.branch_id, user_type: offer.user_type, apply_coupon: offer.apply_coupon || '',
        });
        setShowEditModal(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('offers.update', editingOffer.id), { onSuccess: () => setShowEditModal(false), });
    };

    const deleteOffer = (offer) => {
        if (confirm(`هل أنت متأكد من حذف العرض "${offer.title}"؟`)) {
            router.delete(route('offers.destroy', offer.id));
        }
    };

    const toggleStatus = (offer) => { router.patch(route('offers.toggle', offer.id)); };

    const stats = useMemo(() => ({
        total: offers.length,
        active: offers.filter(o => o.is_active).length,
        expired: offers.filter(o => o.end_date && new Date(o.end_date) < new Date()).length
    }), [offers]);

    return (
        <AdminLayout user={auth.user} header="خزنة الحملات">
            <Head title="محرك العروض — لوحة المدير" />

            <div className="pb-32 animate-in fade-in duration-1000" dir="rtl">
                
                {/* VIP Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 p-10 bg-white/[0.01] rounded-[4rem] border border-white/5 shadow-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-emerald-500 tracking-[0.4em] text-[10px] font-black uppercase">
                            محرك النمو التسويقي
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        </div>
                        <h2 className="text-6xl font-black text-white tracking-tighter leading-none">إدارة الحملات الترويجية</h2>
                        <p className="text-white/20 font-bold text-xl italic pr-6 border-r-4 border-emerald-400/20">هندسة الحوافز البيعية وتصميم استراتيجيات الخصم للمنظومة.</p>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="group px-12 py-6 bg-gradient-to-r from-emerald-400 to-emerald-600 text-black font-black rounded-[2rem] flex items-center gap-4 shadow-2xl shadow-emerald-400/20 hover:scale-105 active:scale-95 transition-all relative z-10">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-xs uppercase tracking-[0.2em]">إطلاق حملة جديدة</span>
                    </button>
                </div>

                {/* VIP Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <StatCard label="إجمالي الحملات" value={stats.total} unit="عرضاً" color="text-white" />
                    <StatCard label="الحملات النشطة" value={stats.active} unit="نشط" color="text-emerald-400" />
                    <StatCard label="العروض المنتهية" value={stats.expired} unit="أرشيف" color="text-rose-500" />
                </div>

                {/* VIP Ledger Table */}
                <div className="bg-[#0c0c0e]/80 backdrop-blur-3xl rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-white/[0.01]">
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">الحملة</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">نوع العرض</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">الصنف / الفرع</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">حالة العرض</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {offers.map((offer) => (
                                    <tr key={offer.id} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="px-12 py-10">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-2xl font-black text-white tracking-tighter group-hover:text-emerald-400 transition-colors uppercase leading-none">{offer.title}</span>
                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                                                    دورة الحياة: {formatDate(offer.start_date)} — {offer.end_date ? formatDate(offer.end_date) : 'دائم'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 ${
                                                offer.offer_type === 'Percentage' ? 'bg-blue-400/10 text-blue-400' :
                                                offer.offer_type === 'Fixed_Amount' ? 'bg-emerald-400/10 text-emerald-400' :
                                                'bg-purple-400/10 text-purple-400'
                                            }`}>
                                                {offer.offer_type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-lg font-black text-white leading-none tracking-tight">{offer.target_product?.name}</span>
                                                <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">{offer.branch?.branch_name} Center</span>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex justify-center">
                                                <button 
                                                    onClick={() => toggleStatus(offer)}
                                                    className={`relative w-16 h-8 rounded-full transition-all duration-500 p-1 ${offer.is_active ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5 border border-white/10'}`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full transition-all duration-500 ${offer.is_active ? 'translate-x-0 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : '-translate-x-8 bg-white/20'}`} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex items-center justify-center gap-4">
                                                <OpButton onClick={() => openEdit(offer)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} color="blue-400" />
                                                <OpButton onClick={() => deleteOffer(offer)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} color="rose-500" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* VIP Offer Modal */}
            <Modal show={showAddModal || showEditModal} onClose={() => { setShowAddModal(false); setShowEditModal(false); }} title={showAddModal ? "استوديو تصميم الحملة" : "تعديل العرض"} maxWidth="4xl">
                 <div className="bg-[#0c0c0e] text-white overflow-hidden rounded-[3rem] border border-white/5">
                    <form onSubmit={showAddModal ? submitAdd : submitEdit} className="p-12" dir="rtl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.4em] border-b border-white/5 pb-4">المواصفات الأساسية</h3>
                                <Field label="عنوان الحملة *" value={(showAddModal ? addForm : editForm).data.title} onChange={v => (showAddModal ? addForm : editForm).setData('title', v)} />
                                <div className="grid grid-cols-2 gap-6">
                                    <Select label="نموذج الخصم *" value={(showAddModal ? addForm : editForm).data.offer_type} onChange={v => (showAddModal ? addForm : editForm).setData('offer_type', v)} options={[{v:'Percentage',l:'نسبة مئوية (%)'},{v:'Fixed_Amount',l:'مبلغ ثابت'},{v:'Free_Unit',l:'هدايا مجانية'}]} />
                                    <Select label="الجمهور المستهدف *" value={(showAddModal ? addForm : editForm).data.user_type} onChange={v => (showAddModal ? addForm : editForm).setData('user_type', v)} options={[{v:'Wholesaler',l:'تجار جملة'},{v:'Retailer',l:'تجار تجزئة'},{v:'Distributor',l:'موزعين'},{v:'End_User',l:'عميل نهائي'}]} />
                                </div>
                                <Select label="الصنف المستهدف *" value={(showAddModal ? addForm : editForm).data.target_product_id} onChange={v => (showAddModal ? addForm : editForm).setData('target_product_id', v)} options={products.map(p => ({v:p.id,l:p.name}))} />
                                <div className="grid grid-cols-2 gap-6">
                                    <Select label="مركز التفعيل *" value={(showAddModal ? addForm : editForm).data.branch_id} onChange={v => (showAddModal ? addForm : editForm).setData('branch_id', v)} options={branches.map(b => ({v:b.id,l:b.branch_name}))} />
                                    <Field label="كود الكوبون" value={(showAddModal ? addForm : editForm).data.apply_coupon} onChange={v => (showAddModal ? addForm : editForm).setData('apply_coupon', v)} placeholder="SAVE20" />
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.4em] border-b border-white/5 pb-4">منطق الحوافز</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <Field label="الحد الأدنى (كمية)" type="number" value={(showAddModal ? addForm : editForm).data.min_purchase_qty} onChange={v => (showAddModal ? addForm : editForm).setData('min_purchase_qty', v)} />
                                    <Field label="كمية التفعيل" type="number" value={(showAddModal ? addForm : editForm).data.min_qty_to_achieve} onChange={v => (showAddModal ? addForm : editForm).setData('min_qty_to_achieve', v)} />
                                </div>

                                {(showAddModal ? addForm : editForm).data.offer_type !== 'Free_Unit' ? (
                                    <Field label="قيمة الخصم" type="number" step="0.0001" value={(showAddModal ? addForm : editForm).data.discount_value} onChange={v => (showAddModal ? addForm : editForm).setData('discount_value', v)} className="text-4xl text-emerald-400" />
                                ) : (
                                    <div className="space-y-6 bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5">
                                        <div className="grid grid-cols-2 gap-6">
                                            <Select label="الصنف المكافئ" value={(showAddModal ? addForm : editForm).data.bonus_product_id} onChange={v => (showAddModal ? addForm : editForm).setData('bonus_product_id', v)} options={[{v:'',l:'نفس الصنف'},...products.map(p => ({v:p.id,l:p.name}))]} />
                                            <Field label="كمية المكافأة" type="number" value={(showAddModal ? addForm : editForm).data.bonus_qty} onChange={v => (showAddModal ? addForm : editForm).setData('bonus_qty', v)} />
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex-1"><Select label="Bonus Unit" value={(showAddModal ? addForm : editForm).data.bonus_unit_id} onChange={v => (showAddModal ? addForm : editForm).setData('bonus_unit_id', v)} options={units.map(u => ({v:u.id,l:u.unit_name}))} /></div>
                                            <label className="flex items-center gap-4 cursor-pointer pt-6">
                                                <input type="checkbox" className="w-6 h-6 rounded bg-white/5 border-white/10 text-emerald-500" checked={(showAddModal ? addForm : editForm).data.is_cumulative} onChange={e => (showAddModal ? addForm : editForm).setData('is_cumulative', e.target.checked)} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">تراكمي</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <Field label="تاريخ البدء" type="date" value={(showAddModal ? addForm : editForm).data.start_date} onChange={v => (showAddModal ? addForm : editForm).setData('start_date', v)} />
                                    <Field label="تاريخ الانتهاء" type="date" value={(showAddModal ? addForm : editForm).data.end_date} onChange={v => (showAddModal ? addForm : editForm).setData('end_date', v)} />
                                </div>
                                <Field label="الحد الأقصى للحملة (كمية)" type="number" value={(showAddModal ? addForm : editForm).data.quantity_limit} onChange={v => (showAddModal ? addForm : editForm).setData('quantity_limit', v)} placeholder="الحد الأقصى" />
                            </div>
                        </div>

                        <div className="flex gap-6 mt-16 pt-12 border-t border-white/5">
                            <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="flex-1 py-7 rounded-[2rem] bg-white/5 text-white/40 font-black uppercase text-xs tracking-[0.4em] hover:bg-white/10 transition-all leading-none">إلغاء</button>
                            <button type="submit" disabled={(showAddModal ? addForm : editForm).processing} className="flex-[2] py-7 rounded-[2rem] bg-emerald-500 text-black font-black uppercase text-xs tracking-[0.4em] hover:bg-emerald-400 hover:scale-[1.02] shadow-2xl shadow-emerald-500/20 disabled:opacity-50 transition-all leading-none">
                                {(showAddModal ? addForm : editForm).processing ? 'جاري الحفظ...' : 'تفعيل الحملة'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            ` }} />
        </AdminLayout>
    );
}

function StatCard({ label, value, unit, color }) {
    return (
        <div className="bg-[#111114] p-12 rounded-[4rem] border border-white/5 shadow-2xl group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1 h-full bg-white/5 group-hover:bg-emerald-400 transition-all duration-700" />
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block mb-6">{label}</span>
            <div className="flex items-baseline gap-4">
                <span className={`text-6xl font-black ${color} tracking-tighter leading-none`}>{value}</span>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{unit}</span>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, type = "text", className = "", step, ...props }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block pr-4">{label}</label>
            <input 
                type={type} step={step} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className={`w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-8 text-xl font-black text-white focus:outline-none focus:border-white/20 transition-all shadow-inner placeholder:text-white/5 ${className}`}
                {...props}
            />
        </div>
    );
}

function Select({ label, value, onChange, options }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block pr-4">{label}</label>
            <div className="relative">
                <select 
                    value={value} onChange={e => onChange(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-8 text-lg font-black text-white focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer"
                >
                    <option value="" className="bg-[#111114]">اختر...</option>
                    {options.map(o => <option key={o.v} value={o.v} className="bg-[#111114]">{o.l}</option>)}
                </select>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/10"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></div>
            </div>
        </div>
    );
}

function OpButton({ onClick, icon, color }) {
    return (
        <button onClick={onClick} className={`w-12 h-12 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-center text-white/20 hover:text-${color} hover:border-${color}/20 transition-all active:scale-90`}>
            {icon}
        </button>
    );
}
