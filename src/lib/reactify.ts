import * as React from "react";
import { mount, unmount } from "svelte";
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
      const wrapperRef = React.useRef<HTMLElement>();
      const sveltePropsRef = React.useRef<(props: P) => void>();
      const svelteChildrenRef = React.useRef<HTMLElement>();
      const reactChildrenRef = React.useRef<HTMLElement>();
      const node = React.useContext(SvelteToReactContext);
      const { key, context } = node ?? {};

      // Mount the Svelte component
      React.useEffect(() => {
        const target = wrapperRef.current;
        if (!target || !key) {
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
          const result = render(SvelteComponent as any, {
            props,
            context,
          });
          html = result.html;
        }
        return [
          React.createElement("react-portal-target", {
            node: key,
            style: { display: "contents" },
            dangerouslySetInnerHTML: { __html: html },
          }),
          ...(children
            ? [
                React.createElement(
                  "react-children",
                  {
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
        "react-portal-target",
        {
          ref: wrapperRef,
          node: key,
          style: { display: "contents" },
        },
        children
          ? React.createElement(
              "react-children",
              {
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
