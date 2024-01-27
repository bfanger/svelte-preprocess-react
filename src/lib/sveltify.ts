import * as React from "react";
import type ReactDOMServer from "react-dom/server";
import { writable, type Readable } from "svelte/store";
import type { SvelteInit, TreeNode } from "./internal/types";
import ReactWrapper from "./internal/ReactWrapper.svelte";
import Bridge, { type BridgeProps } from "./internal/Bridge.js";
import { setPayload } from "./reactify";

let sharedRoot: TreeNode | undefined;

/**
 * Convert a React component into a Svelte component.
 */
export default function sveltify<P>(
  reactComponent: React.FunctionComponent<P> | React.ComponentClass<P>,
  createPortal: BridgeProps["createPortal"],
  ReactDOMClient: any,
  renderToString?: typeof ReactDOMServer.renderToString,
): any {
  const client = typeof document !== "undefined";

  function Sveltified(anchorOrPayload: any, $$props: any) {
    const standalone = !sharedRoot;
    // eslint-disable-next-line no-param-reassign
    $$props.svelteInit = (init: SvelteInit) => {
      if (!init.parent && !sharedRoot) {
        const target = writable<HTMLElement>();
        const rootNode: TreeNode = {
          key: anchorOrPayload?.anchor ?? "client",
          autoKey: 0,
          reactComponent: ({ children }: any) => children,
          target,
          props: writable({}),
          slot: writable() as Readable<any>,
          nodes: [],
          contexts: new Map(),
          hooks: writable([]),
        };
        sharedRoot = rootNode;
        if (client) {
          const rootEl = document.createElement("react-root");
          const root = ReactDOMClient.createRoot?.(rootEl);
          const targetEl = document.createElement("bridge-root");
          target.set(targetEl);
          document.head.appendChild(rootEl);
          document.head.appendChild(targetEl);

          if (root) {
            rootNode.rerender = () => {
              root.render(
                React.createElement(Bridge, { createPortal, node: rootNode }),
              );
            };
          } else {
            rootNode.rerender = () => {
              ReactDOMClient.render(
                React.createElement(Bridge, { createPortal, node: rootNode }),
                rootEl,
              );
            };
          }
        }
      }
      const parent = init.parent ?? (sharedRoot as TreeNode);
      parent.autoKey += 1;
      const key = `${parent.key}_${parent.autoKey}`;
      const node: TreeNode = {
        key,
        autoKey: 0,
        reactComponent,
        props: init.props,
        slot: init.slot,
        target: init.target,
        hooks: init.hooks,
        contexts: init.contexts,
        nodes: [],
        rerender: parent.rerender,
      };
      parent.nodes.push(node);
      if (client) {
        parent.rerender?.();
      }
      return node;
    };
    (ReactWrapper as any)(anchorOrPayload, $$props);

    if (standalone && !client) {
      if (renderToString && sharedRoot) {
        setPayload(anchorOrPayload);
        const html = renderToString(buildReactDOM(sharedRoot));
        applyPortals(anchorOrPayload, sharedRoot, { html });
        setPayload(undefined);
      }
      sharedRoot = undefined;
    }
  }
  return Sveltified as any;
}

function buildReactDOM(node: TreeNode) {
  const props: any = {
    key: node.key,
    ...node.props,
  };
  if (node.nodes.length > 0) {
    props.children = node.nodes.map((subnode) => buildReactDOM(subnode));
  }
  return React.createElement(
    "react-portal-source",
    { key: node.key, sveltify: node.key },
    React.createElement(node.reactComponent, props),
  );
}

function applyPortals(target: any, node: TreeNode, source: { html: string }) {
  node.nodes.forEach((subnode) => applyPortals(target, subnode, source));
  const startTag = `<react-portal-source sveltify="${node.key}">`;
  const endTag = `</react-portal-source>`;
  const start = source.html.indexOf(startTag);
  if (start === -1) {
    return;
  }
  const end = source.html.indexOf(endTag, start) + endTag.length;
  const html = source.html.substring(
    start + startTag.length,
    end - endTag.length,
  );
  // eslint-disable-next-line no-param-reassign
  source.html = source.html.substring(0, start) + source.html.substring(end);
  if (!html) {
    return;
  }
  applyPortal(target, node.key, html);
}
function applyPortal(target: any, key: string, html: string) {
  const startTag = `<react-portal-target sveltify="${key}"`;
  const start = target.out.indexOf(startTag);
  if (start === -1) {
    return;
  }
  const pos = target.out.indexOf(">", start);
  // eslint-disable-next-line no-param-reassign
  target.out =
    target.out.substring(0, pos + 1) + html + target.out.substring(pos + 1);
}
