import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midgray: "#808080",
        brightgray: "#A6A6A6",
        darkgray: "#5F5F5F",
        white: "#F3F3F3"
      },
      fontFamily: {
        intranet: "var(--font-intranet)",
        ppregular: "var(--font-ppregular)",
        ppsemibold: "var(--font-ppsemibold)",
      },
      fontSize: {
        h1: "35px",
        h2: "28px",
        h3: "23px",
        h4: "16px",
        h5: "14px",
        xl: "31px",
        lg: "23px",
        md: "18px",
        sm: "14px",
        body: "16px",
      },
    },
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
};

export default config;
