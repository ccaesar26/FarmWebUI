/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {},
  },
  plugins: [require('tailwindcss-primeui')],
}

