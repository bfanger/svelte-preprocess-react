import * as React from "react";
import type ReactDOMServer from "react-dom/server";
import { writable, type Readable } from "svelte/store";
import { getAllContexts, type SvelteComponentTyped } from "svelte";
import type { SvelteInit, TreeNode } from "./internal/types";
import ReactWrapper from "./internal/ReactWrapper.svelte";
import Slot from "./internal/Slot.svelte";
import Bridge, { type BridgeProps } from "./internal/Bridge.js";
import SvelteToReactContext from "./internal/SvelteToReactContext";

let rerender: (props: BridgeProps) => void;
let autokey = 0;
const never = writable() as Readable<any>;
const target = writable<HTMLElement>();
const tree: TreeNode = {
  key: autokey,
  svelteInstance: never,
  reactComponent: ({ children }: any) => children,
  target,
  props: writable({}),
  slot: never,
  nodes: [],
  contexts: new Map(),
  hooks: writable([]),
};

let current:
  | undefined
  | {
      reactComponent: any;
      props: Record<string, any>;
    }[];
declare type Sveltified<P extends Record<string, any>> = new (args: {
  target: any;
  props?: P;
}) => SvelteComponentTyped<P>;

/**
 * Convert a React component into a Svelte component.
 */
export default function sveltify<P>(
  reactComponent: React.FunctionComponent<P> | React.ComponentClass<P>,
  createPortal: BridgeProps["createPortal"],
  ReactDOMClient: any,
  renderToString?: typeof ReactDOMServer.renderToString
): Sveltified<Omit<P, "children">> {
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

        if (current !== undefined) {
          current.push({ reactComponent, props });
          return `<ssr-portal${current.length - 1}/>`;
        }
        current = [];
        try {
          const contexts = getAllContexts();
          const html = $$render.call(
            Slot,
            result,
            {},
            bindings,
            slots,
            context
          );
          const leaf = !slots.default && current.length === 0;

          const vdom = leaf
            ? React.createElement(
                reactComponent as React.FunctionComponent,
                props
              )
            : React.createElement(
                reactComponent as React.FunctionComponent,
                props,
                [
                  React.createElement("svelte-slot", {
                    key: "svelte-slot",
                    style: { display: "contents" },
                    dangerouslySetInnerHTML: { __html: html },
                  }),
                  ...current.map((child, i) =>
                    React.createElement(
                      `ssr-portal${i}`,
                      { key: `ssr-portal${i}` },
                      React.createElement(child.reactComponent, child.props)
                    )
                  ),
                ]
              );
          let rendered = renderToString(
            React.createElement(
              SvelteToReactContext.Provider,
              {
                value: context || contexts,
              },
              vdom
            )
          );
          current.forEach((_, i) => {
            const start = `<ssr-portal${i}>`;
            const end = `</ssr-portal${i}>`;
            const startPosition = rendered.indexOf(start);
            const endPosition = rendered.indexOf(end);
            let content = "";
            if (startPosition !== -1) {
              content = rendered.substring(
                startPosition + start.length,
                endPosition
              );
              rendered =
                rendered.substring(0, startPosition) +
                rendered.substring(endPosition + end.length);
            }
            rendered = rendered.replace(`<ssr-portal${i}/>`, content);
          });
          return rendered;
        } finally {
          current = undefined;
        }
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
        root.render(React.createElement(Bridge, props));
      };
    } else {
      rerender = (props: BridgeProps) => {
        ReactDOMClient.render(React.createElement(Bridge, props), rootEl);
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
            key: autokey,
            svelteInstance,
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
          rerender({ createPortal, node: tree });
          init.onDestroy(() => {
            parent.nodes = parent.nodes.filter(
              (n) => n.svelteInstance !== svelteInstance
            );
            rerender({ createPortal, node: tree });
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
