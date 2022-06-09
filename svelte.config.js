import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-static";
// import preprocessReact from "./package";

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: [preprocess({ sourceMap: true })],
  // preprocess: [...preprocess({ sourceMap: true }), preprocessReact()],

  kit: {
    // aliases: {
    //   "svelte-preprocess-react": "src/lib",
    // },
    prerender: { default: true },
    adapter: adapter(),
    vite: { css: { devSourcemap: true } },
  },
};
