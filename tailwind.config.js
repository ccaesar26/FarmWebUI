/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {
      backgroundImage: {
        'landing': "url('../src/assets/images/landgreen.jpg')",
      }
    },
  },
  plugins: [require('tailwindcss-primeui')],
}

