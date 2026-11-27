module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#166534",
        harvest: "#EA580C",
        cream: "#FAF7F2",
        leafSoft: "#ECFDF5",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Telugu"', "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
