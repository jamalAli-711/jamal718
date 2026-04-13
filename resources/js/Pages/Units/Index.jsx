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

    // --- Add Form ---
    const addForm = useForm({
        unit_name: '', short_name: '',
    });

    const submitAdd = (e) => {
        e.preventDefault();
        addForm.post(route('units.store'), {
            onSuccess: () => { setShowAddModal(false); addForm.reset(); },
        });
    };

    // --- Edit Form ---
    const editForm = useForm({
        unit_name: '', short_name: '',
    });

    const openEditModal = (u) => {
        setEditingUnit(u);
        editForm.setData({
            unit_name: u.unit_name,
            short_name: u.short_name,
        });
        setShowEditModal(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('units.update', editingUnit.id), {
            onSuccess: () => setShowEditModal(false),
        });
    };

    // --- Delete ---
    const deleteUnit = (u) => {
        if (confirm(`هل أنت متأكد من حذف الوحدة "${u.unit_name}"؟`)) {
            router.delete(route('units.destroy', u.id));
        }
    };

    return (
        <AdminLayout user={auth.user} header="الوحدات">
            <Head title="إدارة الوحدات" />

            <div className="flex justify-between items-center mb-10 bg-surface p-8 rounded-[2.5rem] border-2 border-outline-variant shadow-xl relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-on-surface tracking-tighter uppercase">تعريفات وحدات القياس</h2>
                    <p className="text-sm font-black text-on-surface-variant mt-1 uppercase tracking-widest">إدارة أحجام التعبئة والوحدات البيعية (كرتون، حبة، درزن)</p>
                </div>
                <button className="bg-primary text-white h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:bg-primary/90 hover:-translate-y-1 transition-all active:scale-95 relative z-10" onClick={() => setShowAddModal(true)}>
                    + إضافة وحدة جديدة
                </button>
            </div>


            <div className="bg-surface rounded-[3rem] border-2 border-outline-variant shadow-2xl overflow-hidden mb-12">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead className="bg-surface-lowest border-b-2 border-outline-variant">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-on-surface-variant uppercase tracking-widest text-right w-20">#</th>
                                <th className="px-8 py-5 text-xs font-black text-on-surface-variant uppercase tracking-widest text-right">المسمى التعريفي للوحدة</th>
                                <th className="px-8 py-5 text-xs font-black text-on-surface-variant uppercase tracking-widest text-right">الرمز التقني (Slug)</th>
                                <th className="px-8 py-5 text-xs font-black text-on-surface-variant uppercase tracking-widest text-center">العمليات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-outline-variant">
                            {units.map((u, i) => (
                                <tr key={u.id} className="hover:bg-surface-lowest/50 transition-colors">
                                    <td className="px-8 py-6 font-black text-on-surface-variant/40">{(i + 1).toString().padStart(2, '0')}</td>
                                    <td className="px-8 py-6 font-black text-on-surface text-lg">{u.unit_name}</td>
                                    <td className="px-8 py-6">
                                        <span className="font-mono bg-surface-lowest text-on-surface-variant px-3 py-1 rounded-lg text-xs font-black border border-outline-variant">{u.short_name}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-3">
                                            <button onClick={() => openEditModal(u)} className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center hover:bg-secondary hover:text-white transition-all border border-secondary/20">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => deleteUnit(u)} className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-primary/20">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {units.length === 0 && (
                                <tr><td colSpan="4" className="text-center py-20 text-slate-300 font-black uppercase tracking-widest">لم يتم تعريف أي وحدات بيعية حتى الآن</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* ========== ADD MODAL contents update - using TextInput which is now dark-aware ========== */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة تعريف وحدة بيع" maxWidth="md">
                <form onSubmit={submitAdd}>
                    <Modal.Body className="p-8">
                        <div className="space-y-8">
                            <div>
                                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">المسمى الكامل للوحدة (مثال: كرتون كبير)</label>
                                <input type="text" className="w-full border-2 border-outline-variant rounded-2xl text-lg py-5 px-8 focus:border-secondary transition-all font-black text-on-surface bg-surface-lowest shadow-inner" value={addForm.data.unit_name} onChange={e => addForm.setData('unit_name', e.target.value)} placeholder="اسم الوحدة..." required />
                                {addForm.errors.unit_name && <p className="text-xs font-black text-primary mt-2 uppercase">{addForm.errors.unit_name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">الاختصار أو الرمز التقني</label>
                                <input type="text" className="w-full border-2 border-outline-variant rounded-2xl text-xl py-5 px-8 focus:border-secondary transition-all font-black text-on-surface bg-surface-lowest text-left shadow-inner" dir="ltr" value={addForm.data.short_name} onChange={e => addForm.setData('short_name', e.target.value)} placeholder="CTN-LG" required />
                                {addForm.errors.short_name && <p className="text-xs font-black text-primary mt-2 uppercase">{addForm.errors.short_name}</p>}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="px-8 py-6 border-t-2 border-outline-variant">
                        <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs">إلغاء</button>
                        <button type="submit" disabled={addForm.processing} className="bg-secondary text-white h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-secondary/20 hover:scale-[1.02] transition-all">حفظ وإعتماد الوحدة</button>
                    </Modal.Footer>
                </form>
            </Modal>


            {/* ========== EDIT MODAL ========== */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title={`تعديل تعريف: ${editingUnit?.unit_name}`} maxWidth="md">
                {editingUnit && (
                    <form onSubmit={submitEdit}>
                        <Modal.Body className="p-8">
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">تحديث المسمى</label>
                                    <input type="text" className="w-full border-2 border-outline-variant rounded-2xl text-lg py-5 px-8 focus:border-secondary transition-all font-black text-on-surface bg-surface-lowest shadow-inner" value={editForm.data.unit_name} onChange={e => editForm.setData('unit_name', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">تحديث الاختصار</label>
                                    <input type="text" className="w-full border-2 border-outline-variant rounded-2xl text-xl py-5 px-8 focus:border-secondary transition-all font-black text-on-surface bg-surface-lowest text-left shadow-inner" dir="ltr" value={editForm.data.short_name} onChange={e => editForm.setData('short_name', e.target.value)} required />
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="px-8 py-6 border-t-2 border-outline-variant">
                            <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs">إغلاق</button>
                            <button type="submit" disabled={editForm.processing} className="bg-primary text-white h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all">حفظ التغييرات</button>
                        </Modal.Footer>
                    </form>
                )}
            </Modal>

        </AdminLayout>
    );
}
