import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function FleetList({ trucks = [], drivers = [] }) {
    const { auth } = usePage().props;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTruck, setSelectedTruck] = useState(null);

    const { data, setData, post, patch, delete: destroy, processing, errors, reset } = useForm({
        truck_number: '',
        driver_id: '',
        gps_device_id: '',
        status: 'Idle',
    });

    const openEditModal = (truck) => {
        setSelectedTruck(truck);
        setData({
            truck_number: truck.truck_number || '',
            driver_id: truck.driver_id || '',
            gps_device_id: truck.gps_device_id || '',
            status: truck.status || 'Idle',
        });
        setShowCreateModal(true);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setSelectedTruck(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (selectedTruck) {
            patch(route('fleet.manage.update', selectedTruck.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('fleet.manage.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteTruck = (id) => {
        if (confirm('هل أنت متأكد من حذف هذه المركبة من النظام؟')) {
            router.delete(route('fleet.manage.destroy', id));
        }
    };

    return (
        <AdminLayout user={auth.user} header="إدارة شاحنات الأسطول">
            <Head title="Fleet Management - Vehicles" />

            <div className="pb-24" dir="rtl">
                
                {/* Header Action Part */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 p-8 bg-white/[0.01] rounded-[3rem] border border-white/5 shadow-2xl">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-white tracking-tighter">سجل المركبات</h2>
                        <p className="text-white/20 font-bold text-sm">إدارة الأصول الثابتة، أجهزة التتبع، وتعيين السائقين.</p>
                    </div>
                    <button 
                        onClick={() => { reset(); setShowCreateModal(true); }}
                        className="px-8 py-4 bg-amber-400 hover:bg-amber-500 text-black font-black rounded-2xl flex items-center gap-3 shadow-xl transition-all"
                    >
                        <span>+ إضافة مركبة جديدة</span>
                    </button>
                </div>

                {/* Fleet Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {trucks.map(truck => (
                        <div key={truck.id} className="group bg-[#0c0c0e]/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-8 hover:border-amber-400/30 transition-all shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-24 h-24 bg-white/[0.02] rounded-br-[4rem] group-hover:bg-amber-400/5 transition-colors" />
                            
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-4 bg-white/[0.03] rounded-2xl text-3xl group-hover:scale-110 transition-transform">🚚</div>
                                <div className="flex flex-col items-end">
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${truck.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : (truck.status === 'Maintenance' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-500/10 text-slate-400')}`}>
                                        {truck.status === 'Active' ? 'نشط ميدانياً' : (truck.status === 'Maintenance' ? 'في الصيانة' : 'متاح / انتظار')}
                                    </span>
                                    <span className="text-[10px] text-white/20 mt-2 font-bold uppercase tracking-widest">ID: {truck.id}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tighter mb-1">{truck.truck_number}</h3>
                                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">جهاز التتبع: {truck.gps_device_id || 'غير مثبت'}</p>
                                </div>
                                
                                <div className="pt-4 border-t border-white/5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-500 font-black text-xs">
                                        {truck.driver?.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-none mb-1">السائق المعين</p>
                                        <p className="text-sm font-bold text-white/60">{truck.driver?.name || 'لم يتم التعيين'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-white/5">
                                <button onClick={() => openEditModal(truck)} className="flex-grow py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5">تعديل البيانات</button>
                                <button onClick={() => deleteTruck(truck.id)} className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create/Edit Modal */}
                <Modal show={showCreateModal} onClose={closeModal} title={selectedTruck ? 'تعديل بيانات المركبة' : 'تسجيل مركبة جديدة'} maxWidth="md">
                    <form onSubmit={submit}>
                        <Modal.Body className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">رقم اللوحة / الكود</label>
                                <input 
                                    type="text"
                                    value={data.truck_number}
                                    onChange={e => setData('truck_number', e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-400 transition-all font-bold"
                                    placeholder="مثلاً: ص ن 5566"
                                    required
                                />
                                {errors.truck_number && <p className="text-rose-500 text-[10px] font-bold">{errors.truck_number}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">معرف جهاز الـ GPS</label>
                                <input 
                                    type="text"
                                    value={data.gps_device_id}
                                    onChange={e => setData('gps_device_id', e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-400 transition-all font-bold"
                                    placeholder="ID فريد لجهاز التتبع"
                                />
                                {errors.gps_device_id && <p className="text-rose-500 text-[10px] font-bold">{errors.gps_device_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">تعيين السائق</label>
                                <select 
                                    value={data.driver_id}
                                    onChange={e => setData('driver_id', e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white appearance-none cursor-pointer focus:border-amber-400"
                                >
                                    <option value="" className="bg-[#0c0c0e]">بدون سائق حالياً</option>
                                    {drivers.map(driver => (
                                        <option key={driver.id} value={driver.id} className="bg-[#0c0c0e]">{driver.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">الحالة التشغيلية</label>
                                <select 
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white appearance-none cursor-pointer focus:border-amber-400"
                                >
                                    <option value="Idle" className="bg-[#0c0c0e]">Idle (انتظار)</option>
                                    <option value="Active" className="bg-[#0c0c0e]">Active (نشط)</option>
                                    <option value="Maintenance" className="bg-[#0c0c0e]">Maintenance (صيانة)</option>
                                </select>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" onClick={closeModal} className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">إلغاء</button>
                            <button type="submit" disabled={processing} className="px-10 py-4 bg-amber-400 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                                {selectedTruck ? 'تحديث البيانات' : 'حفظ المركبة'}
                            </button>
                        </Modal.Footer>
                    </form>
                </Modal>

            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .modal-content { background: #0c0c0e; border: 1px solid rgba(255,255,255,0.05); }
            `}} />
        </AdminLayout>
    );
}
