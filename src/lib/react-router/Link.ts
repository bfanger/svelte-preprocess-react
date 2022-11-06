import * as React from "react";
import locationToUrl from "./internal/locationToUrl.js";
import RouterContext from "./internal/RouterContext.js";
import type { To } from "./types";

export type LinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  replace?: boolean;
  to: To;
};

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function LinkWithRef({ to, replace, children, ...rest }, ref) {
    const attrs = rest;
    const context = React.useContext(RouterContext);
    if (!context) {
      let pathname = "";
      if (typeof to === "string") {
        pathname = to;
      } else if (typeof to === "object") {
        pathname = to.pathname;
      }
      if (
        replace ||
        pathname.startsWith("/") === false ||
        /^[a+z]+:\/\//.test(pathname) === false
      ) {
        // Without context only absolute paths are supported.
        throw new Error("Link was not wrapped inside a <Router>");
      }
    }
    const href = locationToUrl(to, context?.base).toString();
    if (replace) {
      const { onClick } = attrs;
      attrs.onClick = (event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          event.preventDefault();
          context?.history.replace(href);
        }
      };
    }
    return React.createElement("a", { ...attrs, ref, href }, children);
  }
);
export default Link;
