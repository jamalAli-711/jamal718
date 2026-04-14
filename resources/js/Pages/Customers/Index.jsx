import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, customers, stats, branches, filters }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleBranchChange = (e) => {
        router.get(route('customers.index'), { branch_id: e.target.value }, { preserveState: true });
    };

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.phone?.includes(searchQuery)
    );

    return (
        <AdminLayout user={auth.user} header="سجل العملاء">
            <Head title="سجل العملاء — إدارة النخبة" />

            <div className="pb-32 animate-in fade-in duration-1000" dir="rtl">
                
                {/* VIP Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 p-10 bg-white/[0.01] rounded-[4rem] border border-white/5 shadow-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full text-amber-500 tracking-[0.4em] text-[10px] font-black uppercase">
                            قاعدة بيانات عملاء النخبة
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                        </div>
                        <h2 className="text-6xl font-black text-white tracking-tighter leading-none">إدارة سجل العملاء</h2>
                        <p className="text-white/20 font-bold text-xl italic pr-6 border-r-4 border-amber-400/20">تحليل القوة الشرائية وتصنيف شركاء النجاح في المنظومة.</p>
                    </div>
                </div>

                {/* VIP Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
                    <StatCard 
                        label="إجمالي المبيعات" 
                        value={stats.total_sales.toLocaleString()} 
                        unit={stats.currency_symbol} 
                        icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="text-amber-400"
                    />
                    <StatCard 
                        label="عمليات الشراء" 
                        value={stats.total_orders} 
                        unit="عملية" 
                        icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                        color="text-blue-500"
                    />
                    <StatCard 
                        label="قاعدة العملاء" 
                        value={stats.total_customers} 
                        unit="عميل" 
                        icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        color="text-purple-500"
                    />
                </div>

                {/* VIP Search/Filters */}
                <div className="bg-[#0c0c0e]/80 backdrop-blur-3xl rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl mb-10">
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div className="flex-1 w-full relative">
                            <input 
                                type="text" 
                                placeholder="ابحث في سجلات النخبة..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)} 
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-12 py-5 text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all text-right"
                            />
                            <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <div className="relative w-full md:w-80">
                            <select 
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm font-black text-white/60 focus:outline-none transition-all cursor-pointer appearance-none" 
                                value={filters.branch_id || ''} 
                                onChange={handleBranchChange}
                            >
                                <option value="" className="bg-[#111114]">كافة الفروع</option>
                                {branches.map(b => <option key={b.id} value={b.id} className="bg-[#111114]">{b.branch_name}</option>)}
                            </select>
                            <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    {/* Elite Table */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-white/[0.02]">
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">اسم العميل</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">نوع الحساب</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">الفرع</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">عدد الطلبات</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-left">إجمالي المشتريات</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">عرض البيانات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-12 py-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[1.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center text-amber-400 text-2xl font-black shadow-inner group-hover:scale-110 transition-transform duration-700">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-2xl font-black text-white tracking-tighter group-hover:text-amber-400 transition-colors leading-none">{customer.name}</span>
                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                                                        <svg className="w-3.5 h-3.5 text-amber-500/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                        {customer.phone || 'DECRYPTED_NULL'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10 text-center">
                                            <span className="px-5 py-2 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-black text-white/60 uppercase tracking-[0.2em] group-hover:text-amber-400 transition-all">
                                                {customer.user_type_label}
                                            </span>
                                        </td>
                                        <td className="px-12 py-10 text-center">
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                                                {customer.branch?.branch_name || 'Global HQ'}
                                            </span>
                                        </td>
                                        <td className="px-12 py-10 text-center">
                                            <div className="inline-flex items-center justify-center min-w-[50px] px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/5 text-xl font-black text-blue-400 group-hover:scale-125 transition-transform">
                                                {customer.orders_count}
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex items-baseline justify-end gap-2">
                                                <span className="text-3xl font-black text-white tracking-tighter">{parseFloat(customer.total_spent).toLocaleString()}</span>
                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{stats.currency_symbol}</span>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10 text-center">
                                            <Link 
                                                href={route('customers.show', customer.id)}
                                                className="w-14 h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-white/20 hover:text-amber-400 hover:border-amber-400/20 transition-all group/btn shadow-xl mx-auto"
                                            >
                                                <svg className="w-6 h-6 group-hover/btn:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-12 py-40 text-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="w-24 h-24 bg-white/[0.02] rounded-full flex items-center justify-center border-2 border-dashed border-white/5">
                                                     <svg className="w-10 h-10 text-white/5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                </div>
                                                <span className="text-2xl font-black text-white/10 uppercase tracking-[0.4em]">لا توجد نتائج</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
                    <span className={`text-sm font-black uppercase tracking-[0.2em] ${color}`}>{unit}</span>
                </div>
            </div>
        </div>
    );
}
