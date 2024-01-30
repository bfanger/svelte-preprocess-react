import type { ComponentClass, FunctionComponent } from "react";
import type { Readable, Writable } from "svelte/store";
import type { Snippet } from "svelte";
import type { BridgeProps } from "./Bridge";

export type HandlerName<T extends string> = `on${Capitalize<T>}`;
export type EventName<T extends string> = T extends `on${infer N}`
  ? Uncapitalize<N>
  : never;

export type SvelteEventHandlers<T> =
  T extends Record<infer Key extends string, infer Value>
    ? Partial<Record<HandlerName<Key>, (e: Value) => void | boolean>>
    : never;

type Uppercase =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

type ReactEventProp = `on${Uppercase}${string}`;
type ExcludeProps<T> = T extends ReactEventProp ? T : never;
type ExcludeEvents<T> = T extends ReactEventProp ? never : T;

export type EventProps<ReactProps> = Omit<
  ReactProps,
  ExcludeEvents<keyof ReactProps>
>;
export type OmitEventProps<ReactProps> = Omit<
  ReactProps,
  ExcludeProps<keyof ReactProps>
>;

export type TreeNode = SvelteInit & {
  reactComponent: FunctionComponent<any> | ComponentClass<any>;
  key: string;
  autoKey: number;
  hooks: Writable<Array<{ Hook: FunctionComponent; key: number }>>;
  nodes: TreeNode[];
  rerender?: () => void;
};

export type SvelteInit = {
  props: Readable<Record<string, any>>; // The react props
  portalTarget: Readable<HTMLElement | undefined>; // An element to portal the React component into
  childrenSource: Readable<HTMLElement | undefined>; // An element containing the children from Svelte, inject as children into the React component
  svelteChildren: Readable<Snippet | undefined>; // The svelte children prop (snippet/slot)
  context: Map<any, any>; // The full Svelte context
  hooks: Writable<Array<{ Hook: FunctionComponent; key: number }>>;
  parent?: TreeNode;
};
