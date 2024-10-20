import * as React from "react";
import useRouterContext from "./internal/useRouterContext.js";

export default function useHistory() {
  const router = useRouterContext();
  return React.useMemo(
    () => ({
      push(url: string) {
        void router.goto(url);
      },
      replace(url: string) {
        void router.goto(url, { replaceState: true });
      },
    }),
    // eslint-disable-next-line @typescript-eslint/unbound-method
    [router.goto],
  );
}
