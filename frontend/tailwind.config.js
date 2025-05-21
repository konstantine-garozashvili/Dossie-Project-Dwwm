/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-50%))' },
        },
        'scroll-vertical': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(calc(-50%))' },
        },
      },
      animation: {
        marquee: 'scroll 25s linear infinite',
        'marquee-vertical': 'scroll-vertical 25s linear infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

