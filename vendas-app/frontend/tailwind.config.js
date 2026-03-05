/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f4ff',
                    100: '#e0e9ff',
                    200: '#c7d7fe',
                    300: '#a5bbfc',
                    400: '#8199f8',
                    500: '#6175f1',
                    600: '#4f56e5',
                    700: '#4045ca',
                    800: '#3538a3',
                    900: '#2f3481',
                },
            },
        },
    },
    plugins: [],
};
