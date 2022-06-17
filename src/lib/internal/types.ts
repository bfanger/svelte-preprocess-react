export type ConstructorOf<T> = {
  new (): T;
};

export type SvelteConstructor<Props = any, Events = any, Slot = any> = {
  name: string;
  prototype: {
    $$prop_def: Props;
    $$events_def: Events;
    $$slot_def: Slot;
  };
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
