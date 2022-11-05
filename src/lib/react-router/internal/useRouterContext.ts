import * as React from "react";
import RouterContext from "./RouterContext.js";

export default function useRouterContext() {
  const context = React.useContext(RouterContext);
  if (!context) {
    throw new Error("Component was not wrapped inside a <Router>");
  }
  return context;
}
