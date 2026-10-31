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
        primary: "#006765",
        "primary-container": "#008280",
        "on-primary": "#ffffff",
        "on-primary-container": "#f3fffd",
        "primary-fixed": "#83f5f1",
        "primary-fixed-dim": "#65d8d4",
        "on-primary-fixed": "#00201f",
        "on-primary-fixed-variant": "#00504e",
        "inverse-primary": "#65d8d4",
        
        secondary: "#00668a",
        "secondary-container": "#40c2fd",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#004d6a",
        "secondary-fixed": "#c4e7ff",
        "secondary-fixed-dim": "#7bd0ff",
        "on-secondary-fixed": "#001e2c",
        "on-secondary-fixed-variant": "#004c69",
        
        tertiary: "#825100",
        "tertiary-container": "#a36700",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#fffbff",
        "tertiary-fixed": "#ffddb8",
        "tertiary-fixed-dim": "#ffb95f",
        "on-tertiary-fixed": "#2a1700",
        "on-tertiary-fixed-variant": "#653e00",
        
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        
        background: "#f8f9ff",
        "on-background": "#0b1c30",
        surface: "#f8f9ff",
        "surface-dim": "#cbdbf5",
        "surface-bright": "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "surface-variant": "#d3e4fe",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#3d4948",
        "inverse-surface": "#213145",
        "inverse-on-surface": "#eaf1ff",
        outline: "#6d7a79",
        "outline-variant": "#bcc9c8",
        "surface-tint": "#006a68"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        full: "9999px"
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
        margin: "1rem",
        "margin-mobile": "1rem",
        gutter: "1rem",
        "gutter-mobile": "0.75rem"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Outfit", "sans-serif"],
        display: ["Outfit", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
};
