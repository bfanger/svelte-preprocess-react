import type ReactDOMServer from "react-dom/server";
import {
  type ComponentClass,
  type FunctionComponent,
  type ReactNode,
} from "react";
import type { Root } from "react-dom/client";
import type { Component, Snippet } from "svelte";

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
  | "O"
  | "P"
  | "Q"
  | "R"
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
  nodes: TreeNode[];
  rerender?: () => void;
  unroot?: () => void;
};

export type SvelteInit = {
  props: { reactProps: Record<string, any>; children: ReactNode }; // The react props
  portalTarget: HTMLElement | undefined; // An element to portal the React component into
  childrenSource: HTMLElement | undefined; // An element containing the children from Svelte, inject as children into the React component
  slotSources: HTMLElement[]; // An array of elements containing the slots from Svelte, inject as partials into the React component
  svelteChildren: Snippet | undefined; // The svelte children prop (snippet/slot)
  context: Map<any, any>; // The full Svelte context
  hooks: { Hook: FunctionComponent; key: number }[];
  parent?: TreeNode;
};

export type ChildrenPropsAsSnippet<T> = T extends { children: unknown }
  ? Omit<T, "children"> & { children: Snippet | T["children"] }
  : T extends { children?: unknown }
    ? Omit<T, "children"> & { children?: Snippet | T["children"] }
    : T;

export type Sveltified<
  T extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>,
> = Component<ChildrenPropsAsSnippet<React.ComponentProps<T>>>;

export type IntrinsicElementComponents = {
  [K in keyof JSX.IntrinsicElements]: Component<
    ChildrenPropsAsSnippet<React.ComponentProps<K>>
  >;
};

/* Primitive typing of `Component.Item` components */
export type StaticPropComponents = {
  [key: string]: Component & {
    [key: string]: Component & {
      [key: string]: Component;
    };
  };
};

export type ReactDependencies = {
  ReactDOM:
    | {
        createRoot: (container: Element) => Root; // React 18 and above
      }
    | {
        render(component: React.ReactNode, container: Element): void; // React 17 and below
      };
  createPortal: (
    children: React.ReactNode,
    container: Element | DocumentFragment,
    key?: null | string,
  ) => React.ReactPortal;
  renderToString?: typeof ReactDOMServer.renderToString;
};
