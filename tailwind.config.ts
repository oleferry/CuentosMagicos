import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cm: {
          amarillo: "#FFD93D",
          naranja: "#FF6B35",
          rosa: "#FF6B9D",
          morado: "#9B5DE5",
          azul: "#00BBF9",
          verde: "#00F5D4",
          fondo: "#FFF9F0",
          pendiente: "#E8E0F0",
        },
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
