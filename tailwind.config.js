/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [ './src/**/*.{js,jsx,ts,tsx}' ],
    darkMode: ['class', '[data-theme="dark"]'], // Add custom data-theme attribute
    theme: {
        extend: {
            fontFamily: {
                'helvetica-neue': [ 'Helvetica Neue', 'Helvetica', 'sans-serif' ],
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}

