import * as React from "react";
import { createRawSnippet, mount, unmount, type Component } from "svelte";
import { render } from "svelte/server";
import SvelteToReactContext from "./internal/SvelteToReactContext.js";
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
  name?: string,
): React.FunctionComponent<any> {
  const hit = cache.get(SvelteComponent);
  if (hit) {
    return hit;
  }
  if (!name) {
    name = SvelteComponent.name;
  }
  const named = {
    [name](options: any) {
      const { children, ...props } = options;
      const wrapperRef = React.useRef<HTMLElement>(undefined);
      const sveltePropsRef = React.useRef<(props: P) => void>(undefined);
      const svelteChildrenRef = React.useRef<HTMLElement>(undefined);
      const reactChildrenRef = React.useRef<HTMLElement>(undefined);
      const node = React.useContext(SvelteToReactContext);
      const { key, context } = node ?? { key: "/island/" };

      // Mount the Svelte component
      React.useEffect(() => {
        const target = wrapperRef.current;
        if (!target) {
          return undefined;
        }
        const component = mount(SvelteWrapper, {
          target,
          props: {
            SvelteComponent: SvelteComponent as any,
            nodeKey: key,
            react$children: children,
            props,
            setSlot: (el: HTMLElement | undefined) => {
              if (el && reactChildrenRef.current) {
                el.appendChild(reactChildrenRef.current);
              }
              svelteChildrenRef.current = el;
            },
          },
          context,
        });
        sveltePropsRef.current = (globalThis as any).$$reactifySetProps;

        return () => {
          void unmount(component);
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
          const len = $$payload.out.length;
          (SvelteWrapper as any)($$payload, {
            SvelteComponent,
            nodeKey: key,
            props,
            react$children: children,
          });
          html = $$payload.out.slice(len);
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
            context,
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
            node: key,
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
                    node: key,
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
                node: key,
                style: { display: "none" },
              },
              children,
            )
          : undefined,
      );
    },
  };
  cache.set(SvelteComponent, named[name]);
  return named[name];
}

export function setPayload(payload: any) {
  $$payload = payload;
}
