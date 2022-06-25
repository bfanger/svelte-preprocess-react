import type { ComponentClass, FunctionComponent } from "react";
import type { SvelteComponentTyped } from "svelte/internal";
import type React from "react";
import type ReactDOMServer from "react-dom/server";
import type { ConstructorOf, ReactImplementation } from "./internal/types";
import ReactWrapper from "./internal/ReactWrapper.svelte";

export default function sveltifyReact<P>(
  reactComponent: FunctionComponent<P> | ComponentClass<P>,
  createElement: typeof React.createElement,
  ReactDOMClient: any,
  renderToString?: typeof ReactDOMServer.renderToString
): ConstructorOf<SvelteComponentTyped<P>> {
  const reactImplementation: ReactImplementation = {
    createElement,
    createRoot: ReactDOMClient.createRoot,
    renderToString,
    rerender(node, el, root) {
      if (root) {
        root.render(node);
      } else {
        ReactDOMClient.render(node, el);
      }
    },
  };
  const Wrapper = ReactWrapper as any;
  const ssr = typeof Wrapper.$$render === "function";
  if (ssr) {
    const { $$render } = Wrapper;
    return {
      ...ReactWrapper,
      $$render(meta: any, props: any, ...args: any[]) {
        const result = $$render.call(
          ReactWrapper,
          meta,
          { reactComponent, reactImplementation, ...props },
          ...args
        );
        return result;
      },
    } as any;
  }

  function Sveltified(options: any) {
    const component = new ReactWrapper({
      ...options,
      props: { reactComponent, reactImplementation, ...options.props },
    });
    return component;
  }
  return Sveltified as any;
}
