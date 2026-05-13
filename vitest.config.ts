import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "tests/unit/**/*.test.ts"],
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    coverage: {
      reporter: ["text", "lcov"],
      include: ["lib/**/*.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
