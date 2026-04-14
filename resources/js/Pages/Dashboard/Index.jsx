import { useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import StatusBadge from '@/Components/StatusBadge';
import BranchesMap from '@/Components/BranchesMap';
import { useToast } from '@/Components/Toast';
import { formatCurrency, formatDate, USER_TYPES } from '@/constants';

export default function Dashboard({ auth, stats, ordersCount, productsCount, customersCount, recentOrders, branches, customers }) {
    const toast = useToast();
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    return (
        <AdminLayout user={auth.user} header="مركز القيادة">
            <Head title="لوحة التحكم الاستراتيجية — نخبة الإدارة" />

            <div className="pb-32 animate-in fade-in duration-1000" dir="rtl">
                
                {/* VIP Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 p-12 bg-white/[0.01] rounded-[4rem] border border-white/5 shadow-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-[180px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="relative z-10 space-y-5">
                        <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-amber-400/10 border border-amber-400/20 rounded-full text-amber-500 tracking-[0.5em] text-[10px] font-black uppercase">
                            وحدة الاستخبارات التشغيلية
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                        </div>
                        <h2 className="text-7xl font-black text-white tracking-tighter leading-none uppercase">منصة القيادة الاستراتيجية</h2>
                        <p className="text-white/20 font-bold text-2xl italic pr-8 border-r-4 border-amber-400/20 max-w-3xl">رصد شامل لتدفق السيولة، الأصول المخزنية، والتوسع الجغرافي للمنظومة في الوقت الفعلي.</p>
                    </div>
                </div>

                {/* VIP KPI Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-8 mb-16">
                    <KpiCard label="مبيعات يمني" value={stats?.sales_yer || '0'} unit="ريال يمني" color="text-amber-400" bg="bg-amber-400/5" />
                    <KpiCard label="مبيعات سعودي" value={stats?.sales_sar || '0'} unit="ريال سعودي" color="text-emerald-400" bg="bg-emerald-400/5" />
                    <KpiCard label="مبيعات دولار" value={stats?.sales_usd || '0'} unit="دولار" color="text-blue-400" bg="bg-blue-400/5" />
                    <KpiCard label="طلبات نشطة" value={ordersCount} unit="طلب" color="text-purple-400" bg="bg-purple-400/5" isPulse />
                    <KpiCard label="الأصناف المسجلة" value={productsCount} unit="صنف" color="text-white" bg="bg-white/5" />
                    <KpiCard label="قاعدة العملاء" value={customersCount} unit="عميل" color="text-amber-500" bg="bg-amber-500/5" />
                </div>

                {/* Intelligence Map Section */}
                <div className="bg-[#0c0c0e] rounded-[4.5rem] border border-white/5 shadow-3xl overflow-hidden mb-16 relative group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                    <div className="p-12 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <h3 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">ذكاء اللوجستيات الوطنية</h3>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">تحليل التوزيع الجغرافي للمراكز والعملاء</p>
                        </div>
                        <div className="flex items-center gap-8">
                            <Link href={route('branches.index')} className="px-8 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-amber-400 hover:border-amber-400/20 transition-all">إدارة الفروع</Link>
                            <Link href={route('customers.index')} className="px-8 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-emerald-400 hover:border-emerald-400/20 transition-all">قاعدة العملاء</Link>
                        </div>
                    </div>
                    <div className="p-8 relative">
                        <div className="rounded-[3.5rem] overflow-hidden border border-white/10 shadow-inner group-hover:border-white/20 transition-all duration-1000 grayscale-[0.8] hover:grayscale-0">
                            <BranchesMap branches={branches} customers={customers} stats={stats} height="600px" />
                        </div>
                        <div className="absolute bottom-16 right-16 p-6 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl z-10 space-y-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                             <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> <span className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none">المراكز الرئيسية (الفروع)</span></div>
                             <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /> <span className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none">العملاء والشركاء</span></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                    {/* Recent Transaction Ledger */}
                    <div className="xl:col-span-2 bg-[#0c0c0e] rounded-[4.5rem] border border-white/5 shadow-3xl overflow-hidden">
                        <div className="p-12 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase whitespace-nowrap">آخر المبيعات المسجلة</h3>
                            <Link href={route('orders.index')} className="px-10 py-5 bg-white/[0.03] border border-white/5 rounded-2xl text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-amber-400 hover:border-amber-400/20 transition-all">عرض كامل السجل</Link>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-right border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.02]">
                                        <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">رقم الطلب</th>
                                        <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">بيانات العميل</th>
                                        <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">قيمة المبيعة</th>
                                        <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">حالة الطلب</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {recentOrders?.length > 0 ? recentOrders.map((order) => (
                                        <tr key={order.id} className="group hover:bg-white/[0.01] transition-colors">
                                            <td className="px-12 py-10">
                                                <span className="text-2xl font-black text-white tracking-tighter group-hover:text-amber-400 transition-colors">#{order.reference_number}</span>
                                            </td>
                                            <td className="px-12 py-10">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-lg font-black text-white leading-none tracking-tight">{order.customer?.name}</span>
                                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{USER_TYPES[order.customer?.user_type]?.label} Network</span>
                                                </div>
                                            </td>
                                            <td className="px-12 py-10">
                                                <span className="text-2xl font-black text-white tracking-tighter">{formatCurrency(order.final_amount)}</span>
                                            </td>
                                            <td className="px-12 py-10 text-center">
                                                <div className="transform scale-90 opacity-60 group-hover:opacity-100 group-hover:scale-100 transition-all origin-center">
                                                    <StatusBadge status={order.order_status} />
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center py-24 text-white/5 font-black uppercase tracking-[0.6em]">لا توجد معاملات بعد</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Elite Quick Actions Grid */}
                    <div className="bg-[#0c0c0e] rounded-[4.5rem] border border-white/5 shadow-3xl overflow-hidden p-12 space-y-12">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] pb-6 border-b border-white/5">وصول سريع للبروتوكولات</h3>
                        <div className="flex flex-col gap-8">
                            <ActionCard 
                                href={route('orders.index')} 
                                title="إنشاء طلب بيع فوري" 
                                desc="تسوية مبيعات جديدة" 
                                color="amber-400" 
                                icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>} 
                            />
                            <ActionCard 
                                href={route('inventory.index')} 
                                title="إدارة الأصول والمخزون" 
                                desc="التحكم الشامل بالأصناف" 
                                color="emerald-400" 
                                icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} 
                            />
                            <ActionCard 
                                href={route('branches.index')} 
                                title="توسيع الشبكة والمراكز" 
                                desc="مراكز التوسع الجغرافي" 
                                color="blue-500" 
                                icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} 
                            />
                        </div>
                        <div className="pt-10 border-t border-white/5 flex justify-center">
                             <div className="w-32 h-1 bg-white/[0.02] rounded-full overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent animate-shimmer" />
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
                .animate-shimmer { animation: shimmer 3s infinite linear; }
            ` }} />
        </AdminLayout>
    );
}

function KpiCard({ label, value, unit, color, bg, isPulse }) {
    return (
        <div className={`group p-10 rounded-[4rem] border border-white/5 ${bg} hover:border-white/10 transition-all duration-700 shadow-2xl relative overflow-hidden`}>
            {isPulse && <div className="absolute top-0 right-0 p-10 opacity-10 animate-pulse"><div className={`w-3 h-3 rounded-full bg-current ${color}`} /></div>}
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block mb-6">{label}</span>
            <div className="flex items-baseline gap-4">
                <span className={`text-4xl font-black ${color} tracking-tighter leading-none group-hover:scale-110 transition-transform origin-right`}>{value}</span>
                <span className="text-[10px] font-black text-white/10 tracking-[0.3em] uppercase">{unit}</span>
            </div>
        </div>
    );
}

function ActionCard({ href, title, desc, color, icon }) {
    return (
        <Link href={href} className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group">
            <div className={`w-16 h-16 rounded-2xl bg-${color}/10 text-${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-2xl`}>{icon}</div>
            <div className="flex-1 text-right">
                <div className="text-xl font-black text-white mb-1 uppercase tracking-tight">{title}</div>
                <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">{desc}</div>
            </div>
        </Link>
    );
}
