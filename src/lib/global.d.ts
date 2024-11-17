import type { Component } from "svelte";
import type { Readable } from "svelte/store";
import type {
  IntrinsicElementComponents,
  StaticPropComponents,
  Sveltified,
} from "./internal/types.js";

declare global {
  function sveltify<
    T extends {
      [key: string]:
        | keyof JSX.IntrinsicElements
        | React.JSXElementConstructor<any>;
    },
  >(
    reactComponents: T,
  ): {
    [K in keyof T]: Sveltified<T[K]> & StaticPropComponents;
  } & IntrinsicElementComponents;

  function hooks<T>(callback: () => T): Readable<T | undefined>;

  const react: IntrinsicElementComponents & {
    [component: string]: Component & StaticPropComponents;
  };
}
