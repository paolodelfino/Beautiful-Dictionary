/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/scripts/*.js",
    "./public/stylesheets/css/*.css",
    "./public/stylesheets/sass/*.css",
    "./views/pages/*.ejs",
    "./views/partials/*.ejs",
  ],
  theme: {
    extend: {},
    fontFamily: {
      sans: ["Inter var"],
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    styled: false,
    themes: ["winter"],
  },
};
