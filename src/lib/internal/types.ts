import type { ComponentClass, FunctionComponent } from "react";
import type { Readable, Writable } from "svelte/store";

export type HandlerName<T extends string> = `on${Capitalize<T>}`;
export type EventName<T extends string> = T extends `on${infer N}`
  ? Uncapitalize<N>
  : never;

export type SvelteEventHandlers<T> = T extends Record<
  infer Key extends string,
  infer Value
>
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

export type TreeNode = Omit<SvelteInit, "onDestroy"> & {
  svelteInstance: Readable<any>;
  reactComponent: FunctionComponent<any> | ComponentClass<any>;
  key: number;
  hooks: Writable<Array<{ Hook: FunctionComponent; key: number }>>;
  nodes: TreeNode[];
};

export type SvelteInit = {
  parent?: TreeNode;
  props: Readable<Record<string, any>>;
  target: Readable<HTMLElement | undefined>;
  slot: Readable<HTMLElement | undefined>;
  contexts: Map<any, any>;
  hooks: Writable<Array<{ Hook: FunctionComponent; key: number }>>;
  onDestroy: (callback: () => void) => void;
};
