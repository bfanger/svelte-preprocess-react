import type { Component } from "svelte";
import type {
  IntrinsicElementComponents,
  StaticPropComponents,
} from "./internal/types.js";
import type SveltifyType from "./sveltify.js";

declare global {
  const sveltify: typeof SveltifyType;

  const react: IntrinsicElementComponents &
    Record<string, Component & StaticPropComponents>;
}
