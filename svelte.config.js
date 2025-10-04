import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-static";
import preprocessReact from "./src/lib/preprocessReact.js";

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: [vitePreprocess(), preprocessReact()],
  compilerOptions: {
    experimental: { async: true },
    //  css: "injected"
  },
  kit: {
    alias: {
      "svelte-preprocess-react": "src/lib",
    },
    adapter: adapter({
      fallback: "index.html",
    }),
  },
  vitePlugin: {
    inspector: true,
  },
};
