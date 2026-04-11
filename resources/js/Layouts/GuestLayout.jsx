import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-slate-50 pt-12 sm:justify-center sm:pt-0" dir="rtl">
            <div className="mb-10 flex justify-center">
                <Link href="/" className="group tracking-tighter">
                    <ApplicationLogo className="w-24 h-24 object-contain transform group-hover:scale-110 transition-transform duration-500" />
                </Link>
            </div>

            <div className="w-full sm:max-w-md bg-white p-10 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-100">
                {children}
            </div>
            
            <div className="mt-8 text-center">
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">&copy; {new Date().getFullYear()} Makhalafi Group - Powered by Alqursan</p>
            </div>
        </div>

    );
}
