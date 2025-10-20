import { createElement, memo } from "react";
import { flushSync } from "react-dom";
import { onDestroy } from "svelte";
import renderToStringAsync from "svelte-preprocess-react/internal/renderToStringAsync";
import { getSvelteContext } from "svelte-preprocess-react/internal/SvelteContext";

export default async function hooks<T>(fn: () => T): Promise<() => T> {
  if (typeof document === "undefined") {
    return hooksSSR(fn);
  }
  const { createApp } = getSvelteContext();
  const app = createApp();
  onDestroy(() => {
    app.unmount();
  });
  let result = $state<T>();
  flushSync(() =>
    app.render(
      createElement(
        memo(() => {
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
    createElement(() => {
      result = fn();
      return null;
    }),
  );

  return () => {
    return result;
  };
}
