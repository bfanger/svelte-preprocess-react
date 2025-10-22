import * as React from "react";
import { flushSync } from "react-dom";
import { onDestroy } from "svelte";
import renderToStringAsync from "svelte-preprocess-react/internal/renderToStringAsync";
import { getSvelteContext } from "svelte-preprocess-react/internal/SvelteContext";

export default async function hooks<T>(fn: () => T): Promise<() => T> {
  if (typeof document === "undefined") {
    return hooksSSR(fn);
  }
  // Client-side
  const { createApp } = getSvelteContext();
  const app = createApp();
  onDestroy(() => {
    app.unmount();
  });
  let result = $state<T>();
  flushSync(() =>
    app.render(
      React.createElement(
        React.memo(() => {
          result = fn();
          return null;
        }),
      ),
    ),
  );

  return () => {
    return result as T;
  };
}

async function hooksSSR<T>(fn: () => T): Promise<() => T> {
  // @TODO: run hook inside nested react context
  let result: T;
  await renderToStringAsync(
    React.createElement(() => {
      result = fn();
      return null;
    }),
  );

  return () => {
    return result;
  };
}
