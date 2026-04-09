import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import MapPicker from '@/Components/MapPicker';
import BranchesMap from '@/Components/BranchesMap';
import { useToast } from '@/Components/Toast';

export default function BranchesIndex({ auth, branches, currencies = [] }) {
    const toast = useToast();
    const { flash } = usePage().props;

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const addForm = useForm({ branch_name: '', location_city: '', manager_name: '', branch_lat: null, branch_lon: null, currency_id: '' });
    const editForm = useForm({ branch_name: '', location_city: '', manager_name: '', branch_lat: null, branch_lon: null, currency_id: '' });

    const submitAdd = (e) => {
        e.preventDefault();
        addForm.post(route('branches.store'), {
            onSuccess: () => { setShowAddModal(false); addForm.reset(); },
        });
    };

    const openEdit = (branch) => {
        setEditingBranch(branch);
        editForm.setData({
            branch_name: branch.branch_name,
            location_city: branch.location_city,
            manager_name: branch.manager_name || '',
            branch_lat: branch.branch_lat,
            branch_lon: branch.branch_lon,
            currency_id: branch.currency_id || '',
        });
        setShowEditModal(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('branches.update', editingBranch.id), {
            onSuccess: () => setShowEditModal(false),
        });
    };

    const deleteBranch = (branch) => {
        if (confirm(`هل أنت متأكد من حذف فرع "${branch.branch_name}"؟`)) {
            router.delete(route('branches.destroy', branch.id));
        }
    };

    return (
        <AdminLayout user={auth.user} header="الفروع">
            <Head title="إدارة الفروع" />

            <div className="page-header">
                <div>
                    <h2 className="page-title">إدارة الفروع</h2>
                    <p className="page-subtitle">إضافة وتعديل فروع الشركة</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    إضافة فرع
                </button>
            </div>

            {/* Branches Overview Map */}
            <div className="card mb-6">
                <div className="card-header">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        خريطة جميع الفروع
                    </h3>
                    <span className="text-xs text-gray-400">{branches.filter(b => b.branch_lat && b.branch_lon).length} فرع محدد الموقع</span>
                </div>
                <div className="p-3">
                    <BranchesMap branches={branches} height="350px" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {branches.map((branch) => (
                    <div key={branch.id} className="card">
                        <div className="card-body">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                     <h3 className="font-black text-xl text-slate-900 mb-1">{branch.branch_name}</h3>
                                    <p className="text-base font-black text-slate-400 uppercase tracking-tight">{branch.location_city}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(branch)} className="text-sm font-black text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 transition-colors">تعديل</button>
                                    <button onClick={() => deleteBranch(branch)} className="text-sm font-black text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-xl border border-rose-100 transition-colors">حذف</button>
                                </div>
                            </div>
                            {branch.manager_name && (
                                <p className="text-sm font-black text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">المدير المسئول: <span className="text-slate-900">{branch.manager_name}</span></p>
                            )}

                            {branch.branch_lat && branch.branch_lon && (
                                <div className="mb-3 flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-md px-2 py-1 border border-emerald-100">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                    <span className="font-medium">الموقع محدد على الخريطة</span>
                                </div>
                            )}
                             <div className="flex gap-4 text-sm font-black text-slate-400 pt-4 border-t-2 border-slate-50">
                                <span><strong className="text-slate-900 text-lg">{branch.users_count}</strong> مستخدم</span>
                                <span><strong className="text-slate-900 text-lg">{branch.products_count}</strong> منتج</span>
                                <span><strong className="text-slate-900 text-lg">{branch.orders_count}</strong> طلب</span>
                            </div>

                        </div>
                    </div>
                ))}
                {branches.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">لا توجد فروع مسجلة</div>
                )}
            </div>

            {/* Add Modal */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة فرع جديد" maxWidth="lg">
                <form onSubmit={submitAdd}>
                    <Modal.Body>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-2">اسم الفرع *</label>
                                    <input type="text" className="w-full border-2 border-slate-200 rounded-xl text-lg py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-black text-slate-900 shadow-sm" value={addForm.data.branch_name} onChange={e => addForm.setData('branch_name', e.target.value)} required />
                                    {addForm.errors.branch_name && <p className="text-sm font-black text-rose-500 mt-1 uppercase">{addForm.errors.branch_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-2">المحافظة / المدينة *</label>
                                    <input type="text" className="w-full border-2 border-slate-200 rounded-xl text-lg py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-black text-slate-900 shadow-sm" value={addForm.data.location_city} onChange={e => addForm.setData('location_city', e.target.value)} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-2">اسم المدير (اختياري)</label>
                                    <input type="text" className="w-full border-2 border-slate-200 rounded-xl text-lg py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-black text-slate-900 shadow-sm" value={addForm.data.manager_name} onChange={e => addForm.setData('manager_name', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-2">العملة الافتراضية للفرع *</label>
                                    <select className="w-full border-2 border-slate-200 rounded-xl text-lg py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-black text-slate-900 shadow-sm appearance-none bg-white" value={addForm.data.currency_id} onChange={e => addForm.setData('currency_id', e.target.value)} required>
                                        <option value="">-- اختر العملة الافتراضية --</option>
                                        {currencies.map(c => (
                                            <option key={c.id} value={c.id}>{c.currency_name} ({c.currency_code_en})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2">
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        موقع الفرع على الخريطة
                                    </span>
                                </label>
                                <MapPicker
                                    lat={addForm.data.branch_lat}
                                    lng={addForm.data.branch_lon}
                                    onLocationChange={(lat, lng) => {
                                        addForm.setData(prev => ({ ...prev, branch_lat: lat, branch_lon: lng }));
                                    }}
                                    height="280px"
                                />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">إلغاء</button>
                        <button type="submit" disabled={addForm.processing} className="btn-primary">{addForm.processing ? 'جاري الحفظ...' : 'حفظ الفرع'}</button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title={`تعديل — ${editingBranch?.branch_name || ''}`} maxWidth="lg">
                {editingBranch && (
                    <form onSubmit={submitEdit}>
                        <Modal.Body>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الفرع *</label>
                                        <input type="text" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={editForm.data.branch_name} onChange={e => editForm.setData('branch_name', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">المحافظة / المدينة *</label>
                                        <input type="text" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={editForm.data.location_city} onChange={e => editForm.setData('location_city', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">اسم المدير (اختياري)</label>
                                        <input type="text" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={editForm.data.manager_name} onChange={e => editForm.setData('manager_name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">العملة الافتراضية *</label>
                                        <select className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={editForm.data.currency_id} onChange={e => editForm.setData('currency_id', e.target.value)} required>
                                            <option value="">-- اختر العملة --</option>
                                            {currencies.map(c => (
                                                <option key={c.id} value={c.id}>{c.currency_name} ({c.currency_code_en})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            موقع الفرع على الخريطة
                                        </span>
                                    </label>
                                    <MapPicker
                                        lat={editForm.data.branch_lat}
                                        lng={editForm.data.branch_lon}
                                        onLocationChange={(lat, lng) => {
                                            editForm.setData(prev => ({ ...prev, branch_lat: lat, branch_lon: lng }));
                                        }}
                                        height="280px"
                                    />
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">إلغاء</button>
                            <button type="submit" disabled={editForm.processing} className="btn-primary">{editForm.processing ? 'جاري التحديث...' : 'حفظ التعديلات'}</button>
                        </Modal.Footer>
                    </form>
                )}
            </Modal>
        </AdminLayout>
    );
}
