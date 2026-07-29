import { useState, useEffect } from 'react';

export default function ThemeToggle({ className = '' }) {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const checkTheme = () => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                setIsDark(false);
                document.documentElement.classList.remove('dark');
            } else if (savedTheme === 'dark') {
                setIsDark(true);
                document.documentElement.classList.add('dark');
            } else {
                const isSystemDark = document.documentElement.classList.contains('dark');
                setIsDark(isSystemDark);
            }
        };

        checkTheme();

        window.addEventListener('themeChanged', checkTheme);
        window.addEventListener('storage', checkTheme);
        return () => {
            window.removeEventListener('themeChanged', checkTheme);
            window.removeEventListener('storage', checkTheme);
        };
    }, []);

    const toggleTheme = () => {
        const nextDark = !isDark;
        setIsDark(nextDark);
        if (nextDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        window.dispatchEvent(new Event('themeChanged'));
    };

    return (
        <button
            onClick={toggleTheme}
            type="button"
            title={isDark ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
            aria-label={isDark ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
            className={`relative p-2.5 rounded-2xl transition-all duration-300 border backdrop-blur-md flex items-center justify-center shadow-md active:scale-95 group ${
                isDark
                    ? 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10 hover:border-amber-400/40'
                    : 'bg-black/5 border-black/10 text-amber-600 hover:bg-black/10 hover:border-amber-600/40'
            } ${className}`}
        >
            {isDark ? (
                /* Sun Icon for Light Mode Switch */
                <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ) : (
                /* Moon Icon for Dark Mode Switch */
                <svg className="w-5 h-5 transition-transform duration-500 group-hover:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
    );
}
