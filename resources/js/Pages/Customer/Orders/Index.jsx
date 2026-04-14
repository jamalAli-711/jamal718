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
            header="سجل المعاملات الحصرية"
        >
            <Head title="VIP Portfolio — تاريخ الطلبات" />

            <div className="pb-32" dir="rtl">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-20">
                    
                    {/* VIP Analytics Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="group bg-[#111114] p-10 rounded-[2.5rem] border border-white/5 hover:border-amber-400/20 transition-all duration-700 shadow-2xl">
                            <div className="flex justify-between items-start mb-10">
                                <div className="w-16 h-16 bg-blue-400/10 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner border border-blue-400/20">📦</div>
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Total Portfolio</span>
                            </div>
                            <div className="text-5xl font-black text-white mb-2 leading-none">{stats.total_orders}</div>
                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest opacity-60">إجمالي الطلبات المُنفذة</div>
                        </div>
                        
                        <div className="group bg-[#111114] p-10 rounded-[2.5rem] border border-white/5 hover:border-amber-400/20 transition-all duration-700 shadow-2xl">
                            <div className="flex justify-between items-start mb-10">
                                <div className="w-16 h-16 bg-amber-400/10 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner border border-amber-400/20">⏳</div>
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Processing</span>
                            </div>
                            <div className="text-5xl font-black text-white mb-2 leading-none">{stats.pending_orders}</div>
                            <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest opacity-60">طلبات في انتظار التدقيق</div>
                        </div>

                        <div className="group bg-[#111114] p-10 rounded-[2.5rem] border border-white/5 hover:border-amber-400/20 transition-all duration-700 shadow-2xl">
                            <div className="flex justify-between items-start mb-10">
                                <div className="w-16 h-16 bg-emerald-400/10 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner border border-emerald-400/20">💎</div>
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Total Value</span>
                            </div>
                            <div className="text-5xl font-black text-white mb-2 leading-none whitespace-nowrap">
                                {stats.total_spent.toLocaleString()} <span className="text-sm font-black text-white/20">ريال</span>
                            </div>
                            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest opacity-60">القيمة الاستثمارية الكلية</div>
                        </div>
                    </div>
                    
                    {/* Orders Ledger */}
                    <div className="bg-[#0c0c0e]/80 backdrop-blur-3xl rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl">
                        <div className="p-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-right">
                                <div className="inline-flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                    <span className="text-[10px] font-black text-amber-400/60 uppercase tracking-[0.4em]">Official Vault Records</span>
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tighter">قائمة المعاملات السابقة</h3>
                            </div>
                            <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5 text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">
                                Registry Entry: {orders ? orders.length : 0} Items
                            </div>
                        </div>

                        {orders && orders.length > 0 ? (
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-right border-collapse">
                                    <thead>
                                        <tr className="bg-white/[0.01]">
                                            <th className="px-12 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Ref No.</th>
                                            <th className="px-12 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Date & Time</th>
                                            <th className="px-12 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] text-center">Volume</th>
                                            <th className="px-12 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Net Worth</th>
                                            <th className="px-12 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] text-center">Status</th>
                                            <th className="px-12 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="px-12 py-10 whitespace-nowrap">
                                                    <span className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors tracking-tighter">#{order.reference_number}</span>
                                                </td>
                                                <td className="px-12 py-10">
                                                    <div className="text-sm font-bold text-white/60">{formatDate(order.created_at)}</div>
                                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Transaction Logged</div>
                                                </td>
                                                <td className="px-12 py-10 text-center">
                                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-amber-400 font-black text-sm">
                                                        {order.order_items ? order.order_items.length : 0}
                                                    </div>
                                                </td>
                                                <td className="px-12 py-10">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <div className="text-2xl font-black text-white tracking-tight">
                                                            {Number(order.final_amount).toLocaleString()} 
                                                            <span className="text-[10px] text-white/30 uppercase tracking-widest mr-2">{order.currency?.currency_code_ar}</span>
                                                        </div>
                                                        <div className="h-0.5 w-8 bg-amber-400/20 group-hover:w-full transition-all duration-700" />
                                                    </div>
                                                </td>
                                                <td className="px-12 py-10 text-center">
                                                    <div className="inline-block transform scale-110">
                                                        <StatusBadge status={order.order_status} />
                                                    </div>
                                                </td>
                                                <td className="px-12 py-10 text-center">
                                                    <Link 
                                                        href={route('customer.orders.show', order.id)} 
                                                        className="relative inline-flex items-center justify-center px-8 py-4 bg-white/5 hover:bg-amber-400 hover:text-black rounded-2xl border border-white/10 hover:border-amber-400 text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 group/btn shadow-xl"
                                                    >
                                                        Details
                                                        <svg className="w-4 h-4 mr-3 transform group-hover/btn:-translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-40 text-center bg-white/[0.01]">
                                <div className="w-32 h-32 bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center mx-auto mb-12 shadow-inner group">
                                    <svg className="w-16 h-16 text-white/5 group-hover:text-amber-400/20 transition-all duration-1000" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                </div>
                                <h3 className="text-4xl font-black text-white mb-6 tracking-tighter">لا توجد سجلات حالياً</h3>
                                <p className="text-white/30 text-lg font-medium max-w-sm mx-auto mb-16 italic">"لم يتم توثيق أي معاملة نخبة لهذا الحساب. ابدأ التميز من المعرض الحصري."</p>
                                <Link href={route('customer.storefront')} className="inline-block px-12 py-6 bg-amber-400 text-black font-black rounded-[2rem] text-xs uppercase tracking-[0.4em] shadow-2xl shadow-amber-400/20 hover:scale-105 transition-all active:scale-95">
                                    GO TO GALLERY
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .shadow-glow { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3); }
            ` }} />
        </CustomerLayout>
    );
}
