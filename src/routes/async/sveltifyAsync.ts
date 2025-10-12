import type { Component } from "svelte";
import type {
  IntrinsicElementComponents,
  StaticPropComponents,
  Sveltified,
} from "svelte-preprocess-react/internal/types";
import SveltifiedCSR from "./SveltifiedCSR.svelte";
import SveltifiedSSR from "./SveltifiedSSR.svelte";

const cache = new WeakMap<any, unknown>();
const intrinsicElementCache: Record<string, unknown> = {};

function sveltifyAsync<
  T extends Record<
    string,
    keyof React.JSX.IntrinsicElements | React.JSXElementConstructor<any>
  >,
>(
  components: T,
): {
  [K in keyof T]: Sveltified<T[K]> & StaticPropComponents;
} & IntrinsicElementComponents;
/**
 * Convert a React components into Svelte components.
 */
function sveltifyAsync<
  T extends
    | React.FC
    | React.ComponentClass
    | React.JSXElementConstructor<any>
    | keyof React.JSX.IntrinsicElements,
>(components: T): Sveltified<T>;
function sveltifyAsync(components: any): any {
  if (typeof components === "object") {
    return Object.fromEntries(
      Object.entries(components).map(([key, reactComponent]) => {
        if (reactComponent === undefined) {
          return [key, undefined];
        }
        return [key, single(reactComponent)];
      }),
    ) as any;
  } else {
    return single(components);
  }
}

export default sveltifyAsync;

function single(ReactComponent: any) {
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
      if (typeof document === "undefined") {
        // @ts-ignore
        return SveltifiedSSR.call(this, $$renderer, $$props, ...args);
      } else {
        // @ts-ignore
        return SveltifiedCSR.call(this, $$renderer, $$props, ...args);
      }
    },
  };
  if (typeof ReactComponent === "string") {
    intrinsicElementCache[ReactComponent] = named[name];
  } else {
    cache.set(ReactComponent, named[name]);
  }
  return named[name] as any as Component;
}
