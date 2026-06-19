import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00E5FF",
          50: "#E0FEFF",
          100: "#B3FBFF",
          200: "#80F7FF",
          300: "#4DF3FF",
          400: "#26EFFF",
          500: "#00E5FF",
          600: "#00B8CC",
          700: "#008A99",
          800: "#005C66",
          900: "#002E33",
        },
        secondary: {
          DEFAULT: "#7C3AED",
          50: "#F5F0FF",
          100: "#EDE0FF",
          200: "#D4BFFF",
          300: "#BB9EFF",
          400: "#A27DFF",
          500: "#7C3AED",
          600: "#6220D4",
          700: "#4A18A0",
          800: "#32106D",
          900: "#1A083A",
        },
        danger: "#FF4D4F",
        warning: "#FFB020",
        safe: "#00C853",
        background: "#0A0A0A",
        surface: "#111111",
        "surface-2": "#1A1A1A",
        border: "#2A2A2A",
        "text-primary": "#FFFFFF",
        "text-secondary": "#A0A0A0",
        "text-muted": "#606060",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "cyber-grid":
          "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)",
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,229,255,0.15), transparent)",
      },
      backgroundSize: {
        "grid-50": "50px 50px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "scan-line": "scanLine 3s ease-in-out infinite",
        "gradient-shift": "gradientShift 8s ease infinite",
        "border-spin": "borderSpin 3s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          from: { boxShadow: "0 0 20px rgba(0,229,255,0.3)" },
          to: { boxShadow: "0 0 40px rgba(0,229,255,0.6), 0 0 80px rgba(0,229,255,0.2)" },
        },
        scanLine: {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        borderSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        cyber: "0 0 30px rgba(0,229,255,0.15), 0 0 60px rgba(0,229,255,0.05)",
        "cyber-hover": "0 0 40px rgba(0,229,255,0.25), 0 0 80px rgba(0,229,255,0.1)",
        "danger-glow": "0 0 30px rgba(255,77,79,0.2)",
        "safe-glow": "0 0 30px rgba(0,200,83,0.2)",
        "warning-glow": "0 0 30px rgba(255,176,32,0.2)",
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
