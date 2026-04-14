import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import StatusBadge from '@/Components/StatusBadge';
import { formatCurrency } from '@/constants';

export default function OrderShow({ order }) {
    const { flash } = usePage().props;

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('ar-SA', options);
    };

    return (
        <CustomerLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shadow-glow p-8 bg-white/[0.01] rounded-[3rem] border border-white/5">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.4em]">Transaction Vault</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        </div>
                        <h2 className="font-black text-4xl text-white tracking-tighter leading-none">
                            تفاصيل الطلب <span className="text-amber-400">#{order.reference_number}</span>
                        </h2>
                    </div>
                    <Link href={route('customer.orders')} className="group px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black text-white/60 hover:text-white uppercase tracking-[0.2em] transition-all flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                        العودة للسجل
                    </Link>
                </div>
            }
        >
            <Head title={`Elite Transaction ${order.reference_number}`} />

            <div className="pb-32" dir="rtl">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    
                    {flash?.success && (
                        <div className="mb-12 bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2.5rem] flex items-center gap-6 animate-in slide-in-from-top-4 duration-700">
                            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">Confirmed</span>
                                <span className="font-black text-xl text-white tracking-tight">{flash.success}</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        
                        <div className="lg:col-span-8 space-y-12">
                            {/* Elite Admin Notice */}
                            {order.admin_note && (
                                <div className="bg-rose-500/10 border border-rose-500/20 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
                                    <div className="flex items-center gap-4 mb-6 text-rose-500">
                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Executive Feedback</span>
                                    </div>
                                    <h4 className="text-2xl font-black text-white mb-3 tracking-tighter">بيان من Sales Dept:</h4>
                                    <p className="text-rose-400 leading-loose font-bold text-lg italic pr-6 border-r-2 border-rose-500/20">{order.admin_note}</p>
                                </div>
                            )}

                            {/* Luxury Item List */}
                            <div className="bg-[#0c0c0e]/60 backdrop-blur-3xl rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl">
                                <div className="p-12 border-b border-white/5 flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2 block">Inventory Manifest</span>
                                        <h3 className="font-black text-4xl text-white tracking-tighter leading-none">الأصناف الحصرية</h3>
                                    </div>
                                    <div className="transform scale-125">
                                        <StatusBadge status={order.order_status} />
                                    </div>
                                </div>
                                
                                <div className="divide-y divide-white/[0.03]">
                                    {(order.order_items || []).map((item, index) => (
                                        <div key={index} className="p-12 flex items-center gap-10 group transition-all hover:bg-white/[0.01]">
                                            <div className="w-28 h-28 bg-white/[0.02] border border-white/5 rounded-[2rem] shrink-0 flex items-center justify-center p-6 shadow-inner group-hover:scale-110 transition-transform duration-700">
                                                {item.product?.thumbnail ? (
                                                    <img src={item.product.thumbnail} alt={item.product?.name} className="object-contain w-full h-full grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000" />
                                                ) : (
                                                    <div className="text-white/5"><svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="text-3xl font-black text-white group-hover:text-amber-400 transition-all leading-none mb-2">{item.product?.name || 'Unknown Article'}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <span className="px-5 py-2 bg-white/5 border border-white/5 rounded-full text-[11px] font-black text-amber-400 uppercase tracking-widest">
                                                                Qty: {item.quantity} • {item.product_unit?.unit?.unit_name || 'Unit'}
                                                            </span>
                                                            {item.is_gift && <span className="px-5 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full text-[11px] font-black text-amber-400 uppercase tracking-widest">Complimentary Gift</span>}
                                                        </div>
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-3xl font-black text-white leading-none">{formatCurrency(item.item_total, '')}<span className="text-xs text-white/20 mr-1 uppercase tracking-widest">{order.currency?.currency_code_ar}</span></div>
                                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mt-2 block">Net Value</span>
                                                    </div>
                                                </div>
                                                {item.notes && (
                                                    <div className="text-sm text-white/30 font-medium italic mt-4 pr-4 border-r border-white/10 uppercase tracking-tight">Manual Inst: {item.notes}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {order.notes && (
                                    <div className="p-12 bg-amber-400/5 border-t border-white/5">
                                        <div className="flex items-center gap-3 mb-6">
                                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em]">Customer Instruction</span>
                                        </div>
                                        <p className="text-white/60 leading-loose italic text-xl font-medium pr-8 border-r-2 border-amber-400/20">"{order.notes}"</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-12">
                            {/* VIP Portofolio Summary */}
                            <div className="bg-[#111114] p-12 rounded-[4rem] border border-white/5 space-y-10 shadow-3xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-400/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                                
                                <div>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 block">Settlement Abstract</span>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end border-b border-white/[0.03] pb-6">
                                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">Inventory Value</span>
                                            <span className="text-xl font-black text-white">{formatCurrency(order.total_price, order.currency?.currency_code_ar)}</span>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-white/[0.03] pb-6">
                                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">Delivery Premium</span>
                                            <span className="text-lg font-black text-emerald-500 uppercase tracking-widest">Waived</span>
                                        </div>
                                        <div className="pt-6">
                                            <span className="text-[10px] font-black text-amber-400/60 uppercase tracking-[0.3em] mb-3 block">Consolidated Due</span>
                                            <div className="text-6xl font-black text-white tracking-tighter leading-none whitespace-nowrap">
                                                {formatCurrency(order.final_amount, '')}
                                                <span className="text-sm font-black text-white/20 uppercase mr-3 tracking-widest">{order.currency?.currency_code_ar}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata Card */}
                            <div className="bg-[#0c0c0e] p-12 rounded-[4rem] border border-white/5 space-y-10">
                                <div>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6 block">Transaction Metadata</span>
                                    <dl className="space-y-8">
                                        <div>
                                            <dt className="text-[10px] font-black text-amber-400/40 uppercase tracking-widest mb-2">Vault Entry Date</dt>
                                            <dd className="font-black text-white text-xl tracking-tight leading-none">{formatDate(order.created_at)}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-[10px] font-black text-amber-400/40 uppercase tracking-widest mb-3">Lifecycle Stage</dt>
                                            <dd className="transform scale-110 origin-right"><StatusBadge status={order.order_status} /></dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                            
                            {/* Concierge Support */}
                            <div className="bg-amber-400 text-black p-12 rounded-[4rem] text-center shadow-[0_40px_80px_-15px_rgba(251,191,36,0.2)] group overflow-hidden relative">
                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-black/10 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-700">
                                        <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    </div>
                                    <h4 className="text-3xl font-black mb-2 tracking-tighter">VIP Concierge</h4>
                                    <p className="text-black/60 mb-10 font-bold italic text-lg leading-snug">مدير حسابك الخاص متاح الآن لمساعدتك في استكمال إجراءات الطلب.</p>
                                    <a href="tel:770000000" className="block w-full py-6 bg-black text-amber-400 font-black rounded-[2rem] text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl">
                                        Request Callback
                                    </a>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
