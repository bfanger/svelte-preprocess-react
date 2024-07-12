import type ReactDOMServer from "react-dom/server";
import * as React from "react";
import { getContext, onDestroy } from "svelte";
import { type Readable, writable } from "svelte/store";
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
    const hook = { Hook, key: getKey(parent) };
    parent.hooks.update(($hooks) => [...$hooks, hook]);
    onDestroy(() => {
      parent.hooks.update(($hooks) => $hooks.filter((entry) => entry !== hook));
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

const autokeys = new WeakMap<TreeNode, number>();
function getKey(node: TreeNode): number;
function getKey(node: TreeNode | undefined) {
  if (!node) {
    return undefined;
  }
  let autokey = autokeys.get(node);
  if (autokey === undefined) {
    autokey = 0;
  } else {
    autokey += 1;
  }
  autokeys.set(node, autokey);
  return autokey;
}
