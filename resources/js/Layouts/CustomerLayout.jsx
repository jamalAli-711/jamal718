import { useState, useEffect } from 'react';
import { Link, usePage, router, Head } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import Modal from '@/Components/Modal';
import CartContent from '@/Components/CartContent';
import { useToast } from '@/Components/Toast';

export default function CustomerLayout({ header, children, hideFooter = false }) {
    const { auth } = usePage().props;
    const [cartCount, setCartCount] = useState(0);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };

    const toast = useToast();

    useEffect(() => {
        updateCartCount();
        window.addEventListener('cartUpdated', updateCartCount);

        if (typeof window.Echo !== 'undefined' && auth.user) {
            window.Echo.private(`customer.${auth.user.id}`)
                .listen('.order.updated', (e) => {
                    const message = `تحديث الطلب #${e.order.reference_number}`;
                    toast.info(message, {
                        onClick: () => router.get(route('customer.orders.show', e.order.id)),
                    });
                });
        }

        return () => {
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, [auth.user]);

    return (
        <div className="min-h-screen bg-[#050507] text-white selection:bg-amber-400 selection:text-black font-vip flex flex-col" dir="rtl">
            <Head>
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
            </Head>

            {/* Premium Orbital Backgrounds */}
            <div className="fixed top-0 left-0 w-[1000px] h-[1000px] bg-amber-500/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />

            {/* VIP Glass Header */}
            <nav className="sticky top-0 z-[60] backdrop-blur-2xl bg-black/20 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="flex justify-between h-24">
                        <div className="flex items-center gap-12">
                            {/* Brand */}
                            <Link href={route('customer.storefront')} className="flex items-center gap-4 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-white rounded-xl   " />
                                    <ApplicationLogo className="w-12 h-12 relative z-10 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black tracking-tighter text-white">المخلافي</span>
                                    <span className="text-[12px] font-black tracking-[0.4em] text-amber-500/60 leading-none mt-1 uppercase"> للتجارة والتبريد</span>
                                </div>
                            </Link>

                            {/* Nav Links */}
                            <div className="hidden md:flex items-center gap-10 h-full">
                                {[
                                    { name: 'المنتجات', route: 'customer.storefront' },
                                    { name: 'طلباتي', route: 'customer.orders' },
                                    { name: 'العروض الحصرية', route: 'customer.offers' },
                                ].map((link) => (
                                    <Link
                                        key={link.route}
                                        href={route(link.route)}
                                        className={`relative h-full flex items-center text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${route().current(link.route + '*') ? 'text-amber-400' : 'text-white/40 hover:text-white'
                                            }`}
                                    >
                                        {link.name}
                                        {route().current(link.route + '*') && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 rounded-t-full shadow-[0_-4px_12px_rgba(251,191,36,0.3)]" />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* VIP Cart */}
                            <button
                                onClick={() => setIsCartModalOpen(true)}
                                className="relative p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-amber-400 hover:border-amber-400/20 transition-all group"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -left-1 flex h-5 w-5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-400 text-black text-[10px] items-center justify-center font-black">
                                            {cartCount}
                                        </span>
                                    </span>
                                )}
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center gap-3 pl-2 pr-4 py-2 bg-white/[0.03] rounded-full border border-white/5 group hover:bg-white/[0.05] transition-all">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400/20 to-amber-600/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black shadow-inner">
                                                {auth.user.name?.charAt(0)}
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">حساب نخبة</span>
                                                <span className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">{auth.user.name}</span>
                                            </div>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content contentClasses="py-2 bg-[#16161a] border border-white/5 shadow-2xl backdrop-blur-3xl rounded-3xl overflow-hidden">
                                        <div className="px-5 py-3 border-b border-white/5">
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">متصل باسم</p>
                                            <p className="text-xs font-bold text-white truncate">{auth.user.email}</p>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')} className="text-white/60 hover:text-white hover:bg-white/5 font-bold transition-all">الملف الشخصي</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button" className="text-rose-400/60 hover:text-rose-400 hover:bg-rose-400/5 font-bold transition-all">
                                            تسجيل الخروج
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Dynamic Header */}
            {header && (
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 relative z-10 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-1 bg-amber-400 rounded-full" />
                        <h2 className="text-4xl font-black text-white tracking-tighter">{header}</h2>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 transition-all duration-700">
                {children}
            </main>

            {/* VIP Footer */}
            {!hideFooter && (
                <footer className="bg-black/40 border-t border-white/5 mt-auto relative z-10 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto py-16 px-6 lg:px-12">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                            <div className="flex items-center gap-4 opacity-30 grayscale saturate-0">
                                <ApplicationLogo className="w-10 h-10" />
                                <div className="text-right">
                                    <div className="text-sm font-black tracking-tighter text-white">المخلافي</div>
                                </div>
                            </div>
                            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] leading-loose text-center md:text-right">
                                © {new Date().getFullYear()} مؤسسة سعيد نعمان المخلافي للتجارة والتبريد<br />
                                <span className="text-amber-500/30">مصنوع بإتقان • توفر محدود</span>
                            </div>
                        </div>
                    </div>
                </footer>
            )}

            {/* Luxury Cart Drawer / Modal */}
            <Modal
                show={isCartModalOpen}
                onClose={() => setIsCartModalOpen(false)}
                maxWidth="md"
            >
                <div className="bg-[#0a0a0c] border border-white/10 rounded-[3rem] overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,1)]">
                    <div className="p-10">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
                                <span className="text-amber-400">سلة</span> المشتريات
                            </h3>
                            <button onClick={() => setIsCartModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <CartContent onCheckoutSuccess={() => setIsCartModalOpen(false)} />
                    </div>
                </div>
            </Modal>

            <style dangerouslySetInnerHTML={{
                __html: `
                .font-vip { font-family: 'Outfit', sans-serif; }
                
                /* Custom Global VIP Scrollbar */
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { 
                    background: rgba(255, 255, 255, 0.05); 
                    border-radius: 10px;
                    transition: all 0.5s;
                }
                ::-webkit-scrollbar-thumb:hover { background: rgba(251, 191, 36, 0.2); }

                /* Premium Input Styling Overrides */
                input, select, textarea {
                    background: rgba(255, 255, 255, 0.02) !important;
                    border: 1px solid rgba(255, 255, 255, 0.05) !important;
                    color: white !important;
                    border-radius: 1rem !important;
                    transition: all 0.5s !important;
                }
                input:focus {
                    border-color: rgba(251, 191, 36, 0.3) !important;
                    box-shadow: 0 0 20px rgba(251, 191, 36, 0.05) !important;
                    outline: none !important;
                }
            ` }} />
        </div>
    );
}
