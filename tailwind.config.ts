import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./site.config.ts",
  ],
  theme: {
    extend: {
      colors: {
        espresso: {
          DEFAULT: "#2A1D11",
          deep: "#1A110A",
          soft: "#3E2C1B",
        },
        cognac: {
          DEFAULT: "#C17A3D",
          light: "#E8933C",
          dark: "#9A5B2E",
        },
        ivory: {
          DEFAULT: "#FAF5EC",
          dark: "#F5EFDD",
        },
        gold: "#C9A24B",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
