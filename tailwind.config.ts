import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        slep: {
          DEFAULT: "var(--slep-blue)",
          dark: "var(--slep-blue-dark)",
          soft: "var(--slep-blue-soft)",
        },
        portal: {
          ink: "var(--foreground)",
          surface: "var(--surface-solid)",
          soft: "var(--surface-soft)",
          line: "var(--surface-line)",
          success: "var(--status-success)",
          warning: "var(--status-warning)",
          danger: "var(--status-danger)",
        },
        route: {
          blue: "var(--route-blue)",
          teal: "var(--route-teal)",
          cyan: "var(--route-cyan)",
          gold: "var(--route-gold)",
          berry: "var(--route-berry)",
          return: "var(--route-return)",
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