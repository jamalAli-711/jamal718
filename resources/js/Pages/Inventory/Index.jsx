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

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // --- Add Product Form ---
    const addForm = useForm({
        sku: '', name: '',
        stock_quantity: 0, branch_id: branches[0]?.id || '', category_id: '',
        images: [], primary_index: 0,
    });

    const [addPreviews, setAddPreviews] = useState([]);

    const handleAddImagesChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));
        setAddPreviews([...addPreviews, ...newPreviews]);
        addForm.setData('images', [...addForm.data.images, ...files]);
    };

    const removeAddImage = (index) => {
        const newPreviews = [...addPreviews];
        newPreviews.splice(index, 1);
        setAddPreviews(newPreviews);

        const newImages = [...addForm.data.images];
        newImages.splice(index, 1);
        addForm.setData('images', newImages);

        if (addForm.data.primary_index === index) {
            addForm.setData('primary_index', 0);
        } else if (addForm.data.primary_index > index) {
            addForm.setData('primary_index', addForm.data.primary_index - 1);
        }
    };

    const submitAdd = (e) => {
        e.preventDefault();
        addForm.post(route('inventory.store'), {
            forceFormData: true,
            onSuccess: () => {
                setShowAddModal(false);
                addForm.reset();
                setAddPreviews([]);
            },
        });
    };

    // --- Edit Product Form ---
    const editForm = useForm({
        name: '', category_id: '',
        new_images: [], deleted_images: [], primary_image_id: null, _method: 'PUT'
    });

    const [editPreviews, setEditPreviews] = useState([]); // For newly added files
    const [existingImages, setExistingImages] = useState([]); // From product.images

    const openEditModal = (product) => {
        setSelectedProduct(product);
        setExistingImages(product.images.map(img => ({ ...img, isDeleted: false })));
        setEditPreviews([]);

        const primaryImg = product.images.find(img => img.is_primary);

        editForm.setData({
            name: product.name,
            category_id: product.category_id || '',
            new_images: [],
            deleted_images: [],
            primary_image_id: primaryImg ? primaryImg.id : null,
            _method: 'PUT'
        });
        setShowEditModal(true);
    };

    const handleEditNewImagesChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));
        setEditPreviews([...editPreviews, ...newPreviews]);
        editForm.setData('new_images', [...editForm.data.new_images, ...files]);
    };

    const toggleDeleteExisting = (id) => {
        const isCurrentlyDeleted = editForm.data.deleted_images.includes(id);
        const newDeleted = isCurrentlyDeleted
            ? editForm.data.deleted_images.filter(did => did !== id)
            : [...editForm.data.deleted_images, id];

        editForm.setData('deleted_images', newDeleted);
        setExistingImages(existingImages.map(img => img.id === id ? { ...img, isDeleted: !isCurrentlyDeleted } : img));

        // If we delete the primary, we should probably pick another one
        if (!isCurrentlyDeleted && editForm.data.primary_image_id === id) {
            editForm.setData('primary_image_id', null);
        }
    };

    const removeEditNewImage = (index) => {
        const newPreviews = [...editPreviews];
        newPreviews.splice(index, 1);
        setEditPreviews(newPreviews);

        const newImages = [...editForm.data.new_images];
        newImages.splice(index, 1);
        editForm.setData('new_images', newImages);

        if (editForm.data.primary_image_id === `new_${index}`) {
            editForm.setData('primary_image_id', null);
        }
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.post(route('inventory.update', selectedProduct.id), {
            forceFormData: true,
            onSuccess: () => setShowEditModal(false),
        });
    };

    // --- Stock Update Form ---
    const stockForm = useForm({
        branch_id: '', stock_quantity: 0,
    });

    const openStockModal = (product) => {
        setSelectedProduct(product);
        stockForm.setData({
            branch_id: branches[0]?.id || '',
            stock_quantity: 0,
        });
        setShowStockModal(true);
    };

    useEffect(() => {
        if (showStockModal && selectedProduct && stockForm.data.branch_id) {
            const branchPivot = selectedProduct.branches?.find(b => b.id == stockForm.data.branch_id);
            stockForm.setData('stock_quantity', branchPivot ? branchPivot.pivot.stock_quantity : 0);
        }
    }, [stockForm.data.branch_id, showStockModal, selectedProduct]);

    const submitStockMode = (e) => {
        e.preventDefault();
        stockForm.put(route('inventory.updateStock', selectedProduct.id), {
            onSuccess: () => setShowStockModal(false),
        });
    };

    // --- Units Setup Form ---
    const unitsForm = useForm({
        units: []
    });

    const openUnitsModal = (product) => {
        setSelectedProduct(product);
        // Load existing units or an empty one
        if (product.units && product.units.length > 0) {
            unitsForm.setData('units', product.units.map(u => ({
                id: u.id, // optional
                unit_id: u.unit_id,
                branch_id: u.branch_id || branches[0]?.id || '',
                currency_id: u.currency_id || currencies[0]?.id || '',
                conversion_factor: u.conversion_factor,
                base_price: u.base_price,
                wholesale_price: u.wholesale_price,
                retail_price: u.retail_price,
                is_default_sale: u.is_default_sale ? true : false,
            })));
        } else {
            unitsForm.setData('units', [
                { unit_id: units[0]?.id || '', branch_id: branches[0]?.id || '', currency_id: currencies[0]?.id || '', conversion_factor: 1, base_price: 0, wholesale_price: 0, retail_price: 0, is_default_sale: true }
            ]);
        }
        setShowUnitsModal(true);
    };

    const addUnitRow = () => {
        unitsForm.setData('units', [...unitsForm.data.units, { unit_id: units[0]?.id || '', branch_id: branches[0]?.id || '', currency_id: currencies[0]?.id || '', conversion_factor: 1, base_price: 0, wholesale_price: 0, retail_price: 0, is_default_sale: false }]);
    };

    const removeUnitRow = (index) => {
        const newUnits = [...unitsForm.data.units];
        newUnits.splice(index, 1);
        unitsForm.setData('units', newUnits);
    };

    const updateUnitRow = (index, field, value) => {
        const newUnits = [...unitsForm.data.units];
        newUnits[index][field] = value;
        unitsForm.setData('units', newUnits);
    };

    const submitUnitsForm = (e) => {
        e.preventDefault();
        unitsForm.post(route('inventory.updateUnits', selectedProduct.id), {
            onSuccess: () => setShowUnitsModal(false),
        });
    };

    // --- Delete ---
    const deleteProduct = (product) => {
        if (confirm(`هل أنت متأكد من حذف "${product.name}"؟`)) {
            router.delete(route('inventory.destroy', product.id));
        }
    };

    const getStockLevel = (qty) => {
        if (qty <= 10) return { color: 'bg-red-500', text: 'text-red-600', label: 'نفاد', badge: 'bg-red-100 text-red-700' };
        if (qty <= 50) return { color: 'bg-amber-400', text: 'text-amber-600', label: 'منخفض', badge: 'bg-amber-100 text-amber-700' };
        return { color: 'bg-green-500', text: 'text-green-600', label: 'متوفر', badge: 'bg-green-100 text-green-700' };
    };

    // Filters
    let filteredProducts = products.data;
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(p => p.name.includes(searchQuery) || p.sku.includes(searchQuery));
    }
    if (filterCategory) {
        filteredProducts = filteredProducts.filter(p => p.category_id == filterCategory);
    }

    return (
        <AdminLayout user={auth.user} header="المخزون">
            <Head title="إدارة المخزون" />

            <div className="animate-slide-in">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 translate-y-0 animate-in fade-in duration-700">
                <div>
                    <h2 className="text-4xl font-black text-[#031633] tracking-tighter">إدارة المخزون والأصناف</h2>
                    <p className="text-slate-500 font-bold text-base mt-2 uppercase tracking-tight">مراقبة دقيقة للأرصدة، الأسعار، وحركة المنتجات عبر الفروع</p>


                </div>
                <button onClick={() => setShowAddModal(true)} className="btn-primary h-12 px-6 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    <span className="font-bold text-sm tracking-wide">إضافة صنف جديد</span>
                </button>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="relative overflow-hidden bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-slate-200 transition-all group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50/50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none mb-2">إجمالي الأصناف</p>
                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{stats.total_products} <span className="text-base font-black text-slate-300">صنف</span></h3>
                        </div>

                    </div>
                </div>

                <div className="relative overflow-hidden bg-white p-6 rounded-3xl border-2 border-rose-50 shadow-sm hover:border-rose-100 transition-all group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50/30 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-black text-rose-400 uppercase tracking-widest leading-none mb-2">تنبيهات الانخفاض</p>
                            <h3 className="text-4xl font-black text-rose-600 tracking-tighter leading-none">{stats.low_stock} <span className="text-base font-black text-rose-300">تنبيه</span></h3>
                        </div>

                    </div>
                </div>

                <div className="relative overflow-hidden bg-slate-900 p-6 rounded-3xl shadow-xl border-t border-white/10 group">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#e31e24]/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000"></div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#e31e24] rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(227,30,36,0.3)]">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-black text-white/40 uppercase tracking-widest leading-none mb-2">إجمالي قيمة المخزون</p>
                            <h3 className="text-4xl font-black text-white tracking-tighter leading-none">{stats.total_value} <span className="text-xl font-black text-[#e31e24] underline underline-offset-4 decoration-2">{stats.currency_symbol}</span></h3>
                        </div>


                    </div>
                </div>
            </div>


            {/* Inventory Table Container */}
            <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b-2 border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                        <div className="relative flex-1 group">
                            <svg className="w-6 h-6 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#e31e24] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input type="text" placeholder="البحث باسم المنتج أو الكود SKU..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full border-2 border-slate-200 rounded-2xl text-lg py-4 pr-12 pl-4 focus:border-[#e31e24] focus:ring-4 focus:ring-red-50 transition-all placeholder:text-slate-300 font-extrabold shadow-sm" />
                        </div>
                        <div className="relative min-w-[240px]">
                            <select className="w-full border-2 border-slate-200 rounded-2xl text-lg py-4 pr-4 pl-10 appearance-none focus:border-[#e31e24] transition-all bg-white font-extrabold text-slate-700 shadow-sm cursor-pointer" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                                <option value="">جميع الأقسام</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                            </select>
                            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                        </div>

                    </div>

                    {searchQuery || filterCategory ? (
                        <button onClick={() => {setSearchQuery(''); setFilterCategory('');}} className="text-base font-black text-[#e31e24] hover:bg-red-50 px-4 py-2 rounded-xl transition-colors border-2 border-rose-100">مسح كافة الفلاتر</button>
                    ) : null}

                </div>
                    <table className="min-w-full border-collapse">
                        <thead className="bg-slate-100 border-b-2 border-slate-200">
                            <tr className="text-right">
                                <th className="px-8 py-6 text-base font-black text-slate-800 uppercase tracking-widest text-center border-l border-slate-200/50">صورة</th>
                                <th className="px-8 py-6 text-base font-black text-slate-800 uppercase tracking-widest border-l border-slate-200/50">رمز SKU</th>
                                <th className="px-8 py-6 text-base font-black text-slate-800 uppercase tracking-widest border-l border-slate-200/50 text-right">المنتج والتفاصيل</th>
                                <th className="px-8 py-6 text-base font-black text-slate-800 uppercase tracking-widest border-l border-slate-200/50 text-center">المخزون المتوفر</th>
                                <th className="px-8 py-6 text-base font-black text-slate-800 uppercase tracking-widest border-l border-slate-200/50 text-right">التسعير والوحدات</th>
                                <th className="px-8 py-6 text-base font-black text-slate-800 uppercase tracking-widest text-center border-l border-slate-200/50 w-32">الحالة</th>
                                <th className="px-8 py-6 text-base font-black text-slate-800 uppercase tracking-widest text-center">الإدارة</th>
                            </tr>
                        </thead>


                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.map((product) => {
                                const level = getStockLevel(product.total_stock);
                                return (
                                    <tr key={product.id} className="group hover:bg-slate-50 transition-all duration-300 border-b border-slate-100 last:border-0">

                                        <td className="px-8 py-6 border-l border-slate-50 text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-sm border-2 border-slate-100 group-hover:border-slate-300 transition-all duration-500 overflow-hidden relative mx-auto">
                                                {product.thumbnail ? (
                                                    <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 border-l border-slate-50">
                                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest block mb-1.5">رمز الصنف</span>
                                            <span className="font-mono text-lg font-black text-slate-900 bg-slate-100 px-4 py-2 rounded-xl border-2 border-slate-200">{product.sku}</span>
                                        </td>

                                        <td className="px-8 py-6 border-l border-slate-50">
                                            <div className="max-w-[250px]">
                                                <h4 className="font-black text-xl text-slate-900 group-hover:text-[#e31e24] transition-colors line-clamp-2 leading-snug">{product.name}</h4>
                                                <span className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg mt-2 uppercase tracking-widest border border-blue-100">
                                                    {product.category?.category_name || 'بدون قسم'}
                                                </span>
                                            </div>
                                        </td>


                                        <td className="px-8 py-6 border-l border-slate-50 bg-slate-50/20">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-sm font-black text-slate-500 uppercase tracking-widest">إجمالي المتوفر</span>
                                                    <span className={`text-2xl font-black ${level.text}`}>{product.total_stock || 0}</span>
                                                </div>


                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                                                    <div className={`h-full rounded-full ${level.color} transition-all duration-1000 ease-out shadow-sm`} style={{ width: `${Math.min(100, (product.total_stock / 200) * 100)}%` }}></div>
                                                </div>
                                                <button onClick={() => openStockModal(product)} className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1.5 transition-colors mt-2 bg-blue-50/50 px-2 py-1 rounded-lg border border-blue-100/50">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                    تعديل الرصيد
                                                </button>

                                            </div>
                                        </td>

                                        <td className="px-8 py-6 border-l border-slate-50">
                                            <div className="text-sm">
                                                {(() => {
                                                    const defUnit = product.units?.find(u => u.is_default_sale) || product.units?.[0];
                                                    if (!defUnit) return <span className="text-xs font-black text-slate-300 uppercase italic">غير مسعر</span>;

                                                    const unitCurrency = currencies.find(c => c.id === defUnit.currency_id) || default_currency;
                                                    const isDifferentCurrency = unitCurrency && default_currency && unitCurrency.id !== default_currency.id;

                                                    const convert = (val) => {
                                                        if (!isDifferentCurrency) return null;
                                                        const converted = val * (unitCurrency.exchange_rate / default_currency.exchange_rate);
                                                        return Number(converted).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                                                    };

                                                    const PriceRow = ({ label, value, colorClass = "" }) => {
                                                        const converted = convert(value);
                                                        return (
                                                            <div className="flex flex-col mb-3 last:mb-0">
                                                                <div className="flex justify-between gap-10 whitespace-nowrap items-baseline">
                                                                    <span className="text-sm font-black text-slate-500 uppercase tracking-widest">{label}</span>
                                                                    <span className={`font-black text-lg ${colorClass}`}>{Number(value).toLocaleString()} <span className="opacity-50 text-xs">{unitCurrency?.currency_code_ar}</span></span>
                                                                </div>
                                                                {converted && (
                                                                    <div className="text-sm font-black text-blue-600 font-mono text-left -mt-0.5 opacity-90">
                                                                        ≈ {converted} {default_currency?.currency_code_ar}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    };

                                                    return (
                                                        <div className="min-w-[200px] bg-slate-50 p-4 rounded-3xl border-2 border-slate-200 group-hover:border-slate-300 transition-colors">
                                                            <PriceRow label="سعر التجزئة" value={defUnit.retail_price} colorClass="text-slate-900" />
                                                            <PriceRow label="سعر الجملة" value={defUnit.wholesale_price} colorClass="text-emerald-700" />
                                                        </div>
                                                    );

                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => openUnitsModal(product)} className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all shadow-sm border-2 border-purple-100" title="تخصيص الوحدات والتسعير">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                                </button>
                                                <button onClick={() => openEditModal(product)} className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm border-2 border-blue-100" title="تعديل البيانات">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => deleteProduct(product)} className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm border-2 border-red-100" title="حذف بالكامل">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-8 py-24 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                                            <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        </div>
                                        <h4 className="font-black text-2xl text-slate-900">لا توجد منتجات مطابقة للبحث</h4>
                                        <button onClick={() => {setSearchQuery(''); setFilterCategory('');}} className="text-base font-black text-blue-600 underline mt-4 uppercase tracking-widest">إلغاء كافة الفلاتر</button>

                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-8 py-5 border-t-2 border-slate-200 text-sm font-black text-slate-900 bg-slate-50 flex justify-between items-center rounded-b-3xl">
                    <span>عرض {filteredProducts.length} من {products.total} صنف في المخزن</span>
                    <span className="text-slate-400 uppercase tracking-widest text-[10px]">Inventory Lifecycle Manager</span>
                </div>



            {/* ========== ADD PRODUCT MODAL ========== */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة صنف جديد (مع أول رصيد فرعي)" maxWidth="xl">
                <form onSubmit={submitAdd}>
                    <Modal.Body className="max-h-[65vh] overflow-y-auto px-8 py-6">

                        <div className="space-y-4">
                            {/* GALLERY MANAGER */}
                            <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-100">
                                <label className="block text-xs font-black text-slate-500 uppercase mb-3 tracking-widest">معرض صور المنتج</label>


                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {addPreviews.map((preview, idx) => (
                                        <div key={idx} className={`relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all ${addForm.data.primary_index === idx ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-200'}`}>
                                            <img src={preview.url} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <button type="button" onClick={() => addForm.setData('primary_index', idx)} className={`text-xs px-2 py-1 rounded-lg font-bold ${addForm.data.primary_index === idx ? 'bg-blue-500 text-white' : 'bg-white text-slate-900'}`}>
                                                    {addForm.data.primary_index === idx ? 'الصورة الرئيسية' : 'تعيين كرئيسية'}
                                                </button>

                                                <button type="button" onClick={() => removeAddImage(idx)} className="bg-rose-500 text-white p-1.5 rounded-full hover:bg-rose-600 transition-colors shadow-lg">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <label className="aspect-square border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-100 cursor-pointer transition-all group">
                                        <svg className="w-7 h-7 text-slate-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                        <span className="text-xs text-slate-400 mt-2 uppercase font-black tracking-widest">إضافة صور</span>

                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleAddImagesChange} />
                                    </label>
                                </div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">بإمكانك إضافة صور متعددة وتحديد الصورة الرئيسية للعرض.</p>

                            </div>


                            {/* BASIC INFO */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-1.5">رمز الصنف (SKU) *</label>
                                    <input type="text" className="w-full border-2 border-slate-200 rounded-xl text-lg py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-black text-slate-900" placeholder="BEV-001" value={addForm.data.sku} onChange={e => addForm.setData('sku', e.target.value)} required />
                                    {addForm.errors.sku && <p className="text-sm font-black text-rose-500 mt-1 uppercase">{addForm.errors.sku}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-1.5">اسم الصنف *</label>
                                    <input type="text" className="w-full border-2 border-slate-200 rounded-xl text-lg py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-black text-slate-900" value={addForm.data.name} onChange={e => addForm.setData('name', e.target.value)} required />
                                </div>

                            </div>
                            <div>
                                <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-1.5">الفئة القسم</label>
                                <select className="w-full border-2 border-slate-200 rounded-xl text-lg py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-black text-slate-900" value={addForm.data.category_id} onChange={e => addForm.setData('category_id', e.target.value)}>
                                    <option value="">بدون فئة</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                                </select>
                            </div>



                            {/* removed legacy pricing logic */}

                            {/* INITIAL STOCK */}
                            <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 grid grid-cols-2 gap-4 shadow-xl">
                                <div className="col-span-2 text-xs font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 pb-2">إيداع المخزون الأولي</div>

                                <div>
                                    <label className="block text-sm font-black text-slate-300 uppercase tracking-widest mb-1.5 text-right">الفرع المستلم</label>
                                    <select className="w-full border-2 border-slate-700 bg-slate-800 rounded-xl text-lg py-3 px-4 text-white font-black focus:border-[#e31e24] transition-all" value={addForm.data.branch_id} onChange={e => addForm.setData('branch_id', e.target.value)} required>
                                        <option value="">اختر الفرع...</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-300 uppercase tracking-widest mb-1.5 text-right">الكمية المتاحة</label>
                                    <input type="number" min="0" className="w-full border-2 border-slate-700 bg-slate-800 rounded-xl text-lg py-3 px-4 text-white font-black focus:border-[#e31e24] transition-all text-center" value={addForm.data.stock_quantity} onChange={e => addForm.setData('stock_quantity', e.target.value)} required />
                                </div>

                            </div>

                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">إلغاء</button>
                        <button type="submit" disabled={addForm.processing} className="btn-primary">{addForm.processing ? 'جاري الحفظ...' : 'حفظ الصنف'}</button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* ========== EDIT PRODUCT DETAILS MODAL ========== */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title={`تعديل معلومات — ${selectedProduct?.name || ''}`} maxWidth="xl">
                {selectedProduct && (
                    <form onSubmit={submitEdit}>
                        <Modal.Body className="max-h-[65vh] overflow-y-auto px-8 py-6">

                            <div className="space-y-4">
                                {/* GALLERY MANAGER */}
                                <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-100">
                                    <label className="block text-xs font-black text-slate-500 uppercase mb-3 tracking-widest">معرض الصور الحالي والجديد</label>


                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        {/* Existing Images */}
                                        {existingImages.map((img) => (
                                            <div key={`existing-${img.id}`} className={`relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all ${editForm.data.primary_image_id === img.id ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-100'} ${img.isDeleted ? 'opacity-40 grayscale' : ''}`}>
                                                <img src={`/storage/${img.image_path}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                    {!img.isDeleted && (
                                                        <button type="button" onClick={() => editForm.setData('primary_image_id', img.id)} className={`text-xs px-2 py-1 rounded-lg font-bold ${editForm.data.primary_image_id === img.id ? 'bg-blue-500 text-white' : 'bg-white text-slate-900'}`}>
                                                            {editForm.data.primary_image_id === img.id ? 'الرئيسية' : 'تعيين رئيسية'}
                                                        </button>

                                                    )}
                                                    <button type="button" onClick={() => toggleDeleteExisting(img.id)} className={`p-1.5 rounded-full shadow-lg transition-colors ${img.isDeleted ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                                        {img.isDeleted ? (
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        )}
                                                    </button>
                                                </div>
                                                {img.isDeleted && <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]"><span className="bg-rose-600 text-xs px-2 py-1 rounded-lg font-black uppercase tracking-widest shadow-lg">سيتم الحذف</span></div>}

                                            </div>
                                        ))}

                                        {/* New Image Previews */}
                                        {editPreviews.map((preview, idx) => (
                                            <div key={`new-${idx}`} className={`relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all ${editForm.data.primary_image_id === `new_${idx}` ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-200'}`}>
                                                <img src={preview.url} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                    <button type="button" onClick={() => editForm.setData('primary_image_id', `new_${idx}`)} className={`text-xs px-2 py-1 rounded-lg font-bold ${editForm.data.primary_image_id === `new_${idx}` ? 'bg-blue-500 text-white' : 'bg-white text-slate-900'}`}>
                                                        تعيين رئيسية
                                                    </button>

                                                    <button type="button" onClick={() => removeEditNewImage(idx)} className="bg-rose-500 text-white p-1.5 rounded-full hover:bg-rose-600 shadow-lg">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Button */}
                                        <label className="aspect-square border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-100 cursor-pointer transition-all group">
                                            <svg className="w-7 h-7 text-slate-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                            <span className="text-xs text-slate-400 mt-2 uppercase font-black tracking-widest">رفع صور</span>

                                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleEditNewImagesChange} />
                                        </label>
                                    </div>
                                </div>


                                <div>
                                    <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-1.5">اسم الصنف *</label>
                                    <input type="text" className="w-full border-2 border-slate-200 rounded-xl text-lg py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-black text-slate-900 shadow-sm" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-1.5">القسم التابع له</label>
                                    <select className="w-full border-2 border-slate-200 rounded-xl text-lg py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-black text-slate-900 shadow-sm" value={editForm.data.category_id} onChange={e => editForm.setData('category_id', e.target.value)}>
                                        <option value="">بدون فئة</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                                    </select>
                                </div>


                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">إلغاء</button>
                            <button type="submit" disabled={editForm.processing} className="btn-primary">{editForm.processing ? 'جاري التحديث...' : 'حفظ التعديلات'}</button>
                        </Modal.Footer>
                    </form>
                )}
            </Modal>

            {/* ========== STOCK DISTRIBUTE MODAL ========== */}
            <Modal show={showStockModal} onClose={() => setShowStockModal(false)} title={`تعديل أرصدة الفروع للمنتج: ${selectedProduct?.name}`} maxWidth="sm">
                <form onSubmit={submitStockMode}>
                    <Modal.Body>
                        <div className="space-y-6">
                            <div className="bg-blue-50 text-blue-700 p-6 rounded-3xl border-2 border-blue-100 flex items-start gap-4 shadow-sm">
                                <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-sm font-black uppercase tracking-tight leading-relaxed">يرجى اختيار الفرع لتحديث الرصيد المتوفر فيه. سيتم اعتماد الكمية الجديدة بدلاً من القديمة.</p>
                            </div>


                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 text-right">الفرع المستهدف</label>

                                    <select className="w-full border-2 border-slate-200 rounded-2xl text-sm py-3 px-4 focus:border-blue-500 transition-all bg-white font-bold" value={stockForm.data.branch_id} onChange={e => stockForm.setData('branch_id', e.target.value)} required>
                                        <option value="">اختر الفرع...</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                    </select>
                                </div>
                                <div className="relative p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 shadow-inner">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 text-center">الرصيد الفعلي الحالي (قطعة)</label>

                                    <input type="number" min="0" className="w-full border-0 bg-transparent text-5xl py-2 px-3 focus:ring-0 transition-all font-black text-center text-slate-900 placeholder:text-slate-100" placeholder="0" value={stockForm.data.stock_quantity} onChange={e => stockForm.setData('stock_quantity', e.target.value)} required />
                                    <div className="text-xs font-bold text-slate-400 mt-4 text-center uppercase tracking-[0.2em]">أدخل الكمية الموجودة على الرف حالياً</div>

                                </div>
                            </div>

                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" onClick={() => setShowStockModal(false)} className="btn-secondary h-12 px-6 rounded-xl font-bold">إلغاء</button>
                        <button type="submit" disabled={stockForm.processing} className="btn-primary h-12 px-8 rounded-xl font-black shadow-lg">حفظ واعتماد الرصيد</button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* ========== UNITS & PRICING MODAL ========== */}
            <Modal show={showUnitsModal} onClose={() => setShowUnitsModal(false)} title={`الوحدات والتسعير المرن: ${selectedProduct?.name}`} maxWidth="3xl">
                <form onSubmit={submitUnitsForm}>
                    <Modal.Body className="max-h-[60vh] overflow-y-auto bg-slate-50/50 p-8 space-y-6">

                        <div className="flex justify-between items-center bg-white text-slate-900 p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50/50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="relative z-10">
                                <h4 className="text-lg font-black uppercase tracking-widest mb-1">لوحة التحكم في الوحدات والتسعير</h4>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-tight">إدارة الوحدات، العملات، والعلاوات السعرية لكل وحدة</p>


                            </div>
                            <button type="button" onClick={addUnitRow} className="bg-slate-900 text-white h-12 px-6 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-[#e31e24] transition-all relative z-10">
                                + إضافة تعريف وحدة
                            </button>
                        </div>


                        <div className="space-y-6">
                            {unitsForm.data.units.map((unitRow, index) => (
                                <div key={index} className="bg-white p-7 rounded-[3rem] border-2 border-slate-100 shadow-sm relative group/row hover:border-slate-300 transition-all duration-500">
                                    <button type="button" onClick={() => removeUnitRow(index)} className="absolute top-7 left-7 text-slate-200 hover:text-rose-500 hover:scale-125 transition-all p-2 rounded-xl" title="حذف التعريف">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pr-2">
                                        <div>
                                            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2">الوحدة البيعية</label>
                                            <select className="w-full border-2 border-slate-100 rounded-2xl text-lg py-3.5 px-4 focus:border-blue-500 transition-all bg-slate-50 font-black text-slate-900" value={unitRow.unit_id} onChange={e => updateUnitRow(index, 'unit_id', e.target.value)} required>
                                                <option value="">اختر الوحدة...</option>
                                                {units.map(u => <option key={u.id} value={u.id}>{u.unit_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2">الفرع التابع</label>
                                            <select className="w-full border-2 border-slate-100 rounded-2xl text-lg py-3.5 px-4 focus:border-blue-500 transition-all bg-slate-50 font-black text-slate-900" value={unitRow.branch_id} onChange={e => updateUnitRow(index, 'branch_id', e.target.value)} required>
                                                <option value="">اختر الفرع...</option>
                                                {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2">عملة التسعير</label>
                                            <select className="w-full border-2 border-slate-100 rounded-2xl text-lg py-3.5 px-4 focus:border-blue-500 transition-all bg-slate-50 font-black text-slate-900" value={unitRow.currency_id} onChange={e => updateUnitRow(index, 'currency_id', e.target.value)} required>
                                                <option value="">اختر العملة...</option>
                                                {currencies.map(c => <option key={c.id} value={c.id}>{c.currency_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2">معامل التحويل</label>
                                            <input type="number" min="1" step="0.01" className="w-full border-2 border-slate-100 rounded-2xl text-lg py-3.5 px-4 focus:border-blue-500 transition-all bg-slate-50 font-black text-slate-900 text-center" value={unitRow.conversion_factor} onChange={e => updateUnitRow(index, 'conversion_factor', e.target.value)} required />
                                        </div>

                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-7 border-t border-slate-50 items-end">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2">سعر التكلفة</label>
                                            <input type="number" step="0.01" min="0" className="w-full border-2 border-slate-200 rounded-xl text-lg py-3 px-3 focus:border-blue-500 transition-all font-black text-slate-900" value={unitRow.base_price} onChange={e => updateUnitRow(index, 'base_price', e.target.value)} required />
                                        </div>
                                        <div className="p-4 bg-rose-50/30 rounded-2xl border border-rose-50">
                                            <label className="block text-sm font-black text-rose-500 uppercase tracking-widest mb-2 text-right">سعر الجملة</label>
                                            <input type="number" step="0.01" min="0" className="w-full border-2 border-rose-100 rounded-xl text-lg py-3 px-3 focus:border-rose-500 transition-all font-black text-rose-700" value={unitRow.wholesale_price} onChange={e => updateUnitRow(index, 'wholesale_price', e.target.value)} required />
                                        </div>
                                        <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-50">
                                            <label className="block text-sm font-black text-emerald-600 uppercase tracking-widest mb-2 text-right">سعر التجزئة</label>
                                            <input type="number" step="0.01" min="0" className="w-full border-2 border-emerald-100 rounded-xl text-lg py-3 px-3 focus:border-emerald-500 transition-all font-black text-emerald-800" value={unitRow.retail_price} onChange={e => updateUnitRow(index, 'retail_price', e.target.value)} required />
                                        </div>

                                        <div className="pb-4 pr-2">
                                            <label className="flex items-center gap-4 cursor-pointer group/check">
                                                <div className={`w-14 h-8 rounded-full transition-all flex items-center px-1.5 shadow-inner ${unitRow.is_default_sale ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                    <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${unitRow.is_default_sale ? '-translate-x-6' : 'translate-x-0'}`} />
                                                </div>

                                                <input type="checkbox" className="hidden" checked={unitRow.is_default_sale} onChange={e => updateUnitRow(index, 'is_default_sale', e.target.checked)} />
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover/check:text-slate-900 transition-colors leading-tight">وحدة البيع<br/>الافتراضية</span>
                                            </label>
                                        </div>

                                    </div>
                                </div>
                            ))}

                            {unitsForm.data.units.length === 0 && (
                                <div className="text-center py-20 bg-white rounded-[4rem] border-4 border-dashed border-slate-100">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-slate-100 shadow-inner">
                                        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    </div>
                                    <h5 className="text-2xl font-black text-slate-400">لم يتم تعريف أي وحدات بعد</h5>
                                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest mt-2">ابدأ بالضغط على زر "إضافة وحدة تعريف" أعلاه</p>
                                </div>

                            )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="bg-white px-8 py-6 rounded-b-[2.5rem] border-t-2 border-slate-100 flex gap-4">
                        <button type="button" onClick={() => setShowUnitsModal(false)} className="btn-secondary h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] border-2">إلغاء الأمر</button>
                        <button type="submit" disabled={unitsForm.processing} className="bg-slate-900 text-white flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-emerald-600 transition-all transform hover:-translate-y-1 active:scale-95">
                            {unitsForm.processing ? 'جاري المعالجة...' : 'حفظ واعتماد التسعير المحدث'}
                        </button>
                    </Modal.Footer>

                </form>
            </Modal>
            </div>
        </AdminLayout>
    );
}
