import { useState, useEffect, useMemo } from 'react';
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

    // Aggregate Stats
    const stats = useMemo(() => {
        return {
            totalBranches: branches.length,
            totalUsers: branches.reduce((acc, b) => acc + (b.users_count || 0), 0),
            totalOrders: branches.reduce((acc, b) => acc + (b.orders_count || 0), 0),
            mappedBranches: branches.filter(b => b.branch_lat && b.branch_lon).length
        };
    }, [branches]);

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
        <AdminLayout user={auth.user}>
            <Head title="إدارة الفروع — نظام مخلافي" />

            <div className="max-w-[1600px] mx-auto space-y-8 pb-12" dir="rtl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-100 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-10 h-1 h-px bg-slate-900 rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">التحكم اللوجستي</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">إدارة الفروع</h1>
                        <p className="text-lg font-bold text-slate-400 italic">تتبع المواقع، المدراء، والعمليات في الوقت اللحظي</p>
                    </div>

                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="group flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl hover:bg-blue-600 transition-all active:scale-95"
                    >
                        <span className="font-black text-sm uppercase tracking-widest">إضافة مركز جديد</span>
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        </div>
                    </button>
                </div>

                {/* Analytical Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <span className="relative z-10 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">إجمالي المراكز</span>
                        <div className="relative z-10 flex items-end gap-2">
                            <h3 className="text-4xl font-black text-slate-900">{stats.totalBranches}</h3>
                            <span className="text-xs font-bold text-slate-400 mb-1.5 uppercase">فرعاً</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <span className="relative z-10 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">إجمالي الطاقم</span>
                        <div className="relative z-10 flex items-end gap-2">
                            <h3 className="text-4xl font-black text-slate-900">{stats.totalUsers}</h3>
                            <span className="text-xs font-bold text-slate-400 mb-1.5 uppercase">عضواً</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <span className="relative z-10 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">حجم العمليات</span>
                        <div className="relative z-10 flex items-end gap-2">
                            <h3 className="text-4xl font-black text-slate-900">{stats.totalOrders}</h3>
                            <span className="text-xs font-bold text-slate-400 mb-1.5 uppercase">طلباً</span>
                        </div>
                    </div>

                     <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <span className="relative z-10 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">التواجد الجغرافي</span>
                        <div className="relative z-10 flex items-end gap-2">
                            <h3 className="text-4xl font-black text-slate-900">{stats.mappedBranches}</h3>
                            <span className="text-xs font-bold text-slate-400 mb-1.5 uppercase">خريطة</span>
                        </div>
                    </div>
                </div>

                {/* Intelligence Map Section */}
                <div className="bg-slate-900 p-8 rounded-[3rem] shadow-3xl overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                    <div className="flex items-center justify-between mb-8 px-4">
                        <div>
                            <h3 className="text-2xl font-black text-white mb-1 tracking-tight">التوزيع اللوجستي للمراكز</h3>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">تغطية المحافظات اليمنية في الوقت الفعلي</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">نظام تتبع مباشر</span>
                        </div>
                    </div>
                    <div className="rounded-[2.5rem] overflow-hidden border-8 border-white/5 shadow-inner">
                        <BranchesMap branches={branches} height="480px" />
                    </div>
                </div>

                {/* Branches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {branches.map((branch) => (
                        <div key={branch.id} className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-2 h-full bg-slate-50 transition-all group-hover:bg-blue-600" />
                            
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 inline-block">ID: #{branch.id}</div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1 leading-none">{branch.branch_name}</h3>
                                    <p className="text-lg font-bold text-blue-600 italic tracking-tight">{branch.location_city}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                                    <svg className="w-8 h-8 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>

                            {branch.manager_name && (
                                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8 transition-colors group-hover:border-blue-100 group-hover:bg-white">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">المدير المسئول</p>
                                        <p className="font-black text-slate-900 text-base">{branch.manager_name}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-3 mb-8">
                                <div className="text-center p-3 bg-slate-50 rounded-3xl border border-slate-50 transition-all hover:bg-white hover:shadow-xl">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">الموظفين</p>
                                    <p className="text-xl font-black text-slate-900 leading-none">{branch.users_count}</p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-3xl border border-slate-50 transition-all hover:bg-white hover:shadow-xl">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">السلع</p>
                                    <p className="text-xl font-black text-slate-900 leading-none">{branch.products_count}</p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-3xl border border-slate-50 transition-all hover:bg-white hover:shadow-xl">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">الطلبيات</p>
                                    <p className="text-xl font-black text-slate-900 leading-none">{branch.orders_count}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 pt-6 border-t-2 border-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{branch.currency?.currency_code_en || 'USD'}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => openEdit(branch)}
                                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all transform active:scale-95"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button 
                                        onClick={() => deleteBranch(branch)}
                                        className="p-3 bg-slate-50 text-rose-300 rounded-xl hover:bg-rose-600 hover:text-white transition-all transform active:scale-95"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {branches.length === 0 && (
                        <div className="col-span-full text-center py-24 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
                             <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                             </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">لا توجد فروع مسجلة حالياً</h3>
                            <p className="text-slate-400 font-bold tracking-tight">ابدأ بإضافة أول فرع لإدارته وتتبع عملياته</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="تأسيس مركز لوجستي جديد" maxWidth="2xl">
                <form onSubmit={submitAdd} className="p-8">
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">اسم الفرع الفني *</label>
                                    <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-xl font-black text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all outline-none shadow-inner" value={addForm.data.branch_name} onChange={e => addForm.setData('branch_name', e.target.value)} required />
                                    {addForm.errors.branch_name && <p className="text-xs font-black text-rose-500 mt-2 uppercase">{addForm.errors.branch_name}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">المحافظة / الموقع *</label>
                                    <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-xl font-black text-slate-900 focus:bg-white focus:border-blue-600 transition-all outline-none" value={addForm.data.location_city} onChange={e => addForm.setData('location_city', e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">المدير المسئول</label>
                                    <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-xl font-black text-slate-900 focus:bg-white focus:border-blue-600 transition-all outline-none" value={addForm.data.manager_name} onChange={e => addForm.setData('manager_name', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">العملة الافتراضية *</label>
                                    <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-xl font-black text-slate-900 focus:bg-white focus:border-blue-600 transition-all outline-none appearance-none cursor-pointer" value={addForm.data.currency_id} onChange={e => addForm.setData('currency_id', e.target.value)} required>
                                        <option value="">اختر العملة</option>
                                        {currencies.map(c => (
                                            <option key={c.id} value={c.id}>{c.currency_name} ({c.currency_code_en})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">التموضع الجغرافي (Map Picker)</label>
                                <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">تحديد GPS</span>
                            </div>
                            <div className="rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-2xl">
                                <MapPicker
                                    lat={addForm.data.branch_lat}
                                    lng={addForm.data.branch_lon}
                                    onLocationChange={(lat, lng) => {
                                        addForm.setData(prev => ({ ...prev, branch_lat: lat, branch_lon: lng }));
                                    }}
                                    height="300px"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-8">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 rounded-2xl bg-slate-50 text-slate-400 font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-100 transition-all">إلغاء العملية</button>
                            <button type="submit" disabled={addForm.processing} className="flex-[2] py-5 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-600 shadow-xl disabled:opacity-50 transition-all transform active:scale-95">
                                {addForm.processing ? 'جاري تأسيس المركز...' : 'تأكيد وحفظ الفرع'}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title={`تعديل بيانات — ${editingBranch?.branch_name}`} maxWidth="2xl">
                {editingBranch && (
                    <form onSubmit={submitEdit} className="p-8">
                        <div className="space-y-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">اسم الفرع الفني *</label>
                                        <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-xl font-black text-slate-900 focus:bg-white focus:border-blue-600 transition-all outline-none shadow-inner" value={editForm.data.branch_name} onChange={e => editForm.setData('branch_name', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">المحافظة / الموقع *</label>
                                        <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-xl font-black text-slate-900 focus:bg-white focus:border-blue-600 transition-all outline-none" value={editForm.data.location_city} onChange={e => editForm.setData('location_city', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">المدير المسئول</label>
                                        <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-xl font-black text-slate-900 focus:bg-white focus:border-blue-600 transition-all outline-none" value={editForm.data.manager_name} onChange={e => editForm.setData('manager_name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">العملة الافتراضية *</label>
                                        <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-xl font-black text-slate-900 focus:bg-white focus:border-blue-600 transition-all outline-none appearance-none cursor-pointer" value={editForm.data.currency_id} onChange={e => editForm.setData('currency_id', e.target.value)} required>
                                            <option value="">اختر العملة</option>
                                            {currencies.map(c => (
                                                <option key={c.id} value={c.id}>{c.currency_name} ({c.currency_code_en})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block text-center">تعديل التموضع الجغرافي</label>
                                <div className="rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-2xl">
                                    <MapPicker
                                        lat={editForm.data.branch_lat}
                                        lng={editForm.data.branch_lon}
                                        onLocationChange={(lat, lng) => {
                                            editForm.setData(prev => ({ ...prev, branch_lat: lat, branch_lon: lng }));
                                        }}
                                        height="300px"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-8">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-5 rounded-2xl bg-slate-50 text-slate-400 font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-100 transition-all">إلغاء التعديل</button>
                                <button type="submit" disabled={editForm.processing} className="flex-[2] py-5 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-600 shadow-xl disabled:opacity-50 transition-all transform active:scale-95">
                                    {editForm.processing ? 'جاري الحفظ...' : 'تحديث بيانات المركز'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </Modal>
        </AdminLayout>
    );
}
