import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),        // plugin cho React
    tailwindcss(),  // plugin cho Tailwind
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // alias @ => fe/src
    },
  },
  server: {
    port: 5173,   // cổng dev server (mặc định 5173)
    open: true,   // tự động mở trình duyệt khi chạy npm run dev
  },
  build: {
    outDir: "dist",   // thư mục build
    sourcemap: true,  // bật sourcemap để dễ debug
  },
})
