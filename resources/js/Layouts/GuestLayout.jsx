import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#050507] selection:bg-amber-400 selection:text-black p-6 relative overflow-hidden" dir="rtl">
            {/* Cinematic Background Elements */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-amber-400/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 w-full max-w-lg">
                {/* Brand Header */}
                <div className="mb-12 flex flex-col items-center gap-6">
                    <Link href="/" className="group relative">
                        <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <ApplicationLogo className="w-28 h-28 object-contain relative z-10 transition-all duration-700 group-hover:scale-110 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]" />
                    </Link>
                    <div className="text-center">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">مجموعة المخلافي</h2>
                        <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.5em] mt-2 block">بوابة الوصول الآمن للنخبة</span>
                    </div>
                </div>

                {/* Main Content Card (Glassmorphism) */}
                <div className="bg-[#0c0c0e]/80 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/5 shadow-3xl relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>

                {/* Footer Meta */}
                <div className="mt-12 text-center space-y-2 opacity-30 group-hover:opacity-100 transition-opacity duration-700">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] leading-none">© {new Date().getFullYear()} مجموعة المخلافي — العمليات الاستراتيجية</p>
                    <div className="flex justify-center items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">جميع البروتوكولات تعمل بكفاءة</span>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                body { font-family: 'Outfit', sans-serif; }
            ` }} />
        </div>
    );
}
