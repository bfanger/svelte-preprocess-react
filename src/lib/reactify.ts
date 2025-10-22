import {
  createElement,
  Fragment,
  use,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { mount, unmount, type Component } from "svelte";
import type {
  ChildrenPropsAsReactNode,
  ReactifiedSync,
} from "./internal/types.js";
import ReactifiedCSR from "./internal/ReactifiedCSR.svelte";
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
        // Server-side rendering
        const ctx = use(ReactContext);
        return import("./internal/reactifySSR.js").then((module) =>
          module.default(SvelteComponent, props, children, ctx),
        );
      }
      // Client-side rendering
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
            {
              key: "children",
              ref: childrenRef,
              style: { display: "contents" },
            },
            createElement(
              ReactContext,
              { value: { context: contexts, suffix: "reactify" } },
              children,
            ),
          ),
      ]);
    },
  };
  cache.set(SvelteComponent, named[name]);
  return named[name];
}
