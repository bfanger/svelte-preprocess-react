import type ReactDOMServer from "react-dom/server";
import * as React from "react";
import { getContext, onDestroy } from "svelte";
import { type Readable, writable } from "svelte/store";
import type { ReactDependencies, TreeNode } from "./internal/types";

export default function hooks<T>(
  callback: () => T,
  dependencies?: Omit<ReactDependencies, "createPortal">,
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
  } else if (!dependencies) {
    throw new Error(
      "{ ReactDOM } is not injected, check svelte.config.js for: `preprocess: [preprocessReact()],`",
    );
  } else {
    let { ReactDOM, renderToString } = dependencies;
    if ("inject$$ReactDOM" in dependencies) {
      ReactDOM = dependencies.inject$$ReactDOM as ReactDependencies["ReactDOM"];
    }
    if ("inject$$renderToString" in dependencies) {
      renderToString =
        dependencies.inject$$renderToString as ReactDependencies["renderToString"];
    }
    if (!ReactDOM) {
      throw new Error(
        "{ ReactDOM } was not injected. Inside *.svelte files hooks() should be called with only 1 argument",
      );
    }
    onDestroy(standalone(Hook, ReactDOM, renderToString));
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
