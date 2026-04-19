import { useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useToast } from '@/Components/Toast';
import { USER_TYPES } from '@/constants';
import ThemeToggle from '@/Components/ThemeToggle';

export default function SettingsIndex({ auth }) {
    const toast = useToast();
    const { flash } = usePage().props;
    const user = auth.user;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address_desc: user.address_desc || '',
        avatar: null,
        _method: 'patch',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.post(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('تم تحديث بروتوكول الهوية بنجاح'),
            onError: () => toast.error('حدث خطأ أثناء تحديث الهوية'),
        });
    };

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => { passwordForm.reset(); toast.success('تم تغيير كلمة المرور بنجاح'); },
            onError: () => toast.error('خطأ في تحديث كلمة المرور'),
        });
    };

    return (
        <AdminLayout user={auth.user} header="إعدادات النظام">
            <Head title="إعدادات النظام — التكوين المتقدم" />

            <div className="pb-32 animate-in fade-in duration-1000" dir="rtl">
                
                {/* VIP Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 p-10 bg-white/[0.01] rounded-[4rem] border border-white/5 shadow-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-full text-white/40 tracking-[0.4em] text-[10px] font-black uppercase">
                            إعداد عملياتي
                            <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse" />
                        </div>
                        <h2 className="text-6xl font-black text-white tracking-tighter leading-none uppercase">إعدادات التحكم والنظام</h2>
                        <p className="text-white/20 font-bold text-xl italic pr-6 border-r-4 border-white/10">إدارة هويات المستخدمين، بروتوكولات الأمان، وتخصيص تجربة القيادة الرقمية.</p>
                    </div>
                </div>

                <div className="max-w-5xl space-y-12">
                    {/* Visual Interface Section */}
                    <div className="bg-[#111114] rounded-[4rem] border border-white/5 shadow-2xl group overflow-hidden">
                        <div className="px-12 py-10 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] flex items-center gap-4 text-right">
                                <div className="w-1 h-6 bg-amber-400/40 rounded-full" />
                                التحصيل البصري (Light/Dark Engine)
                            </h3>
                        </div>
                        <div className="p-12 flex justify-center">
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="bg-[#111114] rounded-[4rem] border border-white/5 shadow-2xl group overflow-hidden">
                        <div className="px-12 py-10 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] flex items-center gap-4 text-right">
                                <div className="w-1 h-6 bg-blue-500/40 rounded-full" />
                                مظهر الهوية الشخصية
                            </h3>
                        </div>
                        <form onSubmit={submitProfile}>
                            <div className="p-12 space-y-12 relative">
                                {/* Digital ID Card Visual Overlay */}
                                <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-amber-400/[0.02] to-transparent pointer-events-none" />
                                
                                <div className="flex flex-col lg:flex-row items-center gap-12 pb-12 border-b border-white/5 relative z-10">
                                    <div className="relative group/avatar">
                                        <div className="w-48 h-48 rounded-[3rem] bg-black border border-white/5 overflow-hidden shadow-2xl relative">
                                            {user.avatar ? (
                                                <img src={`/storage/${user.avatar}`} className="w-full h-full object-cover" alt={user.name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/10 text-7xl font-black bg-gradient-to-tr from-white/[0.02] to-transparent">
                                                    {user.name?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                            
                                            {/* Upload Overlay */}
                                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                                                <svg className="w-8 h-8 text-amber-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">تحديث الصورة</span>
                                                <input type="file" className="hidden" onChange={e => profileForm.setData('avatar', e.target.files[0])} />
                                            </label>
                                        </div>
                                        {profileForm.data.avatar && (
                                            <div className="absolute -bottom-3 -right-3 px-4 py-2 bg-amber-400 rounded-xl text-[8px] font-black text-black uppercase tracking-widest animate-bounce">
                                                تم اختيار ملف جديد
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-6 text-center lg:text-right">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] rounded-full text-[9px] font-black text-amber-500/60 uppercase tracking-[0.3em] mb-4">MEMBER_ID: #00{user.id}</div>
                                            <h4 className="font-black text-6xl text-white tracking-tighter uppercase leading-none group-hover:text-amber-400 transition-colors">{user.name}</h4>
                                            <p className="text-xl font-bold text-white/20 tracking-tight italic mt-2">{user.email}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                            <span className="px-6 py-2 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">الحالة: <span className="text-emerald-500">نشط</span></span>
                                            <span className="px-6 py-2 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">الرتبة: <span className="text-amber-500">{USER_TYPES[user.user_type]?.label || 'مشترك'}</span></span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                    <Field label="الاسم الكامل للهوية" value={profileForm.data.name} onChange={v => profileForm.setData('name', v)} error={profileForm.errors.name} />
                                    <Field label="قناة التواصل المباشرة" value={profileForm.data.phone} onChange={v => profileForm.setData('phone', v)} error={profileForm.errors.phone} dir="ltr" className="text-left" placeholder="+967 ..." />
                                </div>

                                <Field label="مركز التوزيع / العنوان الدائم" value={profileForm.data.address_desc} onChange={v => profileForm.setData('address_desc', v)} error={profileForm.errors.address_desc} placeholder="أدخل تفاصيل الموقع الجغرافي..." />
                            </div>
                            <div className="px-12 py-8 bg-white/[0.01] border-t border-white/5 flex justify-end">
                                <button type="submit" disabled={profileForm.processing} className="px-12 py-6 bg-white/[0.03] border border-white/10 text-white font-black rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all uppercase text-[10px] tracking-[0.4em] active:scale-95 disabled:opacity-50">
                                    {profileForm.processing ? 'جاري التحديث...' : 'حفظ الملف الشخصي'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security Vector */}
                    <div className="bg-[#111114] rounded-[4rem] border border-white/5 shadow-2xl group overflow-hidden">
                        <div className="px-12 py-10 border-b border-white/5 bg-rose-500/[0.02] flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.4em] flex items-center gap-4 text-right">
                                <div className="w-1 h-6 bg-rose-500/40 rounded-full" />
                                بروتوكول الأمان وتغيير المرور
                            </h3>
                        </div>
                        <form onSubmit={submitPassword}>
                            <div className="p-12 space-y-10">
                                <Field label="كلمة المرور الحالية" type="password" value={passwordForm.data.current_password} onChange={v => passwordForm.setData('current_password', v)} className="text-left" dir="ltr" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <Field label="كلمة المرور الجديدة" type="password" value={passwordForm.data.password} onChange={v => passwordForm.setData('password', v)} className="text-left" dir="ltr" />
                                    <Field label="تأكيد كلمة المرور" type="password" value={passwordForm.data.password_confirmation} onChange={v => passwordForm.setData('password_confirmation', v)} className="text-left" dir="ltr" />
                                </div>
                            </div>
                            <div className="px-12 py-8 bg-rose-500/[0.01] border-t border-white/5 flex justify-end">
                                <button type="submit" disabled={passwordForm.processing} className="px-12 py-6 bg-rose-500 text-black font-black rounded-2xl hover:bg-rose-400 transition-all uppercase text-[10px] tracking-[0.4em] active:scale-95 shadow-2xl shadow-rose-500/20 disabled:opacity-50">
                                    {passwordForm.processing ? 'جاري التحديث...' : 'تغيير كلمة المرور'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            ` }} />
        </AdminLayout>
    );
}

function Field({ label, value, onChange, type = "text", className = "", dir = "rtl", placeholder = "", error }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block pr-4">{label}</label>
            <input 
                type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} dir={dir}
                className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-xl font-black text-white focus:outline-none focus:border-white/30 transition-all shadow-inner placeholder:text-white/5 ${className}`}
            />
            {error && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pr-4">{error}</p>}
        </div>
    );
}
