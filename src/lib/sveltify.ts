import type { Component } from "svelte";
import type {
  IntrinsicElementComponents,
  StaticPropComponents,
  Sveltified,
} from "./internal/types.js";
import SveltifiedUniversal from "./internal/SveltifiedUniversal.svelte";

const cache = new WeakMap<any, unknown>();
const intrinsicElementCache: Record<string, unknown> = {};

/**
 * Convert a React components into Svelte components.
 */
export default function sveltify<
  T extends Record<
    string,
    keyof React.JSX.IntrinsicElements | React.JSXElementConstructor<any>
  >,
>(
  components: T,
): {
  [K in keyof T]: Sveltified<T[K]> & StaticPropComponents;
} & IntrinsicElementComponents {
  return Object.fromEntries(
    Object.entries(components).map(([key, reactComponent]) => {
      if (reactComponent === undefined) {
        return [key, undefined];
      }
      return [key, single(reactComponent)];
    }),
  ) as any;
}

function single(ReactComponent: any) {
  if (
    typeof ReactComponent !== "function" &&
    typeof ReactComponent === "object" &&
    ReactComponent !== null &&
    "default" in ReactComponent &&
    typeof ReactComponent.default === "function"
  ) {
    // Fix SSR import issue where node doesn't import the esm version. 'react-youtube'
    ReactComponent = ReactComponent.default;
  }
  const hit =
    typeof ReactComponent === "string"
      ? intrinsicElementCache[ReactComponent]
      : cache.get(ReactComponent);
  if (hit) {
    return hit;
  }
  const name = ReactComponent.displayName ?? ReactComponent.name ?? "anonymous";
  const named = {
    [name](this: any, $$renderer: any, $$props: any, ...args: any[]) {
      $$props.react$component = ReactComponent;
      // @ts-ignore
      return SveltifiedUniversal.call(this, $$renderer, $$props, ...args);
    },
  };
  if (typeof ReactComponent === "string") {
    intrinsicElementCache[ReactComponent] = named[name];
  } else {
    cache.set(ReactComponent, named[name]);
  }
  return named[name] as any as Component;
}
