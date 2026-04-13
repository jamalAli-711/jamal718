import { Fragment } from 'react';

export default function Modal({ show, onClose, title, maxWidth = 'lg', children }) {
    if (!show) return null;

    const widths = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-5xl',
    };

    return (
        <div className="fixed inset-0 z-[80] overflow-y-auto" dir="rtl">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={onClose} />

            {/* Modal */}
            <div className="flex min-h-full items-start justify-center p-4 pt-20">
                <div className={`relative bg-surface-lowest rounded-3xl shadow-2xl w-full ${widths[maxWidth]} border border-outline-variant transform transition-all`}>
                    {/* Header */}
                    {title && (
                        <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant">
                            <h3 className="text-xl font-black text-on-surface tracking-tighter">{title}</h3>
                            <button
                                onClick={onClose}
                                className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-xl hover:bg-on-surface/5"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Body */}
                    {children}
                </div>
            </div>
        </div>
    );
}

// Reusable sub-components for modal structure
Modal.Body = function ModalBody({ children, className = '' }) {
    return <div className={`px-8 py-6 ${className} text-on-surface`}>{children}</div>;
};

Modal.Footer = function ModalFooter({ children, className = '' }) {
    return (
        <div className={`px-8 py-6 bg-surface-lowest border-t border-outline-variant rounded-b-[2rem] flex items-center justify-end gap-3 ${className}`}>
            {children}
        </div>
    );
};
