import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Identity Verification — VIP Gateway" />

            <div className="mb-12 text-center">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-4">Awaiting Clearance</h1>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] leading-relaxed">
                    Identity validation required. Please verify your coordinate (Email) to activate full network privileges.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-xs font-black text-emerald-400 uppercase tracking-widest text-center shadow-lg">
                    New verification cipher dispatched to your coordinate.
                </div>
            )}

            <form onSubmit={submit} className="space-y-12">
                <div className="flex flex-col gap-6">
                    <button 
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] shadow-2xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-500 disabled:opacity-50" 
                        disabled={processing}
                    >
                        {processing ? 'DISPATCHING...' : 'RESEND VERIFICATION CIPHER'}
                    </button>

                    <div className="flex justify-center border-t border-white/5 pt-10">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-rose-500 transition-colors"
                        >
                            De-authorize & <span className="text-rose-500/50">Terminate Session</span>
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
