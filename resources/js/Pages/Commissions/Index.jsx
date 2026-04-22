import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function CommissionIndex({ agents = [], rules = [], recentLogs = [], categories = [], products = [] }) {
    const { auth } = usePage().props;
    const [showRuleModal, setShowRuleModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        rule_name: '',
        commission_percentage: '',
        target_type: 'global',
        target_id: null,
    });

    const submitRule = (e) => {
        e.preventDefault();
        post(route('commissions.rule.store'), {
            onSuccess: () => {
                setShowRuleModal(false);
                reset();
            }
        });
    };

    return (
        <AdminLayout user={auth.user} header="إدارة العمولات والمندوبين">
            <Head title="Commission Management" />

            <div className="pb-24 space-y-12" dir="rtl">

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-[#0c0c0e]/80 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-amber-400/20 transition-all duration-500">
                        <div className="absolute -right-8 -top-8 w-40 h-40 bg-amber-400/5 rounded-full blur-[4rem] group-hover:bg-amber-400/10 transition-all" />
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6">شبكة المناديب النشطة</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-black text-white tracking-tighter">{agents.length}</span>
                                <span className="text-xs font-bold text-amber-500">خبير ميداني</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0c0c0e]/80 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-emerald-400/20 transition-all duration-500">
                        <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-400/5 rounded-full blur-[4rem] group-hover:bg-emerald-400/10 transition-all" />
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6">قواعد الحساب الذكية</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-black text-white tracking-tighter">{rules.length}</span>
                                <span className="text-xs font-bold text-emerald-500">قاعدة نشطة</span>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-amber-400 rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(245,158,11,0.2)] relative overflow-hidden group hover:scale-[1.03] active:scale-95 transition-all duration-500 cursor-pointer"
                        onClick={() => setShowRuleModal(true)}
                    >
                        <div className="flex flex-col h-full justify-between gap-8">
                            <div className="flex justify-between items-start">
                                <h4 className="text-[10px] font-black text-black/50 uppercase tracking-[0.3em]">تحكم إداري</h4>
                                <span className="text-4xl filter drop-shadow-lg">⚡</span>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-black leading-tight tracking-tighter">إضافة قاعدة عمولة متطورة</p>
                                <p className="text-[10px] text-black/40 font-bold mt-2 uppercase tracking-widest italic pr-1">تعديل سلوك الأرباح فورياً →</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                    {/* Agents List */}
                    <div className="space-y-8">
                        <h3 className="text-3xl font-black text-white tracking-tighter pr-4">قائمة الموظفين الأكفاء</h3>
                        <div className="grid gap-6">
                            {agents.map(agent => (
                                <div key={agent.id} className="bg-[#0c0c0e]/80 backdrop-blur-3xl hover:bg-white/[0.04] p-8 rounded-[2.5rem] border border-white/5 transition-all duration-500 flex justify-between items-center group relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 opacity-0 group-hover:opacity-100 transition-all" />
                                    <div className="flex items-center gap-8">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">💼</div>
                                        <div>
                                            <h4 className="text-xl font-black text-white tracking-tight">{agent.name}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest italic">{agent.customers_count} زبائن حصريين</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        href={route('commissions.assignments', agent.id)}
                                        className="px-8 py-4 bg-white/5 hover:bg-amber-400 hover:text-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-white/10 transition-all shadow-xl"
                                    >
                                        إدارة المحفظة
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Earnings / Logs */}
                    <div className="space-y-8">
                        <h3 className="text-3xl font-black text-white tracking-tighter pr-4">سجل العائدات الحية</h3>
                        <div className="bg-[#0c0c0e]/80 backdrop-blur-3xl rounded-[3rem] border border-white/5 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.4)]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead className="bg-white/[0.03] text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">
                                        <tr>
                                            <th className="px-8 py-6">المندوب القائم</th>
                                            <th className="px-8 py-6">الزبون / الوجهة</th>
                                            <th className="px-8 py-6 text-center">أرباح صافية</th>
                                            <th className="px-8 py-6 text-center">الوضعية</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {recentLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-white/[0.02] transition-all duration-300 group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                                        <span className="text-sm font-black text-white tracking-tight">{log.agent?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[11px] text-white/50 font-bold block">{log.order?.customer?.name}</span>
                                                    <span className="text-[8px] text-white/20 font-black uppercase">Ref: #{log.order?.reference_number || log.order_id}</span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="text-xl font-black text-emerald-400 tracking-tighter">+{log.commission_amount}</div>
                                                    <div className="text-[9px] text-white/20 font-bold">Rate: {log.commission_rate}%</div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`inline-flex px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${log.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]'}`}>
                                                        {log.payment_status === 'paid' ? 'المستلم' : 'قيد التدقيق'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rules Modal */}
                <Modal show={showRuleModal} onClose={() => setShowRuleModal(false)} title="إضافة قاعدة عمولة ذكية" maxWidth="md">
                    <form onSubmit={submitRule} className="p-10 space-y-8 bg-[#0c0c0e] border border-white/5 rounded-[3rem]">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-amber-400/10 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-4 border border-amber-400/20 shadow-2xl">🧠</div>
                            <h2 className="text-2xl font-black text-white tracking-tighter">قاعدة الذكاء المالي</h2>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-2">تحكم في هوامش الربح بدقة متناهية</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-2">اسم القاعدة التعريفية</label>
                                <input
                                    type="text"
                                    value={data.rule_name}
                                    onChange={e => setData('rule_name', e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white focus:border-amber-400 font-bold transition-all shadow-xl"
                                    placeholder="مثلاً: بونص المنظفات الصيفي"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-2">مستوى الاستهداف</label>
                                    <select
                                        value={data.target_type}
                                        onChange={e => {
                                            setData(d => ({ ...d, target_type: e.target.value, target_id: null }));
                                        }}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white appearance-none cursor-pointer focus:border-amber-400 font-bold transition-all shadow-xl"
                                    >
                                        <option value="global" className="bg-[#0c0c0e]">عام (Global)</option>
                                        <option value="category" className="bg-[#0c0c0e]">فئة (Category)</option>
                                        <option value="product" className="bg-[#0c0c0e]">منتج (Product)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-2">النسبة (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={data.commission_percentage}
                                            onChange={e => setData('commission_percentage', e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-amber-400 focus:border-amber-400 font-black text-lg transition-all shadow-xl"
                                            placeholder="2.5"
                                            required
                                        />
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 font-black">%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Target Selector */}
                            {data.target_type !== 'global' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <label className="text-[10px] font-black text-amber-400/60 uppercase tracking-[0.2em] px-2">
                                        تحديد {data.target_type === 'category' ? 'الفئة المستهدفة' : 'المنتج المستهدف'}
                                    </label>
                                    <select
                                        value={data.target_id || ''}
                                        onChange={e => setData('target_id', e.target.value)}
                                        className="w-full bg-amber-400/5 border border-amber-400/20 rounded-2xl px-6 py-5 text-white appearance-none cursor-pointer focus:border-amber-400 font-bold transition-all shadow-xl"
                                        required
                                    >
                                        <option value="" className="bg-[#0c0c0e]">--- اختر من القائمة ---</option>
                                        {data.target_type === 'category' ? (
                                            categories.map(c => <option key={c.id} value={c.id} className="bg-[#0c0c0e]">{c.name}</option>)
                                        ) : (
                                            products.map(p => <option key={p.id} value={p.id} className="bg-[#0c0c0e]">{p.name}</option>)
                                        )}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 pt-8">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-6 bg-amber-400 text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-3xl shadow-[0_20px_50px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {processing ? 'جاري الحفظ...' : 'تفعيل القاعدة الآن'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowRuleModal(false)}
                                className="w-full py-2 text-[9px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors"
                            >
                                تراجع عن العملية
                            </button>
                        </div>
                    </form>
                </Modal>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .modal-content { background: #0c0c0e; border: 1px solid rgba(255,255,255,0.05); }
                select { background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff33' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: left 1rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-left: 2.5rem; }
            `}} />
        </AdminLayout>
    );
}
