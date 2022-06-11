import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-static";

const buildPackage = process.argv[2] === "package";
let preprocessReact;
if (!buildPackage) {
  preprocessReact = (await import("./package/preprocess.js")).default;
}

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: buildPackage
    ? preprocess({ sourceMap: true })
    : preprocessReact({ preprocess: preprocess({ sourceMap: true }) }),

  kit: {
    alias: {
      $lib: "./src/lib",
      "svelte-preprocess-react": "./package",
    },
    prerender: { default: true },
    adapter: adapter(),
    vite: {
      css: { devSourcemap: true },
      server: {
        fs: { allow: ["package"] },
      },
    },
  },
};
