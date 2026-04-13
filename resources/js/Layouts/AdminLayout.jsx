import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { USER_TYPES } from '@/constants';

// --- SVG Icon Components ---
const IconDashboard = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
);
const IconOrders = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" /></svg>
);
const IconInventory = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
);
const IconBranch = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>
);
const IconSettings = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
);
const IconCustomers = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
);
const IconBell = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
);
const IconLogout = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
);
const IconMenu = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
);

export default function AdminLayout({ user, header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    const mainNav = [
        { name: 'لوحة التحكم', href: route('dashboard'), icon: IconDashboard, active: url === '/dashboard' },
        { name: 'الطلبات', href: route('orders.index'), icon: IconOrders, active: url.startsWith('/orders') },
        { name: 'المخزون', href: route('inventory.index'), icon: IconInventory, active: url.startsWith('/inventory') },
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
        <>
            {/* Brand */}
            <div className="sidebar-brand">
                <Link href={route('dashboard')} className="flex items-center gap-3 decoration-none group w-full">
                    <ApplicationLogo className="w-10 h-10 object-contain shadow-lg group-hover:scale-105 transition-transform" />
                    <div className="flex flex-col leading-tight">
                        <span className="text-lg font-black text-on-primary tracking-tighter">المخلافي</span>
                        <span className="text-[10px] font-bold text-on-primary/40 uppercase tracking-[0.2em]">Al-Mekhlafi</span>
                    </div>
                </Link>
            </div>

            {/* Main Navigation */}
            <div className="sidebar-section-label">الرئيسية</div>
            <nav className="flex-1 space-y-0.5 px-1">
                {mainNav.map((item) => (
                    <Link key={item.name} href={item.href} className={`sidebar-nav-item ${item.active ? 'active' : ''}`}>
                        <item.icon />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Secondary Navigation */}
            <div className="sidebar-section-label">النظام</div>
            <nav className="space-y-0.5 px-1 mb-2">
                {secondaryNav.map((item) => (
                    <Link key={item.name} href={item.href} className={`sidebar-nav-item ${item.active ? 'active' : ''}`}>
                        <item.icon />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>

            {/* User Account (bottom) */}
            <div className="border-t border-outline-variant p-3 mt-auto">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.name || 'مدير النظام'}</p>
                        <p className="text-xs text-on-surface-variant truncate">{user?.email || ''}</p>
                    </div>
                    <Link href={route('logout')} method="post" as="button" className="text-on-surface-variant hover:text-white transition-colors p-1" title="تسجيل الخروج">
                        <IconLogout />
                    </Link>
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-surface" dir="rtl">
            {/* Desktop Sidebar */}
            <div className="sidebar hidden md:flex">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
                    <div className="sidebar md:hidden">
                        <SidebarContent />
                    </div>
                </>
            )}

            {/* Main Content */}
            <div className="md:mr-64 min-h-screen flex flex-col">
                {/* Top Bar */}
                <header className="glass-nav h-16 flex items-center justify-between px-4 lg:px-8 border-b border-outline-variant">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-on-surface-variant hover:text-on-surface" onClick={() => setSidebarOpen(true)}>
                            <IconMenu />
                        </button>
                        {header && <h1 className="text-lg font-black text-on-surface tracking-tight">{header}</h1>}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col text-left items-end">
                            <span className="text-sm font-bold text-on-surface">{user?.name}</span>
                            <span className="text-[10px] font-bold text-secondary bg-secondary-container/10 px-2 py-0.5 rounded-full">{USER_TYPES[user?.user_type]?.label || user?.user_type}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-surface-low border-2 border-outline-variant shadow-sm overflow-hidden flex items-center justify-center text-on-surface font-bold">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
