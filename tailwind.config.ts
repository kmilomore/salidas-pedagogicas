import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        slep: {
          DEFAULT: "#1B4F8A",
          dark: "#143B66",
          soft: "#D9E8F7",
        },
      },
      boxShadow: {
        soft: "0 24px 60px rgba(16, 36, 61, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;