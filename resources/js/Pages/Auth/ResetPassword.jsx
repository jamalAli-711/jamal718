import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Cipher Re-evaluation — VIP Security" />

            <div className="mb-12 text-center">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-4">Elite Re-entry</h1>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] leading-relaxed">
                    Finalize your operational re-alignment by establishing a new master cipher.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-10">
                <div>
                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.4em] pr-4 mb-3">Linked Identity</label>
                    <input
                        type="email" value={data.email} readOnly
                        className="w-full bg-white/[0.02] border border-white/5 rounded-[2rem] py-6 px-10 text-lg font-black text-white/40 focus:outline-none cursor-not-allowed text-left shadow-inner"
                        placeholder="READONLY_IDENTITY" dir="ltr"
                    />
                    <InputError message={errors.email} className="mt-2 text-[10px] uppercase tracking-widest text-rose-500 pr-4 font-black" />
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <VIPField label="New Master Cipher" type="password" value={data.password} onChange={v => setData('password', v)} error={errors.password} placeholder="••••••••" dir="ltr" />
                    <VIPField label="Confirm Master Cipher" type="password" value={data.password_confirmation} onChange={v => setData('password_confirmation', v)} error={errors.password_confirmation} placeholder="••••••••" dir="ltr" />
                </div>

                <div className="pt-6">
                    <button 
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] shadow-2xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-500 disabled:opacity-50" 
                        disabled={processing}
                    >
                        {processing ? 'SYNCING PROTOCOL...' : 'LOCK NEW CIPHER'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}

function VIPField({ label, value, onChange, type = "text", placeholder = "", dir = "rtl", error }) {
    return (
        <div className="space-y-4">
            <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.4em] pr-4">{label}</label>
            <input
                type={type} value={value} onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] py-6 px-10 text-xl font-black text-white placeholder:text-white/5 focus:outline-none focus:border-amber-400/30 transition-all shadow-inner"
                placeholder={placeholder} dir={dir}
            />
            {error && <InputError message={error} className="mt-2 text-[10px] uppercase tracking-widest text-rose-500 pr-4 font-black" />}
        </div>
    );
}
