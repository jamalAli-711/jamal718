import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
    return useContext(ToastContext);
}

const ICONS = {
    success: (
        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
    ),
    error: (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
    ),
    info: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    warning: (
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    ),
};

const BORDER_COLORS = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500',
    warning: 'border-l-amber-500',
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', options = {}) => {
        const id = Date.now() + Math.random();
        const duration = options.duration || 4000;
        const onClick = options.onClick || null;

        setToasts(prev => [...prev, { id, message, type, onClick }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const toast = {
        success: (msg, opts) => addToast(msg, 'success', opts),
        error: (msg, opts) => addToast(msg, 'error', opts),
        info: (msg, opts) => addToast(msg, 'info', opts),
        warning: (msg, opts) => addToast(msg, 'warning', opts),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast Container - top left for RTL */}
            <div className="fixed top-4 left-4 z-[100] space-y-2 max-w-sm w-full pointer-events-none" dir="rtl">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        onClick={() => {
                            if (t.onClick) {
                                t.onClick();
                                setToasts(prev => prev.filter(x => x.id !== t.id));
                            }
                        }}
                        className={`pointer-events-auto bg-white border border-gray-200 ${BORDER_COLORS[t.type]} border-l-4 rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 animate-slide-in ${t.onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    >
                        <div className="flex-shrink-0 mt-0.5">{ICONS[t.type]}</div>
                        <p className="text-sm text-gray-700 flex-1">{t.message}</p>
                        <button
                            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
