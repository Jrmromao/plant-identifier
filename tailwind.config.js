// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // Add any other relevant paths
  ],
  theme: {
    extend: {
      colors: {
        background: '#f3f4f6', 
        foreground: '#333333',
      },
    },
  },
  plugins: [import("tailwindcss-animate")],
}
