import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-medium": "var(--color-primary-medium)",
        gold: "var(--color-gold)",
        "expo-gray": "var(--color-expo-gray)",
        "expo-white": "var(--color-expo-white)"
      }
    }
  }
};

export default config;
