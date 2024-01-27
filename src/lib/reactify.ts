import * as React from "react";
import { createRoot } from "svelte";
import { render } from "svelte/server";
import SvelteWrapper from "./internal/SvelteWrapper.svelte";
import SvelteToReactContext from "./internal/SvelteToReactContext.js";
import type { SvelteEventHandlers } from "./internal/types";

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
      const { children } = options;
      const props = extractProps(options);
      const wrapperRef = React.useRef<HTMLElement>();
      const svelteRef = React.useRef<ReturnType<typeof createRoot>>();
      const slotRef = React.useRef<HTMLElement>();
      const childrenRef = React.useRef<HTMLElement>();
      const context = React.useContext(SvelteToReactContext);

      // Mount Svelte component
      React.useEffect(() => {
        const target = wrapperRef.current;
        if (!target) {
          return undefined;
        }
        const component = createRoot(SvelteWrapper, {
          target,
          props: {
            SvelteComponent: SvelteComponent as any,
            react$Children: detectChildren(children),
            props,
            setSlot: (el: HTMLElement | undefined) => {
              if (el && childrenRef.current) {
                el.appendChild(childrenRef.current);
              }
              slotRef.current = el;
            },
          },
          context,
        });

        svelteRef.current = component;
        return () => {
          component.$destroy();
        };
      }, [wrapperRef]);

      // Sync props & events
      React.useEffect(() => {
        if (svelteRef.current) {
          svelteRef.current.$set({ props });
        }
      }, [props, svelteRef]);

      // Sync children/slot
      React.useEffect(() => {
        if (childrenRef.current) {
          if (
            slotRef.current &&
            childrenRef.current.parentElement !== slotRef.current
          ) {
            slotRef.current.appendChild(childrenRef.current);
          }
        } else if (slotRef.current) {
          slotRef.current.innerHTML = "";
        }
      }, [childrenRef]);

      if (server) {
        let html = "";
        if ($$payload) {
          const len = $$payload.out.length;
          (SvelteComponent as any)($$payload, props);
          html = $$payload.out.slice(len);
          $$payload.out = $$payload.out.slice(0, len);
        } else {
          const result = render(SvelteComponent as any, { props, context });
          html = result.html;
        }
        return [
          React.createElement("svelte-wrapper", {
            style: {
              display: "contents",
            },
            dangerouslySetInnerHTML: { __html: html },
          }),
        ];
      }

      return React.createElement(
        "svelte-wrapper",
        {
          ref: wrapperRef,
          style: { display: "contents" },
        },
        children
          ? React.createElement(
              "react-children",
              {
                ref: childrenRef,
                style: { display: "contents" },
              },
              children,
            )
          : undefined,
      );
    },
  };
  return named[name];
}

function extractProps(options: Record<string, any>): Record<string, any> {
  const props: Record<string, any> = {};
  Object.entries(options).forEach(([prop, value]) => {
    if (prop !== "children") {
      props[prop] = value;
    }
  });
  return props;
}

function detectChildren(
  children: React.ReactNode | React.ReactNode[] | undefined,
): boolean {
  if (children === undefined) {
    return false;
  }
  if (Array.isArray(children) && children.length === 0) {
    return false;
  }
  return true;
}

export function setPayload(payload: any) {
  $$payload = payload;
}
