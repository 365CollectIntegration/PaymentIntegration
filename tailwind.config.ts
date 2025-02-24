import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "pa-primary": "#2563eb",
        "pa-danger": "#dc3545",
        "pa-border": "#d1d5db",
        "pa-normal": "#17273a",
        "pa-info-bg": "#f0fafc",
        "pa-info-text": "#004886",
        "pa-info-icon": "#00aaff",
        "pa-danger-bg": "#fdf1f5",
        "pa-danger-text": "#d40037",
        "pa-danger-icon": "#d80c49",
        "pa-success-bg": "#eefbf2",
        "pa-success-text": "#114d33",
        "pa-success-icon": "#098350",
        "pa-warning-bg": "#fff9eb",
        "pa-warning-text": "#562a00",
        "pa-warning-icon": "#fcc42f",
        "pa-form-label": "#707992",
        "pa-form-value": "#17273a",
        "pa-background-box": "#F6F9FE",
        "pa-button-dark": "#054365",
        "pa-button-light": "#1486BF",
      },
    },
    backgroundImage: () => ({
      "header-bg":
        "url('https://365rapidapp.powerappsportals.com/MyDashboardBG.png')",
    }),
  },
  plugins: [],
} satisfies Config;
