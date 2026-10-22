/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          app: "var(--color-bg-app)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          subtle: "var(--color-surface-subtle)",
          muted: "var(--color-surface-muted)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          inverted: "var(--color-text-inverted)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          focus: "var(--color-focus-ring)",
          subtle: "var(--color-border-subtle)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          subtle: "var(--color-primary-subtle)",
          contrast: "var(--color-primary-contrast)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          subtle: "var(--color-success-subtle)",
          contrast: "var(--color-success-contrast)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          subtle: "var(--color-warning-subtle)",
          contrast: "var(--color-warning-contrast)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          subtle: "var(--color-error-subtle)",
          contrast: "var(--color-error-contrast)",
        },
        ring: "var(--color-focus-ring)",
      },
      borderRadius: {
        sm: "var(--radius-sm)", // 6px
        md: "var(--radius-md)", // 10px
        lg: "var(--radius-lg)", // 14px
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        panel: "0 2px 8px -2px rgba(16, 24, 40, 0.06), 0 1px 4px -1px rgba(16, 24, 40, 0.04)",
        dialog: "0 12px 32px -4px rgba(16, 24, 40, 0.12), 0 4px 12px -2px rgba(16, 24, 40, 0.08)",
        dropdown: "0 6px 20px -2px rgba(16, 24, 40, 0.10), 0 2px 6px -1px rgba(16, 24, 40, 0.06)",
      },
    },
  },
  plugins: [],
};
