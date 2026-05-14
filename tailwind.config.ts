import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        slep: {
          DEFAULT: "var(--royal-500)",
          dark: "var(--navy-600)",
          soft: "var(--royal-50)",
        },
        portal: {
          ink: "var(--fg-1)",
          surface: "var(--bg-surface)",
          soft: "var(--bg-sunken)",
          line: "var(--border-1)",
          success: "var(--status-success)",
          warning: "var(--status-warning)",
          danger: "var(--status-danger)",
        },
        route: {
          blue: "var(--royal-500)",
          teal: "var(--status-success)",
          cyan: "var(--royal-400)",
          gold: "var(--status-warning)",
          berry: "var(--coral-600)",
          return: "var(--coral-500)",
        },
      },
      borderRadius: {
        portal: "var(--radius-card)",
        control: "var(--radius-control)",
      },
      boxShadow: {
        soft: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};

export default config;