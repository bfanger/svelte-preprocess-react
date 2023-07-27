import { vitePreprocess } from "@sveltejs/kit/vite";
import adapter from "@sveltejs/adapter-static";

const skip =
  process.argv[1].endsWith("svelte-package") || process.argv[2] === "sync";
let preprocessReact;
if (!skip) {
  preprocessReact = (await import("./dist/preprocessReact.js")).default;
}

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: skip
    ? vitePreprocess()
    : preprocessReact({ preprocess: vitePreprocess() }),

  kit: {
    adapter: adapter({
      fallback: "index.html",
    }),
  },
  vitePlugin: {
    inspector: true,
  },
};
