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
        <AdminLayout
            user={auth.user}
            header="إدارة العملاء"
        >
            <Head title="إدارة العملاء" />

            <div className="space-y-8 animate-slide-in">
                {/* Stats Grid - Using Global stat-card styles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="stat-card border-r-4 border-blue-600 relative overflow-hidden">
                         <div className="flex justify-between items-start">
                            <div>
                                <p className="text-on-surface-variant text-xs font-black uppercase tracking-widest mb-1">إجمالي المبيعات</p>
                                <h3 className="text-3xl font-black text-on-surface">{stats.total_sales}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                         </div>
                         <div className="mt-4 flex items-center gap-1">
                            <span className="text-[10px] font-black uppercase bg-blue-50/10 text-secondary px-2 py-0.5 rounded-md">{stats.currency_symbol}</span>
                            <span className="text-[10px] font-bold text-on-surface-variant">القيمة بالعملة الافتراضية</span>
                         </div>
                    </div>

                    <div className="stat-card border-r-4 border-emerald-500">
                         <div className="flex justify-between items-start">
                            <div>
                                <p className="text-on-surface-variant text-xs font-black uppercase tracking-widest mb-1">عدد الطلبات</p>
                                <h3 className="text-3xl font-black text-on-surface">{stats.total_orders}</h3>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1">
                            <span className="text-[10px] font-bold text-on-surface-variant">إجمالي الحركات المفعلة</span>
                        </div>
                    </div>

                    <div className="stat-card border-r-4 border-slate-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-on-surface-variant text-xs font-black uppercase tracking-widest mb-1">إجمالي العملاء</p>
                                <h3 className="text-3xl font-black text-on-surface">{stats.total_customers}</h3>
                            </div>
                            <div className="p-3 bg-on-surface/5 rounded-2xl text-on-surface">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1">
                            <span className="text-[10px] font-bold text-on-surface-variant">جميع الفئات المسجلة</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="card-editorial min-h-[600px]">
                    {/* Filter Bar */}
                    <div className="p-8 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1 max-w-2xl flex items-center gap-3">
                            <div className="relative flex-1">
                                <input 
                                    type="text" 
                                    placeholder="بحث عن عميل بالاسم أو الهاتف..." 
                                    className="w-full bg-surface-lowest border-2 border-outline-variant rounded-2xl py-3.5 pr-12 pl-4 text-sm focus:ring-4 focus:ring-secondary/5 focus:border-secondary transition-all font-bold text-on-surface placeholder:text-on-surface-variant/30"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                            
                            <div className="relative">
                                <select 
                                    className="bg-surface-lowest border-2 border-outline-variant rounded-2xl py-3.5 pr-12 pl-6 text-sm focus:ring-4 focus:ring-secondary/5 focus:border-secondary transition-all font-black text-on-surface appearance-none min-w-[180px]"
                                    value={filters.branch_id || ''}
                                    onChange={handleBranchChange}
                                >
                                    <option value="">جميع الفروع</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.branch_name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="text-right">العميل</th>
                                    <th className="text-center">النوع</th>
                                    <th className="text-center">الفرع التابع</th>
                                    <th className="text-center">الطلبات</th>
                                    <th className="text-left">إجمالي المشتريات</th>
                                    <th className="w-10 text-left"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary text-lg font-black shadow-sm group-hover:scale-105 transition-transform">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-on-surface leading-tight mb-1">{customer.name}</span>
                                                    <span className="text-[11px] font-bold text-on-surface-variant tracking-wider flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                        {customer.phone || '--'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="badge-editorial bg-on-surface/5 text-on-surface font-black">
                                                {customer.user_type_label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-xs font-bold text-on-surface-variant">
                                                {customer.branch?.branch_name || 'غير محدد'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="inline-flex items-center justify-center min-w-[40px] px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-black">
                                                {customer.orders_count}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-baseline justify-end gap-1.5">
                                                <span className="text-base font-black text-on-surface">{parseFloat(customer.total_spent).toLocaleString()}</span>
                                                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{stats.currency_symbol}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-left">
                                            <Link 
                                                href={route('customers.show', customer.id)}
                                                className="p-2 rounded-xl text-on-surface-variant hover:bg-secondary hover:text-white transition-all shadow-sm flex items-center justify-center animate-slide-in"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-32 text-center text-gray-400 italic">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-6 bg-gray-50 rounded-full">
                                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                     </svg>
                                                </div>
                                                <span className="font-black text-slate-300">لم يتم العثور على أي نتائج مطابقة</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
