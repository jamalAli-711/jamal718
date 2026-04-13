import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: 'var(--primary)',
                'primary-container': 'var(--primary-container)',
                'on-primary': 'var(--on-primary)',
                secondary: 'var(--secondary)',
                'secondary-container': 'var(--secondary-container)',
                'on-secondary': 'var(--on-secondary)',
                surface: 'var(--surface)',
                'surface-low': 'var(--surface-low)',
                'surface-lowest': 'var(--surface-lowest)',
                'on-surface': 'var(--on-surface)',
                'on-surface-variant': 'var(--on-surface-variant)',
                'outline-variant': 'var(--outline-variant)',
            },
        },
    },

    plugins: [forms],
};
