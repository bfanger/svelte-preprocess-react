import type { Sveltified } from "./internal/types.js";
export { default as hooks } from "./hooks.js";
export { default as reactify } from "./reactify.js";
export { default as sveltify } from "./sveltify.svelte.js";
export { default as used } from "./used.js";
export { default as useStore } from "./useStore.js";

declare global {
  function sveltify<
    T extends {
      [key: string]: React.FC | React.ComponentClass;
    },
  >(
    reactComponents: T,
  ): {
    [K in keyof T]: Sveltified<T[K]>;
  };
}
