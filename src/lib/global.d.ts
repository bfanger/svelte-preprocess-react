import type { Component } from "svelte";
import type { Sveltified } from "./internal/types";

declare global {
  function sveltify<
    T extends {
      [key: string]:
        | keyof JSX.IntrinsicElements
        | React.JSXElementConstructor<any>;
    },
  >(
    components: T,
  ): {
    [K in keyof T]: K extends keyof JSX.IntrinsicElements
      ? Sveltified[K]
      : Sveltified<T[K]>;
  };

  function hooks<T>(callback: () => T): Readable<T | undefined>;

  const react: {
    [component: string]: Component;
  };
}
