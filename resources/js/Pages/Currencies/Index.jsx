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

    // Rate editing state (Inline)
    const [editingRates, setEditingRates] = useState({});

    // -- Forms --
    const form = useForm({
        currency_name: '',
        currency_code_en: '',
        currency_code_ar: '',
        exchange_rate: '',
        branch_id: '',
        is_default: false,
    });


    const openCreate = () => {
        form.reset();
        setShowCreateModal(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        form.post(route('currencies.store'), {
            onSuccess: () => setShowCreateModal(false),
        });
    };

    const openEdit = (currency) => {
        setSelectedCurrency(currency);
        form.setData({
            currency_name: currency.currency_name,
            currency_code_en: currency.currency_code_en,
            currency_code_ar: currency.currency_code_ar,
            branch_id: currency.branch_id || '',
        });

        setShowEditModal(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        form.put(route('currencies.update', selectedCurrency.id), {
            onSuccess: () => setShowEditModal(false),
        });
    };

    const deleteCurrency = (currency) => {
        if (currency.is_default) {
            toast.error("لا يمكن حذف العملة الافتراضية للنظام.");
            return;
        }
        if (confirm('هل أنت متأكد من حذف العملة ' + currency.currency_name + '؟ ستتأثر الأسعار المرتبطة بها!')) {
            router.delete(route('currencies.destroy', currency.id));
        }
    };

    // -- Quick Inline Actions --
    const handleRateChange = (id, value) => {
        setEditingRates(prev => ({ ...prev, [id]: value }));
    };

    const saveRate = (currency) => {
        const newRate = editingRates[currency.id];
        if (!newRate || newRate == currency.exchange_rate) return;
        
        router.patch(route('currencies.updateRate', currency.id), {
            exchange_rate: newRate,
            is_default: currency.is_default
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('تم تحديث سعر الصرف بنجاح');
                setEditingRates(prev => ({ ...prev, [currency.id]: undefined }));
            }
        });
    };

    const setDefault = (currency) => {
        if(currency.is_default) return; // Already default
        if (confirm(`تحويل "${currency.currency_name}" لتكون العملة الافتراضية للنظام؟ جميع التقارير ستعتمد عليها.`)) {
            router.patch(route('currencies.updateRate', currency.id), {
                exchange_rate: currency.exchange_rate,
                is_default: true
            }, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout user={auth.user} header="الإعدادات المتقدمة">
            <Head title="إدارة العملات وصرف العملات" />

            <div className="mb-12 flex justify-between items-end">
                <div>
                    <span className="text-[10px] font-black text-[#e31e24] uppercase tracking-[0.4em] mb-2 block">النظام المالي والمحاسبي</span>
                    <h2 className="font-black text-4xl text-[#031633] tracking-tighter uppercase">إدارة عملات الصرف</h2>
                    <p className="text-gray-400 font-bold mt-1">تحديث أسعار صرف العملات والتحكم في العملة الافتراضية للنظام</p>
                </div>
                <button onClick={openCreate} className="bg-slate-900 text-white h-14 px-8 rounded-2xl flex items-center gap-3 shadow-2xl hover:bg-[#e31e24] transition-all hover:-translate-y-1 active:scale-95">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    <span className="font-black uppercase tracking-widest text-xs">إضافة عملة جديدة</span>
                </button>
            </div>


            <div className="card-editorial overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead className="bg-gray-50/50">
                            <tr className="text-right">
                                <th className="px-8 py-5 text-[10px] font-black text-[#031633] uppercase tracking-widest">م.</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[#031633] uppercase tracking-widest">اسم العملة</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[#031633] uppercase tracking-widest text-center">الرمز الانجليزي</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[#031633] uppercase tracking-widest">الفرع / المنطقة</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[#031633] uppercase tracking-widest text-center">سعر الصرف</th>

                                <th className="px-8 py-5 text-[10px] font-black text-[#031633] uppercase tracking-widest text-center">حالة النظام</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[#031633] uppercase tracking-widest text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currencies.map((currency, index) => {
                                const currentRateInput = editingRates[currency.id] !== undefined ? editingRates[currency.id] : currency.exchange_rate;
                                const isDirtyRate = editingRates[currency.id] !== undefined && editingRates[currency.id] !== (''+currency.exchange_rate);
                                
                                return (
                                <tr key={currency.id} className={currency.is_default ? "bg-blue-50/30" : ""}>
                                    <td className="px-8 py-4 font-bold text-gray-400">{index + 1}</td>
                                    <td className="px-8 py-4">
                                        <div className="font-bold text-[#031633] text-lg flex items-center gap-2">
                                            {currency.currency_name}
                                            <span className="text-xs bg-gray-100 text-gray-500 rounded px-2">{currency.currency_code_ar}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center font-mono font-bold text-gray-500">{currency.currency_code_en}</td>
                                    
                                    <td className="px-8 py-4">
                                        {currency.branch ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span className="font-bold text-gray-700 text-sm">{currency.branch.branch_name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs font-bold uppercase tracking-tighter">عام (Global)</span>
                                        )}
                                    </td>

                                    
                                    {/* Inline Rate Edit Component */}
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-2 max-w-[200px]">
                                            <input 
                                                type="number" 
                                                step="0.0001"
                                                min="0.0001"
                                                className={`w-full border-2 rounded-xl text-sm font-bold text-center transition-all ${isDirtyRate ? 'border-amber-400 bg-amber-50 shadow-inner' : 'border-gray-200 focus:border-blue-400'}`}
                                                value={currentRateInput}
                                                onChange={(e) => handleRateChange(currency.id, e.target.value)}
                                            />
                                            {isDirtyRate && (
                                                <button onClick={() => saveRate(currency)} className="bg-emerald-500 text-white p-2 rounded-xl shadow-md hover:bg-emerald-600 transition-colors" title="حفظ السعر">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    
                                    <td className="px-8 py-4 text-center">
                                        {currency.is_default ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-widest border border-blue-200">
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                الرئيسية
                                            </span>
                                        ) : (
                                            <button onClick={() => setDefault(currency)} className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold hover:bg-gray-200 transition-colors">
                                                الاعتماد كافتراضي
                                            </button>
                                        )}
                                    </td>
                                    
                                    <td className="px-8 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => openEdit(currency)} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors" title="تعديل تفاصيل العملة الأساسية">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => deleteCurrency(currency)} disabled={currency.is_default} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${currency.is_default ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'}`} title={currency.is_default ? 'لا يمكن حذف العملة الافتراضية' : 'حذف العملة'}>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                            
                            {currencies.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-8 py-12 text-center text-gray-400 font-medium">لا توجد عملات. قم بإضافة عملة جديدة للبدء.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE MODAL */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} title="إضافة عملة جديدة" maxWidth="sm">
                <form onSubmit={submitCreate}>
                    <Modal.Body>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">اسم العملة (مثل: دولار أمريكي)</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-blue-500" value={form.data.currency_name} onChange={e => form.setData('currency_name', e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">الرمز الانجليزي (USD)</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-lg text-sm p-2.5 font-mono uppercase focus:ring-blue-500" value={form.data.currency_code_en} onChange={e => form.setData('currency_code_en', e.target.value.toUpperCase())} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">الرمز العربي (د.أ)</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-blue-500" value={form.data.currency_code_ar} onChange={e => form.setData('currency_code_ar', e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">سعر الصرف (مقارنة بالأساسي)</label>
                                <input type="number" step="0.0001" min="0.0001" className="w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-blue-500" value={form.data.exchange_rate} onChange={e => form.setData('exchange_rate', e.target.value)} required />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">الفرع التابع له (اختياري)</label>
                                <select 
                                    className="w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-blue-500" 
                                    value={form.data.branch_id} 
                                    onChange={e => form.setData('branch_id', e.target.value)}
                                >
                                    <option value="">عام (لا يتبع فرع محدد)</option>
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                                    ))}
                                </select>
                            </div>

                            <label className="flex items-center gap-3 p-3 mt-2 bg-blue-50/50 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors">

                                <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={form.data.is_default} onChange={e => form.setData('is_default', e.target.checked)} />
                                <div>
                                    <span className="block text-sm font-bold text-blue-900">تعيين كعملة افتراضية للنظام</span>
                                    <span className="block text-[10px] text-blue-600/70">سيلغي ذلك حالة العملة الافتراضية لمن هم قبلها.</span>
                                </div>
                            </label>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">إلغاء</button>
                        <button type="submit" disabled={form.processing} className="btn-primary flex items-center gap-2">
                            {form.processing ? 'جاري الحفظ...' : 'إضافة العملة'}
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* EDIT MODAL */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title="تعديل تفاصيل العملة" maxWidth="sm">
                <form onSubmit={submitEdit}>
                    <Modal.Body>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">اسم العملة</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-blue-500" value={form.data.currency_name} onChange={e => form.setData('currency_name', e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">الرمز الانجليزي</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-lg text-sm p-2.5 font-mono uppercase focus:ring-blue-500" value={form.data.currency_code_en} onChange={e => form.setData('currency_code_en', e.target.value.toUpperCase())} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">الرمز العربي</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-blue-500" value={form.data.currency_code_ar} onChange={e => form.setData('currency_code_ar', e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">الفرع التابع له</label>
                                <select 
                                    className="w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-blue-500" 
                                    value={form.data.branch_id} 
                                    onChange={e => form.setData('branch_id', e.target.value)}
                                >
                                    <option value="">عام (لا يتبع فرع محدد)</option>
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="text-[10px] text-gray-400 mt-2 bg-gray-50 p-2 rounded">
                                * لتحديث سعر الصرف أو حالة العملة الافتراضية، يرجى استخدام الخيارات السريعة المتاحة في الجدول مباشرة لسرعة وسهولة التحديث المستمر.
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">إلغاء</button>
                        <button type="submit" disabled={form.processing} className="btn-primary">حفظ التغييرات</button>
                    </Modal.Footer>
                </form>
            </Modal>
        </AdminLayout>
    );
}
