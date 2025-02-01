import * as React from "react";
import { createRawSnippet, mount, unmount } from "svelte";
import { render } from "svelte/server";
import type { SvelteEventHandlers } from "./internal/types";
import SvelteToReactContext from "./internal/SvelteToReactContext.js";
import SvelteWrapper from "./internal/SvelteWrapper.svelte";

const server = typeof document === "undefined";

let $$payload: any;
export type SvelteConstructor<Props = any, Events = any, Slot = any> = {
  name: string;
  prototype: {
    $$prop_def: Props;
    $$events_def: Events;
    $$slot_def: Slot;
  };
};
/**
 * Convert a Svelte component into a React component.
 */
export default function reactify<P = any, E = any>(
  SvelteComponent: SvelteConstructor<P, E>,
): React.FunctionComponent<
  | (P & SvelteEventHandlers<E> & { children?: React.ReactNode })
  | { children?: React.ReactNode }
> {
  const { name } = SvelteComponent as any;
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
  return named[name];
}

export function setPayload(payload: any) {
  $$payload = payload;
}
