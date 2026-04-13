import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { useToast } from '@/Components/Toast';

export default function CategoriesIndex({ auth, categories, branches }) {
    const toast = useToast();
    const { flash } = usePage().props;

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // --- Add Form ---
    const addForm = useForm({
        category_name: '', description: '', branch_id: '',
    });

    const submitAdd = (e) => {
        e.preventDefault();
        addForm.post(route('categories.store'), {
            onSuccess: () => { setShowAddModal(false); addForm.reset(); },
        });
    };

    // --- Edit Form ---
    const editForm = useForm({
        category_name: '', description: '', branch_id: '',
    });

    const openEditModal = (cat) => {
        setEditingCategory(cat);
        editForm.setData({
            category_name: cat.category_name,
            description: cat.description || '',
            branch_id: cat.branch_id || '',
        });
        setShowEditModal(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('categories.update', editingCategory.id), {
            onSuccess: () => setShowEditModal(false),
        });
    };

    // --- Delete ---
    const deleteCategory = (cat) => {
        if (confirm(`هل أنت متأكد من حذف الفئة "${cat.category_name}"؟`)) {
            router.delete(route('categories.destroy', cat.id));
        }
    };

    return (
        <AdminLayout user={auth.user} header="الفئات">
            <Head title="إدارة الفئات" />

            <div className="flex justify-between items-center mb-10 bg-surface p-8 rounded-[2.5rem] border-2 border-outline-variant shadow-xl relative overflow-hidden group">
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-on-surface tracking-tighter uppercase">تصنيفات المخزون</h2>
                    <p className="text-sm font-black text-on-surface-variant mt-1 uppercase tracking-widest">تنسيق وترتيب المنتجات حسب الأقسام (مشروبات، معلبات، منظفات...)</p>
                </div>
                <button className="bg-secondary text-white h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-secondary/20 hover:bg-slate-900 transition-all active:scale-95 relative z-10" onClick={() => setShowAddModal(true)}>
                    + إضافة تصنيف جديد
                </button>
            </div>


            <div className="bg-surface rounded-[3rem] border-2 border-outline-variant shadow-2xl overflow-hidden mb-12">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead className="bg-surface-lowest border-b-2 border-outline-variant">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-on-surface-variant uppercase tracking-widest text-right">اسم القسم / الفئة</th>
                                <th className="px-8 py-5 text-xs font-black text-on-surface-variant uppercase tracking-widest text-right">توصيف القسم</th>
                                <th className="px-8 py-5 text-xs font-black text-on-surface-variant uppercase tracking-widest text-right">الفرع المرتبط</th>
                                <th className="px-8 py-5 text-xs font-black text-on-surface-variant uppercase tracking-widest text-center">إجراءات التحكم</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-outline-variant">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-surface-lowest/50 transition-colors">
                                    <td className="px-8 py-6 font-black text-on-surface text-lg">{cat.category_name}</td>
                                    <td className="px-8 py-6 text-on-surface-variant font-bold">{cat.description || '—'}</td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${cat.branch_id ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-surface-lowest text-on-surface-variant/40 border border-outline-variant'}`}>
                                            {cat.branch_id && <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>}
                                            {cat.branch?.branch_name || 'قسم عام لكل الفروع'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-3">
                                            <button onClick={() => openEditModal(cat)} className="w-10 h-10 rounded-xl bg-surface-lowest text-on-surface-variant flex items-center justify-center hover:bg-secondary hover:text-white transition-all border border-outline-variant">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => deleteCategory(cat)} className="w-10 h-10 rounded-xl bg-surface-lowest text-on-surface-variant flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-outline-variant">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr><td colSpan="4" className="text-center py-20 text-slate-300 font-black uppercase tracking-widest">لم يتم إنشاء أي أقسام مخزنية حتى الآن</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* ========== ADD MODAL ========== */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة فئة جديدة" maxWidth="sm">
                <form onSubmit={submitAdd}>
                    <Modal.Body className="p-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">اسم الفئة *</label>
                                <input type="text" className="w-full border-2 border-outline-variant bg-surface-lowest rounded-2xl text-lg py-4 px-6 focus:border-secondary transition-all font-black text-on-surface uppercase" value={addForm.data.category_name} onChange={e => addForm.setData('category_name', e.target.value)} required />
                                {addForm.errors.category_name && <p className="text-xs font-black text-primary mt-2 uppercase">{addForm.errors.category_name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">وصف الفئة</label>
                                <textarea className="w-full border-2 border-outline-variant bg-surface-lowest rounded-2xl text-sm py-4 px-6 focus:border-secondary transition-all font-bold text-on-surface h-32" value={addForm.data.description} onChange={e => addForm.setData('description', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">الفرع التابع (اختياري)</label>
                                <select className="w-full border-2 border-outline-variant bg-surface-lowest rounded-2xl text-sm py-4 px-6 focus:border-secondary transition-all font-black text-on-surface appearance-none" value={addForm.data.branch_id} onChange={e => addForm.setData('branch_id', e.target.value)}>
                                    <option value="">كل الفروع (عام)</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                </select>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="px-8 py-6 border-t-2 border-outline-variant">
                        <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary h-12 px-6 rounded-xl font-black uppercase text-xs">إلغاء</button>
                        <button type="submit" disabled={addForm.processing} className="bg-secondary text-white h-12 px-8 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-slate-900 transition-all">إضافة الفئة</button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* ========== EDIT MODAL ========== */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title="تعديل الفئة" maxWidth="sm">
                {editingCategory && (
                    <form onSubmit={submitEdit}>
                        <Modal.Body className="p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">اسم الفئة *</label>
                                    <input type="text" className="w-full border-2 border-outline-variant bg-surface-lowest rounded-2xl text-lg py-4 px-6 focus:border-secondary transition-all font-black text-on-surface uppercase" value={editForm.data.category_name} onChange={e => editForm.setData('category_name', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">وصف الفئة</label>
                                    <textarea className="w-full border-2 border-outline-variant bg-surface-lowest rounded-2xl text-sm py-4 px-6 focus:border-secondary transition-all font-bold text-on-surface h-32" value={editForm.data.description} onChange={e => editForm.setData('description', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">الفرع التابع (اختياري)</label>
                                    <select className="w-full border-2 border-outline-variant bg-surface-lowest rounded-2xl text-sm py-4 px-6 focus:border-secondary transition-all font-black text-on-surface appearance-none" value={editForm.data.branch_id} onChange={e => editForm.setData('branch_id', e.target.value)}>
                                        <option value="">كل الفروع (عام)</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="px-8 py-6 border-t-2 border-outline-variant">
                            <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary h-12 px-6 rounded-xl font-black uppercase text-xs">إلغاء</button>
                            <button type="submit" disabled={editForm.processing} className="bg-primary text-white h-12 px-8 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-slate-900 transition-all">حفظ التعديلات</button>
                        </Modal.Footer>
                    </form>
                )}
            </Modal>
        </AdminLayout>
    );
}
