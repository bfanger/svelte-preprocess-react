import {
  createElement,
  Fragment,
  use,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  createRawSnippet,
  mount,
  unmount,
  type Component,
  type Snippet,
} from "svelte";
import type { ChildrenPropsAsReactNode } from "./internal/types.js";
import ReactifiedCSR, {
  type ReactifiedSync,
} from "./internal/ReactifiedCSR.svelte";
import ReactifiedSSR from "./internal/ReactifiedSSR.svelte";
import ReactContext from "./internal/ReactContext.js";

const cache = new WeakMap<Component<any>, React.FunctionComponent<any>>();

/**
 * Convert a Svelte components into React components.
 */
export default function reactify<
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
  const ctx = use(ReactContext);
  const [contexts, setContexts] = useState<Map<any, any>>();

  useLayoutEffect(() => {
    syncRef.current?.(props, children, childrenRef.current);
  });
  useLayoutEffect(() => {
    const app = mount(ReactifiedCSR, {
      target: targetRef.current!,
      props: {
        SvelteComponent,
        init: (sync: ReactifiedSync) => (syncRef.current = sync),
        setContexts,
        react$children: children,
        slot: childrenRef.current,
        props,
      },
      context: ctx?.context,
    });
    return () => {
      syncRef.current = null;
      void unmount(app);
    };
  }, []);
  return createElement(Fragment, null, [
    createElement("reactify-svelte-mount", {
      ref: targetRef,
      key: "component",
      style: { display: "contents" },
    }),

    children &&
      contexts &&
      createElement(
        "reactify-react-child",
        { key: "children", ref: childrenRef, style: { display: "contents" } },
        createElement(
          ReactContext,
          { value: { context: contexts, suffix: "reactify" } },
          children,
        ),
      ),
  ]);
}

async function reactifySSR(
  SvelteComponent: Component,
  props: any,
  reactChildren: any,
) {
  const ctx = use(ReactContext);
  const svelteServer = await import("svelte/server");
  const renderToStringAsync = (
    await import("./internal/renderToStringAsync.js")
  ).default;

  let children: Snippet | undefined = undefined;
  if (ctx && reactChildren === ctx?.reactChildren) {
    children = ctx.svelteChildren;
  } else if (typeof reactChildren !== "undefined") {
    // @TODO: Use a nested context
    const nested = await renderToStringAsync(
      createElement("reactified-ssr-fragment", null, reactChildren),
    );
    children = createRawSnippet(() => ({
      render: () => {
        return nested.substring(25, nested.length - 26);
      },
    }));
  }

  const { body, head } = await svelteServer.render(ReactifiedSSR, {
    props: { SvelteComponent, props, reactChildren, children },
  });
  // @TODO: Improve handling of head content
  return createElement("reactified", {
    style: { display: "contents" },
    dangerouslySetInnerHTML: { __html: head + body },
  });
}
