// eslint-disable-next-line import/no-extraneous-dependencies
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "package", "playwright"],
  },
});
