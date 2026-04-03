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
        password: '',
        password_confirmation: '',
        lat: '',
        lng: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="تسجيل عميل جديد" />

            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">إنشاء حساب جديد</h1>
                <p className="text-sm text-gray-500 mt-2">قم بإنشاء حسابك كعميل للاستفادة من خدماتنا</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* الاسم والهاتف في صف واحد */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="name" value="الاسم الكامل" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="phone" value="رقم الهاتف" />
                        <TextInput
                            id="phone"
                            name="phone"
                            value={data.phone}
                            className="mt-1 block w-full text-left"
                            dir="ltr"
                            placeholder="770000000"
                            onChange={(e) => setData('phone', e.target.value)}
                            required
                        />
                        <InputError message={errors.phone} className="mt-2" />
                    </div>
                </div>

                {/* البريد الإلكتروني */}
                <div>
                    <InputLabel htmlFor="email" value="البريد الإلكتروني" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full text-left"
                        dir="ltr"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* اختيار الفرع */}
                <div>
                    <InputLabel htmlFor="branch_id" value="المحافظة (الفرع الأقرب)" />
                    <select
                        id="branch_id"
                        name="branch_id"
                        value={data.branch_id}
                        className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                        onChange={(e) => setData('branch_id', e.target.value)}
                        required
                    >
                        <option value="">-- اختر الفرع --</option>
                        {branches?.map(branch => (
                            <option key={branch.id} value={branch.id}>
                                {branch.branch_name} - {branch.location_city}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.branch_id} className="mt-2" />
                </div>

                {/* خريطة الموقع الجغرافي */}
                <div>
                    <InputLabel value="موقع المحل الجغرافي" />
                    <div className="mt-1 flex items-center space-x-2 space-x-reverse">
                        <button
                            type="button"
                            onClick={() => setIsMapModalOpen(true)}
                            className="px-4 py-2 border border-blue-500 text-blue-500 hover:bg-blue-50 rounded-md transition-colors text-sm font-medium flex items-center"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            تحديد الموقع من الخريطة
                        </button>
                        {data.lat && data.lng ? (
                            <span className="text-emerald-600 text-sm font-medium">✓ تم تحديد الموقع بنجاح</span>
                        ) : (
                            <span className="text-red-500 text-xs">مطلوب*</span>
                        )}
                    </div>
                    <InputError message={errors.lat || errors.lng} className="mt-2" />
                </div>

                {/* كلمات المرور */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                        <InputLabel htmlFor="password" value="كلمة المرور" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full text-left"
                            dir="ltr"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password_confirmation" value="تأكيد كلمة المرور" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full text-left"
                            dir="ltr"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900"
                    >
                        لديك حساب بالفعل؟ تسجيل الدخول
                    </Link>

                    <PrimaryButton className="ms-4 !px-8" disabled={processing || !data.lat}>
                        إنشاء الحساب
                    </PrimaryButton>
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
