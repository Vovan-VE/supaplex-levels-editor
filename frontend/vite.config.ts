import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],

  build: {
    sourcemap: true,
    // cssMinify: "esbuild",
  },
  css: {
    // transformer: "postcss",
    preprocessorOptions: {
      scss: {
        loadPaths: ["./src/"],
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
});
