import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-static";

const skip =
  process.argv[1].endsWith("svelte-package") || process.argv[2] === "sync";
let preprocessReact;
if (!skip) {
  preprocessReact = (await import("./package/preprocessReact.js")).default;
}

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: skip
    ? preprocess({ sourceMap: true })
    : preprocessReact({ preprocess: preprocess({ sourceMap: true }) }),

  kit: {
    adapter: adapter({
      fallback: "index.html",
    }),
  },
  vitePlugin: {
    experimental: {
      inspector: { holdMode: true },
    },
  },
};
