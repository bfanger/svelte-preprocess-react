import type React from "react";
import type ReactDOMServer from "react-dom/server";

export type ConstructorOf<T> = {
  new (): T;
};

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

type ReactRoot = {
  render(node: React.ReactNode): void;
  unmount(): void;
};
export type ReactImplementation = {
  createElement: typeof React.createElement;
  createRoot?: (el: Element) => ReactRoot;
  renderToString?: typeof ReactDOMServer.renderToString;
  rerender(node: React.ReactNode, el?: Element, root?: ReactRoot): void;
};
