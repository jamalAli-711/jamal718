import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { useToast } from '@/Components/Toast';

export default function CurrenciesIndex({ auth, currencies: initialCurrencies, branches }) {
    const toast = useToast();
    const { flash } = usePage().props;
    const [currencies, setCurrencies] = useState(initialCurrencies);

    useEffect(() => { setCurrencies(initialCurrencies); }, [initialCurrencies]);
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [editingRates, setEditingRates] = useState({});

    const form = useForm({
        currency_name: '', currency_code_en: '', currency_code_ar: '',
        exchange_rate: '', branch_id: '', is_default: false,
    });

    const openCreate = () => { form.reset(); setShowCreateModal(true); };
    const submitCreate = (e) => {
        e.preventDefault();
        form.post(route('currencies.store'), { onSuccess: () => setShowCreateModal(false), });
    };

    const openEdit = (currency) => {
        setSelectedCurrency(currency);
        form.setData({
            currency_name: currency.currency_name, currency_code_en: currency.currency_code_en,
            currency_code_ar: currency.currency_code_ar, branch_id: currency.branch_id || '',
        });
        setShowEditModal(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        form.put(route('currencies.update', selectedCurrency.id), { onSuccess: () => setShowEditModal(false), });
    };

    const deleteCurrency = (currency) => {
        if (currency.is_default) { toast.error("لا يمكن حذف العملة الافتراضية للنظام."); return; }
        if (confirm('هل أنت متأكد من حذف العملة ' + currency.currency_name + '؟ ستتأثر الأسعار المرتبطة بها!')) {
            router.delete(route('currencies.destroy', currency.id));
        }
    };

    const handleRateChange = (id, value) => { setEditingRates(prev => ({ ...prev, [id]: value })); };

    const saveRate = (currency) => {
        const newRate = editingRates[currency.id];
        if (!newRate || newRate == currency.exchange_rate) return;
        router.patch(route('currencies.updateRate', currency.id), { exchange_rate: newRate, is_default: currency.is_default }, {
            preserveScroll: true,
            onSuccess: () => { toast.success('تم تحديث سعر الصرف بنجاح'); setEditingRates(prev => ({ ...prev, [currency.id]: undefined })); }
        });
    };

    const setDefault = (currency) => {
        if(currency.is_default) return;
        if (confirm(`تحويل "${currency.currency_name}" لتكون العملة الافتراضية للنظام؟`)) {
            router.patch(route('currencies.updateRate', currency.id), { exchange_rate: currency.exchange_rate, is_default: true }, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout user={auth.user} header="العملات">
            <Head title="الخزينة المالية — إدارة العملات" />

            <div className="pb-32 animate-in fade-in duration-1000" dir="rtl">
                
                {/* VIP Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 p-10 bg-white/[0.01] rounded-[4rem] border border-white/5 shadow-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-400/10 border border-blue-400/20 rounded-full text-blue-500 tracking-[0.4em] text-[10px] font-black uppercase">
                            سجل العملات العالمي
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                        </div>
                        <h2 className="text-6xl font-black text-white tracking-tighter leading-none">إدارة الخزينة والعملات</h2>
                        <p className="text-white/20 font-bold text-xl italic pr-6 border-r-4 border-blue-400/20">التحكم المركزي في أسعار الصرف، العملات السيادية، والارتباطات المالية للفروع.</p>
                    </div>
                    <button onClick={openCreate} className="group px-12 py-6 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-black rounded-[2rem] flex items-center gap-4 shadow-2xl shadow-blue-400/20 hover:scale-105 active:scale-95 transition-all relative z-10">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-xs uppercase tracking-[0.2em]">إضافة عملة جديدة</span>
                    </button>
                </div>

                {/* VIP Ledger Table */}
                <div className="bg-[#0c0c0e]/80 backdrop-blur-3xl rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-white/[0.01]">
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">اسم العملة</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">الرمز الدولي</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">الفرع المرتبط</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">سعر الصرف</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">حالة النظام</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {currencies.map((currency) => {
                                    const currentRateInput = editingRates[currency.id] !== undefined ? editingRates[currency.id] : currency.exchange_rate;
                                    const isDirtyRate = editingRates[currency.id] !== undefined && editingRates[currency.id] !== (''+currency.exchange_rate);
                                    
                                    return (
                                        <tr key={currency.id} className={`group transition-all ${currency.is_default ? 'bg-blue-400/[0.02]' : 'hover:bg-white/[0.01]'}`}>
                                            <td className="px-12 py-10">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-2xl font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors leading-none uppercase">{currency.currency_name}</span>
                                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{currency.currency_code_ar} رمز العملة</span>
                                                </div>
                                            </td>
                                            <td className="px-12 py-10 text-center">
                                                <span className="px-5 py-2 rounded-full bg-white/[0.03] border border-white/5 text-lg font-mono font-black text-white/60 uppercase tracking-widest">{currency.currency_code_en}</span>
                                            </td>
                                            <td className="px-12 py-10">
                                                {currency.branch ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                                        <span className="text-lg font-black text-white leading-none tracking-tight">{currency.branch.branch_name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">سيادي عالمي</span>
                                                )}
                                            </td>
                                            <td className="px-12 py-10">
                                                <div className="flex items-center justify-center gap-4 group/rate px-4">
                                                    <input 
                                                        type="number" step="0.0001"
                                                        className={`w-36 bg-white/[0.03] border-2 rounded-2xl py-3 px-4 text-center text-xl font-black transition-all ${isDirtyRate ? 'border-amber-400 text-amber-400' : 'border-white/5 text-white/40 focus:border-blue-400 focus:text-white'}`}
                                                        value={currentRateInput}
                                                        onChange={(e) => handleRateChange(currency.id, e.target.value)}
                                                    />
                                                    {isDirtyRate && (
                                                        <button onClick={() => saveRate(currency)} className="w-12 h-12 bg-emerald-500 text-black flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-110 active:scale-90 transition-all">
                                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-12 py-10 text-center">
                                                {currency.is_default ? (
                                                    <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-blue-500 text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20">
                                                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                        العملة الافتراضية
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setDefault(currency)} className="px-6 py-2.5 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all">تعيين كافتراضية</button>
                                                )}
                                            </td>
                                            <td className="px-12 py-10">
                                                <div className="flex items-center justify-center gap-4">
                                                    <OpButton onClick={() => openEdit(currency)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} color="blue-400" />
                                                    <OpButton onClick={() => deleteCurrency(currency)} disabled={currency.is_default} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} color="rose-500" />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* VIP Currency Modals */}
            <Modal show={showCreateModal || showEditModal} onClose={() => { setShowCreateModal(false); setShowEditModal(false); }} title={showCreateModal ? "إضافة عملة جديدة" : "تعديل بيانات العملة"} maxWidth="md">
                <div className="bg-[#0c0c0e] text-white overflow-hidden rounded-[3rem] border border-white/5 p-12" dir="rtl">
                    <form onSubmit={showCreateModal ? submitCreate : submitEdit} className="space-y-8">
                        <Field label="اسم العملة *" value={form.data.currency_name} onChange={v => form.setData('currency_name', v)} required />
                        
                        <div className="grid grid-cols-2 gap-8">
                            <Field label="الرمز بالإنجليزية *" value={form.data.currency_code_en} onChange={v => form.setData('currency_code_en', v.toUpperCase())} placeholder="USD" required />
                            <Field label="الرمز بالعربية *" value={form.data.currency_code_ar} onChange={v => form.setData('currency_code_ar', v)} placeholder="د.أ" required />
                        </div>

                        {showCreateModal && (
                            <Field label="سعر الصرف الابتدائي *" type="number" step="0.0001" value={form.data.exchange_rate} onChange={v => form.setData('exchange_rate', v)} required />
                        )}

                        <Select label="الفرع المرتبط" value={form.data.branch_id} onChange={v => form.setData('branch_id', v)} options={branches.map(b => ({v:b.id,l:b.branch_name}))} defaultLabel="عالمي (مشترك)" />

                        {showCreateModal && (
                            <label className="flex items-center gap-6 p-6 mt-4 bg-blue-500/5 rounded-[2rem] border border-blue-500/10 cursor-pointer hover:bg-blue-500/10 transition-all group">
                                <input type="checkbox" className="w-7 h-7 rounded-[10px] bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/30 transition-all transition-all" checked={form.data.is_default} onChange={e => form.setData('is_default', e.target.checked)} />
                                <div className="space-y-1">
                                    <span className="block text-lg font-black text-white group-hover:text-blue-400 transition-colors">تعيين كعملة افتراضية</span>
                                    <span className="block text-[10px] text-white/30 uppercase tracking-widest leading-none">جميع تقارير النظام ستستند إلى هذا السعر.</span>
                                </div>
                            </label>
                        )}

                        <div className="flex gap-6 mt-12 pt-8 border-t border-white/5">
                            <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="flex-1 py-7 rounded-[2rem] bg-white/5 text-white/40 font-black uppercase text-xs tracking-[0.4em] hover:bg-white/10 transition-all leading-none">إلغاء</button>
                            <button type="submit" disabled={form.processing} className="flex-[2] py-7 rounded-[2rem] bg-blue-500 text-black font-black uppercase text-xs tracking-[0.4em] hover:bg-blue-400 shadow-2xl shadow-blue-500/20 disabled:opacity-50 transition-all leading-none">
                                {form.processing ? 'جاري الحفظ...' : 'حفظ العملة'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            ` }} />
        </AdminLayout>
    );
}

function Field({ label, value, onChange, placeholder, type = "text", className = "", step, ...props }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block pr-4">{label}</label>
            <input 
                type={type} step={step} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-xl font-black text-white focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.05] transition-all shadow-inner placeholder:text-white/5 ${className}`}
                {...props}
            />
        </div>
    );
}

function Select({ label, value, onChange, options, defaultLabel = "Select..." }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block pr-4">{label}</label>
            <div className="relative">
                <select 
                    value={value} onChange={e => onChange(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-lg font-black text-white focus:outline-none focus:border-blue-500/30 transition-all appearance-none cursor-pointer"
                >
                    <option value="" className="bg-[#111114]">{defaultLabel}</option>
                    {options.map(o => <option key={o.v} value={o.v} className="bg-[#111114]">{o.l}</option>)}
                </select>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/10"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></div>
            </div>
        </div>
    );
}

function OpButton({ onClick, icon, color, disabled }) {
    return (
        <button 
            onClick={onClick} disabled={disabled}
            className={`w-12 h-12 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-center transition-all active:scale-90 ${disabled ? 'opacity-10 cursor-not-allowed' : `text-white/20 hover:text-${color} hover:border-${color}/20 hover:bg-white/[0.05]`}`}
        >
            {icon}
        </button>
    );
}
