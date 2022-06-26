import type { ComponentClass, FunctionComponent } from "react";
import type { SvelteComponentTyped } from "svelte/internal";
import type React from "react";
import type ReactDOMServer from "react-dom/server";
import { writable, type Readable } from "svelte/store";
import type { ConstructorOf, ReactImplementation } from "./internal/types";
import ReactWrapper from "./internal/ReactWrapper.svelte";

const never = writable() as Readable<any>;
type Sveltified<P> = ConstructorOf<SvelteComponentTyped<Omit<P, "children">>>;
export default function sveltifyReact<P>(
  reactComponent: FunctionComponent<P> | ComponentClass<P>,
  createElement: typeof React.createElement,
  ReactDOMClient: any,
  renderToString?: typeof ReactDOMServer.renderToString
): Sveltified<P> {
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
          {
            reactComponent,
            reactImplementation,
            svelteInstance: never,
            ...props,
          },
          ...args
        );
        return result;
      },
    } as any;
  }

  function Sveltified(options: any) {
    const svelteInstance = writable<any>();
    const instance = new ReactWrapper({
      ...options,
      props: {
        reactComponent,
        reactImplementation,
        svelteInstance,
        ...options.props,
      },
    });
    svelteInstance.set(instance);
    return instance;
  }
  return Sveltified as any;
}
