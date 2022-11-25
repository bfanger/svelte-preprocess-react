import * as React from "react";
import useRouterContext from "./internal/useRouterContext.js";

export default function useHistory() {
  const { goto } = useRouterContext();
  return React.useMemo(
    () => ({
      push(url: string) {
        goto(url);
      },
      replace(url: string) {
        goto(url, { replaceState: true });
      },
    }),
    [goto]
  );
}
