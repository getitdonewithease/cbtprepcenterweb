import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify("http://localhost:3000"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "tests/**", "dist/**"],
    // Workaround for a Vitest/Vite teardown issue on Windows where the Vite
    // server handles stay open. Tests still exit successfully; this only caps
    // the post-run wait so CI is not delayed by 10 seconds on every run.
    teardownTimeout: 1000,
  },
});
