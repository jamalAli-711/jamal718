import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import StatusBadge from '@/Components/StatusBadge';

export default function OrderShow({ order }) {
    const { flash } = usePage().props;

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('ar-SA', options);
    };

    return (
        <CustomerLayout
            header={
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-[10px] font-black text-[#0058be] uppercase tracking-[0.3em] mb-1 block">Reference No.</span>
                        <h2 className="font-black text-3xl text-[#031633] tracking-tighter">
                            {order.reference_number}
                        </h2>
                    </div>
                    <Link href={route('customer.orders')} className="btn-secondary py-2 px-6 flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                        العودة للطلبات
                    </Link>
                </div>
            }
        >
            <Head title={`الطلب ${order.reference_number}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {flash?.success && (
                        <div className="mb-10 bg-emerald-50 text-emerald-900 p-6 rounded-3xl flex items-center gap-4 animate-slide-in">
                            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest block opacity-50">Success</span>
                                <span className="font-black text-lg">{flash.success}</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        
                        <div className="lg:col-span-2 space-y-10">
                            {/* Admin Note / Rejection Reason */}
                            {order.admin_note && (
                                <div className="bg-rose-50 p-8 rounded-[40px] border-r-8 border-rose-500 shadow-sm animate-pulse-subtle">
                                    <div className="flex items-center gap-3 mb-4 text-rose-800">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Important Message</span>
                                    </div>
                                    <h4 className="text-2xl font-black text-rose-900 mb-2">بيان من إدارة المبيعات:</h4>
                                    <p className="text-rose-800 leading-relaxed font-bold text-lg">{order.admin_note}</p>
                                </div>
                            )}

                            {/* Items List */}
                            <div className="card-editorial overflow-hidden">
                                <div className="p-10 border-b border-gray-50 flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] font-black text-[#0058be] uppercase tracking-[0.3em] mb-1 block">Inventory</span>
                                        <h3 className="font-black text-2xl text-[#031633]">المنتجات المطلوبة</h3>
                                    </div>
                                    <StatusBadge status={order.order_status} />
                                </div>
                                
                                <div className="divide-y divide-gray-50">
                                    {(order.order_items || []).map((item, index) => (
                                        <div key={index} className="p-10 flex items-center gap-8 group transition-all hover:bg-gray-50/50">
                                            <div className="w-24 h-24 bg-[#fdfdfd] rounded-3xl shrink-0 flex items-center justify-center p-4 shadow-sm group-hover:scale-105 transition-transform duration-500">
                                                {item.product?.thumbnail ? (
                                                    <img src={item.product.thumbnail} alt={item.product?.name} className="object-contain w-full h-full" />
                                                ) : (
                                                    <div className="text-gray-100">
                                                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="text-2xl font-black text-[#031633] group-hover:text-[#0058be] transition-colors line-clamp-1">{item.product?.name || 'منتج غير معروف'}</h4>
                                                    <div className="text-right">
                                                        <span className="block text-[#0058be] text-2xl font-black">{Number(item.item_total).toLocaleString()}</span>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-[#0058be]/40">Subtotal</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="px-4 py-1.5 bg-gray-100 rounded-full text-xs font-black text-[#031633]">
                                                        {item.quantity} x {item.unit?.unit_name || 'حبة'}
                                                    </span>
                                                    {item.notes && (
                                                        <span className="text-xs text-gray-400 font-bold italic truncate max-w-xs">{item.notes}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {order.notes && (
                                    <div className="p-10 bg-[#031633] text-white">
                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-4 block">Your feedback</span>
                                        <h4 className="text-xl font-black mb-2 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-[#0058be]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            ملاحظاتك على هذا الطلب:
                                        </h4>
                                        <p className="text-white/80 leading-relaxed italic text-lg">{order.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-10">
                            {/* Payment Summary */}
                            <div className="card-editorial p-10 bg-gradient-to-br from-white to-gray-50/50">
                                <span className="text-[10px] font-black text-[#0058be] uppercase tracking-[0.3em] mb-6 block">Order Summary</span>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Products</span>
                                        <span className="text-xl font-black text-[#031633]">{Number(order.total_price).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Delivery Fee</span>
                                        <span className="text-lg font-black text-emerald-600">Free</span>
                                    </div>
                                    <div className="pt-4">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Grand Total</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black text-[#0058be] tracking-tighter">{Number(order.final_amount).toLocaleString()}</span>
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Yemen</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="card-editorial p-10">
                                <span className="text-[10px] font-black text-[#0058be] uppercase tracking-[0.3em] mb-6 block">Details</span>
                                <dl className="space-y-6">
                                    <div>
                                        <dt className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Created At</dt>
                                        <dd className="font-black text-[#031633] text-lg">{formatDate(order.created_at)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</dt>
                                        <dd className="mt-2"><StatusBadge status={order.order_status} /></dd>
                                    </div>
                                </dl>
                            </div>
                            
                            {/* Support CTA */}
                            <div className="bg-[#031633] p-10 rounded-[40px] text-center shadow-xl group overflow-hidden relative">
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8 text-[#0058be]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-2xl font-black text-white mb-2">هل تحتاج للمساعدة؟</h4>
                                    <p className="text-white/60 mb-8 font-medium italic">فريق الدعم الفني جاهز لخدمتكم 24/7</p>
                                    <a href="tel:770000000" className="btn-primary w-full py-4 text-lg">
                                        تواصل معنا
                                    </a>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
