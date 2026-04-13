import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function Show({ auth, customer, orders, stats, default_currency, status_options }) {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    const openInvoice = (order) => {
        setSelectedOrder(order);
        setIsInvoiceModalOpen(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredOrders = filterStatus === 'all' 
        ? orders 
        : orders.filter(o => o.order_status === parseInt(filterStatus));

    return (
        <AdminLayout
            user={auth.user}
            header={`ملف العميل: ${customer.name}`}
        >
            <Head title={`العميل | ${customer.name}`} />

            <div className="space-y-8 animate-slide-in">
                {/* 1. Customer Profile Header - High-end Banner */}
                <div className="card-editorial p-0 overflow-hidden relative border-none shadow-2xl">
                    <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-l from-blue-600 to-indigo-700" />
                    <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-28 h-28 rounded-[2rem] bg-on-surface/5 flex items-center justify-center text-on-surface text-4xl font-black shadow-xl shrink-0 group hover:rotate-3 transition-transform duration-500">
                            {customer.name.charAt(0)}
                        </div>
                        <div className="flex-1 text-center md:text-right space-y-3 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                <h2 className="text-3xl font-black text-on-surface truncate">{customer.name}</h2>
                                <span className="badge-editorial bg-secondary/10 text-secondary px-5 py-1.5 border border-outline-variant w-fit mx-auto md:mx-0">
                                    {customer.user_type_label || customer.user_type}
                                </span>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-bold text-on-surface-variant">
                                <span className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-surface-low flex items-center justify-center text-secondary">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C10.077 18 2 9.923 2 2V3z" />
                                        </svg>
                                    </div>
                                    {customer.phone || 'غير مسجل'}
                                </span>
                                <span className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-surface-low flex items-center justify-center text-secondary">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </div>
                                    <span className="truncate max-w-[200px]">{customer.email}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-surface-low flex items-center justify-center text-secondary">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1h3v10H5v1a1 1 0 102 0v-1h3v1a1 1 0 102 0v-1h3a1 1 0 100-2h-3V4h3V3a1 1 0 00-1-1H6zm4 2v10H7V4h3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    عضو منذ {new Date(customer.created_at).toLocaleDateString('ar-EG')}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                             <button className="btn-secondary whitespace-nowrap px-8">تصدير السجل</button>
                             <button className="btn-primary whitespace-nowrap px-8">تعديل البيانات</button>
                        </div>
                    </div>
                </div>

                {/* 2. Stats Grid - Responsive 3 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="stat-card border-r-4 border-secondary p-8">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-on-surface-variant text-[11px] font-black uppercase tracking-widest">إجمالي الإنفاق</span>
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                             <h4 className="text-3xl font-black text-on-surface tracking-tighter">{stats.total_spent}</h4>
                             <span className="text-xs font-black text-secondary tracking-widest uppercase opacity-70">{stats.currency_symbol}</span>
                        </div>
                    </div>

                    <div className="stat-card border-r-4 border-primary p-8">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-on-surface-variant text-[11px] font-black uppercase tracking-widest">عدد الطلبيات</span>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 100-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                </svg>
                            </div>
                        </div>
                        <h4 className="text-3xl font-black text-on-surface tracking-tighter">{stats.orders_count} <span className="text-base font-bold text-on-surface-variant">طلب</span></h4>
                    </div>

                    <div className="stat-card border-r-4 border-on-surface/30 p-8">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-on-surface-variant text-[11px] font-black uppercase tracking-widest">الفرع المخدم</span>
                            <div className="w-10 h-10 rounded-xl bg-on-surface/5 flex items-center justify-center text-on-surface">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <h4 className="text-xl font-black text-on-surface leading-tight">{customer.branch?.branch_name || 'غير محدد'}</h4>
                    </div>
                </div>

                {/* 3. Orders Section - High-end Table Card */}
                <div className="card-editorial min-h-[600px] shadow-2xl">
                    <div className="p-8 md:p-10 border-b border-outline-variant bg-surface-low/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-8 bg-on-surface rounded-full" />
                                <h3 className="text-2xl font-black text-on-surface">سجل طلبات العميل</h3>
                            </div>
                            
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 px-1">
                                <button 
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border-2
                                        ${filterStatus === 'all' ? 'bg-on-surface text-surface border-on-surface shadow-xl' : 'bg-surface-lowest text-on-surface-variant border-outline-variant hover:border-on-surface/20'}`}
                                >
                                    عرض الكل
                                </button>
                                {status_options.map(status => (
                                    <button 
                                        key={status.value}
                                        onClick={() => setFilterStatus(status.value)}
                                        className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-3 border-2
                                            ${filterStatus == status.value ? 'bg-secondary text-white border-secondary shadow-xl' : 'bg-surface-lowest text-on-surface-variant border-outline-variant hover:border-on-surface/20'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full 
                                            ${status.color === 'green' ? 'bg-emerald-500' :
                                              status.color === 'blue' ? 'bg-blue-500' :
                                              status.color === 'amber' ? 'bg-amber-500' :
                                              status.color === 'red' ? 'bg-red-500' :
                                              'bg-gray-400'}`} 
                                        />
                                        {status.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="text-right">رقم المرجع الفني</th>
                                    <th className="text-center">تاريخ الإصدار</th>
                                    <th className="text-center">الحالة التشغيلية</th>
                                    <th className="text-center">المستودع/الفرع</th>
                                    <th className="text-left font-black">القيمة النهائية</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                    <tr key={order.id} className="group transition-all duration-300">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-surface-low flex items-center justify-center text-on-surface-variant group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm font-black text-on-surface">ORD-{order.reference_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center text-xs font-bold text-on-surface-variant uppercase tracking-widest italic">
                                            {new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`badge-editorial px-4 py-1.5
                                                ${order.status_color === 'green' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' :
                                                  order.status_color === 'blue' ? 'bg-blue-50 text-blue-600 border border-blue-100/50' :
                                                  order.status_color === 'amber' ? 'bg-amber-50 text-amber-600 border border-amber-100/50' :
                                                  order.status_color === 'red' ? 'bg-red-50 text-red-600 border border-red-100/50' :
                                                  'bg-slate-100 text-slate-500'}`}>
                                                {order.status_label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-xs font-black text-on-surface-variant">{order.branch?.branch_name}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-baseline justify-end gap-1.5">
                                                <span className="text-lg font-black text-on-surface tracking-tighter">{parseFloat(order.converted_total).toLocaleString()}</span>
                                                <span className="text-[10px] font-black text-secondary tracking-widest uppercase opacity-60">{stats.currency_symbol}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-left">
                                            <button 
                                                onClick={() => openInvoice(order)}
                                                className="p-3 rounded-2xl bg-surface-low text-on-surface-variant hover:bg-on-surface hover:text-surface transition-all shadow-sm group-hover:shadow-lg"
                                                title="عرض السجل التفصيلي"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-32 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-30 grayscale">
                                                 <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                     </svg>
                                                 </div>
                                                 <p className="text-xl font-black text-slate-400 italic">لا توجد بيانات لهذه الفئة</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 4. Invoice Modal Redesign */}
            <Modal show={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} maxWidth="2xl">
                {selectedOrder && (
                    <div className="p-10 animate-slide-in relative">
                        {/* Status Watermark */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-12 pointer-events-none select-none">
                            <span className="text-[120px] font-black uppercase text-slate-900 leading-none">
                                {selectedOrder.status_label}
                            </span>
                        </div>

                        {/* Modal Header */}
                        <div className="flex justify-between items-start mb-12 pb-8 border-b border-outline-variant relative z-10">
                            <div>
                                <h2 className="text-3xl font-black text-on-surface mb-1 tracking-tighter">سند مبيعات مالي</h2>
                                <p className="text-xs font-black text-secondary tracking-[0.3em] uppercase opacity-70">CONFIRMED RECORD: #{selectedOrder.reference_number}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handlePrint} className="btn-primary py-3.5 px-10 text-xs shadow-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 012-2H5a2 2 0 012 2v3a2 2 0 002 2zm10-10V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    طباعة فورية
                                </button>
                                <button onClick={() => setIsInvoiceModalOpen(false)} className="w-12 h-12 rounded-2xl bg-surface-low text-on-surface-variant hover:bg-primary/20 hover:text-primary transition-all flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Metadata grid */}
                        <div className="grid grid-cols-2 gap-12 mb-12 relative z-10">
                            <div className="p-8 bg-surface-low/50 rounded-[2.5rem] border border-outline-variant shadow-inner">
                                <h4 className="text-[10px] font-black text-on-surface-variant tracking-widest uppercase italic mb-6">بيانات الطرف المستفيد</h4>
                                <div className="space-y-2">
                                    <p className="text-xl font-black text-on-surface">{customer.name}</p>
                                    <p className="text-sm font-bold text-on-surface-variant italic">هاتف: {customer.phone}</p>
                                    <p className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-tight">{customer.email}</p>
                                </div>
                            </div>
                            <div className="text-left flex flex-col justify-center items-end text-right">
                                <h4 className="text-[10px] font-black text-on-surface-variant tracking-widest uppercase italic mb-6">طابع التوثيق</h4>
                                <div className="space-y-3 text-sm font-black text-on-surface">
                                    <div className="flex items-center gap-3">
                                        <span className="opacity-40 italic">التاريخ المالي :</span>
                                        <span>{new Date(selectedOrder.created_at).toLocaleDateString('ar-EG')}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="opacity-40 italic">الفرع المصدّر :</span>
                                        <span className="text-secondary">{selectedOrder.branch?.branch_name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="opacity-40 italic">حالة السند :</span>
                                        <div className="bg-on-surface text-surface px-3 py-1 rounded-lg text-[10px] uppercase">{selectedOrder.status_label}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table In Modal */}
                        <div className="mb-12 overflow-hidden rounded-[2rem] border-2 border-outline-variant relative z-10 shadow-sm transition-all duration-500">
                            <table className="w-full text-right border-separate border-spacing-0">
                                <thead>
                                    <tr className="bg-on-surface text-surface">
                                        <th className="px-6 py-6 text-[10px] font-black tracking-[0.2em] border-none uppercase">اسم المنتج والوحدة</th>
                                        <th className="px-6 py-6 text-[10px] font-black tracking-[0.2em] border-none text-center uppercase">الكمية</th>
                                        <th className="px-6 py-6 text-[10px] font-black tracking-[0.2em] border-none text-left uppercase">سعر الوحدة</th>
                                        <th className="px-6 py-6 text-[10px] font-black tracking-[0.2em] border-none text-left uppercase">القيمة الكلية</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface-lowest">
                                    {selectedOrder.order_items.map((item, idx) => (
                                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-gray-50/20' : 'bg-white'}>
                                            <td className="px-6 py-5 border-b border-gray-50">
                                                <p className="text-base font-black text-slate-900 mb-0.5">{item.product.name}</p>
                                                <div className="inline-flex px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase">Unit: {item.product_unit?.unit?.unit_name}</div>
                                            </td>
                                            <td className="px-6 py-5 border-b border-gray-50 text-center">
                                                <span className="text-lg font-black text-slate-800">{item.quantity}</span>
                                            </td>
                                            <td className="px-6 py-5 border-b border-gray-50 text-left font-bold text-slate-500 italic">{parseFloat(item.unit_price).toLocaleString()}</td>
                                            <td className="px-6 py-5 border-b border-gray-50 text-left font-black text-base text-slate-900">
                                                {parseFloat(item.item_total).toLocaleString()} 
                                                <span className="text-[10px] font-black text-blue-600 opacity-30 mr-2">{selectedOrder.currency.currency_code_ar}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Totals Area */}
                        <div className="flex flex-col items-end gap-6 max-w-sm mr-auto ml-0 relative z-10 animate-slide-in">
                             <div className="flex justify-between items-center w-full px-8 py-5 bg-surface-low rounded-[1.5rem] border-2 border-outline-variant">
                                <span className="text-xs font-black text-on-surface-variant italic">إجمالي طلب العميل ({selectedOrder.currency.currency_code_ar})</span>
                                <span className="text-2xl font-black text-on-surface tracking-tighter">{parseFloat(selectedOrder.total_price).toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between items-center w-full px-8 py-8 bg-secondary rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                                <span className="text-xs font-black uppercase tracking-[0.3em] opacity-80 z-10">قيمة التحويل الموحدة</span>
                                <div className="flex items-baseline gap-2 z-10">
                                    <span className="text-4xl font-black italic tracking-tighter">{parseFloat(selectedOrder.converted_total).toLocaleString()}</span>
                                    <span className="text-xs font-black text-white/50 uppercase tracking-widest">{stats.currency_symbol}</span>
                                </div>
                             </div>
                        </div>

                        {/* Print Only Content (Hidden Ghost Node) */}
                        <div className="hidden print:block fixed inset-0 bg-white p-16 text-right" dir="rtl" id="print-area">
                            <div className="flex justify-between items-start mb-20 border-b-[12px] border-slate-900 pb-12">
                                <div className="space-y-2">
                                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">منظومـــة السحاب : المخــــلافي</h1>
                                    <p className="text-2xl font-bold text-slate-500 uppercase tracking-widest italic">رقم المستند المالي المعتمد: <span className="text-slate-900 font-black underline decoration-blue-600 decoration-8 underline-offset-8">ORD-{selectedOrder.reference_number}</span></p>
                                </div>
                                <div className="text-left font-black text-xs space-y-3 text-slate-400 uppercase tracking-[0.2em]">
                                    <p>التاريخ التشغيلي: {new Date(selectedOrder.created_at).toLocaleDateString('ar-EG')}</p>
                                    <p>مركز التصدير: {selectedOrder.branch?.branch_name}</p>
                                    <p>طريقة الدفع: نقدي / آجل</p>
                                </div>
                            </div>
                            
                            <div className="mb-24 flex justify-between items-stretch gap-12">
                                <div className="border-[6px] border-slate-50 p-12 rounded-[4rem] bg-gray-50/30 flex-1">
                                    <h3 className="text-[11px] font-black text-slate-300 mb-8 uppercase tracking-[0.5em] italic">بيانات العميل المعتمد لدى الموقع</h3>
                                    <div className="space-y-2">
                                        <p className="text-3xl font-black text-slate-900">{customer.name}</p>
                                        <p className="text-xl font-bold text-slate-600">رقم الاتصال: {customer.phone}</p>
                                        <p className="text-sm font-bold text-slate-400 mt-4">الفرع المسجل: {customer.branch?.branch_name}</p>
                                    </div>
                                </div>
                                <div className="w-1/3 flex flex-col justify-end text-left items-end space-y-6">
                                    <div className="w-24 h-2 bg-blue-600" />
                                    <p className="text-slate-500 font-bold text-lg leading-relaxed italic">يعد هذا السند وثيقة قانونية نهائية تثبت صحة المعاملة المالية والأصناف الواردة فيها وفقاً لسعر الصرف المعتمد في المنظومة.</p>
                                </div>
                            </div>

                            <table className="w-full mb-24 border-collapse overflow-hidden rounded-[3rem] shadow-sm">
                                <thead>
                                    <tr className="bg-slate-900 text-white">
                                        <th className="p-8 text-lg font-black text-right border-none">بيان الصنف والمواصفات</th>
                                        <th className="p-8 text-lg font-black text-center border-none">الكمية</th>
                                        <th className="p-8 text-lg font-black text-center border-none">السعر الفردي</th>
                                        <th className="p-8 text-lg font-black text-left border-none">إجمالي القيمة</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {selectedOrder.order_items.map((item, idx) => (
                                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-gray-50/40' : 'bg-white'}>
                                            <td className="p-8 text-xl font-black border-none text-slate-800">{item.product.name} <span className="text-sm font-bold text-slate-400 mr-4">[{item.product_unit?.unit?.unit_name}]</span></td>
                                            <td className="p-8 text-xl border-none text-center font-black italic">{item.quantity}</td>
                                            <td className="p-8 text-xl border-none text-center font-bold text-slate-600">{parseFloat(item.unit_price).toLocaleString()}</td>
                                            <td className="p-8 text-xl border-none text-left font-black text-slate-900">{parseFloat(item.item_total).toLocaleString()} <span className="text-sm opacity-40 ml-2 font-bold">{selectedOrder.currency.currency_code_ar}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex flex-col items-end gap-10 border-t-[10px] border-slate-900 pt-20">
                                <div className="flex justify-between w-[600px] text-4xl font-black">
                                    <span className="text-slate-300 italic">صافي القيمة المستحقة :</span>
                                    <span className="underline decoration-[12px] decoration-blue-600/10 underline-offset-[16px]">{parseFloat(selectedOrder.total_price).toLocaleString()} {selectedOrder.currency.currency_code_ar}</span>
                                </div>
                                <div className="mt-40 flex justify-between w-full opacity-60 text-sm font-black uppercase tracking-[0.4em] border-t-2 border-slate-100 pt-12">
                                    <div className="flex flex-col gap-28">
                                        <p>اعتماد قسم المحاسبة والتدقيق</p>
                                        <div className="w-64 h-0.5 bg-slate-900" />
                                    </div>
                                    <div className="flex flex-col gap-28 items-end">
                                        <p>توقيع وختم المستلم النهائي</p>
                                        <div className="w-64 h-0.5 bg-slate-900" />
                                    </div>
                                </div>
                                <p className="text-[12px] mt-32 text-slate-300 italic tracking-widest font-black uppercase">SYSTEM GENERATED DOCUMENT - AL-MEKHLAFI INTEGRATED ERP</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * { visibility: hidden !important; }
                    #print-area, #print-area * { visibility: visible !important; }
                    #print-area { position: absolute !important; right: 0 !important; top: 0 !important; width: 100% !important; height: auto !important; padding: 2cm !important; }
                    @page { size: A4; margin: 0; }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </AdminLayout>
    );
}
