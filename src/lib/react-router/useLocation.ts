import * as React from "react";
import type { Location } from "./types";
import useRouterContext from "./internal/useRouterContext.js";

export default function useLocation(): Location {
  const {
    url: { pathname, search, hash },
  } = useRouterContext();

  return React.useMemo(
    () => ({ pathname, search, hash }),
    [hash, pathname, search],
  );
}
