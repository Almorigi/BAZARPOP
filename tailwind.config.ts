import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      colors: {
        accent: {
          DEFAULT: "#f97316",
          dim: "rgba(249,115,22,0.15)",
          muted: "rgba(249,115,22,0.08)",
        },
        surface: {
          DEFAULT: "#101010",
          2: "#161616",
          3: "#1e1e1e",
          4: "#262626",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.07)",
          hover: "rgba(249,115,22,0.4)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-orange": "linear-gradient(135deg, #f97316, #fbbf24)",
      },
      animation: {
        "fade-up":    "fadeUp 0.6s ease forwards",
        "fade-in":    "fadeIn 0.5s ease forwards",
        "pulse-slow": "pulse 4s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
