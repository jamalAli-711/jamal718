import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { formatDate } from '@/constants';

export default function Index({ auth, customerGroups, customers, products, branches, filters }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [expandedCustomers, setExpandedCustomers] = useState([]);

    const toggleCustomer = (id) => {
        setExpandedCustomers(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const { data, setData, post, put, processing, errors, reset } = useForm({
        customer_id: '',
        product_id: '',
        reorder_cycle_days: 30,
        alert_threshold_days: 3,
        minimum_stock_level: '',
        preferred_quantity: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (editingItem) {
            put(route('replenishment.update', editingItem.id), {
                onSuccess: () => { setShowCreateModal(false); setEditingItem(null); reset(); }
            });
        } else {
            post(route('replenishment.store'), {
                onSuccess: () => { setShowCreateModal(false); reset(); }
            });
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setData({
            customer_id: item.customer_id,
            product_id: item.product_id,
            reorder_cycle_days: item.reorder_cycle_days,
            alert_threshold_days: item.alert_threshold_days,
            minimum_stock_level: item.minimum_stock_level || '',
            preferred_quantity: item.preferred_quantity || '',
            is_active: item.is_active,
        });
        setShowCreateModal(true);
    };

    return (
        <AdminLayout user={auth.user} header="دورة التوريد الذكية">
            <Head title="إدارة دورات التوريد — برمجة الذكاء" />

            <div className="pb-32 animate-in fade-in duration-1000" dir="rtl">
                
                {/* VIP Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 p-10 bg-white/[0.01] rounded-[4rem] border border-white/5 shadow-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-400/10 border border-blue-400/20 rounded-full text-blue-500 tracking-[0.4em] text-[10px] font-black uppercase">
                            نظام التنبؤ بالطلب
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                        </div>
                        <h2 className="text-6xl font-black text-white tracking-tighter leading-none">إدارة دورات التوريد</h2>
                        <p className="text-white/20 font-bold text-xl italic pr-6 border-r-4 border-blue-400/20">تحديد فترات الاستهلاك لكل عميل لضمان عدم انقطاع المخزون وتجهيز الطلبات استباقياً.</p>
                    </div>
                    <button 
                        onClick={() => { setEditingItem(null); reset(); setShowCreateModal(true); }}
                        className="px-10 py-5 bg-blue-500 text-white text-xs font-black uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all relative z-10"
                    >
                        إضافة إعداد توريد
                    </button>
                </div>

                {/* Filter Section - VIP Chips */}
                <div className="flex flex-wrap gap-4 mb-10">
                    <button 
                        onClick={() => router.get(route('replenishment.index'), { branch_id: '' }, { preserveState: true })}
                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${!filters.branch_id ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30' : 'bg-white/[0.03] border-white/5 text-white/30 hover:bg-white/10'}`}
                    >
                        كافة الفروع
                    </button>
                    {branches.map(b => (
                        <button 
                            key={b.id}
                            onClick={() => router.get(route('replenishment.index'), { branch_id: b.id }, { preserveState: true })}
                            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${filters.branch_id == b.id ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30' : 'bg-white/[0.03] border-white/5 text-white/30 hover:bg-white/10'}`}
                        >
                            {b.branch_name}
                        </button>
                    ))}
                </div>

                {/* Grouped Customer List */}
                <div className="space-y-6">
                    {customerGroups?.data?.map((customer) => (
                        <div key={customer.id} className="bg-[#0c0c0e]/80 backdrop-blur-3xl rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl transition-all">
                            {/* Customer Summary Row */}
                            <div 
                                onClick={() => toggleCustomer(customer.id)}
                                className="flex flex-col md:flex-row justify-between items-center p-10 cursor-pointer hover:bg-white/[0.01] transition-colors group"
                            >
                                <div className="flex items-center gap-8">
                                    <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-2xl">
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">{customer.name}</h3>
                                        <div className="flex items-center gap-4 text-[10px] font-black text-white/20 uppercase tracking-widest">
                                            <span>{customer.branch?.branch_name}</span>
                                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                                            <span className="text-blue-500/60">{customer.replenishment_settings.length} منتجات مراقبة</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 mt-6 md:mt-0">
                                    <button className={`p-4 rounded-2xl border transition-all ${expandedCustomers.includes(customer.id) ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20 rotate-180' : 'bg-white/5 border-white/10 text-white/40'}`}>
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Product Table */}
                            {expandedCustomers.includes(customer.id) && (
                                <div className="px-10 pb-10 animate-in slide-in-from-top-4 duration-500">
                                    <div className="bg-black/20 rounded-[2rem] border border-white/5 overflow-hidden">
                                        <table className="w-full text-right">
                                            <thead>
                                                <tr className="bg-white/[0.02]">
                                                    <th className="px-8 py-6 text-[9px] font-black text-white/20 uppercase tracking-widest">المنتج</th>
                                                    <th className="px-8 py-6 text-[9px] font-black text-white/20 uppercase tracking-widest text-center">الدورة</th>
                                                    <th className="px-8 py-6 text-[9px] font-black text-white/20 uppercase tracking-widest text-center">آخر توريد</th>
                                                    <th className="px-8 py-6 text-[9px] font-black text-white/20 uppercase tracking-widest text-center">الطلب القادم</th>
                                                    <th className="px-8 py-6 text-[9px] font-black text-white/20 uppercase tracking-widest text-center">الإجراءات</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.03]">
                                                {customer.replenishment_settings.map((item) => (
                                                    <tr key={item.id} className="group/item hover:bg-white/[0.01]">
                                                        <td className="px-8 py-6 font-black text-white">{item.product.name}</td>
                                                        <td className="px-8 py-6 text-center text-blue-400 font-black">{item.reorder_cycle_days} يوم</td>
                                                        <td className="px-8 py-6 text-center text-white/40 font-bold">{formatDate(item.last_fulfilled_date)}</td>
                                                        <td className="px-8 py-6 text-center">
                                                            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[10px]">
                                                                {formatDate(item.next_expected_date)}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6 text-center">
                                                            <div className="flex items-center justify-center gap-3">
                                                                <button onClick={() => handleEdit(item)} className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-blue-400 hover:border-blue-400/20 transition-all">
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </button>
                                                                <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-rose-400 hover:border-rose-400/20 transition-all">
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {customerGroups?.links && (
                    <div className="mt-16 flex justify-center gap-4">
                        {customerGroups.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all ${link.active ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                />
                            ) : (
                                <span
                                    key={i}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className="px-6 py-3 rounded-xl text-[10px] font-black bg-white/5 text-white/10 opacity-50 cursor-not-allowed"
                                />
                            )
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="2xl">
                <form onSubmit={submit} className="p-12 bg-[#0c0c0e] border border-white/10 rounded-[3rem] space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="space-y-4 relative z-10">
                        <h3 className="text-4xl font-black text-white tracking-tighter uppercase">{editingItem ? 'تحديث إعدادات التنبؤ' : 'إضافة إعداد تنبؤ جديد'}</h3>
                        <p className="text-white/20 font-bold text-sm italic">ضبط دورة الحفظ للمنتجات والعملاء.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pr-4">العميل المستهدف</label>
                            <select 
                                disabled={editingItem}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer"
                                value={data.customer_id} onChange={e => setData('customer_id', e.target.value)}
                            >
                                <option value="">اختر عميلاً من السجل</option>
                                {customers.map(c => <option key={c.id} value={c.id} className="bg-[#111114]">{c.name}</option>)}
                            </select>
                            {errors.customer_id && <p className="text-xs text-rose-500 pr-4">{errors.customer_id}</p>}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pr-4">المنتج</label>
                            <select 
                                disabled={editingItem}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer"
                                value={data.product_id} onChange={e => setData('product_id', e.target.value)}
                            >
                                <option value="">اختر المنتج</option>
                                {products.map(p => <option key={p.id} value={p.id} className="bg-[#111114]">{p.name}</option>)}
                            </select>
                            {errors.product_id && <p className="text-xs text-rose-500 pr-4">{errors.product_id}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pr-4">الدورة (يوم)</label>
                            <input 
                                type="number" 
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-center placeholder:text-white/10"
                                value={data.reorder_cycle_days} onChange={e => setData('reorder_cycle_days', e.target.value)}
                                placeholder="30"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pr-4">الحد الأدنى للمخزون</label>
                            <input 
                                type="number" 
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-sm font-black text-white focus:outline-none focus:border-blue-500/30 transition-all text-center"
                                value={data.minimum_stock_level} onChange={e => setData('minimum_stock_level', e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pr-4">الكمية المقترحة</label>
                            <input 
                                type="number" 
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-sm font-black text-white focus:outline-none focus:border-blue-500/30 transition-all text-center"
                                value={data.preferred_quantity} onChange={e => setData('preferred_quantity', e.target.value)}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest pr-4">حد أيام التنبيه (Threshold)</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="number" 
                                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-center"
                                    value={data.alert_threshold_days} onChange={e => setData('alert_threshold_days', e.target.value)}
                                    placeholder="3"
                                />
                                <div className="hidden md:block text-[9px] text-white/20 font-bold max-w-[150px] leading-relaxed italic">
                                    عدد الأيام "قبل" الموعد المتوقع التي يبدأ فيها النظام بإرسال التنبيهات.
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                            <div className="flex-1">
                                <span className="text-xs font-black text-white block">تفعيل التتبع</span>
                                <span className="text-[9px] text-white/20 uppercase">تفعيل/تعطيل الحسابات الذكية</span>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="w-12 h-6 bg-white/5 border-none rounded-full appearance-none cursor-pointer checked:bg-blue-500 transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all checked:after:translate-x-6"
                            />
                        </div>
                    </div>

                    <div className="pt-8 relative z-10">
                        <button 
                            disabled={processing}
                            className="w-full bg-blue-500 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.5em] shadow-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {processing ? 'جاري الحفظ...' : (editingItem ? 'تحديث الإعدادات' : 'تفعيل التتبع الذكي')}
                        </button>
                    </div>
                </form>
            </Modal>

            <style dangerouslySetInnerHTML={{ __html: `
                .divide-y > :not([hidden]) ~ :not([hidden]) { border-top-width: 1px; border-color: rgba(255,255,255,0.03); }
            ` }} />
        </AdminLayout>
    );
}
