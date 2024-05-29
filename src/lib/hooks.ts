import * as React from "react";
import { writable, type Readable } from "svelte/store";
import type ReactDOMServer from "react-dom/server";
import { getContext, onDestroy } from "svelte";
import type { TreeNode } from "./internal/types";

export default function hooks<T>(
  callback: () => T,
  ReactDOMClient?: any,
  renderToString?: typeof ReactDOMServer.renderToString,
): Readable<T | undefined> {
  const store = writable<T | undefined>();

  const parent = getContext<TreeNode | undefined>("ReactWrapper");
  function Hook() {
    store.set(callback());
    return null;
  }

  if (parent) {
    const hook = { Hook, key: autoKey(parent) };
    parent.hooks.push(hook);
    onDestroy(() => {
      const index = parent.hooks.findIndex((h) => h === hook);
      if (index !== -1) {
        parent.hooks.splice(index, 1);
      }
    });
  } else if (ReactDOMClient) {
    onDestroy(standalone(Hook, ReactDOMClient, renderToString));
  } else if (typeof window !== "undefined") {
    throw new Error(
      "The ReactDOMClient parameter is required for hooks(), because no parent component was a sveltified React component",
    );
  }
  return store;
}

function standalone(
  Hook: React.FC,
  ReactDOMClient: any,
  renderToString?: typeof ReactDOMServer.renderToString,
) {
  if (typeof document === "undefined") {
    if (!renderToString) {
      throw new Error("renderToString parameter is required for SSR");
    }
    renderToString(React.createElement(Hook));
    return () => {};
  }
  const el = document.createElement("react-hooks");
  const root = ReactDOMClient.createRoot?.(el);
  if (root) {
    root.render(React.createElement(Hook));
  } else {
    ReactDOMClient.render(React.createElement(Hook), el);
  }
  return () => {
    if (root) {
      root.unmount();
    } else {
      ReactDOMClient.unmountComponentAtNode(el);
    }
  };
}

const keys = new WeakMap();
/**
 * Get incrementing number per node.
 */
function autoKey(node: TreeNode | undefined) {
  if (!node) {
    return -1;
  }
  let key: number | undefined = keys.get(node);
  if (key === undefined) {
    key = 0;
  } else {
    key += 1;
  }
  keys.set(node, key);
  return key;
}
