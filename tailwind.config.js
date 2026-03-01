/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Graphik", "system-ui", "sans-serif"],
        serif: ["Schnyder S", "Georgia", "serif"],
        condensed: ["Schnyder S Cond", "Georgia", "serif"],
      },
      colors: {
        blush: {
          700: '#5C8472',
          800: '#4A6E5E',
          900: '#1A2E26',
        },
        tiepolo: {
          pink: {
            500: "#f9d8da",
            600: "#f5c7c9",
            700: "#e8a8ab",
            800: "#d9898d",
          },
          sky: {
            500: "#d4e5f3",
            600: "#b8d4e8",
            700: "#8fbdd9",
            800: "#6fa6ca",
          },
          gold: {
            500: "#f3e7bd",
            600: "#e8d4a0",
            700: "#d9be7a",
            800: "#c9a855",
          },
          rose: {
            500: "#f0d0d6",
            600: "#e6b5bc",
            700: "#d9969f",
            800: "#cc7882",
          },
          cream: {
            500: "#f9f4e8",
            600: "#f4ead5",
            700: "#e8d9b8",
            800: "#dcc89b",
          },
          azure: {
            500: "#c7dde9",
            600: "#a3c7d6",
            700: "#7daec4",
            800: "#5896b2",
          },
        },
      },
    },
  },
  plugins: [],
}
