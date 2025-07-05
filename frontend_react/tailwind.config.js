// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'base-100': 'var(--b1)',
        'base-200': 'var(--b2)',
        'base-300': 'var(--b3)',
        'base-content': 'var(--bc)',
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("daisyui")
  ],
  daisyui: {
    themes: ["light", "dark"],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
}




