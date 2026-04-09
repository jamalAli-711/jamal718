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

            <div className="flex justify-between items-center mb-10 bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-xl relative overflow-hidden group">
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-emerald-50/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">تصنيفات المخزون</h2>
                    <p className="text-sm font-black text-slate-400 mt-1 uppercase tracking-widest">تنسيق وترتيب المنتجات حسب الأقسام (مشروبات، معلبات، منظفات...)</p>
                </div>
                <button className="bg-slate-900 text-white h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-[#e31e24] transition-all active:scale-95 relative z-10" onClick={() => setShowAddModal(true)}>
                    + إضافة تصنيف جديد
                </button>
            </div>


            <div className="bg-white rounded-[3rem] border-2 border-slate-50 shadow-2xl overflow-hidden mb-12">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead className="bg-slate-50 border-b-2 border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">اسم القسم / الفئة</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">توصيف القسم</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">الفرع المرتبط</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">إجراءات التحكم</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6 font-black text-slate-900 text-lg">{cat.category_name}</td>
                                    <td className="px-8 py-6 text-slate-500 font-bold">{cat.description || '—'}</td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${cat.branch_id ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-400'}`}>
                                            {cat.branch_id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>}
                                            {cat.branch?.branch_name || 'قسم عام لكل الفروع'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-3">
                                            <button onClick={() => openEditModal(cat)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-slate-100">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => deleteCategory(cat)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-slate-100">
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
                    <Modal.Body>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الفئة *</label>
                                <input type="text" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={addForm.data.category_name} onChange={e => addForm.setData('category_name', e.target.value)} required />
                                {addForm.errors.category_name && <p className="text-xs text-red-500 mt-1">{addForm.errors.category_name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">وصف الفئة</label>
                                <textarea className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={addForm.data.description} onChange={e => addForm.setData('description', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">الفرع التابع (اختياري)</label>
                                <select className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={addForm.data.branch_id} onChange={e => addForm.setData('branch_id', e.target.value)}>
                                    <option value="">كل الفروع (عام)</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                </select>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">إلغاء</button>
                        <button type="submit" disabled={addForm.processing} className="btn-primary">حفظ</button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* ========== EDIT MODAL ========== */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title="تعديل الفئة" maxWidth="sm">
                {editingCategory && (
                    <form onSubmit={submitEdit}>
                        <Modal.Body>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الفئة *</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={editForm.data.category_name} onChange={e => editForm.setData('category_name', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">وصف الفئة</label>
                                    <textarea className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={editForm.data.description} onChange={e => editForm.setData('description', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">الفرع التابع (اختياري)</label>
                                    <select className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={editForm.data.branch_id} onChange={e => editForm.setData('branch_id', e.target.value)}>
                                        <option value="">كل الفروع (عام)</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">إلغاء</button>
                            <button type="submit" disabled={editForm.processing} className="btn-primary">حفظ التعديلات</button>
                        </Modal.Footer>
                    </form>
                )}
            </Modal>
        </AdminLayout>
    );
}
