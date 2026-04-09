import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import Modal from '@/Components/Modal';
import MapPicker from '@/Components/MapPicker';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Register() {
    const { branches } = usePage().props;
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        branch_id: '',
        user_type: 4, // Default to Customer
        password: '',
        password_confirmation: '',
        lat: '',
        lng: '',
    });

    const userTypes = [
        { id: 4, label: 'عميل', desc: 'لطلب المنتجات الشخصية', icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        )},
        { id: 3, label: 'تاجر تجزئة', desc: 'لأصحاب المحلات الصغيرة', icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        )},
        { id: 2, label: 'تاجر جملة', desc: 'للكميات والموزعين الكبار', icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
        )},
    ];

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="تسجيل حساب جديد" />

            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-[#031633] tracking-tighter uppercase">إنشاء حساب جديد</h1>
                <p className="text-xs font-black text-slate-400 mt-2 uppercase tracking-[0.1em]">اختر نوع العضوية وابدأ رحلتك التجارية معنا</p>
                <div className="h-1.5 w-16 bg-[#e31e24] mx-auto mt-4 rounded-full"></div>
            </div>


            <form onSubmit={submit} className="space-y-6">
                {/* User Type Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    {userTypes.map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => setData('user_type', type.id)}
                            className={`relative text-right p-6 rounded-[2rem] border-2 transition-all duration-500 flex flex-col gap-3 group ${
                                data.user_type === type.id 
                                ? 'border-[#e31e24] bg-white shadow-2xl shadow-red-100 ring-8 ring-red-50' 
                                : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                data.user_type === type.id ? 'bg-[#e31e24] text-white scale-110 rotate-3' : 'bg-white text-slate-400 group-hover:bg-slate-900 group-hover:text-white'
                            }`}>
                                {type.icon}
                            </div>
                            <div>
                                <h3 className={`font-black text-sm uppercase tracking-widest ${data.user_type === type.id ? 'text-[#e31e24]' : 'text-[#031633]'}`}>
                                    {type.label}
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 mt-1 leading-tight uppercase tracking-tight">{type.desc}</p>
                            </div>
                            {data.user_type === type.id && (
                                <div className="absolute top-4 left-4 bg-[#e31e24] text-white rounded-full p-1 shadow-lg animate-in zoom-in">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2">الاسم بالكامل</label>
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="w-full !border-2 !border-slate-50 !bg-slate-50 !rounded-2xl !py-4 !px-5 !text-base !font-black focus:!border-[#e31e24] focus:!bg-white focus:!ring-8 focus:!ring-red-50 transition-all"
                                autoComplete="name"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2">رقم الجوال</label>
                            <TextInput
                                id="phone"
                                name="phone"
                                value={data.phone}
                                className="w-full !border-2 !border-slate-50 !bg-slate-50 !rounded-2xl !py-4 !px-5 !text-base !font-black focus:!border-[#e31e24] focus:!bg-white focus:!ring-8 focus:!ring-red-50 transition-all text-left"
                                dir="ltr"
                                placeholder="770000000"
                                onChange={(e) => setData('phone', e.target.value)}
                                required
                            />
                            <InputError message={errors.phone} className="mt-2" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2">البريد الإلكتروني</label>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full !border-2 !border-slate-50 !bg-slate-50 !rounded-2xl !py-4 !px-5 !text-base !font-black focus:!border-[#e31e24] focus:!bg-white focus:!ring-8 focus:!ring-red-50 transition-all text-left"
                            dir="ltr"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2">المنطقة / الفرع الأقرب</label>
                        <select
                            id="branch_id"
                            name="branch_id"
                            value={data.branch_id}
                            className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl py-4 px-5 text-base font-black focus:border-[#e31e24] focus:bg-white focus:ring-8 focus:ring-red-50 transition-all appearance-none"
                            onChange={(e) => setData('branch_id', e.target.value)}
                            required
                        >
                            <option value="">-- اختر المنطقة --</option>
                            {branches?.map(branch => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.branch_name} ({branch.location_city})
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.branch_id} className="mt-2" />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2">الموقع الجغرافي للمحل</label>
                        <button
                            type="button"
                            onClick={() => setIsMapModalOpen(true)}
                            className={`w-full py-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all duration-500 font-black text-sm uppercase tracking-widest ${
                                data.lat ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-slate-100 bg-white text-[#031633] hover:border-[#e31e24] hover:text-[#e31e24]'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {data.lat ? 'تم تحديد الموقع بنجاح' : 'تحديد الموقع على الخارطة'}
                        </button>
                        <InputError message={errors.lat || errors.lng} className="mt-2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                        <div className="space-y-2">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2">كلمة المرور</label>
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="w-full !border-2 !border-slate-50 !bg-slate-50 !rounded-2xl !py-4 !px-5 !text-base !font-black focus:!border-[#e31e24] focus:!bg-white focus:!ring-8 focus:!ring-red-50 transition-all text-left"
                                dir="ltr"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2">تأكيد كلمة المرور</label>
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="w-full !border-2 !border-slate-50 !bg-slate-50 !rounded-2xl !py-4 !px-5 !text-base !font-black focus:!border-[#e31e24] focus:!bg-white focus:!ring-8 focus:!ring-red-50 transition-all text-left"
                                dir="ltr"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t-2 border-slate-50 flex flex-col items-center gap-6">
                    <button className="w-full bg-[#031633] text-white py-5 rounded-[1.5rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl hover:bg-[#e31e24] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50" disabled={processing || !data.lat}>
                        {processing ? 'جاري المعالجة...' : 'تأكيد وإنشاء الحساب'}
                    </button>
                    
                    <Link
                        href={route('login')}
                        className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-[#e31e24] transition-colors"
                    >
                        لديك حساب بالفعل؟ <span className="underline underline-offset-4">سجل دخولك هنا</span>
                    </Link>
                </div>

            </form>

            <Modal show={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} title="تحديد موقع المحل" maxWidth="2xl">
                <div className="p-4">
                    <div className="mb-4 text-sm text-gray-600">
                        يرجى سحب العلامة الحمراء أو استخدام مربع البحث لتحديد موقع محلك بدقة. هذه الخطوة ضرورية لضمان توصيل الطلبات إليك بشكل أسرع.
                    </div>
                    <MapPicker 
                        lat={data.lat} 
                        lng={data.lng} 
                        onLocationChange={(lat, lng) => {
                            setData(prev => ({...prev, lat, lng}));
                        }}
                        height="400px" 
                    />
                    <div className="mt-4 flex justify-end">
                        <PrimaryButton type="button" onClick={() => setIsMapModalOpen(false)}>
                            حفظ وإغلاق
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </GuestLayout>
    );
}
