import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function StaffIndex({ staff = [], types = [] }) {
    const { auth } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    const { data, setData, post, patch, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        user_type: types[0]?.value || '',
    });

    const filteredStaff = staff.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             member.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || member.user_type == filterType;
        return matchesSearch && matchesFilter;
    });

    const openCreateModal = () => {
        reset();
        setSelectedStaff(null);
        setShowModal(true);
    };

    const openEditModal = (member) => {
        setSelectedStaff(member);
        setData({
            name: member.name,
            email: member.email,
            phone: member.phone || '',
            user_type: member.user_type,
            password: '', // Keep empty for update unless changed
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (selectedStaff) {
            patch(route('staff.update', selectedStaff.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('staff.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteStaff = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا الموظف؟ سيؤدي ذلك لفقده الوصول للنظام.')) {
            router.delete(route('staff.destroy', id));
        }
    };

    return (
        <AdminLayout user={auth.user} header="إدارة الموظفين الميدانيين">
            <Head title="Staff Management - Field Team" />

            <div className="pb-24 animate-in fade-in duration-1000" dir="rtl">
                
                {/* Search & Filter Bar */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 p-8 bg-white/[0.01] rounded-[3rem] border border-white/5 shadow-2xl">
                    <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
                        <div className="relative">
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="بحث بالاسم أو البريد..."
                                className="w-full md:w-80 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-400 font-bold transition-all pr-12"
                            />
                            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <select 
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold appearance-none cursor-pointer focus:border-amber-400"
                        >
                            <option value="all" className="bg-[#0c0c0e]">الكل</option>
                            {types.map(t => <option key={t.value} value={t.value} className="bg-[#0c0c0e]">{t.label}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="w-full lg:w-auto px-10 py-5 bg-amber-400 hover:bg-amber-500 text-black font-black rounded-2xl flex justify-center items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        <span>+ إضافة موظف جديد</span>
                    </button>
                </div>

                {/* Staff Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredStaff.map(member => (
                        <div key={member.id} className="group bg-[#0c0c0e]/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-8 hover:border-amber-400/30 transition-all shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-white/[0.02] rounded-br-[5rem] group-hover:bg-amber-400/5 transition-colors" />
                            
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-amber-400/10 to-transparent border border-amber-400/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                                    {member.user_type == 9 ? '🚚' : (member.user_type == 8 ? '💼' : '📦')}
                                </div>
                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${member.user_type == 9 ? 'bg-blue-500/10 text-blue-400' : (member.user_type == 8 ? 'bg-purple-500/10 text-purple-400' : 'bg-orange-500/10 text-orange-400')}`}>
                                    {types.find(t => t.value == member.user_type)?.label}
                                </span>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tighter mb-1 truncate">{member.name}</h3>
                                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] truncate">{member.email}</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 text-white/40">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        <span className="text-xs font-bold">{member.phone || 'بدون رقم هاتف'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/40">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span className="text-xs font-bold font-mono">تاريخ الانضمام: {new Date(member.created_at).toLocaleDateString('ar-YE')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <button onClick={() => openEditModal(member)} className="text-xs font-black text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors">تعديل الملف</button>
                                <button onClick={() => deleteStaff(member.id)} className="w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white flex items-center justify-center transition-all border border-rose-500/10">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredStaff.length === 0 && (
                        <div className="md:col-span-2 xl:col-span-3 py-24 text-center bg-white/[0.01] rounded-[3rem] border border-white/5 border-dashed">
                             <p className="text-white/20 font-black text-xl italic pr-6">لا يوجد موظفين يطابقون معايير البحث.</p>
                        </div>
                    )}
                </div>

                {/* Staff Modal */}
                <Modal show={showModal} onClose={closeModal} title={selectedStaff ? 'تعديل بيانات الموظف' : 'إدارة موظف جديد'} maxWidth="md">
                    <form onSubmit={submit}>
                        <Modal.Body className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">الاسم الكامل</label>
                                <input 
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-400 font-bold appearance-none"
                                    required
                                />
                                {errors.name && <p className="text-rose-500 text-[10px] font-bold">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">البريد الإلكتروني</label>
                                    <input 
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-400 font-bold"
                                        required
                                    />
                                    {errors.email && <p className="text-rose-500 text-[10px] font-bold">{errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">رقم الهاتف</label>
                                    <input 
                                        type="text"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-400 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">نوع الموظف / الرتبة</label>
                                <select 
                                    value={data.user_type}
                                    onChange={e => setData('user_type', e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white appearance-none cursor-pointer focus:border-amber-400"
                                >
                                    {types.map(t => <option key={t.value} value={t.value} className="bg-[#0c0c0e]">{t.label}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">{selectedStaff ? 'تغيير كلمة المرور (اختياري)' : 'كلمة المرور'}</label>
                                <input 
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-400 font-bold"
                                    required={!selectedStaff}
                                />
                                {errors.password && <p className="text-rose-500 text-[10px] font-bold">{errors.password}</p>}
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" onClick={closeModal} className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest transition-all">إلغاء</button>
                            <button type="submit" disabled={processing} className="px-12 py-5 bg-amber-400 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-amber-400/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                                {selectedStaff ? 'تحديث البيانات' : 'اعتماد التعيين'}
                            </button>
                        </Modal.Footer>
                    </form>
                </Modal>

            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .modal-content { background: #0c0c0e; border: 1px solid rgba(255,255,255,0.05); }
                select { background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff33' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: left 1rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-left: 2.5rem; }
            `}} />
        </AdminLayout>
    );
}
