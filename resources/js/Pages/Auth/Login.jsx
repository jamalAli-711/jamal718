import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        phone: '', password: '', remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password'), });
    };

    return (
        <GuestLayout>
            <Head title="بوابة الوصول — حماية النخبة" />

            <div className="mb-12 text-center md:text-right">
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none mb-3 italic">مرحباً بك</h1>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">يرجى التحقق من الهوية للوصول إلى واجهة التحكم</p>
            </div>

            <form onSubmit={submit} className="space-y-10">
                <div>
                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 pr-4">رقم الهاتف</label>
                    <div className="relative group/field">
                        <input
                            type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] py-6 px-10 text-xl font-black text-white focus:outline-none focus:border-amber-400/30 transition-all text-right placeholder:text-white/5 shadow-inner"
                            placeholder="77XXXXXXXX" dir="ltr"
                        />
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/5 group-hover/field:text-amber-400/20 transition-colors pointer-events-none">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                    </div>
                    <InputError message={errors.phone} className="mt-4 font-black text-[10px] uppercase tracking-widest text-rose-500 pr-4" />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4 px-4">
                        <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">رمز الأمان (كلمة المرور)</label>
                        {canResetPassword && (
                            <Link href={route('password.request')} className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest hover:text-amber-400 transition-colors leading-none">استعادة الوصول</Link>
                        )}
                    </div>
                    <div className="relative group/field">
                        <input
                            type="password" value={data.password} onChange={(e) => setData('password', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] py-6 px-10 text-xl font-black text-white focus:outline-none focus:border-amber-400/30 transition-all text-right placeholder:text-white/5 shadow-inner"
                            placeholder="••••••••••••" dir="ltr"
                        />
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/5 group-hover/field:text-amber-400/20 transition-colors pointer-events-none">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                    </div>
                    <InputError message={errors.password} className="mt-4 font-black text-[10px] uppercase tracking-widest text-rose-500 pr-4" />
                </div>

                <div className="flex items-center px-4">
                    <label className="flex items-center gap-4 cursor-pointer group/check">
                        <Checkbox
                            name="remember" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)}
                            className="!w-7 !h-7 !rounded-xl !bg-white/5 !border-white/10 text-amber-500 focus:!ring-amber-500/20"
                        />
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] group-hover/check:text-white/60 transition-colors">إبقاء جلسة العمل نشطة</span>
                    </label>
                </div>

                <div className="pt-6">
                    <button
                        className="w-full bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 bg-size-200 text-black py-7 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] shadow-2xl shadow-amber-500/10 hover:bg-pos-100 transition-all duration-700 active:scale-95 disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? 'جاري التحقق...' : 'مصادقة الدخول'}
                    </button>
                </div>

                <div className="mt-16 pt-10 border-t border-white/5 flex flex-col items-center gap-6">
                    <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">هل تفتقد بيانات الاعتماد؟</span>
                    <Link
                        href={route('register')}
                        className="w-full py-5 border border-white/5 bg-white/[0.01] text-white/40 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] text-center hover:bg-white/5 hover:text-white transition-all shadow-xl"
                    >
                        طلب إنشاء هوية جديدة
                    </Link>
                </div>
            </form>

            <style dangerouslySetInnerHTML={{
                __html: `
                .bg-size-200 { background-size: 200% 100%; }
                .bg-pos-100 { background-position: 100% 0; }
            ` }} />
        </GuestLayout>
    );
}
