/** @type {import('tailwindcss').Config} */
// Ported 1:1 from readtothink.html tailwind.config — DO NOT change theme tokens.
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0F0F0E",
        card: "#1A1A18",
        fg: "#E8E2D6",
        muted: "#9B9485",
        accent: "#C8965A",
        "accent-h": "#D4A66A",
        sage: "#7B9A6B",
        terra: "#B07060",
        bdr: "#2A2A26",
        "bdr-l": "#3A3A34",
      },
      fontFamily: {
        serif: ["Lora", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
