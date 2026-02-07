/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(210, 16%, 93%)",        // light gray
        input: "hsl(210, 16%, 97%)",
        ring: "hsl(210, 16%, 80%)",
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(210, 10%, 23%)",
      },
    },
  },
  plugins: [],
}
