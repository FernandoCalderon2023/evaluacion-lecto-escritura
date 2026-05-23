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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Paleta de marca VirIA
        viria: {
          50:  "#E6F7F8",
          100: "#C1EDF0",
          200: "#9BE2E8",
          300: "#74D8DF",
          400: "#3DCAD3",
          500: "#0FBFC9",  // primary cyan
          600: "#058A9A",  // primary teal (CTAs)
          700: "#046878",
          800: "#024E5A",
          900: "#01323A",
        },
        orchid: {
          400: "#C36BD4",
          500: "#A847BC",
          600: "#8008A5",  // accent purple
          700: "#660A85",
          800: "#4B0764",
        },
        glacier: {
          DEFAULT: "#A1C8D1",
          light: "#D6E8EC",
        },
      },
      backgroundImage: {
        "viria-gradient": "linear-gradient(135deg, #058A9A 0%, #0FBFC9 50%, #8008A5 100%)",
        "viria-gradient-soft": "linear-gradient(135deg, #058A9A 0%, #8008A5 100%)",
        "ia-gradient": "linear-gradient(90deg, #0FBFC9 0%, #C36BD4 50%, #8008A5 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
