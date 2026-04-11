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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <div className="stat-card p-6 bg-white rounded-[2rem] border-2 border-slate-50 shadow-xl group hover:bg-[#031633] transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-white/40">إجمالي المبيعات</span>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-[10px] group-hover:bg-emerald-500 group-hover:text-white transition-colors">YEM</div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 group-hover:text-white transition-colors tracking-tighter">{stats?.totalSales || '0'}</div>
                    <div className="text-xs font-black text-slate-400 mt-2 uppercase tracking-wide group-hover:text-white/30">ريال يمني (إجمالي الفواتير)</div>
                </div>

                <div className="stat-card p-6 bg-white rounded-[2rem] border-2 border-slate-50 shadow-xl group hover:bg-[#0058be] transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-white/40">طلبات نشطة</span>
                        <div className="w-3 h-3 rounded-full bg-blue-500 group-hover:bg-white animate-pulse"></div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 group-hover:text-white transition-colors tracking-tighter">{ordersCount}</div>
                    <div className="text-xs font-black text-slate-400 mt-2 uppercase tracking-wide group-hover:text-white/30">قيد المعالجة حالياً</div>
                </div>

                <div className="stat-card p-6 bg-white rounded-[2rem] border-2 border-slate-50 shadow-xl group hover:bg-slate-900 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-white/40">إجمالي المنتجات</span>
                        <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center font-black group-hover:bg-white/10 group-hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 group-hover:text-white transition-colors tracking-tighter">{productsCount}</div>
                    <div className="text-xs font-black text-slate-400 mt-2 uppercase tracking-wide group-hover:text-white/30">صنف مسجل بالنظام</div>
                </div>

                <div className="stat-card p-6 bg-white rounded-[2rem] border-2 border-slate-50 shadow-xl group hover:bg-[#e31e24] transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-white/40">قاعدة العملاء</span>
                        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-black group-hover:bg-white/20 group-hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 group-hover:text-white transition-colors tracking-tighter">{customersCount}</div>
                    <div className="text-xs font-black text-slate-400 mt-2 uppercase tracking-wide group-hover:text-white/30">عملاء جملة وتجزئة</div>
                </div>
            </div>


            {/* Interactive Intelligence Map */}
            <div className="card-editorial mb-8 overflow-hidden rounded-[2.5rem] border-2 border-slate-50 shadow-2xl">
                <div className="bg-white px-8 py-5 border-b-2 border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full animate-pulse"></div>
                        خارطة التوزيع الميداني - الذكاء اللوجستي
                    </h3>
                    <div className="flex items-center gap-4">
                        <Link href={route('branches.index')} className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">إدارة الفروع</Link>
                        <Link href={route('customers.index')} className="text-[10px] font-black text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-[0.2em]">إدارة العملاء</Link>
                    </div>
                </div>
                <div className="p-4 bg-white relative">
                    <BranchesMap 
                        branches={branches} 
                        customers={customers} 
                        stats={stats}
                        height="520px" 
                    />
                </div>
            </div>


            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Recent Orders */}
                <div className="card-editorial xl:col-span-2 overflow-hidden rounded-[2.5rem] border-2 border-slate-50 shadow-2xl bg-white">
                    <div className="px-8 py-5 border-b-2 border-slate-50 flex items-center justify-between bg-white">
                        <h3 className="text-lg font-black text-slate-900">سجل أحدث الطلبات</h3>
                        <Link href={route('orders.index')} className="text-sm font-black text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest">المزيد من التفاصيل ←</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead className="bg-slate-50 border-b-2 border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">الرقم المرجعي</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">العميل</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">المبلغ</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">حالة الطلب</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-50">
                                {recentOrders?.length > 0 ? recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6 font-black text-slate-900 text-lg">{order.reference_number}</td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-slate-900 text-base">{order.customer?.name}</div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{USER_TYPES[order.customer?.user_type]?.label}</div>
                                        </td>
                                        <td className="px-8 py-6 font-black text-lg text-slate-900">{formatCurrency(order.final_amount)}</td>
                                        <td className="px-8 py-6 text-center"><StatusBadge status={order.order_status} /></td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="text-center py-12 text-slate-300 font-black uppercase tracking-widest">لا توجد سجلات حالية للاستعراض</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* Quick Actions */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-sm font-bold text-gray-800">إجراءات سريعة</h3>
                    </div>
                    <div className="card-body space-y-2">
                        <Link href={route('orders.index')} className="w-full text-right flex items-center gap-3 p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group">
                            <div className="w-9 h-9 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-800">طلب بيع جديد</div>
                                <div className="text-xs text-gray-400">إنشاء فاتورة</div>
                            </div>
                        </Link>
                        <Link href={route('inventory.index')} className="w-full text-right flex items-center gap-3 p-3 rounded-md border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-colors group">
                            <div className="w-9 h-9 rounded-md bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-800">إدارة المخزون</div>
                                <div className="text-xs text-gray-400">إضافة وتعديل الأصناف</div>
                            </div>
                        </Link>
                        <Link href={route('branches.index')} className="w-full text-right flex items-center gap-3 p-3 rounded-md border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-colors group">
                            <div className="w-9 h-9 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4z" clipRule="evenodd" /></svg>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-800">إدارة الفروع</div>
                                <div className="text-xs text-gray-400">إضافة فرع جديد</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
