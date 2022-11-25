import * as React from "react";
import RouterContext, { type RouterContextType } from "./RouterContext.js";

export default function useRouterContext(): RouterContextType {
  const context = React.useContext(RouterContext);
  if (!context) {
    console.warn("Component was not wrapped inside a <react:RouterProvider>");
    return {
      url: new URL(
        typeof window !== "undefined"
          ? window.location.href
          : "http://localhost/"
      ),
      params: {},
      goto,
    };
  }
  return context;
}

function goto(url: string) {
  console.warn(
    "No access to <react:RouterProvider>, falling back to using browser navigation"
  );
  window.location.href = url;
}
