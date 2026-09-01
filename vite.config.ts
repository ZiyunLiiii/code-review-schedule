import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Set VITE_BASE_PATH to your GitHub Pages repo name when deploying.
// Example: VITE_BASE_PATH=/code-review-schedule npm run build
// When running locally (npm run dev), leave it unset.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? "/",
  // @ts-ignore — vitest extends vite config at runtime
  test: {
    environment: "node",
  },
});
