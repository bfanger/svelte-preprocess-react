import type { ComponentClass, FunctionComponent } from "react";
import type { SvelteComponentTyped } from "svelte/internal";
import type ReactDOMServer from "react-dom/server";
import { writable, type Readable } from "svelte/store";
import type { ConstructorOf, SvelteInit, TreeNode } from "./internal/types";
import ReactWrapper from "./internal/ReactWrapper.svelte";
import Slot from "./internal/Slot.svelte";
import Bridge, { type BridgeProps } from "./internal/Bridge";

let rerender: (props: BridgeProps) => void;
let autokey = 0;
const never = writable() as Readable<any>;
const target = writable<HTMLElement>();
const tree: TreeNode = {
  key: "root",
  svelteInstance: never,
  reactComponent: ({ children }: any) => children,
  target,
  props: writable({}),
  slot: never,
  nodes: [],
};

type Sveltified<P> = ConstructorOf<SvelteComponentTyped<Omit<P, "children">>>;
/**
 * Convert a React component into a Svelte component.
 */
export default function sveltifyReact<P>(
  reactComponent: FunctionComponent<P> | ComponentClass<P>,
  createElement: BridgeProps["createElement"],
  createPortal: BridgeProps["createPortal"],
  ReactDOMClient: any,
  renderToString?: typeof ReactDOMServer.renderToString
): Sveltified<P> {
  const Wrapper = ReactWrapper as any;
  const ssr = typeof Wrapper.$$render === "function";
  if (ssr) {
    const { $$render } = Slot as any;
    return {
      ...Slot,
      $$render(
        result: any,
        props: any,
        bindings: any,
        slots: any,
        context: any
      ) {
        if (!renderToString) {
          return "";
        }
        const html = $$render.call(Slot, result, {}, bindings, slots, context);
        const vdom = html
          ? createElement(
              reactComponent,
              props,
              createElement("svelte-slot", {
                dangerouslySetInnerHTML: { __html: html },
              })
            )
          : createElement(reactComponent, props);
        return renderToString(vdom);
      },
    } as any;
  }
  if (!rerender) {
    const rootEl = document.createElement("react-root");
    const root = ReactDOMClient.createRoot?.(rootEl);
    const targetEl = document.createElement("bridge-root");
    target.set(targetEl);
    document.head.appendChild(rootEl);
    document.head.appendChild(targetEl);
    if (root) {
      rerender = (props: BridgeProps) => {
        root.render(createElement(Bridge, props));
      };
    } else {
      rerender = (props: BridgeProps) => {
        ReactDOMClient.render(createElement(Bridge, props), rootEl);
      };
    }
  }

  function Sveltified(options: any) {
    const svelteInstance = writable<any>();
    const instance = new ReactWrapper({
      ...options,
      props: {
        svelteInit(init: SvelteInit) {
          autokey += 1;
          const node = {
            key: autokey.toString(),
            svelteInstance,
            reactComponent,
            props: init.props,
            slot: init.slot,
            target: init.target,
            nodes: [],
          };
          const parent = init.parent ?? tree;
          parent.nodes.push(node);
          rerender({ createElement, createPortal, node: tree });
          init.onDestroy(() => {
            parent.nodes = parent.nodes.filter(
              (n) => n.svelteInstance !== svelteInstance
            );
            rerender({ createElement, createPortal, node: tree });
          });
          return node;
        },
        ...options.props,
      },
    });
    svelteInstance.set(instance);

    return instance;
  }
  return Sveltified as any;
}
