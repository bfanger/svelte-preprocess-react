import { type Component, type SvelteComponent } from "svelte";
import WrapReact from "./WrapReact.svelte";
import type {
  ChildrenPropsAsSnippet,
  IntrinsicElementComponents,
  StaticPropComponents,
  Sveltified,
} from "svelte-preprocess-react/internal/types";

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
  T extends React.FC | React.ComponentClass | React.JSXElementConstructor<any>,
>(components: T): Sveltified<T>;
function sveltifyAsync(components: any): any {
  if (typeof components === "object") {
    return multiple(components);
  } else {
    return single(components);
  }
}

export default sveltifyAsync;

function multiple<T extends Record<string, React.FC | React.ComponentClass>>(
  reactComponents: T,
): {
  [K in keyof T]: Component<ChildrenPropsAsSnippet<React.ComponentProps<T[K]>>>;
} {
  return Object.fromEntries(
    Object.entries(reactComponents).map(([key, reactComponent]) => {
      if (reactComponent === undefined) {
        return [key, undefined];
      }
      return [key, single(reactComponent)];
    }),
  ) as any;
}

function single(component: any) {
  function ConvertedReact(
    this: any,
    $$renderer: any,
    $$props: any,
    ...args: any[]
  ) {
    $$props.react$component = component;
    // @ts-ignore
    return WrapReact.call(this, $$renderer, $$props, ...args);
  }
  return ConvertedReact as any as SvelteComponent;
}
