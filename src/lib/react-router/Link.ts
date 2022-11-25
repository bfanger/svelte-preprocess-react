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
      if (replace) {
        console.warn("replace attribute <Link> needs a <Router.Provider>");
      }
    }

    const href = locationToUrl(to, context?.url).toString();
    if (replace) {
      const { onClick } = attrs;
      attrs.onClick = (event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          event.preventDefault();
          context?.goto(href, { replaceState: true });
        }
      };
    }
    return React.createElement("a", { ...attrs, ref, href }, children);
  }
);
export default Link;
