import { useState } from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import Modal from '@/Components/Modal';
import MapPicker from '@/Components/MapPicker';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Register() {
    const { branches } = usePage().props;
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', phone: '', branch_id: '',
        user_type: 4, password: '', password_confirmation: '',
        lat: '', lng: '',
    });

    const userTypes = [
        { id: 4, label: 'عميل فردي', desc: 'مشتريات شخصية', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
        { id: 3, label: 'شريك تجزئة', desc: 'نشاط تجاري قياسي', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { id: 2, label: 'تاجر جملة', desc: 'توزيع النخبة', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
    ];

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation'), });
    };

    return (
        <GuestLayout>
            <Head title="إعداد الهوية — شبكة النخبة" />

            <div className="text-center mb-16">
                <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none mb-4 italic">إنشاء هوية</h1>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">سجل حضورك ضمن شبكة التوريد الخاصة بالنخبة</p>
                <div className="h-1 w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-8 opacity-40"></div>
            </div>

            <form onSubmit={submit} className="space-y-12">
                {/* VIP Role Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {userTypes.map((type) => (
                        <button
                            key={type.id} type="button" onClick={() => setData('user_type', type.id)}
                            className={`relative text-right p-8 rounded-[2.5rem] border transition-all duration-700 flex flex-col gap-5 group overflow-hidden ${
                                data.user_type === type.id 
                                ? 'border-amber-400/40 bg-white/[0.04] shadow-2xl' 
                                : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                            }`}
                        >
                            {/* Role Icon Wrapper */}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-700 ${
                                data.user_type === type.id ? 'bg-amber-400 text-black scale-110' : 'bg-white/5 text-white/20 group-hover:text-white'
                            }`}>
                                {type.icon}
                            </div>
                            <div>
                                <h3 className={`font-black text-xs uppercase tracking-widest ${data.user_type === type.id ? 'text-amber-400' : 'text-white/40'}`}>{type.label}</h3>
                                <p className="text-[9px] font-black text-white/10 mt-1 uppercase tracking-tighter">{type.desc}</p>
                            </div>
                            {data.user_type === type.id && (
                                <div className="absolute top-6 left-6 w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <VIPField label="الاسم القانوني الكامل" value={data.name} onChange={v => setData('name', v)} error={errors.name} />
                        <VIPField label="الاتصال المباشر (رقم الجوال)" value={data.phone} onChange={v => setData('phone', v)} error={errors.phone} placeholder="77XXXXXXX" dir="ltr" />
                    </div>

                    <VIPField label="الوصول الآمن (البريد الإلكتروني)" type="email" value={data.email} onChange={v => setData('email', v)} error={errors.email} placeholder="EMAIL@DOMAIN.COM" dir="ltr" />

                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.4em] pr-4">عقدة التوزيع الأساسية (الفرع)</label>
                        <div className="relative group">
                            <select
                                value={data.branch_id} onChange={(e) => setData('branch_id', e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] py-6 px-10 text-lg font-black text-white/60 focus:outline-none focus:border-amber-400/30 transition-all appearance-none cursor-pointer group-hover:bg-white/[0.05]"
                            >
                                <option value="" className="bg-[#111114]">-- اختر المركز الإقليمي --</option>
                                {branches?.map(branch => <option key={branch.id} value={branch.id} className="bg-[#111114]">{branch.branch_name} ({branch.location_city})</option>)}
                            </select>
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/10"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></div>
                        </div>
                        <InputError message={errors.branch_id} className="mt-2 text-[10px] uppercase tracking-widest text-rose-500 pr-4 font-black text-right" />
                    </div>

                    {/* VIP Map Trigger */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.4em] pr-4">تحديد الموقع الجغرافي (COORDINATES)</label>
                        <button
                            type="button" onClick={() => setIsMapModalOpen(true)}
                            className={`w-full py-6 rounded-[2rem] border transition-all duration-700 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] overflow-hidden relative group/map ${
                                data.lat ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-white/5 bg-white/[0.02] text-white/20 hover:border-amber-400/20 hover:text-amber-400 shadow-xl'
                            }`}
                        >
                             <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover/map:translate-x-full transition-transform duration-1000`} />
                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                             {data.lat ? 'تم قفل الإحداثيات بنجاح' : 'تفعيل بروتوكول الموقع'}
                        </button>
                        <InputError message={errors.lat || errors.lng} className="mt-2 text-[10px] uppercase tracking-widest text-rose-500 pr-4 font-black text-right" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                        <VIPField label="رمز الوصول (كلمة المرور)" type="password" value={data.password} onChange={v => setData('password', v)} error={errors.password} placeholder="••••••••" dir="ltr" />
                        <VIPField label="تأكيد رمز الوصول" type="password" value={data.password_confirmation} onChange={v => setData('password_confirmation', v)} error={errors.password_confirmation} placeholder="••••••••" dir="ltr" />
                    </div>
                </div>

                <div className="mt-16 pt-12 flex flex-col items-center gap-8">
                    <button 
                        className="w-full bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 text-black py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] shadow-2xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-500 disabled:opacity-20 disabled:grayscale" 
                        disabled={processing || !data.lat}
                    >
                        {processing ? 'جاري تثبيت السجل...' : 'بدء تفعيل الهوية'}
                    </button>
                    
                    <Link href={route('login')} className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-amber-400 transition-colors py-4">
                        مسجل بالفعل ضمن الشبكة؟ <span className="text-amber-500 border-b border-amber-500/20 pb-0.5">تسجيل الدخول</span>
                    </Link>
                </div>
            </form>

            <Modal show={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} maxWidth="2xl">
                <div className="bg-[#0c0c0e] p-10 rounded-[4rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] text-right" dir="rtl">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase">رسم الإحداثيات</h3>
                        <button type="button" onClick={() => setIsMapModalOpen(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/20 hover:bg-rose-500 hover:text-white transition-all"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                    <div className="mb-8 p-6 bg-amber-400/5 rounded-3xl border border-amber-400/10">
                        <p className="text-[11px] font-black text-amber-500/60 uppercase tracking-widest leading-relaxed text-right">يرجى تحديد موقع المحل بدقة على الخارطة لضمان ترقية حسابك إلى وضعية الشريك التجاري الفعّال.</p>
                    </div>
                    <div className="rounded-[2.5rem] overflow-hidden border border-white/5 shadow-inner">
                        <MapPicker lat={data.lat} lng={data.lng} onLocationChange={(lat, lng) => setData(prev => ({...prev, lat, lng}))} height="400px" />
                    </div>
                    <div className="mt-10">
                        <button type="button" onClick={() => setIsMapModalOpen(false)} className="w-full py-6 bg-white/5 text-white font-black text-xs uppercase tracking-[0.4em] rounded-[2rem] hover:bg-white/10 transition-all border border-white/5 shadow-xl">
                            قفل الموقع الجغرافي
                        </button>
                    </div>
                </div>
            </Modal>
        </GuestLayout>
    );
}

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
