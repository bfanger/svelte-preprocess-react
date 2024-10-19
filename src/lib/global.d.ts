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

  const react: {
    [component: string]: Component;
  };
}
