import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { useToast } from '@/Components/Toast';

export default function UnitsIndex({ auth, units }) {
    const toast = useToast();
    const { flash } = usePage().props;

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const addForm = useForm({ unit_name: '', short_name: '', });

    const submitAdd = (e) => {
        e.preventDefault();
        addForm.post(route('units.store'), { onSuccess: () => { setShowAddModal(false); addForm.reset(); }, });
    };

    const editForm = useForm({ unit_name: '', short_name: '', });

    const openEditModal = (u) => {
        setEditingUnit(u);
        editForm.setData({ unit_name: u.unit_name, short_name: u.short_name, });
        setShowEditModal(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('units.update', editingUnit.id), { onSuccess: () => setShowEditModal(false), });
    };

    const deleteUnit = (u) => {
        if (confirm(`هل أنت متأكد من حذف الوحدة "${u.unit_name}"؟`)) {
            router.delete(route('units.destroy', u.id));
        }
    };

    return (
        <AdminLayout user={auth.user} header="وحدات القياس">
            <Head title="وحدات القياس — إدارة المعايير" />

            <div className="pb-32 animate-in fade-in duration-1000" dir="rtl">
                
                {/* VIP Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 p-10 bg-white/[0.01] rounded-[4rem] border border-white/5 shadow-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 tracking-[0.4em] text-[10px] font-black uppercase">
                            معايير قياسية موحدة
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                        </div>
                        <h2 className="text-6xl font-black text-white tracking-tighter leading-none">إدارة وحدات القياس</h2>
                        <p className="text-white/20 font-bold text-xl italic pr-6 border-r-4 border-blue-500/20">تعريف المقاييس الكمية، أحجام التعبئة، والرموز التقنية للأصول المخزنية.</p>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="group px-12 py-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-black rounded-[2rem] flex items-center gap-4 shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all relative z-10">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-xs uppercase tracking-[0.2em]">تسجيل وحدة جديدة</span>
                    </button>
                </div>

                {/* VIP Ledger Table */}
                <div className="bg-[#0c0c0e]/80 backdrop-blur-3xl rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-white/[0.01]">
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">#</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">اسم الوحدة</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">الرمز المختصر</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {units.map((u, i) => (
                                    <tr key={u.id} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="px-12 py-10">
                                            <span className="text-4xl font-black text-white/5 tracking-tighter">{(i + 1).toString().padStart(2, '0')}</span>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-2xl font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors uppercase leading-none">{u.unit_name}</span>
                                                <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">ID_UNIT: #{u.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <span className="px-6 py-2.5 rounded-full bg-white/[0.03] border border-white/10 font-mono text-xl font-black text-white/60 tracking-widest">{u.short_name}</span>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex items-center justify-center gap-4">
                                                <OpButton onClick={() => openEditModal(u)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} color="blue-400" />
                                                <button onClick={() => deleteUnit(u)} className="w-12 h-12 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-center text-white/20 hover:text-rose-500 hover:border-rose-500/20 transition-all active:scale-90 shadow-xl">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {units.length === 0 && (
                        <div className="text-center py-40">
                            <span className="text-3xl font-black text-white/5 uppercase tracking-[0.6em]">لا توجد وحدات معرفة</span>
                        </div>
                    )}
                </div>
            </div>

            {/* VIP Unit Modal */}
            <Modal show={showAddModal || showEditModal} onClose={() => { setShowAddModal(false); setShowEditModal(false); }} title={showAddModal ? "إضافة وحدة قياسية" : "تعديل وحدة قياسية"} maxWidth="md">
                <div className="bg-[#0c0c0e] text-white overflow-hidden rounded-[3rem] border border-white/5 p-12" dir="rtl">
                    <form onSubmit={showAddModal ? submitAdd : submitEdit} className="space-y-10">
                        <div>
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block pr-4 mb-3">اسم الوحدة *</label>
                            <input type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 px-8 text-2xl font-black text-white focus:outline-none focus:border-blue-500/30 transition-all shadow-inner placeholder:text-white/5 uppercase" value={(showAddModal ? addForm : editForm).data.unit_name} onChange={e => (showAddModal ? addForm : editForm).setData('unit_name', e.target.value)} placeholder="مثال: كرتون" required />
                            {(showAddModal ? addForm : editForm).errors.unit_name && <p className="text-[10px] font-black text-rose-500 mt-2 tracking-widest uppercase">{(showAddModal ? addForm : editForm).errors.unit_name}</p>}
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block pr-4 mb-3">الرمز المختصر *</label>
                            <input type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 px-8 text-2xl font-mono font-black text-white focus:outline-none focus:border-blue-500/30 transition-all shadow-inner text-left placeholder:text-white/5" dir="ltr" value={(showAddModal ? addForm : editForm).data.short_name} onChange={e => (showAddModal ? addForm : editForm).setData('short_name', e.target.value)} placeholder="CTN-X" required />
                        </div>

                        <div className="flex gap-6 mt-12 pt-10 border-t border-white/5">
                            <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="flex-1 py-8 rounded-[2rem] bg-white/5 text-white/40 font-black uppercase text-[11px] tracking-[0.4em] hover:bg-white/10 transition-all leading-none">إلغاء</button>
                            <button type="submit" disabled={(showAddModal ? addForm : editForm).processing} className="flex-[2] py-8 rounded-[2rem] bg-blue-500 text-black font-black uppercase text-[11px] tracking-[0.4em] hover:bg-blue-400 shadow-2xl shadow-blue-500/10 disabled:opacity-50 transition-all leading-none">
                                {(showAddModal ? addForm : editForm).processing ? 'جاري الحفظ...' : 'حفظ الوحدة'}
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

function OpButton({ onClick, icon, color }) {
    return (
        <button onClick={onClick} className={`w-12 h-12 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-center text-white/20 hover:text-${color} hover:border-${color}/20 transition-all active:scale-90 shadow-xl`}>
            {icon}
        </button>
    );
}
