import { useState, useRef, useEffect } from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import Modal from '@/Components/Modal';
import MapPicker from '@/Components/MapPicker';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Register() {
    const { branches } = usePage().props;
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        branch_id: '',
        user_type: 4,
        password: '',
        password_confirmation: '',
        lat: '',
        lng: '',
    });

    const userTypes = [
        {
            id: 4,
            label: 'عميل فردي',
            desc: 'مشتريات شخصية',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            )
        },
        {
            id: 3,
            label: 'شريك تجزئة',
            desc: 'نشاط تجاري قياسي',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            id: 2,
            label: 'تاجر جملة',
            desc: 'توزيع النخبة',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            )
        },
    ];

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <GuestLayout>
                <Head title="إعداد الهوية — شبكة النخبة" />

                <div className="text-center mb-4">
                    <h1 className="text-2xl font-black text-white tracking-tighter uppercase leading-none  italic">إنشاء هوية</h1>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">سجل حضورك ضمن شبكة التوريد الخاصة بالنخبة</p>
                    <div className="h-1 w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-8 opacity-40"></div>
                </div>

                <form onSubmit={submit} className="space-y-10">
                    {/* اختيار نوع الحساب ببحث واحترافية */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.4em] pr-4">فئة العضوية (نوع الحساب)</label>
                        <SearchableUserTypeSelect
                            userTypes={userTypes}
                            value={data.user_type}
                            onChange={(id) => setData('user_type', id)}
                        />
                        <InputError message={errors.user_type} className="mt-2 text-[10px] uppercase tracking-widest text-rose-500 pr-4 font-black text-right" />
                    </div>

                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <VIPField label="الاسم الكامل" value={data.name} onChange={v => setData('name', v)} error={errors.name} />
                            <VIPField label="رقم الهاتف" value={data.phone} onChange={v => setData('phone', v)} error={errors.phone} placeholder="77XXXXXXX" dir="ltr" />
                        </div>

                        {/* اختيار المركز الإقليمي (الفرع) ببحث واحترافية */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.4em] pr-4">عقدة التوزيع الأساسية (الفرع)</label>
                            <SearchableBranchSelect
                                branches={branches || []}
                                value={data.branch_id}
                                onChange={(id) => setData('branch_id', id)}
                            />
                            <InputError message={errors.branch_id} className="mt-2 text-[10px] uppercase tracking-widest text-rose-500 pr-4 font-black text-right" />
                        </div>

                        {/* VIP Map Trigger */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.4em] pr-4">تحديد الموقع الجغرافي (COORDINATES)</label>
                            <button
                                type="button" onClick={() => setIsMapModalOpen(true)}
                                className={`w-full py-6 rounded-[2rem] border transition-all duration-700 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] overflow-hidden relative group/map ${data.lat ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-white/5 bg-white/[0.02] text-white/20 hover:border-amber-400/20 hover:text-amber-400 shadow-xl'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover/map:translate-x-full transition-transform duration-1000" />
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {data.lat ? 'تم قفل الإحداثيات بنجاح' : 'تفعيل بروتوكول الموقع'}
                            </button>
                            <InputError message={errors.lat || errors.lng} className="mt-2 text-[10px] uppercase tracking-widest text-rose-500 pr-4 font-black text-right" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <VIPField label="رمز الوصول (كلمة المرور)" type="password" value={data.password} onChange={v => setData('password', v)} error={errors.password} placeholder="••••••••" dir="ltr" />
                            <VIPField label="تأكيد رمز الوصول" type="password" value={data.password_confirmation} onChange={v => setData('password_confirmation', v)} error={errors.password_confirmation} placeholder="••••••••" dir="ltr" />
                        </div>
                    </div>

                    <div className="mt-16 pt-12 flex flex-col items-center gap-8">
                        <button
                            className="w-full bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 text-black py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] shadow-2xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-500 disabled:opacity-20 disabled:grayscale cursor-pointer"
                            disabled={processing || !data.lat}
                        >
                            {processing ? 'جاري تثبيت السجل...' : 'بدء تفعيل الهوية'}
                        </button>

                        <Link href={route('login')} className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-amber-400 transition-colors py-4">
                            مسجل بالفعل ضمن الشبكة؟ <span className="text-amber-500 border-b border-amber-500/20 pb-0.5">تسجيل الدخول</span>
                        </Link>
                    </div>
                </form>
            </GuestLayout>

            <Modal show={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} maxWidth="2xl">
                <div className="bg-[#0c0c0e] p-10 rounded-[4rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] text-right" dir="rtl">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase">رسم الإحداثيات</h3>
                        <button type="button" onClick={() => setIsMapModalOpen(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/20 hover:bg-rose-500 hover:text-white transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="mb-8 p-6 bg-amber-400/5 rounded-3xl border border-amber-400/10">
                        <p className="text-[11px] font-black text-amber-500/60 uppercase tracking-widest leading-relaxed text-right">يرجى تحديد موقع المحل بدقة على الخارطة لضمان ترقية حسابك إلى وضعية الشريك التجاري الفعّال.</p>
                    </div>
                    <div className="rounded-[2.5rem] overflow-hidden border border-white/5 shadow-inner">
                        <MapPicker lat={data.lat} lng={data.lng} onLocationChange={(lat, lng) => setData(prev => ({ ...prev, lat, lng }))} height="400px" />
                    </div>
                    <div className="mt-10">
                        <button type="button" onClick={() => setIsMapModalOpen(false)} className="w-full py-6 bg-white/5 text-white font-black text-xs uppercase tracking-[0.4em] rounded-[2rem] hover:bg-white/10 transition-all border border-white/5 shadow-xl">
                            قفل الموقع الجغرافي
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

{/* المكون الفرعي: حقل VIP الموحد */ }
function VIPField({ label, value, onChange, type = "text", placeholder = "", dir = "rtl", error }) {
    return (
        <div className="space-y-4">
            <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.4em] pr-4">{label}</label>
            <input
                type={type} value={value} onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] py-6 px-10 text-xl font-black text-white placeholder:text-white/5 focus:outline-none focus:border-amber-400/30 transition-all shadow-inner text-right"
                placeholder={placeholder} dir={dir}
            />
            <InputError message={error} className="mt-2 text-[10px] uppercase tracking-widest text-rose-500 pr-4 font-black text-right" />
        </div>
    );
}

{/* المكون الفرعي: قائمة احترافية قابلة للبحث لـ (نوع الحساب) */ }
function SearchableUserTypeSelect({ userTypes, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef(null);

    const selectedType = userTypes.find(t => t.id === value);
    const filteredTypes = userTypes.filter(t =>
        t.label.toLowerCase().includes(search.toLowerCase()) ||
        t.desc.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full text-right p-5 rounded-[2rem] border transition-all duration-300 flex items-center justify-between gap-4 ${isOpen
                    ? 'border-amber-400/40 bg-white/[0.05] shadow-2xl ring-1 ring-amber-400/20'
                    : 'border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.04]'
                    }`}
            >
                <div className="flex items-center gap-4 min-w-0">
                    {selectedType ? (
                        <>
                            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
                                {selectedType.icon}
                            </div>
                            <div className="text-right truncate">
                                <h3 className="font-black text-xs uppercase tracking-widest text-amber-400 truncate">
                                    {selectedType.label}
                                </h3>
                                <p className="text-[10px] font-black text-white/30 mt-0.5 uppercase tracking-tighter truncate">
                                    {selectedType.desc}
                                </p>
                            </div>
                        </>
                    ) : (
                        <span className="text-white/30 text-xs font-black uppercase tracking-widest">اختر نوع الحساب...</span>
                    )}
                </div>
                <svg className={`w-5 h-5 text-white/30 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-3 w-full rounded-[2.5rem] border border-white/10 bg-[#0c0c0e]/95 backdrop-blur-2xl shadow-2xl p-4 space-y-3 transition-all duration-300">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث في فئات العضوية..."
                            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pr-10 pl-4 py-3 text-xs font-black text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/40 text-right"
                            autoFocus
                        />
                        <svg className="w-4 h-4 text-white/20 absolute right-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                        {filteredTypes.length > 0 ? (
                            filteredTypes.map((type) => {
                                const isSelected = value === type.id;
                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(type.id);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={`w-full text-right p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${isSelected
                                            ? 'border-amber-400/40 bg-amber-400/10'
                                            : 'border-transparent hover:bg-white/[0.04]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-amber-400 text-black scale-105' : 'bg-white/5 text-white/30 group-hover:text-white'
                                                }`}>
                                                {type.icon}
                                            </div>
                                            <div className="truncate">
                                                <h4 className={`font-black text-xs uppercase tracking-widest ${isSelected ? 'text-amber-400' : 'text-white/80 group-hover:text-white'}`}>
                                                    {type.label}
                                                </h4>
                                                <p className="text-[9px] font-black text-white/20 mt-0.5 uppercase tracking-tighter truncate group-hover:text-white/40">
                                                    {type.desc}
                                                </p>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <p className="text-center py-6 text-xs text-white/20 font-black uppercase tracking-widest">لا توجد نتائج</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

{/* المكون الفرعي: قائمة احترافية قابلة للبحث لـ (الفروع) */ }
function SearchableBranchSelect({ branches, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef(null);

    const selectedBranch = branches.find(b => String(b.id) === String(value));
    const filteredBranches = branches.filter(b =>
        b.branch_name.toLowerCase().includes(search.toLowerCase()) ||
        (b.location_city && b.location_city.toLowerCase().includes(search.toLowerCase()))
    );

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full text-right py-6 px-10 rounded-[2rem] border transition-all duration-300 flex items-center justify-between gap-4 ${isOpen
                    ? 'border-amber-400/40 bg-white/[0.05] shadow-2xl ring-1 ring-amber-400/20'
                    : 'border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.04]'
                    }`}
            >
                <span className={`text-lg font-black truncate ${selectedBranch ? 'text-white' : 'text-white/20'}`}>
                    {selectedBranch
                        ? `${selectedBranch.branch_name} (${selectedBranch.location_city || 'المركز الرئيسي'})`
                        : '-- اختر المركز الإقليمي --'}
                </span>
                <svg className={`w-5 h-5 text-white/30 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-3 w-full rounded-[2.5rem] border border-white/10 bg-[#0c0c0e]/95 backdrop-blur-2xl shadow-2xl p-4 space-y-3 transition-all duration-300">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث عن فرع أو مدينة..."
                            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pr-10 pl-4 py-3 text-xs font-black text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/40 text-right"
                            autoFocus
                        />
                        <svg className="w-4 h-4 text-white/20 absolute right-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                        {filteredBranches.length > 0 ? (
                            filteredBranches.map((branch) => {
                                const isSelected = String(value) === String(branch.id);
                                return (
                                    <button
                                        key={branch.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(branch.id);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={`w-full text-right p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${isSelected
                                            ? 'border-amber-400/40 bg-amber-400/10 text-amber-400'
                                            : 'border-transparent text-white/70 hover:bg-white/[0.04] hover:text-white'
                                            }`}
                                    >
                                        <div className="truncate">
                                            <span className="font-black text-sm block truncate">{branch.branch_name}</span>
                                            {branch.location_city && (
                                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mt-0.5">
                                                    المدينة: {branch.location_city}
                                                </span>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)] shrink-0" />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <p className="text-center py-6 text-xs text-white/20 font-black uppercase tracking-widest">لا توجد فروع مطابقة</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}