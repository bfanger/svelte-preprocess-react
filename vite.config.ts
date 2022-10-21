import path from "path";
import { sveltekit } from "@sveltejs/kit/vite";
import { configDefaults, type UserConfig } from "vitest/config";

const config: UserConfig = {
  plugins: [sveltekit()],
  css: { devSourcemap: true },
  server: {
    fs: { allow: ["package"] },
  },
  test: {
    exclude: [...configDefaults.exclude, "package", "playwright"],
  },
  resolve: {
    alias: {
      "svelte-preprocess-react": path.resolve("./package"),
    },
  },
};
export default config;
