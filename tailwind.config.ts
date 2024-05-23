import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 8px 32px 0 rgba(70, 70, 70, 0.37)',
        glassDark: '0 8px 32px 0 rgba(190, 190, 190, 0.05)',
      },  
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
