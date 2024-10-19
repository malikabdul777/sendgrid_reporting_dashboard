import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@radix-ui/react-icons": path.resolve(
        __dirname,
        "node_modules/@radix-ui/react-icons"
      ), // Add this line
    },
  },
  build: {
    rollupOptions: {
      external: ["@reduxjs/toolkit", "redux-persist", "redux"],
    },
  },
});
