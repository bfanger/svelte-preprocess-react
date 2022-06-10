export interface ConstructorOf<T> {
  new (): T;
}

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

type EventKey = `on${Uppercase}${string}`;
type ExcludeProps<T> = T extends EventKey ? T : never;
type ExcludeEvents<T> = T extends EventKey ? never : T;

export type PropsOf<T> = Omit<T, ExcludeProps<keyof T>>;
export type EventsOf<T> = Omit<T, ExcludeEvents<keyof T>>;
