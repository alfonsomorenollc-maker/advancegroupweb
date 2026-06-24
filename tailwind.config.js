
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        advance: {
          orange: '#F37021',
          grey: '#939598',
          navy: '#1A237E',
          teal: '#4DB6AC',
        }
      },
      keyframes: {
        "fade-in": {
          "from": { opacity: "0" },
          "to": { opacity: "1" },
        },
        "slide-in-from-left": {
          "from": { transform: "translateX(-20px)", opacity: "0" },
          "to": { transform: "translateX(0)", opacity: "1" },
        },
         "slide-in-from-top": {
          "from": { transform: "translateY(-20px)", opacity: "0" },
          "to": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 1s ease-out forwards",
        "slide-in-from-left": "slide-in-from-left 1s ease-out forwards",
        "slide-in-from-top": "slide-in-from-top 1s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}