/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Serene Expedition Primary (Deep Forest Green)
        primary: "#173F35",
        "primary-container": "#204E43",
        "on-primary": "#FFFFFF",
        "on-primary-container": "#C1ECDD",
        "primary-fixed": "#C1ECDD",
        "primary-fixed-dim": "#A6CFC1",
        "on-primary-fixed": "#002019",
        "on-primary-fixed-variant": "#274E43",
        "inverse-primary": "#A6CFC1",
        
        // Serene Expedition Secondary (Botanical Sage Green)
        secondary: "#526259",
        "secondary-container": "#D8E9DD",
        "on-secondary": "#FFFFFF",
        "on-secondary-container": "#173F35",
        "secondary-fixed": "#D6E7DB",
        "secondary-fixed-dim": "#BACBBF",
        "on-secondary-fixed": "#101E17",
        "on-secondary-fixed-variant": "#3B4A41",
        
        // Serene Expedition Accent / Tertiary (Warm Amber)
        tertiary: "#E5A45B",
        "tertiary-container": "#FFF8F0",
        "on-tertiary": "#FFFFFF",
        "on-tertiary-container": "#543000",
        "tertiary-fixed": "#FFDCBB",
        "tertiary-fixed-dim": "#FDB96E",
        "on-tertiary-fixed": "#2C1700",
        "on-tertiary-fixed-variant": "#683D00",
        accent: "#E5A45B",
        "on-accent": "#FFFFFF",
        
        // Semantic Error
        error: "#BA1A1A",
        "error-container": "#FFDAD6",
        "on-error": "#FFFFFF",
        "on-error-container": "#93000A",
        
        // Serene Expedition Canvas & Surfaces
        background: "#F7F5EF", // Warm Cream
        "on-background": "#25332E", // Charcoal
        surface: "#EDFDF5", // Soft Mint / Base Surface
        "surface-dim": "#CEDED6",
        "surface-bright": "#EDFDF5",
        "surface-container-lowest": "#FFFFFF", // Pure White Elevated Cards
        "surface-container-low": "#E7F7EF",
        "surface-container": "#E1F2EA",
        "surface-container-high": "#DCECE4",
        "surface-container-highest": "#D6E6DF",
        "surface-variant": "#D6E6DF",
        
        // Serene Expedition Neutrals & Outlines
        "on-surface": "#25332E", // Charcoal Evergreen Text
        "on-surface-variant": "#414845", // Muted Charcoal Text
        "inverse-surface": "#25332E",
        "inverse-on-surface": "#E4F4ED",
        outline: "#717975",
        "outline-variant": "#C0C8C4",
        "surface-tint": "#3F665A",
        
        // Named Serene Expedition Palette Direct Access
        forest: "#173F35",
        sage: "#D8E9DD",
        amber: "#E5A45B",
        charcoal: "#25332E",
        cream: "#F7F5EF",
        mint: "#EDFDF5"
      },
      borderRadius: {
        DEFAULT: "0.5rem", // 8px
        sm: "0.25rem", // 4px
        md: "0.75rem", // 12px (controls, buttons, inputs)
        lg: "1rem", // 16px (cards, content blocks)
        xl: "1.25rem", // 20px (travel cards)
        "2xl": "1.5rem", // 24px (containers, hero cards, bottom sheets)
        "3xl": "1.75rem",
        full: "9999px"
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
        margin: "1rem",
        "margin-tablet": "2rem",
        "margin-desktop": "3rem",
        "margin-mobile": "1rem",
        gutter: "1rem",
        "gutter-tablet": "1.5rem",
        "gutter-desktop": "2rem",
        "gutter-mobile": "0.75rem"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Manrope", "sans-serif"],
        display: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"]
      },
      boxShadow: {
        "card": "0 2px 8px -2px rgba(23, 63, 53, 0.05)",
        "card-hover": "0 12px 32px -4px rgba(23, 63, 53, 0.08)",
        "sheet": "0 -8px 32px -4px rgba(37, 51, 46, 0.12)",
        "overlay": "0 20px 40px -8px rgba(37, 51, 46, 0.12)"
      }
    },
  },
  plugins: [],
};
