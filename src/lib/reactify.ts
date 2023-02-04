import * as React from "react";
import SvelteWrapper from "./internal/SvelteWrapper.svelte";
import SvelteToReactContext from "./internal/SvelteToReactContext.js";
import type { SvelteEventHandlers } from "./internal/types";

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
  SvelteComponent: SvelteConstructor<P, E>
): React.FunctionComponent<
  | (P & SvelteEventHandlers<E> & { children?: React.ReactNode })
  | { children?: React.ReactNode }
> {
  const { name } = SvelteComponent as any;
  const named = {
    [name](options: any) {
      const { children } = options;
      const props = extractProps(options);
      const events = extractListeners(options);

      const wrapperRef = React.useRef<HTMLElement>();
      const svelteRef = React.useRef<SvelteWrapper>();
      const slotRef = React.useRef<HTMLElement>();
      const childrenRef = React.useRef<HTMLElement>();

      const context = React.useContext(SvelteToReactContext);

      // Mount Svelte component
      React.useEffect(() => {
        const target = wrapperRef.current;
        if (!target) {
          return undefined;
        }
        const component = new SvelteWrapper({
          target,
          props: {
            SvelteComponent: SvelteComponent as any,
            children: detectChildren(children),
            props,
            events,
          },
          context,
        });
        component.$on(
          "svelte-slot",
          ({ detail: el }: CustomEvent<HTMLElement>) => {
            if (el && childrenRef.current) {
              el.appendChild(childrenRef.current);
            }
            slotRef.current = el;
          }
        );
        svelteRef.current = component;
        return () => {
          component.$destroy();
        };
      }, [wrapperRef]);

      // Sync props & events
      React.useEffect(() => {
        if (svelteRef.current) {
          svelteRef.current.$set({ props, events });
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

      const ssr = SvelteComponent as any;
      if (ssr.render) {
        const $$slots: any = {};
        if (typeof children === "string") {
          $$slots.default = () => children;
        }
        const result = ssr.render(props, {
          context,
          $$slots,
        });
        return React.createElement("svelte-wrapper", {
          style: {
            display: "contents",
          },
          dangerouslySetInnerHTML: { __html: result.html },
        });
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
              children
            )
          : undefined
      );
    },
  };
  return named[name];
}

function extractProps(options: Record<string, any>): Record<string, any> {
  const props: Record<string, any> = {};
  Object.entries(options).forEach(([prop, value]) => {
    if (prop !== "children" && isEventProp(prop) === false) {
      props[prop] = value;
    }
  });
  return props;
}

function extractListeners(options: Record<string, any>): Record<string, any> {
  const listeners: Record<string, any> = {};
  Object.entries(options).forEach(([prop, value]) => {
    if (isEventProp(prop)) {
      listeners[prop[2].toLowerCase() + prop.slice(3)] = value;
    }
  });
  return listeners;
}

function isEventProp(prop: string) {
  return /^on[A-Z]/.test(prop);
}

function detectChildren(
  children: React.ReactNode | React.ReactNode[] | undefined
): boolean {
  if (children === undefined) {
    return false;
  }
  if (Array.isArray(children) && children.length === 0) {
    return false;
  }
  return true;
}
