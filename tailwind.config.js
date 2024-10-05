/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [ './src/**/*.{js,jsx,ts,tsx}' ],
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

