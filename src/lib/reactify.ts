import {
  createElement,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { FunctionComponent } from "react";
import { get, type Readable } from "svelte/store";
import SvelteWrapper from "./internal/SvelteWrapper.svelte";
import SvelteToReactContext from "./internal/SvelteToReactContext";
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
): FunctionComponent<P & SvelteEventHandlers<E>> {
  const { name } = SvelteComponent as any;
  const named = {
    [name](options: any) {
      const { children } = options;
      const props = extractProps(options);
      const events = extractListeners(options);

      const wrapperRef = useRef<HTMLElement>();
      const svelteRef = useRef<SvelteWrapper>();
      const slotRef = useRef<HTMLElement>();
      const childrenRef = useRef<HTMLElement>();

      const context = useContext(SvelteToReactContext);

      // Mount Svelte component
      useEffect(() => {
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
          context: extractSvelteContext(context),
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
      useEffect(() => {
        if (svelteRef.current) {
          svelteRef.current.$set({ props, events });
        }
      }, [props, svelteRef]);

      // Sync children/slot
      useEffect(() => {
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
          context: extractSvelteContext(context),
          $$slots,
        });
        return createElement("svelte-wrapper", {
          style: {
            display: "contents",
          },
          dangerouslySetInnerHTML: { __html: result.html },
        });
      }

      return createElement(
        "svelte-wrapper",
        {
          ref: wrapperRef,
          style: { display: "contents" },
        },
        children
          ? createElement(
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

function extractSvelteContext(reactContext: Readable<any> | undefined) {
  if (!reactContext) {
    return undefined;
  }
  const value = get(reactContext);
  return value?.$$.context;
}

function detectChildren(
  children: ReactNode | ReactNode[] | undefined
): boolean {
  if (children === undefined) {
    return false;
  }
  if (Array.isArray(children) && children.length === 0) {
    return false;
  }
  return true;
}
