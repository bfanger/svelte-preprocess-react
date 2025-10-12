import { createElement, Fragment, use, useLayoutEffect, useRef } from "react";
import {
  createRawSnippet,
  mount,
  unmount,
  type Component,
  type Snippet,
} from "svelte";
import type { ChildrenPropsAsReactNode } from "svelte-preprocess-react/internal/types.js";
import ReactifiedCSR, { type ReactifiedSync } from "./ReactifiedCSR.svelte";
import ReactifiedSSR from "./ReactifiedSSR.svelte";
import ReactContext from "./ReactContext";

const cache = new WeakMap<Component<any>, React.FunctionComponent<any>>();

/**
 * Convert a Svelte components into React components.
 */
export default function reactifyAsync<
  T extends Component<any> | Record<string, Component<any>>,
>(
  svelteComponents: T,
): T extends Component<infer TProps>
  ? React.FunctionComponent<ChildrenPropsAsReactNode<TProps>>
  : {
      [K in keyof T]: T[K] extends Component<infer TProps>
        ? React.FunctionComponent<ChildrenPropsAsReactNode<TProps>>
        : React.FunctionComponent<any>;
    } {
  if (typeof svelteComponents === "function") {
    return single(svelteComponents) as any;
  }
  const reactComponents: Record<string, React.FunctionComponent<any>> = {};
  for (const key in svelteComponents) {
    reactComponents[key] = single((svelteComponents as any)[key], key);
  }
  return reactComponents as any;
}

function single(SvelteComponent: Component, key?: string): React.FC<any> {
  const hit = cache.get(SvelteComponent);
  if (hit) {
    return hit;
  }
  const name = key ?? SvelteComponent.name ?? "anonymous";
  const named = {
    [name]({ children, ...props }: any) {
      if (typeof document === "undefined") {
        return reactifySSR(SvelteComponent, props, children);
      } else {
        return reactifyCSR(SvelteComponent, props, children);
      }
    },
  };
  cache.set(SvelteComponent, named[name]);
  return named[name];
}

function reactifyCSR(SvelteComponent: Component, props: any, children: any) {
  const targetRef = useRef<HTMLElement>(null);
  const childrenRef = useRef<HTMLElement>(null);
  const syncRef = useRef<ReactifiedSync>(null);

  useLayoutEffect(() => {
    syncRef.current?.(props, children, childrenRef.current);
  });
  useLayoutEffect(() => {
    const app = mount(ReactifiedCSR, {
      target: targetRef.current!,
      props: {
        SvelteComponent,
        init: (sync: ReactifiedSync) => (syncRef.current = sync),
        react$children: children,
        slot: childrenRef.current,
        props,
      },
    });
    return () => {
      syncRef.current = null;
      void unmount(app);
    };
  }, []);
  return createElement(Fragment, null, [
    children &&
      createElement(
        "reactify-react-child",
        { key: "children", ref: childrenRef },
        children,
      ),
    createElement("reactify-svelte-mount", {
      ref: targetRef,
      key: "component",
    }),
  ]);
}

async function reactifySSR(
  SvelteComponent: Component,
  props: any,
  reactChildren: any,
) {
  const ctx = use(ReactContext);
  let children: Snippet | undefined = undefined;
  if (ctx && reactChildren === ctx?.reactChildren) {
    children = ctx.svelteChildren;
  } else if (typeof reactChildren === "string") {
    const escapedHtml = reactChildren
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

    children = createRawSnippet(() => ({ render: () => escapedHtml }));
  } else {
    console.warn(
      "svelte-preprocess-react: Converting react children to svelte children in ssr is not implemented",
    );
  }
  const svelteServer = await import("svelte/server");

  const { body, head } = await svelteServer.render(ReactifiedSSR, {
    props: { SvelteComponent, props, reactChildren, children },
  });
  if (head !== "") {
    console.warn("svelte-preprocess-react doesn't support head content ");
  }
  return createElement("reactify-svelte-render", {
    dangerouslySetInnerHTML: { __html: body },
  });
}
