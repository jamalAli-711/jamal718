import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function FleetReports({ total_trips, completed_deliveries, active_fleet, fleet_performance = [], trip_logs = {} }) {
    return (
        <AdminLayout
            user={usePage().props.auth.user}
            header="تقارير الميدان والذكاء اللوجستي"
        >
            <Head title="Logistics Reports" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
                
                {/* Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-[4rem] group-hover:scale-110 transition-transform" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">إجمالي الرحلات المنجزة</h4>
                        <p className="text-4xl font-black text-slate-900 mb-1">{total_trips}</p>
                        <p className="text-[10px] font-bold text-emerald-500">↑ 12% منذ الشهر الماضي</p>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-[4rem] group-hover:scale-110 transition-transform" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">معدل نجاح التوصيل</h4>
                        <p className="text-4xl font-black text-slate-900 mb-1">{((completed_deliveries / (total_trips || 1)) * 100).toFixed(1)}%</p>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${(completed_deliveries / (total_trips || 1)) * 100}%` }} />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-[4rem] group-hover:scale-110 transition-transform" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">الأسطول النشط برحلات</h4>
                        <p className="text-4xl font-black text-slate-900 mb-1">{active_fleet}</p>
                        <p className="text-[10px] font-bold text-slate-400">من إجمالي {fleet_performance.length} مركبة</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Fleet Performance Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                <h3 className="font-black text-slate-900 text-xl tracking-tighter">تحليل أداء الأسطول</h3>
                                <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">تحميل ملف Excel</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">المركبة / السائق</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي التوصيلات</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">الحالة الحالية</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">الأداء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {fleet_performance.map(truck => (
                                            <tr key={truck.id} className="hover:bg-slate-50 transition-all group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🚚</div>
                                                        <div>
                                                            <p className="font-black text-slate-900 underline decoration-slate-200 underline-offset-4">{truck.truck_number}</p>
                                                            <p className="text-[10px] font-bold text-slate-400">{truck.driver?.name || 'بدون سائق'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-black text-slate-900">{truck.trips_count} نُقطة</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${truck.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                                        {truck.status === 'Active' ? 'في مهمة' : 'متاح'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-grow h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500" style={{ width: `${Math.min((truck.trips_count / 10) * 100, 100)}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-900">{(truck.trips_count / 10 * 100).toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Trip Logs / Feed */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[5rem]" />
                            <h3 className="font-black tracking-tighter text-lg mb-8 relative z-10">سجل الرحلات التفصيلي</h3>
                            <div className="space-y-8 relative z-10">
                                {Object.keys(trip_logs).slice(0, 5).map(tripCode => {
                                    const logs = trip_logs[tripCode];
                                    const first = logs[0];
                                    return (
                                        <div key={tripCode} className="relative pr-6 border-r-2 border-white/10 pb-2">
                                            <div className="absolute -right-[9px] top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-slate-900 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{tripCode}</span>
                                                <span className="text-[9px] opacity-40">{new Date(first.created_at).toLocaleDateString('ar-YE')}</span>
                                            </div>
                                            <h4 className="text-xs font-black mb-1">{first.truck?.truck_number} → {logs.length} وجهات</h4>
                                            <p className="text-[10px] opacity-60 leading-relaxed italic">
                                                بدأت الرحلة من المركز اللوجستي وتم تغطية منطقة {first.order?.customer?.branch?.branch_name || 'وسط المدينة'}.
                                            </p>
                                            <div className="mt-4 flex gap-2">
                                                {logs.slice(0, 3).map((log, i) => (
                                                    <div key={i} className="px-2 py-1 bg-white/5 rounded-lg text-[8px] font-bold border border-white/10">
                                                        {log.order?.customer?.name.split(' ')[0]}
                                                    </div>
                                                ))}
                                                {logs.length > 3 && <span className="text-[8px] opacity-40 self-center">+{logs.length - 3}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                                {Object.keys(trip_logs).length === 0 && (
                                    <div className="text-center py-12 opacity-40">
                                        <p className="text-xs">لا يوجد سجل رحلات متاح حالياً</p>
                                    </div>
                                )}
                            </div>
                            <Link href={route('fleet.index')} className="block mt-10 text-center w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                معاينة الخريطة الحية
                            </Link>
                        </div>

                        {/* Logistic Efficiency Alert Card */}
                        <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                             <h3 className="text-sm font-black mb-4 uppercase tracking-widest">كفاءة التوزيع</h3>
                             <p className="text-xs leading-relaxed opacity-90 mb-6">
                                تم تحسين خطوط السير بنسبة 18% هذا الأسبوع بفضل خوارزمية "الجار الأقرب"، مما وفر قرابة 45 لتر من الوقود.
                             </p>
                             <div className="flex items-end gap-2">
                                <span className="text-4xl font-black italic">A+</span>
                                <span className="text-[10px] font-bold mb-1 opacity-60">نظام تقييم الذكاء اللوجستي</span>
                             </div>
                        </div>
                    </div>

                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @font-face { font-family: 'Black'; src: local('Inter Black'); }
                td, th { white-space: nowrap; }
            `}} />
        </AdminLayout>
    );
}
