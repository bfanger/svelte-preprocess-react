import * as React from "react";
import type ReactDOMServer from "react-dom/server";
import { writable, type Readable } from "svelte/store";
import { getAllContexts, type SvelteComponent } from "svelte";
import type { SvelteInit, TreeNode } from "./internal/types";
import ReactWrapper from "./internal/ReactWrapper.svelte";
import Slot from "./internal/Slot.svelte";
import Bridge, { type BridgeProps } from "./internal/Bridge.js";
import SvelteToReactContext from "./internal/SvelteToReactContext.js";

let rerender: (props: BridgeProps) => void;
let autokey = 0;
const never = writable() as Readable<any>;
const target = writable<HTMLElement>();
const tree: TreeNode = {
  key: autokey,
  reactComponent: ({ children }: any) => children,
  target,
  props: writable({}),
  slot: never,
  nodes: [],
  contexts: new Map(),
  hooks: writable([]),
};

// let current:
//   | undefined
//   | {
//       reactComponent: any;
//       props: Record<string, any>;
//     }[];
// declare type Sveltified<P extends Record<string, any>> = new (args: {
//   target: any;
//   props?: P;
// }) => SvelteComponent<P>;

// Sveltified<Omit<P, "children">>
/**
 * Convert a React component into a Svelte component.
 */
export default function sveltify<P>(
  reactComponent: React.FunctionComponent<P> | React.ComponentClass<P>,
  createPortal: BridgeProps["createPortal"],
  ReactDOMClient: any,
  renderToString?: typeof ReactDOMServer.renderToString,
): any {
  if (!rerender && typeof document !== "undefined") {
    const rootEl = document.createElement("react-root");
    const root = ReactDOMClient.createRoot?.(rootEl);
    const targetEl = document.createElement("bridge-root");
    target.set(targetEl);
    document.head.appendChild(rootEl);
    document.head.appendChild(targetEl);
    if (root) {
      rerender = (props: BridgeProps) => {
        root.render(React.createElement(Bridge, props));
      };
    } else {
      rerender = (props: BridgeProps) => {
        ReactDOMClient.render(React.createElement(Bridge, props), rootEl);
      };
    }
  }
  function Sveltified($$anchorOrPayload: any, $$props: any) {
    const ssr = typeof $$anchorOrPayload.appendChild === "undefined";
    // eslint-disable-next-line no-param-reassign
    $$props.svelteInit = (init: SvelteInit) => {
      autokey += 1;
      const node = {
        key: autokey,
        reactComponent,
        props: init.props,
        slot: init.slot,
        target: init.target,
        hooks: init.hooks,
        contexts: init.contexts,
        nodes: [],
      };
      const parent = init.parent ?? tree;
      parent.nodes.push(node);
      if (!ssr) {
        rerender({ createPortal, node: tree });
        init.onDestroy(() => {
          parent.nodes = parent.nodes.filter((n) => n.key !== node.key);
          rerender({ createPortal, node: tree });
        });
      }
      return node;
    };
    (ReactWrapper as any)($$anchorOrPayload, $$props);
  }
  return Sveltified as any;
}
