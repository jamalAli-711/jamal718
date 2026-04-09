import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-slate-50 pt-12 sm:justify-center sm:pt-0" dir="rtl">
            <div className="mb-10">
                <Link href="/" className="flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 bg-[#e31e24] shadow-2xl shadow-red-200 rounded-[1.5rem] flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500">
                        <span className="text-3xl font-black text-white">S</span>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-[#031633] tracking-tighter uppercase whitespace-nowrap">المخلافي ستور</h2>
                        <div className="h-1 w-12 bg-[#e31e24] mx-auto mt-1 rounded-full"></div>
                    </div>
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
