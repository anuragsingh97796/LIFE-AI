/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0EA5E9", // Sky-500
          dark: "#0284C7",
          light: "#38BDF8",
        },
        background: "#090A0F", // Deep rich dark background
        card: "#121420", // Sleek dark card color
        border: "#1E2235", // Custom dark border
        text: {
          DEFAULT: "#F8FAFC", // Slate-50
          secondary: "#94A3B8", // Slate-400
          muted: "#64748B", // Slate-500
        }
      },
    },
  },
  plugins: [],
}
