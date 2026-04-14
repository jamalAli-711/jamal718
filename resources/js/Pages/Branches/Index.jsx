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
        addForm.post(route('branches.store'), { onSuccess: () => { setShowAddModal(false); addForm.reset(); }, });
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
        editForm.put(route('branches.update', editingBranch.id), { onSuccess: () => setShowEditModal(false), });
    };

    const deleteBranch = (branch) => {
        if (confirm(`هل أنت متأكد من حذف فرع "${branch.branch_name}"؟`)) {
            router.delete(route('branches.destroy', branch.id));
        }
    };

    return (
        <AdminLayout user={auth.user} header="مركز العمليات">
            <Head title="لوجستيات الفروع — مراقبة النخبة" />

            <div className="pb-32 animate-in fade-in duration-1000" dir="rtl">
                
                {/* VIP Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 p-10 bg-white/[0.01] rounded-[4rem] border border-white/5 shadow-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full text-amber-500 tracking-[0.4em] text-[10px] font-black uppercase">
                            التحكم اللوجستي العالمي
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                        </div>
                        <h2 className="text-6xl font-black text-white tracking-tighter leading-none">إدارة المراكز اللوجستية</h2>
                        <p className="text-white/20 font-bold text-xl italic pr-6 border-r-4 border-amber-400/20">تتبع حي للمواقع، المدراء، والتدفق العملياتي لمنظومة النخبة.</p>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="group px-12 py-6 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black rounded-[2rem] flex items-center gap-4 shadow-2xl shadow-amber-400/20 hover:scale-105 active:scale-95 transition-all relative z-10">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        <span className="text-xs uppercase tracking-[0.2em]">إضافة فرع جديد</span>
                    </button>
                </div>

                {/* VIP Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    <StatCard label="إجمالي المراكز" value={stats.totalBranches} unit="فرعاً" icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} color="text-amber-400" />
                    <StatCard label="الطاقم البشري" value={stats.totalUsers} unit="عضواً" icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} color="text-blue-500" />
                    <StatCard label="مؤشر العمليات" value={stats.totalOrders} unit="طلباً" icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} color="text-emerald-500" />
                    <StatCard label="رسم الخرائط" value={stats.mappedBranches} unit="موقعاً" icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>} color="text-purple-500" />
                </div>

                {/* Intelligence Map Section */}
                <div className="bg-[#0c0c0e] p-12 rounded-[4rem] border border-white/5 shadow-3xl overflow-hidden relative mb-16 group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase whitespace-nowrap">خريطة المراكز الجغرافية</h3>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">تغطية وطنية شاملة للمراكز المعتمدة</p>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/5 rounded-full">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-pulse" />
                            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none">بث مباشر</span>
                        </div>
                    </div>
                    <div className="rounded-[3rem] overflow-hidden border border-white/10 shadow-inner grayscale-[0.8] hover:grayscale-0 transition-all duration-1000">
                        <BranchesMap branches={branches} height="520px" />
                    </div>
                </div>

                {/* Branches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {branches.map((branch) => (
                        <div key={branch.id} className="bg-[#111114] p-10 rounded-[4rem] border border-white/5 group hover:border-white/10 transition-all duration-700 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-white/5 group-hover:bg-amber-400 transition-all duration-1000" />
                            
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <div className="px-4 py-1.5 bg-white/[0.03] rounded-full text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 inline-block">VAULT_REF: #{branch.id}</div>
                                    <h3 className="text-4xl font-black text-white tracking-tighter mb-1 leading-none group-hover:text-amber-400 transition-colors uppercase">{branch.branch_name}</h3>
                                    <p className="text-xl font-bold text-amber-500/60 italic tracking-tight">{branch.location_city}</p>
                                </div>
                                <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                                    <svg className="w-8 h-8 text-white/10 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>

                            {branch.manager_name && (
                                <div className="flex items-center gap-5 bg-white/[0.01] p-6 rounded-[2rem] border border-white/5 mb-10">
                                    <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center shadow-2xl shadow-amber-400/20">
                                        <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] leading-none mb-1">مدير الفرع</p>
                                        <p className="font-black text-white text-xl tracking-tight leading-none">{branch.manager_name}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4 mb-10">
                                <Metric value={branch.users_count} label="طاقم" />
                                <Metric value={branch.products_count} label="أصناف" />
                                <Metric value={branch.orders_count} label="طلبات" />
                            </div>

                            <div className="flex items-center justify-between gap-6 pt-8 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{branch.currency?.currency_code_en || 'غير محدد'}</span>
                                </div>
                                <div className="flex gap-3">
                                    <OpButton onClick={() => openEdit(branch)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} color="blue-400" />
                                    <OpButton onClick={() => deleteBranch(branch)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} color="rose-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            ` }} />
        </AdminLayout>
    );
}

function StatCard({ label, value, unit, icon, color }) {
    return (
        <div className="group bg-[#111114] p-12 rounded-[4rem] border border-white/5 hover:border-white/10 transition-all duration-700 shadow-2xl relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-1000 ${color}`}>{icon}</div>
            <div className="relative z-10 flex flex-col gap-6">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{label}</span>
                <div className="flex items-baseline gap-4">
                    <span className="text-6xl font-black text-white tracking-tighter leading-none">{value}</span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${color}`}>{unit}</span>
                </div>
            </div>
        </div>
    );
}

function Metric({ value, label }) {
    return (
        <div className="text-center p-5 bg-white/[0.02] border border-white/5 rounded-[2rem] transition-all hover:bg-white/[0.04]">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">{label}</p>
            <p className="text-2xl font-black text-white leading-none tracking-tighter">{value}</p>
        </div>
    );
}

function OpButton({ onClick, icon, color }) {
    return (
        <button 
            onClick={onClick} 
            className={`w-12 h-12 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-center text-white/20 hover:text-${color} hover:border-${color}/20 transition-all active:scale-90`}
        >
            {icon}
        </button>
    );
}
