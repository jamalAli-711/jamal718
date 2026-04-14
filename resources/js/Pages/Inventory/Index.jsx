import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { useToast } from '@/Components/Toast';
import { formatCurrency } from '@/constants';

export default function InventoryIndex({ auth, products, stats, units, categories, branches, currencies = [], default_currency }) {
    const toast = useToast();
    const { flash } = usePage().props;

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [showUnitsModal, setShowUnitsModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // --- Forms Logic (Preserved) ---
    const addForm = useForm({
        sku: '', name: '', stock_quantity: 0, branch_id: branches[0]?.id || '', category_id: '',
        images: [], primary_index: 0,
    });
    const [addPreviews, setAddPreviews] = useState([]);

    const handleAddImagesChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => ({ file, url: URL.createObjectURL(file) }));
        setAddPreviews([...addPreviews, ...newPreviews]);
        addForm.setData('images', [...addForm.data.images, ...files]);
    };

    const removeAddImage = (index) => {
        const newPreviews = [...addPreviews]; newPreviews.splice(index, 1); setAddPreviews(newPreviews);
        const newImages = [...addForm.data.images]; newImages.splice(index, 1); addForm.setData('images', newImages);
        if (addForm.data.primary_index === index) addForm.setData('primary_index', 0);
        else if (addForm.data.primary_index > index) addForm.setData('primary_index', addForm.data.primary_index - 1);
    };

    const submitAdd = (e) => {
        e.preventDefault();
        addForm.post(route('inventory.store'), { forceFormData: true, onSuccess: () => { setShowAddModal(false); addForm.reset(); setAddPreviews([]); }, });
    };

    const editForm = useForm({ name: '', category_id: '', new_images: [], deleted_images: [], primary_image_id: null, _method: 'PUT' });
    const [editPreviews, setEditPreviews] = useState([]); const [existingImages, setExistingImages] = useState([]);

    const handleEditNewImagesChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => ({ file, url: URL.createObjectURL(file) }));
        setEditPreviews(prev => [...prev, ...newPreviews]);
        editForm.setData('new_images', [...editForm.data.new_images, ...files]);
    };

    const removeEditNewImage = (index) => {
        const newPreviews = [...editPreviews]; newPreviews.splice(index, 1); setEditPreviews(newPreviews);
        const newImgs = [...editForm.data.new_images]; newImgs.splice(index, 1); editForm.setData('new_images', newImgs);
    };

    const toggleDeleteExisting = (imgId) => {
        setExistingImages(prev => prev.map(img => img.id === imgId ? { ...img, isDeleted: !img.isDeleted } : img));
        const deletedIds = existingImages.map(img => img.id === imgId ? { ...img, isDeleted: !img.isDeleted } : img)
            .filter(img => img.isDeleted).map(img => img.id);
        editForm.setData('deleted_images', deletedIds);
    };

    const openEditModal = (product) => {
        setSelectedProduct(product); setExistingImages(product.images.map(img => ({ ...img, isDeleted: false }))); setEditPreviews([]);
        const primaryImg = product.images.find(img => img.is_primary);
        editForm.setData({ name: product.name, category_id: product.category_id || '', new_images: [], deleted_images: [], primary_image_id: primaryImg ? primaryImg.id : null, _method: 'PUT' });
        setShowEditModal(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.post(route('inventory.update', selectedProduct.id), { forceFormData: true, onSuccess: () => setShowEditModal(false), });
    };

    const stockForm = useForm({ branch_id: '', stock_quantity: 0 });
    const openStockModal = (product) => {
        setSelectedProduct(product); stockForm.setData({ branch_id: branches[0]?.id || '', stock_quantity: 0 }); setShowStockModal(true);
    };
    useEffect(() => {
        if (showStockModal && selectedProduct && stockForm.data.branch_id) {
            const branchPivot = selectedProduct.branches?.find(b => b.id == stockForm.data.branch_id);
            stockForm.setData('stock_quantity', branchPivot ? branchPivot.pivot.stock_quantity : 0);
        }
    }, [stockForm.data.branch_id, showStockModal, selectedProduct]);

    const submitStockMode = (e) => {
        e.preventDefault();
        stockForm.put(route('inventory.updateStock', selectedProduct.id), { onSuccess: () => setShowStockModal(false), });
    };

    const unitsForm = useForm({ units: [] });
    const openUnitsModal = (product) => {
        setSelectedProduct(product);
        if (product.units && product.units.length > 0) {
            unitsForm.setData('units', product.units.map(u => ({
                id: u.id, unit_id: u.unit_id, branch_id: u.branch_id || branches[0]?.id || '',
                currency_id: u.currency_id || currencies[0]?.id || '', conversion_factor: u.conversion_factor,
                base_price: u.base_price, wholesale_price: u.wholesale_price, retail_price: u.retail_price,
                is_default_sale: u.is_default_sale ? true : false,
            })));
        } else {
            unitsForm.setData('units', [{ unit_id: units[0]?.id || '', branch_id: branches[0]?.id || '', currency_id: currencies[0]?.id || '', conversion_factor: 1, base_price: 0, wholesale_price: 0, retail_price: 0, is_default_sale: true }]);
        }
        setShowUnitsModal(true);
    };

    const updateUnitRow = (index, field, value) => {
        const newUnits = [...unitsForm.data.units]; newUnits[index][field] = value; unitsForm.setData('units', newUnits);
    };

    const submitUnitsForm = (e) => {
        e.preventDefault();
        unitsForm.post(route('inventory.updateUnits', selectedProduct.id), { onSuccess: () => setShowUnitsModal(false), });
    };

    const deleteProduct = (product) => {
        if (confirm(`هل أنت متأكد من حذف "${product.name}"؟`)) { router.delete(route('inventory.destroy', product.id)); }
    };

    const getStockLevel = (qty) => {
        if (qty <= 10) return { color: 'bg-rose-500', text: 'text-rose-500', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]' };
        if (qty <= 50) return { color: 'bg-amber-400', text: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.2)]' };
        return { color: 'bg-emerald-500', text: 'text-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]' };
    };

    const filteredProducts = products.data.filter(p => {
        const searchMatch = !searchQuery || p.name.includes(searchQuery) || p.sku.includes(searchQuery);
        const catMatch = !filterCategory || p.category_id == filterCategory;
        return searchMatch && catMatch;
    });

    return (
        <AdminLayout user={auth.user} header="خزنة الأصول">
            <Head title="إدارة المخزون — النخبة اللوجستية" />

            <div className="pb-32 animate-in fade-in duration-1000" dir="rtl">
                
                {/* VIP Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 p-10 bg-white/[0.01] rounded-[4rem] border border-white/5 shadow-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full text-amber-500 tracking-[0.4em] text-[10px] font-black uppercase">
                            ذكاء سلسلة التوريد العالمية
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                        </div>
                        <h2 className="text-6xl font-black text-white tracking-tighter leading-none">إدارة مستودعات الأصول</h2>
                        <p className="text-white/20 font-bold text-xl italic pr-6 border-r-4 border-amber-400/20">تتبع حي للمخزون، تقييم القيمة الرأسمالية، وإدارة وحدات التداول للفروع.</p>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="group px-12 py-6 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black rounded-[2rem] flex items-center gap-4 shadow-2xl shadow-amber-400/20 hover:scale-105 active:scale-95 transition-all relative z-10">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-xs uppercase tracking-[0.2em]">إضافة صنف جديد</span>
                    </button>
                </div>

                {/* VIP Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                    <StatCard label="حجم الكتالوج" value={stats.total_products} unit="صنف" icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} color="amber-400" />
                    <StatCard label="قرب النفاد" value={stats.low_stock} unit="تنبيه" icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} color="rose-500" />
                    <StatCard label="التقييم الرأسمالي" value={stats.total_value.toLocaleString()} unit={stats.currency_symbol} icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="emerald-500" />
                </div>

                {/* VIP Search Box */}
                <div className="mb-12 flex flex-col md:flex-row gap-8 items-center justify-between p-8 bg-white/[0.01] rounded-[3rem] border border-white/5">
                    <div className="flex-1 w-full relative group">
                        <input type="text" placeholder="ابحث في السجلات..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-14 py-6 text-xl font-black text-white focus:outline-none focus:border-amber-400/30 transition-all text-right group-hover:bg-white/[0.05]" />
                        <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/10 group-hover:text-amber-400/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <div className="relative w-full md:w-96 group">
                        <select className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-8 py-6 text-sm font-black text-white/40 focus:outline-none focus:border-amber-400/30 transition-all cursor-pointer appearance-none group-hover:bg-white/[0.05]" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                            <option value="" className="bg-[#111114]">جميع التصنيفات</option>
                            {categories.map(c => <option key={c.id} value={c.id} className="bg-[#111114]">{c.category_name}</option>)}
                        </select>
                        <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>

                {/* VIP Asset Ledger */}
                <div className="bg-[#0c0c0e]/80 backdrop-blur-3xl rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-white/[0.01]">
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">الصورة</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">رمز SKU</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">اسم الصنف</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">مؤشر المخزون</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">التسعير</th>
                                    <th className="px-12 py-10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {filteredProducts.map((product) => {
                                    const level = getStockLevel(product.total_stock);
                                    return (
                                        <tr key={product.id} className="group hover:bg-white/[0.01] transition-colors">
                                            <td className="px-12 py-10">
                                                <div className="w-24 h-24 bg-white/[0.02] border border-white/5 rounded-3xl p-4 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-700 overflow-hidden relative">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
                                                    {product.thumbnail ? <img src={product.thumbnail} className="w-full h-full object-contain relative z-10" /> : <svg className="w-10 h-10 text-white/5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                                </div>
                                            </td>
                                            <td className="px-12 py-10">
                                                <span className="text-2xl font-black text-white tracking-tighter group-hover:text-amber-400 transition-colors uppercase leading-none">#{product.sku}</span>
                                            </td>
                                            <td className="px-12 py-10">
                                                <div className="flex flex-col gap-1">
                                                    <h4 className="text-2xl font-black text-white leading-none tracking-tighter uppercase whitespace-normal max-w-xs">{product.name}</h4>
                                                    <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">{product.category?.category_name || 'GENERIC_ASSET'}</span>
                                                </div>
                                            </td>
                                            <td className="px-12 py-10">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className={`text-4xl font-black ${level.text} tracking-tighter leading-none`}>{product.total_stock || 0}</span>
                                                        <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">وحدة</span>
                                                    </div>
                                                    <div className="w-32 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                                        <div className={`h-full ${level.color} transition-all duration-1000 ${level.glow}`} style={{ width: `${Math.min(100, (product.total_stock / 200) * 100)}%` }} />
                                                    </div>
                                                    <button onClick={() => openStockModal(product)} className="text-[9px] font-black text-white/20 hover:text-amber-400 uppercase tracking-[0.4em] transition-all bg-white/[0.02] px-4 py-1.5 rounded-full border border-white/5">ضبط المخزون</button>
                                                </div>
                                            </td>
                                            <td className="px-12 py-10">
                                                {(() => {
                                                    const defUnit = product.units?.find(u => u.is_default_sale) || product.units?.[0];
                                                    if (!defUnit) return <span className="text-[10px] italic text-white/5 uppercase tracking-[0.4em]">التسعير غير متاح</span>;
                                                    const unitCurrency = currencies.find(c => c.id === defUnit.currency_id) || default_currency;
                                                    return (
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex justify-between items-baseline gap-10">
                                                                <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">سعر التجزئة</span>
                                                                <span className="text-2xl font-black text-white tracking-tighter">{Number(defUnit.retail_price).toLocaleString()} <span className="text-[10px] text-white/30 uppercase ml-1">{unitCurrency?.currency_code_ar}</span></span>
                                                            </div>
                                                            <div className="flex justify-between items-baseline gap-10 border-t border-white/[0.03] pt-1.5">
                                                                <span className="text-[10px] font-black text-white/5 uppercase tracking-widest">سعر الجملة</span>
                                                                <span className="text-lg font-black text-white/20 tracking-tighter italic">{Number(defUnit.wholesale_price).toLocaleString()} <span className="text-[8px] opacity-20 ml-1">{unitCurrency?.currency_code_ar}</span></span>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-12 py-10">
                                                <div className="flex items-center justify-center gap-4">
                                                    <OpBtn onClick={() => openUnitsModal(product)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>} color="amber-400" />
                                                    <OpBtn onClick={() => openEditModal(product)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} color="blue-400" />
                                                    <OpBtn onClick={() => deleteProduct(product)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} color="rose-500" />
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

            {/* VIP Modals */}

            <Modal show={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="xl">
                <div className="bg-[#0c0c0e] text-white p-12 overflow-hidden rounded-[3rem] border border-white/5 relative" dir="rtl">
                    <form onSubmit={submitAdd} className="space-y-12">
                        <ModalHeader title="تسجيل صنف جديد" onClose={() => setShowAddModal(false)} />
                        <div className="grid grid-cols-2 gap-10">
                            <Field label="رمز SKU" value={addForm.data.sku} onChange={v => addForm.setData('sku', v)} placeholder="SKU-XXXXX" />
                            <Field label="اسم الصنف" value={addForm.data.name} onChange={v => addForm.setData('name', v)} />
                        </div>
                        <div className="grid grid-cols-2 gap-10">
                            <Select label="التصنيف" value={addForm.data.category_id} onChange={v => addForm.setData('category_id', v)} options={categories.map(c => ({v:c.id, l:c.category_name}))} />
                            <Select label="الفرع (Entry Node)" value={addForm.data.branch_id} onChange={v => addForm.setData('branch_id', v)} options={branches.map(b => ({v:b.id, l:b.branch_name}))} />
                        </div>
                        <Field label="رصيد المخزون الافتتاحي" type="number" value={addForm.data.stock_quantity} onChange={v => addForm.setData('stock_quantity', v)} />
                        
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block pr-4">الصور التوثيقية</label>
                            <input type="file" multiple onChange={handleAddImagesChange} className="hidden" id="add-images" />
                            <label htmlFor="add-images" className="flex flex-col items-center justify-center p-12 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[2.5rem] cursor-pointer hover:bg-white/[0.04] transition-all group">
                                <svg className="w-12 h-12 text-white/10 group-hover:text-amber-400 group-hover:scale-110 transition-all mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Drag & Drop or Click to Upload High-Fidelity Renders</span>
                            </label>
                            <div className="grid grid-cols-4 gap-6 mt-6">
                                {addPreviews.map((p, i) => (
                                    <div key={i} className={`relative group/img rounded-2xl overflow-hidden border-2 transition-all ${addForm.data.primary_index === i ? 'border-amber-400' : 'border-white/5'}`}>
                                        <img src={p.url} className="w-full h-24 object-cover" />
                                        <button type="button" onClick={() => removeAddImage(i)} className="absolute top-2 left-2 w-6 h-6 bg-rose-500 text-white rounded-lg flex items-center justify-center translate-y-2 opacity-0 group-hover/img:translate-y-0 group-hover/img:opacity-100 transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                        <button type="button" onClick={() => addForm.setData('primary_index', i)} className={`absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all ${addForm.data.primary_index === i ? 'bg-amber-400/20 text-white opacity-100' : 'bg-black/60 text-white/40 opacity-0 group-hover/img:opacity-100'}`}>{addForm.data.primary_index === i ? 'صورة رئيسية' : 'تعيين كرئيسية'}</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <ModalFooter onAbort={() => setShowAddModal(false)} submitTxt="تسجيل الصنف" processing={addForm.processing} />
                    </form>
                </div>
            </Modal>

            {/* EDIT ASSET MODAL */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="xl">
                <div className="bg-[#0c0c0e] text-white p-12 overflow-hidden rounded-[3rem] border border-white/5 relative" dir="rtl">
                    <form onSubmit={submitEdit} className="space-y-12">
                        <ModalHeader title={`تعديل بيانات: ${selectedProduct?.name}`} onClose={() => setShowEditModal(false)} />
                        <div className="grid grid-cols-2 gap-10">
                            <Field label="اسم الصنف" value={editForm.data.name} onChange={v => editForm.setData('name', v)} />
                            <Select label="التصنيف" value={editForm.data.category_id} onChange={v => editForm.setData('category_id', v)} options={categories.map(c => ({v:c.id, l:c.category_name}))} />
                        </div>
                        
                        <div className="space-y-6">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block pr-4">مستودع الصور</label>
                            <div className="grid grid-cols-4 gap-6">
                                {existingImages.map((img) => (
                                    <div key={img.id} className={`relative group/img rounded-2xl overflow-hidden border-2 transition-all ${img.isDeleted ? 'opacity-20 border-rose-500' : editForm.data.primary_image_id === img.id ? 'border-amber-400' : 'border-white/5'}`}>
                                        <img src={`/storage/${img.image_path}`} className="w-full h-24 object-cover grayscale-[0.2]" />
                                        <div className="absolute inset-0 bg-black/40 group-hover/img:bg-black/20 transition-all flex flex-col items-center justify-center gap-2">
                                            {!img.isDeleted && (
                                                <button type="button" onClick={() => editForm.setData('primary_image_id', img.id)} className="px-3 py-1 bg-white/5 text-[9px] font-black uppercase rounded-lg border border-white/10 hover:bg-amber-400 hover:text-black hover:border-transparent transition-all">Primary</button>
                                            )}
                                            <button type="button" onClick={() => toggleDeleteExisting(img.id)} className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border transition-all ${img.isDeleted ? 'bg-white/5 text-white/40 border-white/10 hover:bg-emerald-500 hover:text-black hover:border-transparent' : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white hover:border-transparent'}`}>
                                                {img.isDeleted ? 'استرجاع' : 'حذف'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {editPreviews.map((p, i) => (
                                    <div key={i} className="relative group/img rounded-2xl overflow-hidden border-2 border-emerald-500/20">
                                        <img src={p.url} className="w-full h-24 object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <button type="button" onClick={() => removeEditNewImage(i)} className="w-8 h-8 bg-rose-500 text-white rounded-lg flex items-center justify-center"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                        </div>
                                    </div>
                                ))}
                                <label className="h-24 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-white/[0.04] transition-all text-white/10 hover:text-amber-400">
                                    <input type="file" multiple onChange={handleEditNewImagesChange} className="hidden" />
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                </label>
                            </div>
                        </div>

                        <ModalFooter onAbort={() => setShowEditModal(false)} submitTxt="حفظ التعديلات" processing={editForm.processing} />
                    </form>
                </div>
            </Modal>

            {/* STOCK ADJUSTMENT MODAL */}
            <Modal show={showStockModal} onClose={() => setShowStockModal(false)} maxWidth="md">
                <div className="bg-[#0c0c0e] text-white p-12 overflow-hidden rounded-[3rem] border border-white/5 relative" dir="rtl">
                    <form onSubmit={submitStockMode} className="space-y-12">
                        <ModalHeader title="ضبط مخزون الفرع" onClose={() => setShowStockModal(false)} />
                        <Select label="اختر الفرع المستهدف" value={stockForm.data.branch_id} onChange={v => stockForm.setData('branch_id', v)} options={branches.map(b => ({v:b.id, l:b.branch_name}))} />
                        <Field label="ضبط الكمية" type="number" value={stockForm.data.stock_quantity} onChange={v => stockForm.setData('stock_quantity', v)} />
                        <div className="p-8 bg-amber-400/5 rounded-3xl border border-amber-400/10 flex items-start gap-4">
                            <svg className="w-6 h-6 text-amber-400 mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-[11px] font-black text-amber-400/60 uppercase tracking-widest leading-relaxed">تنبيه: ضبط المخزون يوجب التحقق الدقيق ويلغي قيم السجل المركزي لهذا الفرع.</p>
                        </div>
                        <ModalFooter onAbort={() => setShowStockModal(false)} submitTxt="تطبيق التعديل" processing={stockForm.processing} />
                    </form>
                </div>
            </Modal>

            {/* UNITS & PRICING MODAL (VIP ELITE EDITION) */}
            <Modal show={showUnitsModal} onClose={() => setShowUnitsModal(false)} maxWidth="2xl">
                <div className="bg-[#0c0c0e] text-white p-12 overflow-hidden rounded-[4rem] border border-white/5 relative" dir="rtl">
                    <form onSubmit={submitUnitsForm} className="space-y-12">
                        <ModalHeader title="إعداد وحدات البيع" onClose={() => setShowUnitsModal(false)} />
                        
                        <div className="space-y-8 max-h-[50vh] overflow-y-auto px-4 custom-scrollbar">
                            {unitsForm.data.units.map((row, idx) => (
                                <div key={idx} className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] relative group/row hover:bg-white/[0.03] transition-all">
                                    <div className="grid grid-cols-3 gap-8 mb-8">
                                        <Select label="وحدة البيع" value={row.unit_id} onChange={v => updateUnitRow(idx, 'unit_id', v)} options={units.map(u => ({v:u.id, l:u.unit_name}))} />
                                        <Select label="الفرع" value={row.branch_id} onChange={v => updateUnitRow(idx, 'branch_id', v)} options={branches.map(b => ({v:b.id, l:b.branch_name}))} />
                                        <Select label="العملة" value={row.currency_id} onChange={v => updateUnitRow(idx, 'currency_id', v)} options={currencies.map(c => ({v:c.id, l:c.currency_name}))} />
                                    </div>
                                    <div className="grid grid-cols-4 gap-8">
                                        <Field label="معامل التحويل" type="number" step="0.001" value={row.conversion_factor} onChange={v => updateUnitRow(idx, 'conversion_factor', v)} />
                                        <Field label="سعر التكلفة" type="number" step="0.01" value={row.base_price} onChange={v => updateUnitRow(idx, 'base_price', v)} />
                                        <Field label="سعر الجملة" type="number" step="0.01" value={row.wholesale_price} onChange={v => updateUnitRow(idx, 'wholesale_price', v)} />
                                        <Field label="سعر التجزئة" type="number" step="0.01" value={row.retail_price} onChange={v => updateUnitRow(idx, 'retail_price', v)} />
                                    </div>
                                    <div className="absolute -top-4 -left-4 flex gap-2">
                                        <button type="button" onClick={() => updateUnitRow(idx, 'is_default_sale', !row.is_default_sale)} className={`h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${row.is_default_sale ? 'bg-amber-400 text-black border-transparent shadow-xl' : 'bg-[#111114] text-white/20 border-white/5 hover:text-white'}`}>
                                            {row.is_default_sale ? 'وحدة أساسية' : 'تعيين كأساسية'}
                                        </button>
                                        <button type="button" onClick={() => removeUnitRow(idx)} className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all active:scale-90"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={() => unitsForm.setData('units', [...unitsForm.data.units, { unit_id: units[0]?.id || '', branch_id: branches[0]?.id || '', currency_id: currencies[0]?.id || '', conversion_factor: 1, base_price: 0, wholesale_price: 0, retail_price: 0, is_default_sale: false }])} className="w-full py-8 border-2 border-dashed border-white/5 rounded-[3rem] text-[10px] font-black text-white/10 uppercase tracking-[0.4em] hover:bg-white/5 hover:text-amber-400 transition-all group">
                                + إضافة وحدة جديدة
                            </button>
                        </div>

                        <ModalFooter onAbort={() => setShowUnitsModal(false)} submitTxt="حفظ الوحدات" processing={unitsForm.processing} />
                    </form>
                </div>
            </Modal>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(251,191,36,0.2); }
                select { background-image: none !important; }
            ` }} />
        </AdminLayout>
    );
}

// Subcomponents
function StatCard({ label, value, unit, icon, color }) {
    return (
        <div className={`group bg-[#111114] p-10 rounded-[3rem] border border-white/5 hover:border-white/10 transition-all duration-700 shadow-2xl relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000 ${color}`}>{icon}</div>
            <div className="relative z-10 space-y-4">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{label}</span>
                <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black text-white tracking-tighter leading-none">{value}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{unit}</span>
                </div>
            </div>
        </div>
    );
}

function OpBtn({ onClick, icon, color }) {
    return (
        <button onClick={onClick} className={`w-14 h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-white/20 hover:text-${color} hover:border-${color}/20 transition-all active:scale-90 shadow-xl`}>
            {icon}
        </button>
    );
}

function ModalHeader({ title, onClose }) {
    return (
        <div className="flex justify-between items-center pb-8 border-b border-white/5">
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{title}</h3>
            <button type="button" onClick={onClose} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all text-white/30"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
    );
}

function ModalFooter({ onAbort, submitTxt, processing }) {
    return (
        <div className="pt-12 flex gap-8 border-t border-white/5">
            <button type="button" onClick={onAbort} className="flex-1 py-7 bg-white/5 text-white/40 font-black uppercase text-xs tracking-[0.4em] rounded-[2rem] hover:bg-white/10 transition-all">إلغاء</button>
            <button type="submit" disabled={processing} className="flex-[2] py-7 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black uppercase text-xs tracking-[0.4em] rounded-[2rem] shadow-2xl shadow-amber-400/10 active:scale-95 transition-all disabled:opacity-50">
                {processing ? 'جاري الحفظ...' : submitTxt}
            </button>
        </div>
    );
}

function Field({ label, value, onChange, type = "text", placeholder = "", step = "1", className = "" }) {
    return (
        <div className={`space-y-4 ${className}`}>
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block pr-4">{label}</label>
            <input type={type} step={step} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 px-8 text-xl font-black text-white focus:outline-none focus:border-amber-400/30 transition-all shadow-inner" required />
        </div>
    );
}

function Select({ label, value, onChange, options }) {
    return (
        <div className="space-y-4">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block pr-4">{label}</label>
            <div className="relative">
                <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 px-8 text-lg font-black text-white/60 focus:outline-none focus:border-amber-400/30 transition-all appearance-none cursor-pointer">
                    {options.map(o => <option key={o.v} value={o.v} className="bg-[#111114]">{o.l}</option>)}
                </select>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/10"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></div>
            </div>
        </div>
    );
}
