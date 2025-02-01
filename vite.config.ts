import path from "path";
import { sveltekit } from "@sveltejs/kit/vite";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [sveltekit()],
  css: { devSourcemap: true },
  test: {
    environment: "happy-dom",
    exclude: [...configDefaults.exclude, "dist", "playwright"],
  },
  resolve: {
    alias: {
      "svelte-preprocess-react": path.resolve("./src/lib"),
    },
  },
});
