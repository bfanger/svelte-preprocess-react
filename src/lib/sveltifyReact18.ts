import type { ComponentClass, FunctionComponent } from "react";
import type { SvelteComponentTyped } from "svelte/internal";
import ReactWrapper from "./React18Wrapper.svelte";
import type { ConstructorOf } from "./types";

export default function sveltifyReact18<P>(
  ReactComponent: FunctionComponent<P> | ComponentClass<P>
): ConstructorOf<SvelteComponentTyped<P>> {
  const ssr = typeof (ReactWrapper as any).$$render === "function";
  if (ssr) {
    const { $$render } = ReactWrapper as any;
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
}
