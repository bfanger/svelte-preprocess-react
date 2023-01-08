import path from "path";
import { sveltekit } from "@sveltejs/kit/vite";
import react from "@vitejs/plugin-react";
import { configDefaults, type UserConfig } from "vitest/config";

const config: UserConfig = {
  plugins: [react({ fastRefresh: false }), sveltekit()],
  css: { devSourcemap: true },
  server: {
    fs: { allow: ["package"] },
  },
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "package", "playwright"],
  },
  resolve: {
    alias: {
      "svelte-preprocess-react": path.resolve("./package"),
    },
  },
};
export default config;
