import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "/eco-green/",   
  plugins: [react(), tailwind()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  }
});
