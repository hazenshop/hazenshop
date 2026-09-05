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
        brand: {
          50: "#faf8f5",
          100: "#f4efe6",
          200: "#e9ddcb",
          300: "#dcbf98",
          400: "#cca167",
          500: "#b8873f", // Refined warm bronze/gold
          600: "#a06f30",
          700: "#835526",
          800: "#6b4422",
          900: "#57371f",
          dark: "#0f1115",
          charcoal: "#181a20",
          surface: "#fcfbf9",
          maroon: {
            50: "#fdf2f4",
            100: "#fce7ea",
            200: "#f8cfd6",
            300: "#f2aab7",
            400: "#e8788f",
            500: "#d84969",
            600: "#c12c4f",
            700: "#7A1C2C", // Royal Maroon Primary
            800: "#5A121E",
            900: "#3d0b13",
            dark: "#2A060C",
          },
          gold: {
            50: "#fbf8f1",
            100: "#f6efdd",
            200: "#ecdcba",
            300: "#dfc48e",
            400: "#cea65f",
            500: "#b8873f",
            600: "#9e6f31",
            700: "#7e5327",
          },
        },
      },

      fontFamily: {
        sans: ["var(--font-outfit)", "Outfit", "Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
        heading: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "Outfit", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.04)",
        card: "0 8px 30px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 16px 40px rgba(0, 0, 0, 0.08)",
        floating: "0 20px 50px rgba(0, 0, 0, 0.12)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slight": "bounceSlight 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-in-out forwards",
      },
      keyframes: {
        bounceSlight: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

