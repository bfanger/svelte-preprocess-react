import * as React from "react";
import useRouterContext from "./internal/useRouterContext.js";
import locationToUrl from "./internal/locationToUrl.js";
import type { Location } from "./types";

export default function useLocation(): Location {
  const {
    base,
    location: { pathname, search, hash },
  } = useRouterContext();

  return React.useMemo(() => {
    return locationToUrl({ pathname, search, hash }, base);
  }, [hash, pathname, search, base]);
}
