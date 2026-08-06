/// <reference types="vitest/config" />

import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    deps: {
      moduleDirectories: ["node_modules", "src"],
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
});
