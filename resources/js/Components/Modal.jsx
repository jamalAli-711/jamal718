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
                <div className={`relative bg-white rounded-xl shadow-2xl w-full ${widths[maxWidth]} transform transition-all`}>
                    {/* Header */}
                    {title && (
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h3 className="text-base font-bold text-gray-900">{title}</h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
    return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

Modal.Footer = function ModalFooter({ children }) {
    return (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl flex items-center justify-end gap-2">
            {children}
        </div>
    );
};
