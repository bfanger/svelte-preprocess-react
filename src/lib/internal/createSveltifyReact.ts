import type { ComponentClass, FunctionComponent } from "react";
import type { SvelteComponentTyped } from "svelte/internal";
import type { ConstructorOf } from "./types";

export default function createSveltifyReact(ReactWrapper: any) {
  return function sveltifyReact<P>(
    ReactComponent: FunctionComponent<P> | ComponentClass<P>
  ): ConstructorOf<SvelteComponentTyped<P>> {
    const ssr = typeof ReactWrapper.$$render === "function";
    if (ssr) {
      const { $$render } = ReactWrapper;
      return {
        ...ReactWrapper,
        $$render(meta: any, props: any, ...args: any[]) {
          const result = $$render.call(
            ReactWrapper,
            meta,
            { ReactComponent, ...props },
            ...args
          );
          return result;
        },
      } as any;
    }

    function Sveltified(options: any) {
      const component = new ReactWrapper({
        ...options,
        props: { ReactComponent, ...options.props },
      });
      return component;
    }
    return Sveltified as any;
  };
}
