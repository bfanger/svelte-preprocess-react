import * as React from "react";
import useRouterContext from "./internal/useRouterContext.js";
import type { Location } from "./types";

export default function useLocation(): Location {
  const {
    location: { pathname, search, hash },
  } = useRouterContext();

  return React.useMemo(() => {
    const base =
      typeof document !== "undefined" ? document.baseURI : "svelte://router";
    const url = new URL(pathname, base);
    url.search = search;
    url.hash = hash;
    url.toString = () => {
      return URL.prototype.toString.call(url).substring(url.origin.length);
    };
    return url;
  }, [hash, pathname, search]);
}
