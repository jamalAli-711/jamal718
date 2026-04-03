import { useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import StatusBadge from '@/Components/StatusBadge';
import BranchesMap from '@/Components/BranchesMap';
import { useToast } from '@/Components/Toast';
import { formatCurrency, formatDate } from '@/constants';

export default function Dashboard({ auth, stats, ordersCount, productsCount, customersCount, recentOrders, branches }) {
    const toast = useToast();
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    return (
        <AdminLayout user={auth.user} header="لوحة التحكم">
            <Head title="لوحة التحكم" />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="stat-card">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">إجمالي المبيعات</span>
                        <span className="text-green-600 bg-green-50 text-xs font-medium px-1.5 py-0.5 rounded">مُنجز</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats?.totalSales || '0'}</div>
                    <div className="text-xs text-gray-400 mt-1">ريال يمني</div>
                </div>
                <div className="stat-card">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">طلبات نشطة</div>
                    <div className="text-2xl font-bold text-gray-900">{ordersCount}</div>
                    <div className="text-xs text-gray-400 mt-1">قيد المعالجة والتوصيل</div>
                </div>
                <div className="stat-card">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">المنتجات</div>
                    <div className="text-2xl font-bold text-gray-900">{productsCount}</div>
                    <div className="text-xs text-gray-400 mt-1">صنف في المستودع</div>
                </div>
                <div className="stat-card">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">العملاء</div>
                    <div className="text-2xl font-bold text-gray-900">{customersCount}</div>
                    <div className="text-xs text-gray-400 mt-1">تاجر جملة وتجزئة</div>
                </div>
            </div>

            {/* Branches Map */}
            <div className="card mb-6">
                <div className="card-header">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        مواقع الفروع
                    </h3>
                    <Link href={route('branches.index')} className="text-xs font-medium text-blue-600 hover:text-blue-800">إدارة الفروع ←</Link>
                </div>
                <div className="p-3">
                    <BranchesMap branches={branches} height="380px" />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Recent Orders */}
                <div className="card xl:col-span-2">
                    <div className="card-header">
                        <h3 className="text-sm font-bold text-gray-800">آخر الطلبات</h3>
                        <Link href={route('orders.index')} className="text-xs font-medium text-blue-600 hover:text-blue-800">عرض الكل ←</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead><tr><th>المرجع</th><th>العميل</th><th>المبلغ</th><th>الحالة</th></tr></thead>
                            <tbody>
                                {recentOrders?.length > 0 ? recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="font-medium text-gray-900">{order.reference_number}</td>
                                        <td>{order.customer?.name}</td>
                                        <td className="font-medium">{formatCurrency(order.final_amount)}</td>
                                        <td><StatusBadge status={order.order_status} /></td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="text-center py-8 text-gray-400">لا توجد طلبات بعد</td></tr>
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
