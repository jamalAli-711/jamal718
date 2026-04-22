import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';

export default function CommissionAssignments({ agent, assignedCustomers = [], availableCustomers = [] }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState('');

    const filteredAvailable = availableCustomers.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    const assign = (customerId) => {
        router.post(route('commissions.assignments.store'), {
            agent_id: agent.id,
            customer_id: customerId
        });
    };

    const unassign = (customerId) => {
        if (confirm('هل أنت متأكد من فك ارتباط هذا الزبون بهذا المندوب؟')) {
            router.delete(route('commissions.assignments.destroy', { agentId: agent.id, customerId }));
        }
    };

    return (
        <AdminLayout user={auth.user} header={`إدارة زبائن المندوب: ${agent.name}`}>
            <Head title="Agent Assignments" />

            <div className="pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12" dir="rtl">
                
                {/* Available Customers */}
                <div className="space-y-8">
                    <div className="bg-[#0c0c0e]/80 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
                        <div className="absolute -left-10 -top-10 w-40 h-40 bg-amber-400/5 rounded-full blur-[4rem]" />
                        <h3 className="text-3xl font-black text-white tracking-tighter mb-2 relative z-10">الزبائن المتاحين</h3>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] relative z-10 italic">قم بتحديد الملكية الحصرية للزبون الميداني</p>
                    </div>

                    <div className="relative group">
                        <input 
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="البحث في قاعدة بيانات العملاء..."
                            className="w-full bg-[#0c0c0e]/50 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-5 text-white focus:border-amber-400 font-bold transition-all shadow-2xl pr-14"
                        />
                         <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 select-none">🔍</span>
                    </div>

                    <div className="bg-[#111114]/50 backdrop-blur-3xl rounded-[3rem] border border-white/5 overflow-hidden max-h-[600px] overflow-y-auto custom-scrollbar shadow-2xl">
                        <div className="divide-y divide-white/[0.03]">
                            {filteredAvailable.map(cust => (
                                <div key={cust.id} className="p-8 flex justify-between items-center hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 font-black text-xs group-hover:bg-amber-400 group-hover:text-black transition-all">
                                            {cust.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white tracking-tight">{cust.name}</h4>
                                            <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1">{cust.email}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => assign(cust.id)}
                                        className="px-6 py-3 bg-white/5 hover:bg-amber-400 text-white hover:text-black text-[9px] font-black uppercase tracking-widest rounded-xl border border-white/10 transition-all active:scale-90"
                                    >
                                        + ربط حصري
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Assigned Customers */}
                <div className="space-y-8">
                    <div className="bg-amber-400 p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(245,158,11,0.2)] relative overflow-hidden group">
                         <div className="absolute -right-8 -top-8 w-40 h-40 bg-black/5 rounded-full blur-[3rem]" />
                        <h3 className="text-3xl font-black text-black tracking-tighter mb-2 relative z-10">المحفظة الخاصة</h3>
                        <p className="text-[10px] text-black/40 font-bold uppercase tracking-[0.2em] relative z-10 italic">إجمالي {assignedCustomers.length} زبائن تحت إدارة {agent.name}</p>
                    </div>

                    <div className="bg-[#0c0c0e]/80 backdrop-blur-3xl rounded-[3rem] border border-amber-400/20 min-h-[500px] overflow-hidden shadow-2xl relative">
                        <div className="absolute inset-0 bg-amber-400/[0.01] pointer-events-none" />
                        <div className="divide-y divide-white/[0.03]">
                            {assignedCustomers.map(cust => (
                                <div key={cust.id} className="p-8 flex justify-between items-center hover:bg-amber-400/[0.02] transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-[1.5rem] bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-500 font-black text-lg group-hover:scale-110 transition-transform">
                                            {cust.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white tracking-tight text-lg">{cust.name}</h4>
                                            <p className="text-[9px] text-white/30 font-bold mt-1">تم الربط في: {new Date(cust.pivot?.created_at || Date.now()).toLocaleDateString('ar-YE')}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => unassign(cust.id)}
                                        className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all border border-rose-500/20 active:rotate-90"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                            {assignedCustomers.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-[500px] text-center p-12">
                                    <div className="text-6xl mb-6 opacity-20">📂</div>
                                    <p className="text-white/20 font-black italic tracking-widest uppercase text-xs">لا توجد ملكية مسجلة لهذا المندوب حالياً</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
