import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { formatDate } from '@/constants';

export default function Report({ auth, predictions, branches, products, totalExpectedQuantity, filters }) {
    
    const getStatusText = (days) => {
        if (days < 0) return 'متأخر';
        if (days === 0) return 'موعد الطلب اليوم';
        if (days === 1) return 'موعد الطلب غداً';
        return `متبقي ${days} أيام`;
    };

    const getColorClass = (color) => {
        switch(color) {
            case 'rose': return 'bg-rose-500/10 border-rose-500/20 text-rose-500';
            case 'red': return 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse';
            case 'amber': return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
            case 'emerald': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
            default: return 'bg-white/5 border-white/10 text-white/40';
        }
    };

    const handleFilterChange = (key, value) => {
        router.get(route('replenishment.report'), { ...filters, [key]: value }, { preserveState: true });
    };

    return (
        <AdminLayout user={auth.user} header="تقرير التنبؤ بالطلبات">
            <Head title="تقرير التنبؤ بالطلبات" />

            <div className="pb-32" dir="rtl">
                
                {/* Header & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    <div className="lg:col-span-2 p-10 bg-[#111114] rounded-[3rem] border border-white/5 relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-widest">
                                تحليلات استباقية
                                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                            </div>
                            <h2 className="text-5xl font-black text-white tracking-tighter">تقرير التنبؤ بالطلبات</h2>
                            <p className="text-white/40 font-medium text-lg leading-relaxed max-w-2xl">توقع كميات الطلب بناءً على دورات توريد العملاء لجدولة عمليات التوزيع بكفاءة.</p>
                        </div>
                    </div>

                    <div className="p-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[3rem] shadow-2xl shadow-amber-400/20 flex flex-col justify-center items-center text-center space-y-3">
                        <span className="text-[11px] font-black text-black/40 uppercase tracking-[0.2em]">إجمالي الكمية المتوقعة</span>
                        <div className="text-6xl font-black text-black tracking-tighter">
                            {(totalExpectedQuantity || 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] font-bold text-black/60 italic">بناءً على العملاء المستحقين حالياً</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-6 mb-12 items-center bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => handleFilterChange('branch_id', '')}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!filters.branch_id ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                        >
                            كافة الفروع
                        </button>
                        {(branches || []).map(b => (
                            <button 
                                key={b.id}
                                onClick={() => handleFilterChange('branch_id', b.id)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filters.branch_id == b.id ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                            >
                                {b.branch_name}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 w-full max-w-sm">
                        <select 
                            value={filters.product_id || ''}
                            onChange={(e) => handleFilterChange('product_id', e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-2.5 text-white font-bold text-xs focus:ring-1 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all cursor-pointer"
                        >
                            <option value="">كافة الأصناف المتوقعة</option>
                            {(products || []).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {predictions && predictions.length > 0 ? predictions.map((item) => {
                        const consumption = Math.min(100, Math.max(0, 100 - (item.days_left / item.reorder_cycle_days * 100)));
                        
                        return (
                            <div key={item.id} className="group bg-[#111114] rounded-[2.5rem] border border-white/5 hover:border-amber-400/20 transition-all duration-500 flex flex-col overflow-hidden">
                                <div className={`h-1.5 w-full ${item.status_color === 'red' || item.status_color === 'rose' ? 'bg-red-500' : (item.status_color === 'amber' ? 'bg-amber-500' : 'bg-emerald-500')}`} />
                                
                                <div className="p-8 space-y-6 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h4 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">{item.customer?.name}</h4>
                                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{item.customer?.branch?.branch_name}</span>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${getColorClass(item.status_color)}`}>
                                            {getStatusText(item.days_left)}
                                        </div>
                                    </div>

                                    <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 space-y-3">
                                        <div className="flex justify-between text-[9px] font-black text-white/20 uppercase">
                                            <span>الكمية المعتادة</span>
                                            <span>الموعد المتوقع</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-3xl font-black text-amber-500 tabular-nums">{item.preferred_quantity || 0}</span>
                                            <span className="text-xs font-bold text-white">{formatDate(item.next_expected_date)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black text-white/20 uppercase">الصنف المتوقع</span>
                                            <span className="text-xs font-bold text-white/60 truncate max-w-[150px]">{item.product?.name}</span>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                                                <span className="text-white/20">زمن الاستهلاك</span>
                                                <span className={item.days_left <= 2 ? 'text-red-500' : 'text-white/40'}>{consumption.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${item.days_left <= 2 ? 'bg-red-500' : (item.days_left <= 7 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                                                    style={{ width: `${consumption}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-8 py-5 bg-white/[0.01] border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[8px] font-black text-white/10 uppercase italic">الأيام: {item.days_left < 0 ? 'متأخر' : item.days_left}</span>
                                    <Link 
                                        href={route('replenishment.index')}
                                        className="text-[9px] font-black text-amber-500 uppercase tracking-widest"
                                    >
                                        التفاصيل ←
                                    </Link>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center gap-4 opacity-20 text-center">
                            <span className="text-xl font-black uppercase tracking-[0.2em] block">لا توجد طلبات متوقعة حالياً</span>
                            {filters.product_id && <p className="text-amber-500 text-xs font-bold">لم يحن موعد توريد هذا الصنف لأي عميل بعد.</p>}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
