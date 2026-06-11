import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          deep: "#075985",
          dark: "#0369A1",
          base: "#0284C7",
          mid: "#0EA5E9",
          turquoise: "#22D3EE",
          aqua: "#A5F3FC",
          yellow: "#FFE01A",
          coral: "#FF6B4D",
          pink: "#FF8ACB",
          green: "#33D08C",
          orange: "#FFA51A",
        },
      },
      fontFamily: {
        display: ["var(--font-baloo)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 32px rgba(32, 207, 216, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
