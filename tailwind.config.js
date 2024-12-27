/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E3A8A",
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#1E3A8A",
          600: "#1C3879",
          700: "#1A3468",
          800: "#183057",
          900: "#162C46",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F9FAFB",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "heading-1": ["2.25rem", { lineHeight: "2.5rem", fontWeight: "700" }],
        "heading-2": ["1.875rem", { lineHeight: "2.25rem", fontWeight: "700" }],
        "heading-3": ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
        "body-large": ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        "body-small": [
          "0.875rem",
          { lineHeight: "1.25rem", fontWeight: "400" },
        ],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        float: "float 6s ease-in-out infinite",
        "fade-up": "fadeUp 0.5s ease-out",
        blob: "blob 7s infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },
        fadeUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
};
