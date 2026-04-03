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

            <div className="page-header">
                <div>
                    <h2 className="page-title">الإعدادات</h2>
                    <p className="page-subtitle">إدارة الملف الشخصي وإعدادات الحساب</p>
                </div>
            </div>

            <div className="max-w-2xl space-y-6">
                {/* Profile Info */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-sm font-bold text-gray-800">الملف الشخصي</h3>
                    </div>
                    <form onSubmit={submitProfile}>
                        <div className="card-body space-y-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{user.name}</h4>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">{USER_TYPES[user.user_type]?.label || user.user_type}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">الاسم</label>
                                <input type="text" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={profileForm.data.name} onChange={e => profileForm.setData('name', e.target.value)} />
                                {profileForm.errors.name && <p className="text-xs text-red-500 mt-1">{profileForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">رقم الهاتف</label>
                                <input type="text" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={profileForm.data.phone} onChange={e => profileForm.setData('phone', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">العنوان</label>
                                <textarea className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" rows="2" value={profileForm.data.address_desc} onChange={e => profileForm.setData('address_desc', e.target.value)} />
                            </div>
                        </div>
                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button type="submit" disabled={profileForm.processing} className="btn-primary">
                                {profileForm.processing ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change Password */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-sm font-bold text-gray-800">تغيير كلمة المرور</h3>
                    </div>
                    <form onSubmit={submitPassword}>
                        <div className="card-body space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">كلمة المرور الحالية</label>
                                <input type="password" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={passwordForm.data.current_password} onChange={e => passwordForm.setData('current_password', e.target.value)} />
                                {passwordForm.errors.current_password && <p className="text-xs text-red-500 mt-1">{passwordForm.errors.current_password}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">كلمة المرور الجديدة</label>
                                <input type="password" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={passwordForm.data.password} onChange={e => passwordForm.setData('password', e.target.value)} />
                                {passwordForm.errors.password && <p className="text-xs text-red-500 mt-1">{passwordForm.errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">تأكيد كلمة المرور</label>
                                <input type="password" className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" value={passwordForm.data.password_confirmation} onChange={e => passwordForm.setData('password_confirmation', e.target.value)} />
                            </div>
                        </div>
                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button type="submit" disabled={passwordForm.processing} className="btn-primary">
                                {passwordForm.processing ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
