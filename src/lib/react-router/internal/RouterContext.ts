import * as React from "react";
import type { Location, Params } from "../types";

type RouterContextType = {
  base: string;
  location: Location;
  params: Params;
  history: {
    push(url: string): void;
    replace(url: string): void;
  };
};
const RouterContext = React.createContext<RouterContextType | undefined>(
  undefined
);
export default RouterContext;
