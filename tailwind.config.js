/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{vue,js,ts,jsx,tsx}", "./src/**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        satoshi: ["Satoshi", "sans-serif"], // Default font family
      },
      fontSize: {
        sm: "0.800rem",
        base: "1rem",
        xl: "1.250rem",
        "2xl": "1.563rem",
        "3xl": "1.954rem",
        "4xl": "2.442rem",
        "5xl": "3.053rem",
      },
      colors: {
        text: "#0b121e",
        background: "#f2f5fb",
        blue1: "#3f73ce",
        blue2: "#5287e5",
        blue3: "#91b1e9",
        graytint: "#EAEDF3",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const customFonts = {
        ".font-satoshi-light": {
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 300,
        },
        ".font-satoshi-regular": {
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 400,
        },
        ".font-satoshi-medium": {
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 500,
        },
        ".font-satoshi-bold": {
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
        },
        ".font-satoshi-black": {
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 900,
        },
        ".font-satoshi-light-italic": {
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 300,
          fontStyle: "italic",
        },
        ".font-satoshi-italic": {
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 400,
          fontStyle: "italic",
        },
        ".font-satoshi-medium-italic": {
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 500,
          fontStyle: "italic",
        },
        ".font-satoshi-bold-italic": {
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          fontStyle: "italic",
        },
        ".font-satoshi-black-italic": {
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 900,
          fontStyle: "italic",
        },
      };

      addUtilities(customFonts, {
        variants: ["responsive"],
      });
    },
  ],
};
