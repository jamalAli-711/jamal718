import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link } from '@inertiajs/react';

export default function CustomerDashboard({ auth, recentOrders, stats }) {
    return (
        <CustomerLayout
            header={<h2 className="font-black text-2xl text-[#031633] tracking-tight">لوحة التحكم</h2>}
        >
            <Head title="لوحة تحكم العميل" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                            <div className="text-3xl font-black text-[#031633] group-hover:text-white transition-colors">{stats.total_spent.toLocaleString()} <small className="text-sm">ريال</small></div>
                            <div className="text-xs font-bold text-gray-400 group-hover:text-white/40">إجمالي قيمة المشتريات</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Welcome & Actions */}
                        <div className="card-editorial relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#031633] to-[#0058be]"></div>
                            <div className="p-10 text-gray-900 relative z-10">
                                <span className="text-[10px] font-black text-[#0058be] uppercase tracking-[0.3em] mb-4 block">Welcome back</span>
                                <h3 className="text-4xl font-black mb-4 text-[#031633] leading-tight">أهلاً بك يا {auth.user.name.split(' ')[0]}! 🌟</h3>
                                <p className="text-gray-500 mb-10 text-lg leading-relaxed max-w-md">
                                    استمتع بتجربة تسوق فريدة ومبسطة من خلال لوحة التحكم الخاصة بك. تابع طلباتك لحظة بلحظة.
                                </p>
                                
                                <div className="flex flex-wrap gap-4">
                                    <Link href={route('customer.storefront')} className="btn-primary px-8">
                                        تصفح المتجر
                                    </Link>
                                    <Link href={route('customer.orders')} className="btn-secondary px-8">
                                        سجل الطلبات
                                    </Link>
                                </div>
                            </div>
                            {/* Decorative background element */}
                            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-gray-50 rounded-full group-hover:scale-110 transition-transform duration-700 opacity-50"></div>
                        </div>

                        {/* Recent Orders List */}
                        <div className="card-editorial flex flex-col">
                            <div className="p-8 pb-4 flex justify-between items-end">
                                <div>
                                    <span className="text-[10px] font-black text-[#0058be] uppercase tracking-[0.3em] mb-1 block">Activity</span>
                                    <h3 className="font-black text-2xl text-[#031633]">آخر الطلبات</h3>
                                </div>
                                <Link href={route('customer.orders')} className="text-sm font-bold text-[#0058be] hover:underline mb-1">عرض الكل</Link>
                            </div>
                            <div className="flex-1">
                                {recentOrders.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {recentOrders.map(order => (
                                            <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                                <div>
                                                    <div className="font-bold text-gray-900">{order.reference_number}</div>
                                                    <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('ar-SA')}</div>
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-emerald-600">{order.final_amount.toLocaleString()} ريال</div>
                                                    <div className="text-xs text-gray-400">{(order.order_items || []).length} أصناف</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-400 text-sm">
                                        لا توجد طلبات حديثة
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
