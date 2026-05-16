/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: "#FFA42D",
          hover: "#FF8C00",
        },
        secondary: {
          DEFAULT: "#4ADE80",
          soft: "rgba(74, 222, 128, 0.2)",
        },

        // Backgrounds
        background: "#141738",
        surface: "#1C2045",
        "surface-light": "#252A5C",

        // Text
        "text-primary": "#FFFFFF",
        "text-secondary": "#AAB0D6",
        "text-muted": "#6B7280",
      },
    },
  },
  plugins: [],
}