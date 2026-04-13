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
        <AdminLayout user={auth.user} header="لوحة التحكم">
            <Head title="لوحة التحكم" />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4 md:gap-6 mb-8">
                {/* YEM Sales Card */}
                <div className="stat-card p-4 md:p-6 bg-surface-lowest rounded-[1.5rem] md:rounded-[2rem] border-2 border-outline-variant shadow-xl group hover:border-secondary transition-all duration-500">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <span className="text-[10px] md:text-xs font-black text-on-surface-variant uppercase tracking-widest group-hover:text-secondary">مبيعات يمني</span>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-black text-[9px] md:text-[10px] group-hover:bg-secondary group-hover:text-white transition-all shadow-sm">YEM</div>
                    </div>
                    <div className="text-xl md:text-3xl font-black text-on-surface transition-colors tracking-tighter">{stats?.sales_yer || '0'}</div>
                    <div className="text-[9px] md:text-[10px] font-black text-on-surface-variant/40 mt-1 md:mt-2 uppercase tracking-[0.2em]">ريال يمني</div>
                </div>

                {/* SAR Sales Card */}
                <div className="stat-card p-4 md:p-6 bg-surface-lowest rounded-[1.5rem] md:rounded-[2rem] border-2 border-outline-variant shadow-xl group hover:border-emerald-500 transition-all duration-500">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <span className="text-[10px] md:text-xs font-black text-on-surface-variant uppercase tracking-widest group-hover:text-emerald-500">مبيعات سعودي</span>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-[9px] md:text-[10px] group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">SAR</div>
                    </div>
                    <div className="text-xl md:text-3xl font-black text-on-surface transition-colors tracking-tighter">{stats?.sales_sar || '0'}</div>
                    <div className="text-[9px] md:text-[10px] font-black text-on-surface-variant/40 mt-1 md:mt-2 uppercase tracking-[0.2em]">ريال سعودي</div>
                </div>

                {/* USD Sales Card */}
                <div className="stat-card p-4 md:p-6 bg-surface-lowest rounded-[1.5rem] md:rounded-[2rem] border-2 border-outline-variant shadow-xl group hover:border-amber-500 transition-all duration-500">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <span className="text-[10px] md:text-xs font-black text-on-surface-variant uppercase tracking-widest group-hover:text-amber-500">مبيعات دولار</span>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-[9px] md:text-[10px] group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">USD</div>
                    </div>
                    <div className="text-xl md:text-3xl font-black text-on-surface transition-colors tracking-tighter">{stats?.sales_usd || '0'}</div>
                    <div className="text-[9px] md:text-[10px] font-black text-on-surface-variant/40 mt-1 md:mt-2 uppercase tracking-[0.2em]">دولار أمريكي</div>
                </div>

                <div className="stat-card p-4 md:p-6 bg-surface-lowest rounded-[1.5rem] md:rounded-[2rem] border-2 border-outline-variant shadow-xl group hover:border-secondary transition-all duration-500">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <span className="text-[10px] md:text-xs font-black text-on-surface-variant uppercase tracking-widest group-hover:text-secondary">طلبات نشطة</span>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-secondary animate-pulse"></div>
                    </div>
                    <div className="text-xl md:text-3xl font-black text-on-surface transition-colors tracking-tighter">{ordersCount}</div>
                    <div className="text-[9px] md:text-[10px] font-black text-on-surface-variant/40 mt-1 md:mt-2 uppercase tracking-[0.2em]">قيد المعالجة</div>
                </div>

                <div className="stat-card p-4 md:p-6 bg-surface-lowest rounded-[1.5rem] md:rounded-[2rem] border-2 border-outline-variant shadow-xl group hover:border-secondary transition-all duration-500">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <span className="text-[10px] md:text-xs font-black text-on-surface-variant uppercase tracking-widest group-hover:text-secondary">إجمالي المنتجات</span>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-on-surface/5 text-on-surface-variant flex items-center justify-center group-hover:bg-on-surface group-hover:text-surface transition-all">
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                    </div>
                    <div className="text-xl md:text-3xl font-black text-on-surface transition-colors tracking-tighter">{productsCount}</div>
                    <div className="text-[9px] md:text-[10px] font-black text-on-surface-variant/40 mt-1 md:mt-2 uppercase tracking-[0.2em]">صنف مسجل</div>
                </div>

                <div className="stat-card p-4 md:p-6 bg-surface-lowest rounded-[1.5rem] md:rounded-[2rem] border-2 border-outline-variant shadow-xl group hover:border-primary transition-all duration-500">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <span className="text-[10px] md:text-xs font-black text-on-surface-variant uppercase tracking-widest group-hover:text-primary">قاعدة العملاء</span>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                    </div>
                    <div className="text-xl md:text-3xl font-black text-on-surface transition-colors tracking-tighter">{customersCount}</div>
                    <div className="text-[9px] md:text-[10px] font-black text-on-surface-variant/40 mt-1 md:mt-2 uppercase tracking-[0.2em]">عميد مسجل</div>
                </div>
            </div>


            {/* Interactive Intelligence Map */}
            <div className="card-editorial mb-8 overflow-hidden rounded-[2.5rem] border-2 border-outline-variant shadow-2xl">
                <div className="bg-surface-lowest px-8 py-6 border-b-2 border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-black text-on-surface flex items-center gap-3 tracking-tighter">
                        <div className="w-2 h-6 bg-secondary rounded-full animate-pulse"></div>
                        خارطة التوزيع الميداني - الذكاء اللوجستي
                    </h3>
                    <div className="flex items-center gap-6">
                        <Link href={route('branches.index')} className="text-[10px] font-black text-on-surface-variant hover:text-secondary transition-colors uppercase tracking-[0.2em]">إدارة الفروع</Link>
                        <Link href={route('customers.index')} className="text-[10px] font-black text-on-surface-variant hover:text-primary transition-colors uppercase tracking-[0.2em]">إدارة العملاء</Link>
                    </div>
                </div>
                <div className="p-4 bg-surface-lowest relative">
                    <BranchesMap 
                        branches={branches} 
                        customers={customers} 
                        stats={stats}
                        height="520px" 
                    />
                </div>
            </div>


            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="card-editorial xl:col-span-2 overflow-hidden rounded-[2.5rem] border-2 border-outline-variant shadow-2xl bg-surface">
                    <div className="px-8 py-6 border-b-2 border-outline-variant flex items-center justify-between bg-surface-lowest/50">
                        <h3 className="text-xl font-black text-on-surface tracking-tighter">سجل أحدث الطلبات</h3>
                        <Link href={route('orders.index')} className="text-xs font-black text-secondary hover:bg-secondary/5 px-6 py-3 rounded-2xl transition-all uppercase tracking-widest border-2 border-outline-variant">المزيد من التفاصيل ←</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead className="bg-surface-lowest border-b-2 border-outline-variant">
                                <tr>
                                    <th className="px-4 md:px-8 py-5 text-[10px] md:text-xs font-black text-on-surface-variant uppercase tracking-widest text-right">الرقم المرجعي</th>
                                    <th className="px-4 md:px-8 py-5 text-[10px] md:text-xs font-black text-on-surface-variant uppercase tracking-widest text-right">العميل</th>
                                    <th className="px-4 md:px-8 py-5 text-[10px] md:text-xs font-black text-on-surface-variant uppercase tracking-widest text-right">المبلغ</th>
                                    <th className="px-4 md:px-8 py-5 text-[10px] md:text-xs font-black text-on-surface-variant uppercase tracking-widest text-center">حالة الطلب</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-outline-variant">
                                {recentOrders?.length > 0 ? recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-surface-lowest/50 transition-colors">
                                        <td className="px-4 md:px-8 py-4 md:py-6 font-black text-on-surface text-base md:text-lg">{order.reference_number}</td>
                                        <td className="px-4 md:px-8 py-4 md:py-6">
                                            <div className="font-black text-on-surface text-sm md:text-base">{order.customer?.name}</div>
                                            <div className="text-[9px] md:text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{USER_TYPES[order.customer?.user_type]?.label}</div>
                                        </td>
                                        <td className="px-4 md:px-8 py-4 md:py-6 font-black text-base md:text-lg text-on-surface">{formatCurrency(order.final_amount)}</td>
                                        <td className="px-4 md:px-8 py-4 md:py-6 text-center"><StatusBadge status={order.order_status} /></td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="text-center py-12 text-on-surface-variant/20 font-black uppercase tracking-widest">لا توجد سجلات حالية للاستعراض</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* Quick Actions */}
                <div className="card-editorial overflow-hidden rounded-[2.5rem] border-2 border-outline-variant shadow-2xl bg-surface-lowest transition-all hover:shadow-secondary/5">
                    <div className="px-8 py-6 border-b-2 border-outline-variant bg-surface-lowest">
                        <h3 className="text-xl font-black text-on-surface tracking-tighter">إجراءات سريعة</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <Link href={route('orders.index')} className="w-full text-right flex items-center gap-4 p-5 rounded-[1.5rem] bg-surface-low border-2 border-outline-variant hover:border-secondary hover:bg-surface-lowest transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-secondary group-hover:text-surface transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            </div>
                            <div className="flex-1">
                                <div className="text-base font-black text-on-surface mb-0.5">طلب بيع جديد</div>
                                <div className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">إنشاء فاتورة فورية</div>
                            </div>
                        </Link>
                        
                        <Link href={route('inventory.index')} className="w-full text-right flex items-center gap-4 p-5 rounded-[1.5rem] bg-surface-low border-2 border-outline-variant hover:border-emerald-500 hover:bg-surface-lowest transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-surface transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                            </div>
                            <div className="flex-1">
                                <div className="text-base font-black text-on-surface mb-0.5">إدارة المخزون</div>
                                <div className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">تحديث الأصناف والكميات</div>
                            </div>
                        </Link>

                        <Link href={route('branches.index')} className="w-full text-right flex items-center gap-4 p-5 rounded-[1.5rem] bg-surface-low border-2 border-outline-variant hover:border-primary hover:bg-surface-lowest transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-surface transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4z" clipRule="evenodd" /></svg>
                            </div>
                            <div className="flex-1">
                                <div className="text-base font-black text-on-surface mb-0.5">إدارة الفروع</div>
                                <div className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">توسيع نطاق العمل</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
