import type { Component } from "svelte";
import Sveltified from "./Sveltified.svelte";
import type {
  IntrinsicElementComponents,
  StaticPropComponents,
  Sveltified as SveltifiedComponent,
} from "svelte-preprocess-react/internal/types";

const cache = new WeakMap<any, unknown>();

function sveltifyAsync<
  T extends Record<
    string,
    keyof React.JSX.IntrinsicElements | React.JSXElementConstructor<any>
  >,
>(
  components: T,
): {
  [K in keyof T]: SveltifiedComponent<T[K]> & StaticPropComponents;
} & IntrinsicElementComponents;
/**
 * Convert a React components into Svelte components.
 */
function sveltifyAsync<
  T extends React.FC | React.ComponentClass | React.JSXElementConstructor<any>,
>(components: T): SveltifiedComponent<T>;
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
  const hit = cache.get(ReactComponent);
  if (hit) {
    return hit;
  }
  const name = ReactComponent.displayName ?? ReactComponent.name ?? "anonymous";
  const named = {
    [name](this: any, $$renderer: any, $$props: any, ...args: any[]) {
      $$props.react$component = ReactComponent;
      // @ts-ignore
      return Sveltified.call(this, $$renderer, $$props, ...args);
    },
  };
  cache.set(ReactComponent, named[name]);
  return named[name] as any as Component;
}
