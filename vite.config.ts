import path, { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  logLevel: "info",
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    pool: "threads",
    logHeapUsage: true,
    restoreMocks: true,
    watch: true,
    environment: "node",
    projects: [
      {
        test: {
          isolate: false,
          env: {
            NODE_ENV: "test",
          },
          pool: "threads",
          testTimeout: 10000,
          name: "unit",
          include: ["**/*.unit.test.ts"],
        },
      },
      // {
      //   extends: "./vitest_integration.config.ts",
      //   test: {
      //     name: "integration",
      //     include: ["**/*.integration.test.ts"],
      //   },
      // },
    ],
  },
  esbuild: {
    sourcemap: true,
    target: "es2024",
  },
});
