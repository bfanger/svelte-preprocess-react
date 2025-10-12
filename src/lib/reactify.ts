import * as React from "react";
import { createRawSnippet, mount, unmount, type Component } from "svelte";
import { render } from "svelte/server";
import SvelteFirstContext from "./internal/SvelteFirstContext.js";
import ReactFirstContext from "./internal/ReactFirstContext.js";
import SvelteWrapper from "./internal/SvelteWrapper.svelte";
import type { ChildrenPropsAsReactNode } from "svelte-preprocess-react/internal/types.js";

const server = typeof document === "undefined";
const cache = new WeakMap<Component<any>, React.FunctionComponent<any>>();

let $$payload: any;

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

function single<P extends Record<string, any>>(
  SvelteComponent: Component<P>,
  displayName?: string,
): React.FunctionComponent<any> {
  const hit = cache.get(SvelteComponent);
  if (hit) {
    return hit;
  }
  const name = displayName ?? SvelteComponent.name ?? "ReactifiedComponent";

  const named = {
    [name](options: any) {
      const { children, ...props } = options;
      const wrapperRef = React.useRef<HTMLElement>(undefined);
      const sveltePropsRef = React.useRef<(props: P) => void>(undefined);
      const svelteChildrenRef = React.useRef<HTMLElement>(undefined);
      const reactChildrenRef = React.useRef<HTMLElement>(undefined);
      const node = React.useContext(SvelteFirstContext);

      const nestedContext = React.useContext(ReactFirstContext);
      const nestedRef = React.useRef(
        {} as {
          promise: Promise<void>;
          contexts?: Map<any, any>;
          resolve: () => void;
        },
      );
      if (typeof nestedRef.current.promise === "undefined") {
        nestedRef.current.promise = new Promise((resolve) => {
          nestedRef.current.resolve = resolve;
        });
      }
      const nodeKey = node?.key ?? "/island/";

      const mountComponent = React.useCallback((target: HTMLElement) => {
        return mount(SvelteWrapper, {
          target,
          props: {
            SvelteComponent: SvelteComponent as any,
            nodeKey: node?.key ?? "/island/",
            react$children: node ? children : children ? [] : undefined,
            setContexts: node
              ? undefined
              : (value: Map<any, any>) => {
                  nestedRef.current.contexts = value;
                },
            props,
            setSlot: (el: HTMLElement | undefined) => {
              if (el && reactChildrenRef.current) {
                el.appendChild(reactChildrenRef.current);
              }
              svelteChildrenRef.current = el;
            },
          },
          context: node?.context ?? nestedContext?.contexts,
        });
      }, []);

      // Mount the Svelte component
      React.useEffect(() => {
        const target = wrapperRef.current;
        if (!target) {
          return undefined;
        }
        let component: ReturnType<typeof mount>;
        if (nestedContext) {
          void nestedContext.promise.then(() => {
            component = mountComponent(target);
            nestedRef.current.resolve();
          });
        } else {
          component = mountComponent(target);
          nestedRef.current.resolve();
        }

        sveltePropsRef.current = (globalThis as any).$$reactifySetProps;
        return () => {
          void (async () => {
            await nestedContext?.promise;
            await unmount(component);
          })();
        };
      }, [wrapperRef]);

      // Sync props & events
      React.useEffect(() => {
        if (sveltePropsRef.current) {
          sveltePropsRef.current(props);
        }
      }, [props, sveltePropsRef]);

      // Sync children/slot
      React.useEffect(() => {
        if (reactChildrenRef.current) {
          if (
            svelteChildrenRef.current &&
            reactChildrenRef.current.parentElement !== svelteChildrenRef.current
          ) {
            svelteChildrenRef.current.appendChild(reactChildrenRef.current);
          } else if (node === undefined) {
            reactChildrenRef.current.style.display = "contents";
          }
        } else if (svelteChildrenRef.current) {
          svelteChildrenRef.current.innerHTML = "";
        }
      }, [reactChildrenRef]);

      if (server) {
        let html = "";
        if ($$payload) {
          if (typeof $$payload.out === "string") {
            throw new Error(
              "Invalid $$payload, check if the svelte version is 5.36.8 or higher",
            );
          }
          if (Array.isArray($$payload.out) === false) {
            console.error(
              "svelte-preprocess-react's SSR is not compatible with Svelte 5.39.0 or higher",
            );
            return;
          }
          const len = $$payload.out.length;
          (SvelteWrapper as any)($$payload, {
            SvelteComponent,
            nodeKey,
            props,
            react$children: children,
          });
          html = $$payload.out.slice(len).join("");
          $$payload.out = $$payload.out.slice(0, len);
        } else {
          if (children && !props.children) {
            props.children = createRawSnippet(() => ({
              render() {
                return "<!-- React children not supported during SSR -->";
              },
            }));
          }
          const result = render(SvelteComponent as any, {
            props,
            context: node?.context,
          });
          if (typeof result.head === "string") {
            html += result.head;
          }
          if (typeof result.body === "string") {
            html += result.body;
          }
        }
        if (!node) {
          return React.createElement("reactify-svelte", {
            key: "reactify",
            ref: wrapperRef,
            node: undefined,
            style: { display: "contents" },
            suppressHydrationWarning: true,
            dangerouslySetInnerHTML: { __html: html },
          });
        }
        return [
          React.createElement("reactify-svelte", {
            key: "reactify",
            ref: wrapperRef,
            node: nodeKey,
            style: { display: "contents" },
            suppressHydrationWarning: true,
            dangerouslySetInnerHTML: { __html: html },
          }),
          ...(children
            ? [
                React.createElement(
                  "react-children",
                  {
                    key: "react-children",
                    node: nodeKey,
                    style: { display: "none" },
                  },
                  children,
                ),
              ]
            : []),
        ];
      }

      return React.createElement(
        "reactify-svelte",
        {
          key: "reactify",
          ref: wrapperRef,
          node: node?.key,
          style: { display: "contents" },
          suppressHydrationWarning: true,
        },
        children
          ? React.createElement(
              "react-children",
              {
                key: "react-children",
                ref: reactChildrenRef,
                node: node?.key,
                style: { display: "none" },
              },
              node
                ? children
                : React.createElement(
                    ReactFirstContext.Provider,
                    { value: nestedRef.current },
                    children,
                  ),
            )
          : undefined,
      );
    },
  };
  if (name) {
    (named[name] as React.FC).displayName = name;
  }
  cache.set(SvelteComponent, named[name]);
  return named[name];
}

export function setPayload(payload: any) {
  $$payload = payload;
}
