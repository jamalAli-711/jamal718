import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="تسجيل الدخول" />

            <div className="mb-8">
                <h1 className="text-3xl font-black text-[#031633] tracking-tighter">مرحباً بك مجدداً</h1>
                <p className="text-sm font-black text-slate-400 mt-1 uppercase tracking-tight">سجل دخولك لمتابعة عملياتك وفواتيرك</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">البريد الإلكتروني</label>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="w-full !border-2 !border-slate-100 !rounded-2xl !py-4 !px-6 !text-lg !font-black focus:!border-[#e31e24] focus:!ring-4 focus:!ring-red-50 transition-all text-left"
                        dir="ltr"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2 font-black text-xs uppercase" />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">كلمة المرور</label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-[10px] font-black text-[#e31e24] uppercase tracking-widest hover:underline"
                            >
                                نسيت كلمة المرور؟
                            </Link>
                        )}
                    </div>
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="w-full !border-2 !border-slate-100 !rounded-2xl !py-4 !px-6 !text-lg !font-black focus:!border-[#e31e24] focus:!ring-4 focus:!ring-red-50 transition-all text-left"
                        dir="ltr"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2 font-black text-xs uppercase" />
                </div>

                <div className="flex items-center">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        className="!w-6 !h-6 !rounded-lg !border-2 !border-slate-200 text-[#e31e24] focus:ring-[#e31e24]"
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    <span className="ms-3 text-sm font-black text-slate-500 uppercase tracking-tight">تذكرني على هذا الجهاز</span>
                </div>

                <div className="pt-4">
                    <button className="w-full bg-[#e31e24] text-white py-5 rounded-[1.5rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-red-200 hover:bg-[#c3181d] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50" disabled={processing}>
                        {processing ? 'جاري التحقق...' : 'تسجيل الدخول'}
                    </button>
                </div>

                <div className="mt-10 pt-8 border-t-2 border-slate-50 flex flex-col items-center gap-4">
                    <span className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">ليس لديك حساب؟</span>
                    <Link
                        href={route('register')}
                        className="w-full bg-white text-[#031633] border-2 border-slate-100 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest text-center hover:bg-slate-50 transition-all"
                    >
                        فتح حساب جديد (انضم إلينا)
                    </Link>
                </div>
            </form>


        </GuestLayout>
    );
}
