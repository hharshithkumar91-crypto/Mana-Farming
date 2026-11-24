// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#166534",
        secondary: "#22C55E",
        accent: "#F59E0B",
        bgLight: "#F0FDF4"
      },
      borderRadius: {
        card: "16px"
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"]
      }
    }
  },
  plugins: []
};
