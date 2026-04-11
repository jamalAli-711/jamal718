import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import Modal from '@/Components/Modal';
import CartContent from '@/Components/CartContent';
import { useToast } from '@/Components/Toast';

export default function CustomerLayout({ header, children, hideFooter = false }) {
    const { auth } = usePage().props;
    const [cartCount, setCartCount] = useState(0);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);

    // Update cart count from local storage
    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.length);
    };

    const toast = useToast();

    useEffect(() => {
        updateCartCount();
        window.addEventListener('cartUpdated', updateCartCount);

        // Real-time listener for order status updates
        if (typeof window.Echo !== 'undefined' && auth.user) {
            window.Echo.private(`customer.${auth.user.id}`)
                .listen('.order.updated', (e) => {
                    const isRejected = Number(e.order.order_status) === 5;
                    const message = isRejected 
                        ? `تم رفض طلبك رقم ${e.order.reference_number}. انقر للتفاصيل.`
                        : `تم تحديث حالة طلبك رقم ${e.order.reference_number}.`;
                    
                    toast.info(message, {
                        onClick: () => router.get(route('customer.orders.show', e.order.id)),
                        duration: 8000
                    });

                    // Optional: Play sound
                    try {
                        const audio = new Audio('/sounds/notification.mp3');
                        audio.play();
                    } catch (err) {}
                });
        }

        return () => {
            window.removeEventListener('cartUpdated', updateCartCount);
            if (typeof window.Echo !== 'undefined' && auth.user) {
                window.Echo.leave(`customer.${auth.user.id}`);
            }
        };
    }, [auth.user]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
            {/* Top Navigation */}
            <nav className="glass-nav sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center gap-8">
                            {/* Logo */}
                            <div className="shrink-0 flex items-center">
                                <Link href={route('customer.storefront')} className="flex items-center gap-3 decoration-none group">
                                    <ApplicationLogo className="w-10 h-10 object-contain shadow-lg group-hover:scale-105 transition-transform" />
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-lg font-black text-[#031633] tracking-tighter">المخلافي</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Al-Mekhlafi</span>
                                    </div>
                                </Link>
                            </div>

                            {/* Navigation Links */}
                            <div className="hidden space-x-8 space-x-reverse sm:flex items-center h-full me-10">
                                <Link
                                    href={route('customer.storefront')}
                                    className={`inline-flex items-center px-1 text-sm font-bold transition-all duration-200 ${route().current('customer.storefront') ? 'text-[#0058be]' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    المنتجات
                                </Link>
                                <Link
                                    href={route('customer.orders')}
                                    className={`inline-flex items-center px-1 text-sm font-bold transition-all duration-200 ${route().current('customer.orders*') ? 'text-[#0058be]' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    طلباتي
                                </Link>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ms-6">
                            {/* Cart Icon */}
                            <button 
                                onClick={() => setIsCartModalOpen(true)}
                                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors mr-4"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Settings Dropdown */}
                            <div className="ms-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                {auth.user.name}

                                                <svg
                                                    className="ms-2 -me-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>الملف الشخصي</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            تسجيل الخروج
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Header */}
            {header && (
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            {/* Page Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            {!hideFooter && (
                <footer className="bg-white border-t border-gray-200 mt-auto">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} نظام مكلفة للمخازن. جميع الحقوق محفوظة.
                    </div>
                </footer>
            )}

            {/* Cart Modal */}
            <Modal show={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} title="سلة المشتريات" maxWidth="md">
                <div className="p-6">
                    <CartContent onCheckoutSuccess={() => setIsCartModalOpen(false)} />
                </div>
            </Modal>
        </div>
    );
}
