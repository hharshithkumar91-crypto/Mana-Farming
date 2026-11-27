module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#166534",
        primaryHover: "#14532D",
        cream: "#FAF6EE",
        creamSoft: "#F3EDE0",
        surface: "#FFFFFF",
        ink: "#1C241B",
        inkMuted: "#5C665A",
        harvest: "#D97706",
        sage: "#E9F2EC",
      },
      fontFamily: {
        sans: ["Manrope", '"Noto Sans Telugu"', "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
