import * as React from "react";
import type { Params } from "../types";

export type RouterContextType = {
  url: URL;
  params: Params;
  goto(url: string, opts?: { replaceState?: boolean }): void;
};
const RouterContext = React.createContext<RouterContextType | undefined>(
  undefined
);
export default RouterContext;
