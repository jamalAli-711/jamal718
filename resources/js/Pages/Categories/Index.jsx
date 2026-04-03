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

            <div className="page-header">
                <div>
                    <h2 className="page-title">إدارة فئات المنتجات</h2>
                    <p className="page-subtitle">تصنيف وترتيب المنتجات داخل المخزون</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    + إضافة فئة
                </button>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>اسم الفئة</th>
                                <th>الوصف</th>
                                <th>الفرع التابع له</th>
                                <th className="text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.id}>
                                    <td className="font-bold text-gray-900">{cat.category_name}</td>
                                    <td className="text-gray-500">{cat.description || '—'}</td>
                                    <td>{cat.branch?.branch_name || 'كل الفروع'}</td>
                                    <td className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => openEditModal(cat)} className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50">تعديل</button>
                                            <button onClick={() => deleteCategory(cat)} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50">حذف</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr><td colSpan="4" className="text-center py-10 text-gray-400">لا توجد فئات حالياً.</td></tr>
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
