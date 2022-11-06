import * as React from "react";
import { noop } from "svelte/internal";
import RouterContext from "../../lib/react-router/internal/RouterContext";

type Props = {
  url: string;
  base?: string;
  children: React.ReactNode;
  onPush?: (url: string) => void;
  onReplace?: (url: string) => void;
};

const TestRouter: React.FC<Props> = ({
  children,
  url,
  base,
  onPush = noop,
  onReplace = noop,
}) => {
  const { pathname, search, hash } = new URL(url, base ?? "http://localhost/");
  return (
    <RouterContext.Provider
      value={{
        base: base ?? `http://localhost${pathname}`,
        history: {
          push: onPush,
          replace: onReplace,
        },
        location: {
          pathname,
          search,
          hash,
        },
        params: {},
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};
export default TestRouter;
