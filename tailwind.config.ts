import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
        surface: {
          900: "#0d0d0d",
          800: "#141414",
          700: "#1a1a1a",
          600: "#222222",
          500: "#2a2a2a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
