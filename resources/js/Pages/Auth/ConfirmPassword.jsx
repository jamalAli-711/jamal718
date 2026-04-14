import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Secure Verification — VIP Protocol" />

            <div className="mb-12 text-center">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-4">Identity Verification</h1>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] leading-relaxed">
                    This sector is restricted. Re-authenticate with your master cipher to proceed.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-10">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.4em] pr-4">Active Cipher</label>
                    <div className="relative group/field">
                        <input
                            type="password" value={data.password} onChange={(e) => setData('password', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] py-6 px-10 text-xl font-black text-white focus:outline-none focus:border-amber-400/30 transition-all text-left placeholder:text-white/5 shadow-inner"
                            placeholder="••••••••" dir="ltr" autoFocus
                        />
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/5 group-hover/field:text-amber-400/20 transition-colors pointer-events-none">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                    </div>
                    <InputError message={errors.password} className="mt-2 text-[10px] uppercase tracking-widest text-rose-500 pr-4 font-black" />
                </div>

                <div className="pt-6">
                    <button 
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] shadow-2xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-500 disabled:opacity-50" 
                        disabled={processing}
                    >
                        {processing ? 'VERIFYING...' : 'CONFIRM ACCESS'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
