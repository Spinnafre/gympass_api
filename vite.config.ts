import path, { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  logLevel: "info",
  test: {
    pool: "threads",
    logHeapUsage: true,
    restoreMocks: true,
    environment: "node",
    watch: true,
    projects: [
      {
        test: {
          isolate: false,
          env: {
            NODE_ENV: "test",
          },
          alias: {
            "@": resolve(__dirname, "./src"),
          },
          pool: "threads",
          testTimeout: 10000,
          name: "unit",
          include: ["**/*.unit.test.ts"],
        },
      },
      {
        test: {
          isolate: false,
          name: "e2e",
          alias: {
            "@": resolve(__dirname, "./src"),
          },
          environment: "prisma",
          include: ["**/*.e2e.test.ts"],
        },
      },
    ],
  },
  esbuild: {
    sourcemap: true,
    target: "es2024",
  },
});
