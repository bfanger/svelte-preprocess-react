import * as React from "react";
import useRouterContext from "./internal/useRouterContext.js";
import type { Location } from "./types";

export default function useLocation(): Location {
  const {
    url: { pathname, search, hash },
  } = useRouterContext();

  return React.useMemo(
    () => ({ pathname, search, hash }),
    [hash, pathname, search]
  );
}
