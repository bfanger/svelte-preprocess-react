import path from "path";
import { sveltekit } from "@sveltejs/kit/vite";
import { configDefaults, type UserConfig } from "vitest/config";

const config: UserConfig = {
  plugins: [sveltekit()],
  css: { devSourcemap: true },
  server: {
    fs: { allow: ["dist"] },
  },
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "dist", "playwright"],
  },
  resolve: {
    alias: {
      "svelte-preprocess-react": path.resolve("./dist"),
    },
  },
};
export default config;
