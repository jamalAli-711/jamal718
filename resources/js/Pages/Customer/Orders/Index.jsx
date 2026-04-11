import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link } from '@inertiajs/react';
import StatusBadge from '@/Components/StatusBadge';
import { formatCurrency } from '@/constants';

export default function OrdersIndex({ orders, stats }) {
    
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('ar-SA', options);
    };

    return (
        <CustomerLayout
            header={<h2 className="font-black text-2xl text-[#031633] tracking-tight">سجل الطلبات</h2>}
        >
            <Head title="طلباتي" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Stats Grid Merged from Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="stat-card group hover:bg-[#031633] transition-all duration-500">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-4 bg-blue-50 rounded-2xl text-2xl group-hover:bg-white/10 transition-colors">📦</div>
                                <span className="text-[10px] font-black text-[#0058be] uppercase tracking-widest group-hover:text-white/50">Total Orders</span>
                            </div>
                            <div className="text-3xl font-black text-[#031633] group-hover:text-white transition-colors">{stats.total_orders}</div>
                            <div className="text-xs font-bold text-gray-400 group-hover:text-white/40">إجمالي الطلبات المسجلة</div>
                        </div>
                        
                        <div className="stat-card group hover:bg-[#031633] transition-all duration-500">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-4 bg-amber-50 rounded-2xl text-2xl group-hover:bg-white/10 transition-colors">⏳</div>
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest group-hover:text-white/50">Pending</span>
                            </div>
                            <div className="text-3xl font-black text-[#031633] group-hover:text-white transition-colors">{stats.pending_orders}</div>
                            <div className="text-xs font-bold text-gray-400 group-hover:text-white/40">طلبات في انتظار المراجعة</div>
                        </div>

                        <div className="stat-card group hover:bg-[#031633] transition-all duration-500">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-4 bg-emerald-50 rounded-2xl text-2xl group-hover:bg-white/10 transition-colors">💰</div>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest group-hover:text-white/50">Invested</span>
                            </div>
                            <div className="text-3xl font-black text-[#031633] group-hover:text-white transition-colors">{stats.total_spent.toLocaleString()} <small className="text-sm font-bold">ريال</small></div>
                            <div className="text-xs font-bold text-gray-400 group-hover:text-white/40">إجمالي قيمة المشتريات</div>
                        </div>
                    </div>
                    
                    <div className="card-editorial overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-end">
                            <div>
                                <span className="text-[10px] font-black text-[#0058be] uppercase tracking-[0.3em] mb-1 block">تاريخ المعاملات</span>
                                <h3 className="font-black text-2xl text-[#031633]">قائمة طلباتك السابقة</h3>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-bold text-gray-400">إجمالي الطلبات: {orders ? orders.length : 0}</span>
                            </div>
                        </div>

                        {orders && orders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-right">
                                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-[#031633] uppercase tracking-widest">رقم المرجع</th>
                                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-[#031633] uppercase tracking-widest">تاريخ الطلب</th>
                                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-[#031633] uppercase tracking-widest text-center">الأصناف</th>
                                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-[#031633] uppercase tracking-widest">المبلغ الإجمالي</th>
                                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-[#031633] uppercase tracking-widest text-center">حالة الطلب</th>
                                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-[#031633] uppercase tracking-widest text-center">الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <span className="font-black text-[#031633] tracking-tighter text-lg">{order.reference_number}</span>
                                                </td>
                                                <td className="px-8 py-6 text-gray-500 font-medium">
                                                    {formatDate(order.created_at)}
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-[#031633] text-xs font-black">
                                                        {order.order_items ? order.order_items.length : 0}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-[#0058be] text-xl">{formatCurrency(order.final_amount, order.currency?.currency_code_ar)}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">الإجمالي الصافي</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <StatusBadge status={order.order_status} />
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <Link 
                                                        href={route('customer.orders.show', order.id)} 
                                                        className="btn-secondary py-2 px-6 inline-flex items-center gap-2 group-hover:bg-[#031633] group-hover:text-white transition-all"
                                                    >
                                                        التفاصيل
                                                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-24 text-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-black text-[#031633] mb-4">لا توجد طلبات بعد</h3>
                                <p className="text-gray-400 mb-10 max-w-sm mx-auto font-medium">لم تقم بإجراء أي طلب للآن. ابدأ رحلة التسوق واطلب منتجاتك المفضلة اليوم.</p>
                                <Link href={route('customer.storefront')} className="btn-primary px-10">
                                    اذهب للمتجر الآن
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </CustomerLayout>
    );
}
