import { useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useToast } from '@/Components/Toast';
import { USER_TYPES } from '@/constants';

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
        phone: user.phone || '',
        address_desc: user.address_desc || '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('تم تحديث الملف الشخصي'),
        });
    };

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => { passwordForm.reset(); toast.success('تم تغيير كلمة المرور'); },
            onError: () => toast.error('خطأ في تحديث كلمة المرور'),
        });
    };

    return (
        <AdminLayout user={auth.user} header="الإعدادات">
            <Head title="الإعدادات" />

            <div className="flex flex-col mb-12 bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-20 -top-20 w-60 h-60 bg-slate-50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10">
                    <span className="text-[10px] font-black text-[#e31e24] uppercase tracking-[0.5em] mb-3 block">Account & Security</span>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">إعدادات الحساب الشخصي</h2>
                    <p className="text-sm font-black text-slate-400 mt-2 uppercase tracking-widest">تحديث بيانات الملف الشخصي، الأمان، وتغيير كلمات المرور</p>
                </div>
            </div>


            <div className="max-w-2xl space-y-6">
                {/* Profile Info */}
                <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-2xl overflow-hidden group">
                    <div className="px-10 py-8 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <div className="w-2 h-6 bg-slate-900 rounded-full"></div>
                            معلومات الملف الشخصي
                        </h3>
                    </div>
                    <form onSubmit={submitProfile}>
                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-8 pb-8 border-b-2 border-slate-50">
                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white text-4xl font-black shadow-2xl group-hover:rotate-6 transition-transform">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-2xl text-slate-900 tracking-tight">{user.name}</h4>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-tight">{user.email}</p>
                                    <div className="flex gap-2 pt-2">
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg uppercase tracking-widest">{USER_TYPES[user.user_type]?.label || user.user_type}</span>
                                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-widest">ID: #{user.id}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الاسم بالكامل</label>
                                    <input type="text" className="w-full border-2 border-slate-100 rounded-2xl text-lg py-4 px-6 focus:border-slate-900 transition-all font-black text-slate-900 bg-slate-50/50" value={profileForm.data.name} onChange={e => profileForm.setData('name', e.target.value)} />
                                    {profileForm.errors.name && <p className="text-xs font-black text-rose-500 mt-2 uppercase">{profileForm.errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mr-2">رقم التواصل</label>
                                    <input type="text" className="w-full border-2 border-slate-100 rounded-2xl text-lg py-4 px-6 focus:border-slate-900 transition-all font-black text-slate-900 bg-slate-50/50 text-left" dir="ltr" value={profileForm.data.phone} onChange={e => profileForm.setData('phone', e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mr-2">وصف العنوان / المنطقة</label>
                                <textarea className="w-full border-2 border-slate-100 rounded-2xl text-lg py-4 px-6 focus:border-slate-900 transition-all font-black text-slate-900 bg-slate-50/50" rows="2" value={profileForm.data.address_desc} onChange={e => profileForm.setData('address_desc', e.target.value)} />
                            </div>
                        </div>
                        <div className="px-10 py-6 bg-slate-50 border-t-2 border-slate-100 flex justify-end">
                            <button type="submit" disabled={profileForm.processing} className="bg-slate-900 text-white h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-[#e31e24] transition-all hover:-translate-y-1">
                                {profileForm.processing ? 'جاري الحفظ...' : 'تحديث البيانات الشخصية'}
                            </button>
                        </div>
                    </form>
                </div>


                {/* Change Password */}
                <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-2xl overflow-hidden group">
                    <div className="px-10 py-8 border-b-2 border-slate-50 flex justify-between items-center bg-rose-50/30">
                        <h3 className="text-sm font-black text-rose-700 uppercase tracking-widest flex items-center gap-3">
                            <div className="w-2 h-6 bg-rose-500 rounded-full"></div>
                            تأمين الحساب (تغيير كلمة المرور)
                        </h3>
                    </div>
                    <form onSubmit={submitPassword}>
                        <div className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mr-2">كلمة المرور الحالية</label>
                                <input type="password" className="w-full border-2 border-slate-100 rounded-2xl text-lg py-4 px-6 focus:border-rose-500 transition-all font-black text-slate-900 bg-slate-50/50 text-left" dir="ltr" value={passwordForm.data.current_password} onChange={e => passwordForm.setData('current_password', e.target.value)} />
                                {passwordForm.errors.current_password && <p className="text-xs font-black text-rose-500 mt-2 uppercase">{passwordForm.errors.current_password}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mr-2">كلمة المرور الجديدة</label>
                                    <input type="password" className="w-full border-2 border-slate-100 rounded-2xl text-lg py-4 px-6 focus:border-rose-500 transition-all font-black text-slate-900 bg-slate-50/50 text-left" dir="ltr" value={passwordForm.data.password} onChange={e => passwordForm.setData('password', e.target.value)} />
                                    {passwordForm.errors.password && <p className="text-xs font-black text-rose-500 mt-2 uppercase">{passwordForm.errors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mr-2">تأكيد كلمة المرور الجديدة</label>
                                    <input type="password" className="w-full border-2 border-slate-100 rounded-2xl text-lg py-4 px-6 focus:border-rose-500 transition-all font-black text-slate-900 bg-slate-50/50 text-left" dir="ltr" value={passwordForm.data.password_confirmation} onChange={e => passwordForm.setData('password_confirmation', e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="px-10 py-6 bg-rose-50/20 border-t-2 border-rose-50 flex justify-end">
                            <button type="submit" disabled={passwordForm.processing} className="bg-rose-600 text-white h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-slate-900 transition-all hover:-translate-y-1">
                                {passwordForm.processing ? 'جاري التحديث...' : 'تأكيد تغيير كلمة المرور'}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </AdminLayout>
    );
}
