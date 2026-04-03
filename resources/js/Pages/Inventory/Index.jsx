import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { useToast } from '@/Components/Toast';
import { formatCurrency } from '@/constants';

export default function InventoryIndex({ auth, products, stats, units, categories, branches }) {
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
        sku: '', name: '', official_price: 0, wholesale_price: 0, retail_price: 0, 
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
        name: '', official_price: 0, wholesale_price: 0, retail_price: 0, category_id: '', 
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
            official_price: product.official_price,
            wholesale_price: product.wholesale_price,
            retail_price: product.retail_price,
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
                conversion_factor: u.conversion_factor,
                base_price: u.base_price,
                wholesale_price: u.wholesale_price,
                retail_price: u.retail_price,
                is_default_sale: u.is_default_sale ? true : false,
            })));
        } else {
            unitsForm.setData('units', [
                { unit_id: units[0]?.id || '', branch_id: branches[0]?.id || '', conversion_factor: 1, base_price: product.official_price, wholesale_price: product.wholesale_price, retail_price: product.retail_price, is_default_sale: true }
            ]);
        }
        setShowUnitsModal(true);
    };

    const addUnitRow = () => {
        unitsForm.setData('units', [...unitsForm.data.units, { unit_id: units[0]?.id || '', branch_id: branches[0]?.id || '', conversion_factor: 1, base_price: 0, wholesale_price: 0, retail_price: 0, is_default_sale: false }]);
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

            <div className="page-header">
                <div>
                    <h2 className="page-title">إدارة المخزون والأصناف</h2>
                    <p className="page-subtitle">مراقبة الأرصدة والأسعار للفروع المختلفة</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                        + إضافة صنف
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="stat-card">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">إجمالي الأصناف</div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total_products}</div>
                </div>
                <div className="stat-card">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">تنبيهات مخزون منخفض</div>
                    <div className="text-2xl font-bold text-red-600">{stats.low_stock}</div>
                </div>
                <div className="stat-card">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">القيمة التقديرية</div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total_value} <span className="text-sm font-normal text-gray-400">ر.ي</span></div>
                </div>
            </div>

            <div className="card">
                <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative w-full sm:max-w-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                        <input type="text" placeholder="بحث بالاسم أو رمز SKU..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full border border-gray-300 rounded-md text-sm py-2 pr-9 pl-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="w-full sm:max-w-xs">
                        <select className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                            <option value="">جميع الفئات</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>صورة</th>
                                <th>رمز SKU</th>
                                <th>المنتج والفئة</th>
                                <th>الرصيد الكلي (جميع الفروع)</th>
                                <th>الأسعار (رسمي / تجزئة / جملة)</th>
                                <th className="text-center">الحالة</th>
                                <th className="text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => {
                                const level = getStockLevel(product.total_stock);
                                return (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="w-12 h-12 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 overflow-hidden">
                                                {product.thumbnail ? (
                                                    <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                )}
                                            </div>
                                        </td>
                                        <td className="font-mono text-xs text-gray-500">{product.sku}</td>
                                        <td>
                                            <div className="font-bold text-gray-900">{product.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{product.category?.category_name || 'بدون فئة'}</div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-100 rounded-full h-2">
                                                    <div className={`h-2 rounded-full ${level.color}`} style={{ width: `${Math.min(100, (product.total_stock / 200) * 100)}%` }}></div>
                                                </div>
                                                <span className={`text-sm font-bold ${level.text}`}>{product.total_stock || 0}</span>
                                            </div>
                                            <button onClick={() => openStockModal(product)} className="text-[10px] text-blue-600 hover:underline mt-1">تعديل المخزون للفروع</button>
                                        </td>
                                        <td>
                                            <div className="text-xs text-gray-600 space-y-1">
                                                <div>رسمي: <span className="font-bold">{formatCurrency(product.official_price)}</span></div>
                                                <div>تجزئة: <span className="text-blue-700 font-bold">{formatCurrency(product.retail_price)}</span></div>
                                                <div>جملة: <span className="text-green-700 font-bold">{formatCurrency(product.wholesale_price)}</span></div>
                                            </div>
                                        </td>
                                        <td className="text-center"><span className={`badge ${level.badge}`}>{level.label}</span></td>
                                        <td className="text-center">
                                            <div className="flex flex-col gap-1 items-center justify-center">
                                                <button onClick={() => openUnitsModal(product)} className="text-xs text-purple-600 hover:text-purple-800 font-medium px-2 py-1 bg-purple-50 rounded w-full">تخصيص الوحدات</button>
                                                <div className="flex gap-1 w-full">
                                                    <button onClick={() => openEditModal(product)} className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 bg-blue-50 rounded flex-1">تعديل</button>
                                                    <button onClick={() => deleteProduct(product)} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 bg-red-50 rounded flex-1">حذف</button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredProducts.length === 0 && (
                                <tr><td colSpan="8" className="text-center py-10 text-gray-400">لا توجد أصناف مطابقة</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
                    عرض {filteredProducts.length} من {products.total} صنف
                </div>
            </div>

            {/* ========== ADD PRODUCT MODAL ========== */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة صنف جديد (مع أول رصيد فرعي)" maxWidth="md">
                <form onSubmit={submitAdd}>
                    <Modal.Body className="max-h-[70vh] overflow-y-auto">
                        <div className="space-y-4">
                            {/* GALLERY MANAGER */}
                            <div className="bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-3">معرض صور المنتج</label>
                                
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {addPreviews.map((preview, idx) => (
                                        <div key={idx} className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all ${addForm.data.primary_index === idx ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100'}`}>
                                            <img src={preview.url} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <button type="button" onClick={() => addForm.setData('primary_index', idx)} className={`text-[10px] px-2 py-1 rounded font-bold ${addForm.data.primary_index === idx ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}>
                                                    {addForm.data.primary_index === idx ? 'الصورة الرئيسية' : 'تعيين كرئيسية'}
                                                </button>
                                                <button type="button" onClick={() => removeAddImage(idx)} className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                            {addForm.data.primary_index === idx && (
                                                <div className="absolute top-1 right-1 bg-blue-500 text-white p-0.5 rounded-full">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    <label className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors group">
                                        <svg className="w-6 h-6 text-gray-300 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold">إضافة صور</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleAddImagesChange} />
                                    </label>
                                </div>
                                <p className="text-[10px] text-gray-400">بإمكانك إضافة صور متعددة وتحديد الصورة الرئيسية للعرض.</p>
                            </div>

                            {/* BASIC INFO */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">رمز الصنف (SKU) *</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" placeholder="مثال: BEV-001" value={addForm.data.sku} onChange={e => addForm.setData('sku', e.target.value)} required />
                                    {addForm.errors.sku && <p className="text-xs text-red-500 mt-1">{addForm.errors.sku}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الصنف *</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={addForm.data.name} onChange={e => addForm.setData('name', e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">الفئة</label>
                                <select className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={addForm.data.category_id} onChange={e => addForm.setData('category_id', e.target.value)}>
                                    <option value="">بدون فئة</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                                </select>
                            </div>
                            
                            {/* PRICING */}
                            <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg grid grid-cols-3 gap-3">
                                <div className="col-span-3 text-xs font-bold text-gray-700 border-b border-gray-200 pb-2">التسعير</div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">الرسمي</label>
                                    <input type="number" step="0.01" min="0" className="w-full border border-gray-300 rounded-md text-sm py-2 px-2" value={addForm.data.official_price} onChange={e => addForm.setData('official_price', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">الجملة</label>
                                    <input type="number" step="0.01" min="0" className="w-full border border-gray-300 rounded-md text-sm py-2 px-2" value={addForm.data.wholesale_price} onChange={e => addForm.setData('wholesale_price', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">التجزئة</label>
                                    <input type="number" step="0.01" min="0" className="w-full border border-gray-300 rounded-md text-sm py-2 px-2" value={addForm.data.retail_price} onChange={e => addForm.setData('retail_price', e.target.value)} required />
                                </div>
                            </div>

                            {/* INITIAL STOCK */}
                            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg grid grid-cols-2 gap-3">
                                <div className="col-span-2 text-xs font-bold text-blue-800 border-b border-blue-200 pb-2">تفاصيل الإيداع الأولية</div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">الفرع المُستلم</label>
                                    <select className="w-full border border-gray-300 rounded-md text-sm py-2 px-3" value={addForm.data.branch_id} onChange={e => addForm.setData('branch_id', e.target.value)} required>
                                        <option value="">اختر الفرع...</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                    </select>
                                    {addForm.errors.branch_id && <p className="text-xs text-red-500 mt-1">{addForm.errors.branch_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">الرصيد المبدئي (قطعة)</label>
                                    <input type="number" min="0" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3" value={addForm.data.stock_quantity} onChange={e => addForm.setData('stock_quantity', e.target.value)} required />
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
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title={`تعديل معلومات — ${selectedProduct?.name || ''}`} maxWidth="md">
                {selectedProduct && (
                    <form onSubmit={submitEdit}>
                        <Modal.Body className="max-h-[70vh] overflow-y-auto">
                            <div className="space-y-4">
                                {/* GALLERY MANAGER */}
                                <div className="bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">معرض الصور الحالي والجديد</label>
                                    
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        {/* Existing Images */}
                                        {existingImages.map((img) => (
                                            <div key={`existing-${img.id}`} className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all ${editForm.data.primary_image_id === img.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100'} ${img.isDeleted ? 'opacity-40 grayscale' : ''}`}>
                                                <img src={`/storage/${img.image_path}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                    {!img.isDeleted && (
                                                        <button type="button" onClick={() => editForm.setData('primary_image_id', img.id)} className={`text-[10px] px-2 py-1 rounded font-bold ${editForm.data.primary_image_id === img.id ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}>
                                                            {editForm.data.primary_image_id === img.id ? 'الرئيسية' : 'تعيين رئيسية'}
                                                        </button>
                                                    )}
                                                    <button type="button" onClick={() => toggleDeleteExisting(img.id)} className={`p-1 rounded-full ${img.isDeleted ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                        {img.isDeleted ? (
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        )}
                                                    </button>
                                                </div>
                                                {editForm.data.primary_image_id === img.id && !img.isDeleted && (
                                                    <div className="absolute top-1 right-1 bg-blue-500 text-white p-0.5 rounded-full">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    </div>
                                                )}
                                                {img.isDeleted && <div className="absolute inset-0 flex items-center justify-center bg-white/20"><span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full font-bold">سيتم الحذف</span></div>}
                                            </div>
                                        ))}

                                        {/* New Image Previews */}
                                        {editPreviews.map((preview, idx) => (
                                            <div key={`new-${idx}`} className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all ${editForm.data.primary_image_id === `new_${idx}` ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100'}`}>
                                                <img src={preview.url} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                    <button type="button" onClick={() => editForm.setData('primary_image_id', `new_${idx}`)} className={`text-[10px] px-2 py-1 rounded font-bold ${editForm.data.primary_image_id === `new_${idx}` ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}>
                                                        تعيين رئيسية
                                                    </button>
                                                    <button type="button" onClick={() => removeEditNewImage(idx)} className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Button */}
                                        <label className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors group">
                                            <svg className="w-6 h-6 text-gray-300 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold">رفع صور</span>
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleEditNewImagesChange} />
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الصنف *</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">الفئة</label>
                                    <select className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={editForm.data.category_id} onChange={e => editForm.setData('category_id', e.target.value)}>
                                        <option value="">بدون فئة</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 gap-4 border-t pt-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">السعر الرسمي</label>
                                        <input type="number" step="0.01" min="0" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3" value={editForm.data.official_price} onChange={e => editForm.setData('official_price', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">سعر الجملة</label>
                                        <input type="number" step="0.01" min="0" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3" value={editForm.data.wholesale_price} onChange={e => editForm.setData('wholesale_price', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">سعر التجزئة</label>
                                        <input type="number" step="0.01" min="0" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3" value={editForm.data.retail_price} onChange={e => editForm.setData('retail_price', e.target.value)} required />
                                    </div>
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
                        <div className="space-y-4">
                            <p className="text-xs text-gray-500 mb-2">اختر الفرع لتعديل الكمية المتوفرة فيه. سيتم الاستبدال بالكمية الجديدة.</p>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">الفرع</label>
                                <select className="w-full border border-gray-300 rounded-md text-sm py-2 px-3" value={stockForm.data.branch_id} onChange={e => stockForm.setData('branch_id', e.target.value)} required>
                                    <option value="">اختر الفرع...</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">جرد الكمية (Current Stock)</label>
                                <input type="number" min="0" className="w-full border-blue-500 ring-1 ring-blue-500 rounded-md text-lg py-2 px-3 font-bold text-center" value={stockForm.data.stock_quantity} onChange={e => stockForm.setData('stock_quantity', e.target.value)} required />
                                <p className="text-[10px] text-gray-400 mt-1 text-center">أدخل الكمية الفعلية للصنف (بالحبة)</p>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" onClick={() => setShowStockModal(false)} className="btn-secondary">إنهاء</button>
                        <button type="submit" disabled={stockForm.processing} className="btn-primary">اعتماد الرصيد</button>
                    </Modal.Footer>
                </form>
            </Modal>
            {/* ========== UNITS & PRICING MODAL ========== */}
            <Modal show={showUnitsModal} onClose={() => setShowUnitsModal(false)} title={`الوحدات والتسعير المرن: ${selectedProduct?.name}`} maxWidth="3xl">
                <form onSubmit={submitUnitsForm}>
                    <Modal.Body className="max-h-[70vh] overflow-y-auto bg-gray-50/50">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-blue-50 text-blue-800 p-3 rounded border border-blue-100">
                                <p className="text-xs font-semibold">بإمكانك تعريف أكثر من وحدة للمنتج، وتخصيص أسعار مختلفة لكل وحدة حسب الفرع!</p>
                                <button type="button" onClick={addUnitRow} className="btn-primary text-xs py-1 px-3">
                                    + إضافة وحدة تعريف
                                </button>
                            </div>

                            <div className="space-y-3">
                                {unitsForm.data.units.map((unitRow, index) => (
                                    <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative">
                                        <button type="button" onClick={() => removeUnitRow(index)} className="absolute top-3 left-3 text-red-500 hover:text-red-700 bg-red-50 p-1 rounded transition-colors" title="حذف هذه الوحدة">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pr-8">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">الوحدة</label>
                                                <select className="w-full border border-gray-300 rounded text-xs py-1.5 focus:ring-blue-500" value={unitRow.unit_id} onChange={e => updateUnitRow(index, 'unit_id', e.target.value)} required>
                                                    <option value="">اختر الوحدة...</option>
                                                    {units.map(u => <option key={u.id} value={u.id}>{u.unit_name} ({u.short_name})</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">الفرع المطبق عليه (التسعير)</label>
                                                <select className="w-full border border-gray-300 rounded text-xs py-1.5 focus:ring-blue-500" value={unitRow.branch_id} onChange={e => updateUnitRow(index, 'branch_id', e.target.value)} required>
                                                    <option value="">اختر الفرع...</option>
                                                    {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">معامل التحويل (كم حبة؟)</label>
                                                <input type="number" min="1" step="0.01" className="w-full border border-gray-300 rounded text-xs py-1.5" value={unitRow.conversion_factor} onChange={e => updateUnitRow(index, 'conversion_factor', e.target.value)} required />
                                            </div>
                                            <div className="flex items-center mt-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" className="rounded text-blue-600 border-gray-300 focus:ring-blue-500" checked={unitRow.is_default_sale} onChange={e => updateUnitRow(index, 'is_default_sale', e.target.checked)} />
                                                    <span className="text-xs font-semibold text-gray-700">وحدة البيع الافتراضية؟</span>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">السعر الرسمي لهذه الوحدة</label>
                                                <input type="number" step="0.01" min="0" className="w-full border border-blue-200 bg-blue-50/50 rounded text-xs py-1.5 font-semibold text-gray-800" value={unitRow.base_price} onChange={e => updateUnitRow(index, 'base_price', e.target.value)} required />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-green-600 uppercase mb-1">سعر الجملة</label>
                                                <input type="number" step="0.01" min="0" className="w-full border border-green-200 bg-green-50/50 rounded text-xs py-1.5 font-semibold text-gray-800" value={unitRow.wholesale_price} onChange={e => updateUnitRow(index, 'wholesale_price', e.target.value)} required />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-purple-600 uppercase mb-1">سعر التجزئة</label>
                                                <input type="number" step="0.01" min="0" className="w-full border border-purple-200 bg-purple-50/50 rounded text-xs py-1.5 font-semibold text-gray-800" value={unitRow.retail_price} onChange={e => updateUnitRow(index, 'retail_price', e.target.value)} required />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {unitsForm.data.units.length === 0 && (
                                    <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed border-gray-300 rounded-lg">
                                        لا توجد وحدات معرفة. اضغط على أضف وحدة.
                                    </div>
                                )}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" onClick={() => setShowUnitsModal(false)} className="btn-secondary">إلغاء</button>
                        <button type="submit" disabled={unitsForm.processing} className="btn-primary">حفظ واعتماد التسعير المرن</button>
                    </Modal.Footer>
                </form>
            </Modal>
        </AdminLayout>
    );
}
