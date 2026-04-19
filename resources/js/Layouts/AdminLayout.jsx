import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { USER_TYPES } from '@/constants';

// --- VIP SVG Icon Components (Enhanced Stroke) ---
const IconDashboard = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
);
const IconOrders = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
);
const IconInventory = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
);
const IconBranch = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
);
const IconSettings = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.688.06 1.386.09 2.09.09H16.5a4.5 4.5 0 100-9h-.75c-.704 0-1.402-.03-2.09-.09m-4.18 9.18V6.66m4.18 9.18V6.66" /></svg>
);
const IconCustomers = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
);
const IconBell = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
);
const IconAlert = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
);
const IconForecasting = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0V3m0 13.5v3.75m0-3.75H15m-1.5 3.75H15m-1.5-3.75V3" /></svg>
);
const IconLogout = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
);
const IconMenu = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
);

export default function AdminLayout({ user, header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    const mainNav = [
        { name: 'لوحة التحكم', href: route('dashboard'), icon: IconDashboard, active: url === '/dashboard' },
        { name: 'الطلبات', href: route('orders.index'), icon: IconOrders, active: url.startsWith('/orders') },
        { name: 'تنبؤ الاستهلاك', href: route('replenishment.report'), icon: IconForecasting, active: url.startsWith('/replenishment/report') },
        { name: 'دورات التوريد', href: route('replenishment.index'), icon: IconSettings, active: url.match(/\/replenishment(?!\/report)/) },
        { name: 'المخزون', href: route('inventory.index'), icon: IconInventory, active: url.startsWith('/inventory') },
        { name: 'العروض', href: route('offers.index'), icon: IconBell, active: url.startsWith('/offers') },
        { name: 'العملاء', href: route('customers.index'), icon: IconCustomers, active: url.startsWith('/customers') },
        { name: 'الفروع', href: route('branches.index'), icon: IconBranch, active: url.startsWith('/branches') },
    ];

    const secondaryNav = [
        { name: 'الوحدات', href: route('units.index'), icon: IconSettings, active: url.startsWith('/units') },
        { name: 'الفئات', href: route('categories.index'), icon: IconSettings, active: url.startsWith('/categories') },
        { name: 'العملات', href: route('currencies.index'), icon: IconSettings, active: url.startsWith('/currencies') },
        { name: 'الإعدادات', href: route('settings.index'), icon: IconSettings, active: url.startsWith('/settings') },
    ];

    const SidebarContent = () => (
        <div className="h-full flex flex-col bg-[#0f0f12]/80 backdrop-blur-3xl border-l border-white/5 relative z-50 overflow-hidden">
            {/* Glossy Overlay for Sidebar */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            
            {/* Brand Section */}
            <div className="p-8 mb-6">
                <Link href={route('dashboard')} className="flex items-center gap-4 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <ApplicationLogo className="w-12 h-12 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-white tracking-tighter bg-clip-text bg-gradient-to-r from-white via-white to-white/40">المخلافي</span>
                        <span className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.4em] mt-0.5">AL-MEKHLAFI</span>
                    </div>
                </Link>
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 overflow-y-auto px-4 space-y-10 custom-scrollbar pb-10">
                <div>
                    <div className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">الإدارة الأساسية</div>
                    <nav className="space-y-1">
                        {mainNav.map((item) => (
                            <Link key={item.name} href={item.href} className={`vip-nav-item ${item.active ? 'active' : ''}`}>
                                <div className={`w-1 shadow-glow absolute right-0 h-4 rounded-full transition-all duration-500 ${item.active ? 'bg-amber-400 opacity-100' : 'bg-transparent opacity-0'}`} />
                                <item.icon />
                                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                                {item.active && <div className="absolute inset-0 bg-amber-400/5 rounded-2xl pointer-events-none" />}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div>
                    <div className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">إعدادات النظام</div>
                    <nav className="space-y-1">
                        {secondaryNav.map((item) => (
                            <Link key={item.name} href={item.href} className={`vip-nav-item ${item.active ? 'active' : ''}`}>
                                <div className={`w-1 shadow-glow absolute right-0 h-4 rounded-full transition-all duration-500 ${item.active ? 'bg-amber-400 opacity-100' : 'bg-transparent opacity-0'}`} />
                                <item.icon />
                                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* VIP User Profile (Sidebar Bottom) */}
            <div className="p-6 mt-auto border-t border-white/5 bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-4 group/user p-3 rounded-2xl border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-all duration-500">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black shadow-lg">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-emerald-500 border-2 border-[#0f0f12] rounded-full shadow-glow-emerald" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-white truncate leading-none mb-1">{user?.name || 'Administrator'}</p>
                        <p className="text-[10px] font-bold text-white/30 truncate uppercase tracking-tighter">عضو نخبة</p>
                    </div>
                </div>
                <Link href={route('logout')} method="post" as="button" className="w-full mt-4 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-rose-400 hover:bg-rose-400/5 rounded-xl transition-all border border-transparent hover:border-rose-400/20">
                    <IconLogout />
                    <span>إنهاء الجلسة</span>
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050507] selection:bg-amber-400 selection:text-black font-vip" dir="rtl">
            {/* Orbital BG Glows */}
            <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-amber-400/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

            {/* Desktop Sidebar */}
            <div className="fixed inset-y-0 right-0 w-72 hidden md:block z-50">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar Trigger & Container */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
                    <div className="absolute inset-y-0 right-0 w-80 shadow-2xl animate-in slide-in-from-right duration-500">
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="md:mr-72 flex flex-col min-h-screen relative z-10 transition-all duration-700">
                {/* VIP Glass Top Bar */}
                <header className="h-20 flex items-center justify-between px-6 lg:px-12 backdrop-blur-xl bg-black/10 border-b border-white/5 sticky top-0 z-40">
                    <div className="flex items-center gap-6">
                        <button className="md:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(true)}>
                            <IconMenu />
                        </button>
                        <div className="flex flex-col">
                            {header ? (
                                <>
                                    <div className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] mb-1 leading-none">البوابة الإدارية</div>
                                    <h1 className="text-2xl font-black text-white tracking-tighter leading-none">{header}</h1>
                                </>
                            ) : (
                                <h1 className="text-xl font-black text-white/20 tracking-widest uppercase">التحكم بالنظام</h1>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        {/* Notifications / Bells */}
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/[0.03] rounded-2xl border border-white/5 text-white/30 hover:text-amber-400 cursor-pointer transition-all">
                            <IconBell />
                            <span className="text-[10px] font-black tracking-widest uppercase">التنبيهات</span>
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                        </div>

                        {/* Profile Pill */}
                        <div className="flex items-center gap-3 pl-2 pr-4 py-2 bg-white/[0.03] rounded-full border border-white/5 group transition-all hover:bg-white/[0.05] hover:border-amber-400/20 cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400/20 to-amber-600/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black shadow-inner">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-xs font-black text-white leading-none mb-1 group-hover:text-amber-400 transition-colors">{user?.name}</span>
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.1em]">{USER_TYPES[user?.user_type]?.label || "مدير"}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* VIP Main Stage */}
                <main className="flex-1 p-6 lg:p-12 animate-in fade-in duration-1000">
                    {children}
                </main>

                <footer className="px-12 py-8 bg-black/20 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
                    <span>© {new Date().getFullYear()} مجموعة المخلافي — الأنظمة المتكاملة</span>
                    <span className="flex items-center gap-2">
                        حالة النظام: <span className="text-emerald-500/50">مثالية</span>
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-glow-emerald" />
                    </span>
                </footer>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                
                .font-vip { font-family: 'Outfit', sans-serif; }

                .shadow-glow { box-shadow: 0 0 15px currentColor; }
                .shadow-glow-emerald { box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }

                .vip-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 1.25rem;
                    border-radius: 1.25rem;
                    color: rgba(255, 255, 255, 0.4);
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                    position: relative;
                    overflow: hidden;
                    border: 1px solid transparent;
                }

                .vip-nav-item:hover {
                    background: rgba(255, 255, 255, 0.03);
                    color: white;
                    border-color: rgba(255, 255, 255, 0.05);
                    transform: translateX(-4px);
                }

                .vip-nav-item.active {
                    color: #fbbf24;
                    background: rgba(251, 191, 36, 0.05);
                    border-color: rgba(251, 191, 36, 0.1);
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
                }

                .vip-nav-item.active svg {
                    filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.5));
                }

                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(255, 255, 255, 0.05); 
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
                    background: rgba(251, 191, 36, 0.2); 
                }

                .hide-spinner::-webkit-inner-spin-button, 
                .hide-spinner::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
                
                input[type=number] { -moz-appearance: textfield; }
            ` }} />
        </div>
    );
}
