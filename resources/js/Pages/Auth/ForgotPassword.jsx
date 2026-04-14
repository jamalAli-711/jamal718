import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Recover Access — VIP Suite" />

            <div className="mb-12 text-center">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-4">Access Recovery</h1>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] leading-relaxed">
                    Enter your registered coordinate (Email) to initialize the secure reset protocol.
                </p>
            </div>

            {status && (
                <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-xs font-black text-emerald-400 uppercase tracking-widest text-center shadow-lg">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-10">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.4em] pr-4">Credential Target</label>
                    <div className="relative group/field">
                        <input
                            type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] py-6 px-10 text-xl font-black text-white focus:outline-none focus:border-amber-400/30 transition-all text-left placeholder:text-white/5 shadow-inner"
                            placeholder="OPERATOR@ELITE.COM" dir="ltr" autoFocus
                        />
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/5 group-hover/field:text-amber-400/20 transition-colors pointer-events-none">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                    </div>
                    <InputError message={errors.email} className="mt-2 text-[10px] uppercase tracking-widest text-rose-500 pr-4 font-black" />
                </div>

                <div className="pt-4 flex flex-col gap-6">
                    <button 
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] shadow-2xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-500 disabled:opacity-50" 
                        disabled={processing}
                    >
                        {processing ? 'Processing...' : 'Initialize Reset Link'}
                    </button>
                    
                    <Link href={route('login')} className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-amber-400 transition-colors text-center">
                        Return to <span className="text-amber-500">Security Gate</span>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
