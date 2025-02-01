import * as React from "react";
import { getContext, onDestroy } from "svelte";
import { type Readable, writable } from "svelte/store";
import type { ReactDependencies, TreeNode } from "./internal/types";
import type { Root } from "react-dom/client";

type Dependencies = Omit<ReactDependencies, "createPortal">;

export default function hooks<T>(
  callback: () => T,
  dependencies?: Dependencies,
): (() => T) & Readable<T> {
  let state = $state<T>();
  const store = writable<T>();

  const parent = getContext<TreeNode | undefined>("ReactWrapper");

  function Hook() {
    state = callback();
    store.set(state);
    return null;
  }

  if (!dependencies || !dependencies.ReactDOM || !dependencies.flushSync) {
    throw new Error(
      "{ ReactDOM, flushSync } are not injected, check svelte.config.js for: `preprocess: [preprocessReact()],`",
    );
  }
  if (parent) {
    const hook = { Hook, key: autoKey(parent) };
    parent.hooks.push(hook);

    dependencies.flushSync(() => {
      parent.rerender?.("hooks");
    });

    onDestroy(() => {
      const index = parent.hooks.findIndex((h) => h === hook);
      if (index !== -1) {
        parent.hooks.splice(index, 1);
      }
    });
  } else {
    onDestroy(standalone(Hook, dependencies));
  }
  let subscribe = (fn: (value: T | undefined) => void) => {
    console.warn(
      "Using a hooks() as store is deprecated, instead use $derived.by: `let [state, setState] = $derived.by(hooks(() => useState(1)));`",
    );
    subscribe = store.subscribe;
    return store.subscribe(fn);
  };
  function signal() {
    return state;
  }
  signal.subscribe = (fn: (value: T | undefined) => void) => {
    return subscribe(fn);
  };
  return signal as any;
}

function standalone(Hook: React.FC, dependencies: Dependencies) {
  const { renderToString, ReactDOM, flushSync } = dependencies;
  if (typeof document === "undefined") {
    if (!renderToString) {
      throw new Error("renderToString parameter is required for SSR");
    }
    renderToString(React.createElement(Hook));
    return () => {};
  }
  const el = document.createElement("react-hooks");
  let root: Root | undefined;
  if ("createRoot" in ReactDOM) {
    root = ReactDOM.createRoot?.(el);
    flushSync(() => {
      root?.render(React.createElement(Hook));
    });
  } else {
    ReactDOM.render(React.createElement(Hook), el);
  }
  return () => {
    if (root) {
      root.unmount();
    } else if ("unmountComponentAtNode" in ReactDOM) {
      ReactDOM.unmountComponentAtNode(el);
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
