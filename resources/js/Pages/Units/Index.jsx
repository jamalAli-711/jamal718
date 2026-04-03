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

            <div className="page-header">
                <div>
                    <h2 className="page-title">إدارة وحدات القياس والبيع</h2>
                    <p className="page-subtitle">تعريف الكرتون، الحبة، الدرزن، إلخ.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    + إضافة وحدة
                </button>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>اسم الوحدة</th>
                                <th>الاختصار (Short Name)</th>
                                <th className="text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {units.map((u, i) => (
                                <tr key={u.id}>
                                    <td>{i + 1}</td>
                                    <td className="font-bold text-gray-900">{u.unit_name}</td>
                                    <td className="text-gray-500 font-mono">{u.short_name}</td>
                                    <td className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => openEditModal(u)} className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50">تعديل</button>
                                            <button onClick={() => deleteUnit(u)} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50">حذف</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {units.length === 0 && (
                                <tr><td colSpan="4" className="text-center py-10 text-gray-400">لا توجد وحدات حالياً.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========== ADD MODAL ========== */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة وحدة جديدة" maxWidth="sm">
                <form onSubmit={submitAdd}>
                    <Modal.Body>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الوحدة (مثال: كرتون) *</label>
                                <input type="text" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={addForm.data.unit_name} onChange={e => addForm.setData('unit_name', e.target.value)} required />
                                {addForm.errors.unit_name && <p className="text-xs text-red-500 mt-1">{addForm.errors.unit_name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">رمز الوحدة (مثال: CTN) *</label>
                                <input type="text" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-left" dir="ltr" value={addForm.data.short_name} onChange={e => addForm.setData('short_name', e.target.value)} required />
                                {addForm.errors.short_name && <p className="text-xs text-red-500 mt-1">{addForm.errors.short_name}</p>}
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
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title="تعديل الوحدة" maxWidth="sm">
                {editingUnit && (
                    <form onSubmit={submitEdit}>
                        <Modal.Body>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الوحدة *</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={editForm.data.unit_name} onChange={e => editForm.setData('unit_name', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">رمز الوحدة *</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-left" dir="ltr" value={editForm.data.short_name} onChange={e => editForm.setData('short_name', e.target.value)} required />
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
