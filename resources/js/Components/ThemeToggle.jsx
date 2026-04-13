import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <button
                onClick={() => setTheme('light')}
                className={`relative p-8 rounded-[2rem] border-2 transition-all duration-300 text-right group ${theme === 'light' ? 'border-secondary bg-secondary/5 ring-4 ring-secondary/10' : 'border-outline-variant hover:border-on-surface-variant'}`}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${theme === 'light' ? 'bg-secondary text-white' : 'bg-surface-low text-on-surface-variant'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    {theme === 'light' && (
                        <span className="bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-pulse">
                            نشط حالياً
                        </span>
                    )}
                </div>
                <h4 className={`text-xl font-black mb-1 ${theme === 'light' ? 'text-secondary' : 'text-on-surface'}`}>الوضع المضيء</h4>
                <p className="text-sm font-bold text-on-surface-variant">الوضع الكلاسيكي المريح للعين في النهار</p>
                {theme === 'light' && <div className="absolute right-6 top-6 w-2 h-2 bg-secondary rounded-full"></div>}
            </button>

            <button
                onClick={() => setTheme('dark')}
                className={`relative p-8 rounded-[2rem] border-2 transition-all duration-300 text-right group ${theme === 'dark' ? 'border-secondary bg-secondary/5 ring-4 ring-secondary/10' : 'border-outline-variant hover:border-on-surface-variant'}`}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-secondary text-white' : 'bg-surface-low text-on-surface-variant'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    </div>
                    {theme === 'dark' && (
                        <span className="bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-pulse">
                            نشط حالياً
                        </span>
                    )}
                </div>
                <h4 className={`text-xl font-black mb-1 ${theme === 'dark' ? 'text-secondary' : 'text-on-surface'}`}>الوضع الداكن</h4>
                <p className="text-sm font-bold text-on-surface-variant">تقليل إجهاد العين وتوفير طاقة البطارية</p>
                {theme === 'dark' && <div className="absolute right-6 top-6 w-2 h-2 bg-secondary rounded-full"></div>}
            </button>
        </div>
    );
}
