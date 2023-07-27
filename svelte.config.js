import { vitePreprocess } from "@sveltejs/kit/vite";
import adapter from "@sveltejs/adapter-static";
import preprocessReact from "./src/lib/preprocessReact.js";

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: [vitePreprocess(), preprocessReact()],
  kit: {
    adapter: adapter({
      fallback: "index.html",
    }),
  },
  vitePlugin: {
    inspector: true,
  },
};
