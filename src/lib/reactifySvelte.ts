import {
  createElement,
  useEffect,
  useRef,
  type FunctionComponent,
} from "react";
import type {
  SvelteComponent as SvelteComponentType,
  SvelteComponentTyped,
} from "svelte";
import type { ConstructorOf } from "./internal/types";
import SvelteWrapper from "./internal/SvelteWrapper.svelte";

export default function reactifySvelte<P>(
  SvelteComponent: ConstructorOf<SvelteComponentTyped<P>>
): FunctionComponent<P> {
  const named = {
    [SvelteComponent.name](options: any) {
      const props = extractProps(options);
      const events = extractListeners(options);

      const wrapperRef = useRef<HTMLElement>();
      const svelteRef = useRef<SvelteComponentType>();
      const slotRef = useRef<HTMLElement>();
      const childrenRef = useRef<HTMLElement>();

      // Mount Svelte component
      useEffect(() => {
        const target = wrapperRef.current;
        if (!target) {
          return undefined;
        }
        const component = new SvelteWrapper({
          target,
          props: { SvelteComponent, props, events },
        });
        component.$on(
          "svelte-slot",
          ({ detail: el }: CustomEvent<HTMLElement>) => {
            if (childrenRef.current) {
              el.appendChild(childrenRef.current);
            }
            slotRef.current = el;
          }
        );
        svelteRef.current = component;
        return () => {
          svelteRef.current?.$destroy();
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

      return createElement(
        "svelte-wrapper",
        {
          ref: wrapperRef,
          style: { display: "contents" },
        },
        options.children
          ? createElement(
              "react-children",
              {
                ref: childrenRef,
                style: { display: "contents" },
              },
              options.children
            )
          : undefined
      );
    },
  };
  return named[SvelteComponent.name];
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
